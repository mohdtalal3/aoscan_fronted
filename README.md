# Voice Analysis System - Next.js Application

This is a complete Next.js conversion of the Flask/Python voice analysis system. The application provides user authentication via Google Sheets, client registration forms, and audio recording capabilities.

## Features

- **🔐 Email Authentication**: Users login with email verified against Google Sheets
- **📝 Client Registration Form**: Comprehensive form collecting personal information and physical measurements
- **🎙️ Audio Recording**: 10-second voice recording with WAV conversion (4.1kHz, stereo, 16-bit)
- **🔒 Session Management**: Secure session handling with automatic logout
- **📊 Google Sheets Integration**: Email verification and access control
- **🎨 Modern UI**: Beautiful gradient designs with smooth animations
- **📱 Responsive Design**: Works perfectly on all devices

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Session**: iron-session
- **Google API**: googleapis
- **Audio**: Web Audio API

## Prerequisites

- Node.js 18+ and npm
- Google Cloud Platform project with Sheets API enabled
- Service account credentials for Google Sheets
- Backend API server (for processing submissions)

## Installation

1. **Clone or navigate to the project directory**

```bash
cd nextjs-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure Environment Variables**

Create a `.env.local` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

# Google Sheets Configuration
SPREADSHEET_ID=your_spreadsheet_id_here
CREDENTIALS_JSON={"type":"service_account","project_id":"..."}

# Session Configuration (must be at least 32 characters)
SESSION_PASSWORD=your_complex_password_at_least_32_characters_long
```

Refer to `ENV_SETUP.md` for detailed environment setup instructions.

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── login/route.ts         # Login API endpoint
│   │   │   ├── logout/route.ts        # Logout API endpoint
│   │   │   ├── session/route.ts       # Session check endpoint
│   │   │   └── upload-audio/route.ts  # Audio upload endpoint
│   │   ├── login/
│   │   │   └── page.tsx               # Login page
│   │   ├── thank-you/
│   │   │   └── page.tsx               # Thank you page
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Main registration form
│   │   └── globals.css                # Global styles
│   └── lib/
│       ├── audioRecorder.ts           # Audio recording utility
│       ├── googleSheets.ts            # Google Sheets integration
│       └── session.ts                 # Session configuration
├── public/
│   └── uploads/                       # Uploaded audio files
├── .env.local                         # Environment variables (not in git)
├── ENV_SETUP.md                       # Environment setup guide
└── package.json
```

## Application Flow

1. **Login**: User enters email → Verified against Google Sheets → Session created
2. **Registration**: Authenticated user fills form → Records 10-second audio
3. **Submission**: Audio uploaded to server → Data sent to backend API
4. **Completion**: Redirect to thank you page → Auto-logout after 3 seconds

## Google Sheets Setup

Your Google Sheet should have the following columns:

- `Name`: User's full name
- `Email`: User's email address
- `Date`: Registration/purchase date
- `Expire`: Access status (TRUE = expired, FALSE = active)

## API Endpoints

### Frontend Endpoints

- `GET /` - Main registration form (requires authentication)
- `GET /login` - Login page
- `GET /thank-you` - Thank you page
- `POST /api/login` - Login authentication
- `GET /api/logout` - Logout and clear session
- `GET /api/session` - Check authentication status
- `POST /api/upload-audio` - Upload recorded audio

### Backend Integration

The application sends client data to the backend server at:
- `POST ${NEXT_PUBLIC_BACKEND_URL}/submit-client`

## Audio Specifications

- **Sample Rate**: 4100 Hz (4.1 kHz)
- **Channels**: 2 (Stereo)
- **Bit Depth**: 16-bit
- **Duration**: 10 seconds
- **Format**: WAV (converted from WebM)

## Security Features

- Session-based authentication with encrypted cookies
- HTTP-only cookies for session security
- Environment-based configuration
- Input validation on all forms
- Secure session expiration (1 hour)

## Troubleshooting

### Microphone Access Issues
- Ensure HTTPS in production (required for microphone access)
- Check browser permissions for microphone
- Try different browsers (Chrome, Firefox, Safari)

### Authentication Issues
- Verify Google Sheets credentials in `.env.local`
- Check spreadsheet ID is correct
- Ensure service account has access to the sheet

### Upload Issues
- Check `public/uploads/` directory permissions
- Verify backend URL is correct
- Check network connectivity

## Migrating from Flask

The Python Flask application has been fully converted to Next.js:

| Flask Feature | Next.js Equivalent |
|--------------|-------------------|
| Flask Routes | Next.js App Router API Routes |
| Jinja2 Templates | React Components (TSX) |
| Flask Sessions | iron-session |
| Python gspread | googleapis (Node.js) |
| Flask static files | Next.js public directory |
| Python audio processing | Web Audio API (client-side) |

## Development

### Adding New Pages

Create a new directory in `src/app/` with a `page.tsx` file:

```tsx
export default function NewPage() {
  return <div>New Page Content</div>;
}
```

### Adding New API Routes

Create a new `route.ts` file in `src/app/api/your-endpoint/`:

```tsx
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello' });
}
```

## License

This project is part of the Voice Analysis System.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review environment configuration
3. Check browser console for errors
4. Verify backend server is running
