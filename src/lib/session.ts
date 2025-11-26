import { SessionOptions } from 'iron-session';

export interface SessionData {
  user_email?: string;
  user_data?: {
    name: string;
    email: string;
    date: string;
  };
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: 'voice_analysis_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 3600, // 1 hour
  },
};
