-- ============================================================
-- JJBA ROLEPLAY PLATFORM — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (usually already on)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'game_master', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || LEFT(NEW.id::TEXT, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- STANDS
-- ============================================================
CREATE TABLE stands (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  battle_cry TEXT,                -- e.g. "ORA ORA ORA"
  stand_type TEXT DEFAULT 'close-range' CHECK (
    stand_type IN ('close-range', 'long-range', 'automatic', 'bound', 'colony', 'special', 'act')
  ),
  -- A-E stat rankings stored as integers: A=5, B=4, C=3, D=2, E=1
  stat_destructive_power TEXT DEFAULT 'C' CHECK (stat_destructive_power IN ('A','B','C','D','E')),
  stat_speed TEXT DEFAULT 'C' CHECK (stat_speed IN ('A','B','C','D','E')),
  stat_range TEXT DEFAULT 'C' CHECK (stat_range IN ('A','B','C','D','E')),
  stat_durability TEXT DEFAULT 'C' CHECK (stat_durability IN ('A','B','C','D','E')),
  stat_precision TEXT DEFAULT 'C' CHECK (stat_precision IN ('A','B','C','D','E')),
  stat_potential TEXT DEFAULT 'C' CHECK (stat_potential IN ('A','B','C','D','E')),
  -- Ability
  ability_name TEXT NOT NULL,
  ability_description TEXT NOT NULL,  -- Detailed physics/rules of the ability
  ability_rules TEXT[],               -- Specific rules as array of strings
  -- Critical weakness (MANDATORY for tactical play)
  critical_weakness TEXT NOT NULL,
  weakness_detail TEXT,               -- Further explanation of the weakness
  -- Approval system (Peer Review feature for future)
  approval_status TEXT DEFAULT 'pending' CHECK (
    approval_status IN ('pending', 'approved', 'rejected', 'revision_requested')
  ),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PARTS (Story Arcs)
-- ============================================================
CREATE TABLE parts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  part_number INT,                    -- e.g. 1, 2, 3
  title TEXT NOT NULL,               -- e.g. "Gilded Echoes"
  full_title TEXT,                   -- e.g. "Part 1: Gilded Echoes"
  description TEXT,
  setting TEXT,                      -- Where/when the Part takes place
  current_arc TEXT,                  -- Current story arc within the Part
  status TEXT DEFAULT 'recruiting' CHECK (
    status IN ('recruiting', 'active', 'on_hiatus', 'completed', 'cancelled')
  ),
  -- Access control
  is_private BOOLEAN DEFAULT TRUE,   -- Always true for Beta
  max_players INT DEFAULT 6,
  -- Narrator/GM tools
  narrator_notes TEXT,               -- Private GM notes, hidden from players
  world_rules TEXT[],                -- Special rules for this Part's universe
  -- Metadata
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART MEMBERSHIPS (Invite System)
-- ============================================================
CREATE TABLE part_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stand_id UUID REFERENCES stands(id) ON DELETE SET NULL,  -- Stand used in this Part
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'narrator', 'observer')),
  invite_status TEXT DEFAULT 'pending' CHECK (
    invite_status IN ('pending', 'accepted', 'declined', 'removed')
  ),
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE(part_id, user_id)
);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  -- Message types
  message_type TEXT DEFAULT 'player' CHECK (
    message_type IN (
      'player',       -- Regular player action/dialogue
      'narrator',     -- GM scene-setting (styled differently)
      'ooc',          -- Out of character (bracketed)
      'stand_action', -- Stand ability use
      'system'        -- System notifications (join/leave)
    )
  ),
  content TEXT NOT NULL,
  -- Stand action metadata
  stand_used TEXT,    -- Stand name if this is a stand_action
  -- Reply threading (optional)
  reply_to UUID REFERENCES chat_messages(id),
  -- Moderation
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_by UUID REFERENCES profiles(id),
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STAND PEER REVIEWS (Future feature prep)
-- ============================================================
CREATE TABLE stand_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stand_id UUID REFERENCES stands(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE, -- Review within context of a Part
  verdict TEXT NOT NULL CHECK (verdict IN ('approve', 'reject', 'request_revision')),
  comment TEXT,
  specific_issues TEXT[],  -- Array of specific logical flaws cited
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stand_id, reviewer_id, part_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (The private Part access control)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stand_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Stands: owner can CRUD, others can read approved stands
CREATE POLICY "Stand owners have full access" ON stands 
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Approved stands are viewable" ON stands 
  FOR SELECT USING (approval_status = 'approved');

-- Parts: creator has full access; members can read their Parts
CREATE POLICY "Part creators have full access" ON parts 
  FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Part members can view their parts" ON parts 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM part_memberships 
      WHERE part_id = parts.id 
        AND user_id = auth.uid() 
        AND invite_status = 'accepted'
    )
  );

-- Part memberships
CREATE POLICY "Members can view their memberships" ON part_memberships 
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM parts WHERE id = part_id AND creator_id = auth.uid()
  ));
CREATE POLICY "Part creators manage memberships" ON part_memberships 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM parts WHERE id = part_id AND creator_id = auth.uid()
  ));
CREATE POLICY "Users can update their own membership" ON part_memberships 
  FOR UPDATE USING (auth.uid() = user_id);

-- Chat: only accepted part members can read/write
CREATE POLICY "Part members can read chat" ON chat_messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM part_memberships 
      WHERE part_id = chat_messages.part_id 
        AND user_id = auth.uid() 
        AND invite_status = 'accepted'
    ) OR EXISTS (
      SELECT 1 FROM parts WHERE id = part_id AND creator_id = auth.uid()
    )
  );
CREATE POLICY "Part members can send messages" ON chat_messages 
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND (
      EXISTS (
        SELECT 1 FROM part_memberships 
        WHERE part_id = chat_messages.part_id 
          AND user_id = auth.uid() 
          AND invite_status = 'accepted'
      ) OR EXISTS (
        SELECT 1 FROM parts WHERE id = part_id AND creator_id = auth.uid()
      )
    )
  );

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_stands_owner ON stands(owner_id);
CREATE INDEX idx_parts_creator ON parts(creator_id);
CREATE INDEX idx_memberships_part ON part_memberships(part_id);
CREATE INDEX idx_memberships_user ON part_memberships(user_id);
CREATE INDEX idx_chat_part_time ON chat_messages(part_id, created_at DESC);
CREATE INDEX idx_chat_author ON chat_messages(author_id);

-- ============================================================
-- Enable Realtime for chat
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE part_memberships;
