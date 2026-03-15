# JJBA Platform — Setup Guide

## Folder Structure

```
your-repo/
├── index.html           ← Landing page
├── dashboard.html       ← User dashboard
├── encyclopedia.html    ← Character/Stand browser
├── forum.html           ← Community forum
├── quiz.html            ← JoJo quiz (3 difficulty levels)
├── profile.html         ← User profile
├── css/
│   └── style.css        ← All shared styles
├── js/
│   └── app.js           ← Shared: Supabase auth, music player, rotating backgrounds
├── backgrounds/         ← Put your 6 background images here
│   ├── jojo-purple-pattern.png
│   ├── jojo-symbols-rainbow.png
│   ├── jojo-dark-pattern.png
│   ├── sbr-blue-characters.png
│   ├── jotaro-sunburst.png
│   └── sbr-cast-wagon.png
└── music/               ← Put your .mp3 files here
    ├── giornos-theme.mp3
    ├── sono-chi-no-sadame.mp3
    ├── il-vento-doro.mp3
    ├── bloody-stream.mp3
    ├── stand-proud.mp3
    ├── great-days.mp3
    └── cnbt.mp3
```

## Supabase Setup

1. Create a free project at https://supabase.com
2. Go to Project Settings → API
3. Copy your Project URL and anon/public key
4. Open `js/app.js` and replace:
   ```js
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

## Deploying to Cloudflare Pages

1. Push all files to your GitHub repo
2. Go to Cloudflare Pages → Create a project
3. Connect your GitHub repo
4. **Build settings:** Leave everything blank (no build command needed — it's plain HTML!)
5. Deploy!

That's it. No npm, no build step, no errors.
