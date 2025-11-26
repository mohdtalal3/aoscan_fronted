import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        // Clear the session after form submission
        await clearSession();
        
        return NextResponse.json({
            success: true,
            message: 'Session cleared'
        });
    } catch (error) {
        console.error('Error clearing session:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to clear session' },
            { status: 500 }
        );
    }
}
