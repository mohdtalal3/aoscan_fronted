import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioData = formData.get('audio') as string;

        if (!audioData) {
            return NextResponse.json(
                { success: false, error: 'No audio data provided' },
                { status: 400 }
            );
        }

        // Decode base64 audio data
        let audioBytes: Buffer;
        try {
            // Remove the data URL prefix if present
            let base64Data = audioData;
            if (audioData.includes(',')) {
                base64Data = audioData.split(',')[1];
            }

            audioBytes = Buffer.from(base64Data, 'base64');
        } catch (error) {
            return NextResponse.json(
                { success: false, error: `Invalid audio data: ${error}` },
                { status: 400 }
            );
        }

        // Generate unique filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `recording_${timestamp}.wav`;

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (error) {
            // Directory might already exist, that's ok
        }

        const filepath = path.join(uploadsDir, filename);

        // Save audio file
        await writeFile(filepath, audioBytes);

        // Generate URL for the audio file
        const audioUrl = `${request.nextUrl.origin}/uploads/${filename}`;

        return NextResponse.json({
            success: true,
            message: 'Audio uploaded successfully',
            filename,
            audio_url: audioUrl,
        });
    } catch (error) {
        console.error('❌ Error uploading audio:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
