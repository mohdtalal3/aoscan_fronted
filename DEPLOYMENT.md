# Deployment Instructions

## Environment Configuration

This project uses different environment variables for local development and production.

### Local Development
Uses `.env.local` with:
- `NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:5000`
- `NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000`

### Production (DigitalOcean)
Uses `.env.production` with:
- `NEXT_PUBLIC_BACKEND_URL=http://209.97.179.10:5000`
- `NEXT_PUBLIC_FRONTEND_URL=https://aoscan-frontend-hu6pw.ondigitalocean.app`

## How to Deploy to DigitalOcean App Platform

### Method 1: Environment Variables in DigitalOcean Console (Recommended)

1. Go to your DigitalOcean App Platform dashboard
2. Select your app: `aoscan-frontend-hu6pw`
3. Go to **Settings** → **App-Level Environment Variables**
4. Add the following environment variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://209.97.179.10:5000
   NEXT_PUBLIC_FRONTEND_URL=https://aoscan-frontend-hu6pw.ondigitalocean.app
   SPREADSHEET_ID=1S4MpONiJ7VdjuFDUlQPKOre-ccF9Vl5xL93BXDn5CUA
   CREDENTIALS_JSON=<paste the full JSON credentials>
   SESSION_PASSWORD=<your session password>
   ```
5. Click **Save**
6. Push your code changes to trigger a new deployment

### Method 2: Using .env.production file

If you prefer to use the `.env.production` file:

1. Make sure `.env.production` exists with the correct production values
2. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Fix audio URL generation for production"
   git push origin main
   ```
3. DigitalOcean will automatically detect and use `.env.production` during build

## Important Notes

- The `.env.local` file is **only** for local development and won't be deployed
- The `.env.production` file contains production values and will be used during build on DigitalOcean
- Never commit sensitive credentials to public repositories
- After making environment changes on DigitalOcean, redeploy your app

## Verifying the Fix

After deployment, the audio URL should be:
```
https://aoscan-frontend-hu6pw.ondigitalocean.app/uploads/recording_TIMESTAMP.wav
```

NOT:
```
https://localhost:8080/uploads/recording_TIMESTAMP.wav  ❌
```

## Troubleshooting

If you still see localhost URLs after deployment:
1. Check that environment variables are properly set in DigitalOcean console
2. Trigger a full rebuild (not just a restart)
3. Clear Next.js cache by deleting `.next` folder and rebuilding
4. Check the build logs to verify environment variables are being loaded
