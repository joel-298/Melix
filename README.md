# Melix

A personal music web app: browse, play, and manage your own library without a monthly streaming subscription.

## Why I built this

I made Melix mainly so I would not have to pay for **Spotify Premium** just to listen the way I want. This is a **self-hosted style** setup: you upload tracks once, and you use your own storage and database. Over time that can save a recurring fee every month, with a bit of one-time effort to add songs and run the app.

## What it does

- **Listen** to music in a Spotify-style player (queue, play/pause, seek, volume, favourites, playlists).
- **Upload** songs and cover art; files are stored on **Cloudinary** (generous free tier—on the order of **25 GB** of bandwidth/storage for media depending on your plan), while **metadata and references** live in **MongoDB**.
- **UI** feels close to what you know from **Netflix / Spotify** (dark theme, cards, library flows)—same general idea: discover content and enjoy it in one place.

## Tech stack

| Layer        | Tech                          |
|-------------|-------------------------------|
| Frontend    | React, Vite, Tailwind, **GSAP** |
| Backend     | Node.js, Express              |
| Database    | MongoDB (Mongoose)            |
| Media       | Cloudinary                    |
| Overall     | **MERN**-style architecture   |

## Workflow (high level)

1. Run the backend and frontend, configure `.env` (MongoDB URI, JWT, Cloudinary keys).
2. Add artists/categories as needed, then **upload** audio + artwork through the app.
3. Play from your library; optional download uses the stored file URL.

**Note:** Only upload audio you have the **right** to use (your own recordings, properly licensed files, purchases where redistribution/upload is allowed, etc.). Respect copyright in your country.

## Project layout

```
Melix/
├── backend/    # Express API, Cloudinary upload, auth, caching
├── frontend/   # React UI + player
└── README.md
```

## Quick start (local)

1. **Backend:** `cd backend` → create `.env` with `MONGODB_URI`, `JWT_SECRET`, email settings if you use them, and `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` → `npm install` → `npm run dev` (runs on port **5000** by default).
2. **Frontend:** `cd frontend` → `npm install` → `npm run dev`. Vite proxies `/api` to `http://localhost:5000` (see `vite.config.js`).

## License

Personal / educational use unless you specify otherwise.
