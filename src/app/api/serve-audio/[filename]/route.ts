import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        
        console.log(`📥 Serving audio file request: ${filename}`);
        
        // Validate filename to prevent directory traversal attacks
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            console.error(`❌ Invalid filename: ${filename}`);
            return NextResponse.json(
                { success: false, error: 'Invalid filename' },
                { status: 400 }
            );
        }

        // Get the file path
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const filepath = path.join(uploadsDir, filename);
        
        console.log(`📁 Looking for file at: ${filepath}`);

        // Read the file
        const fileBuffer = await readFile(filepath);
        
        console.log(`✅ File found, serving: ${filename} (${fileBuffer.length} bytes)`);

        // Return the file with appropriate headers
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/wav',
                'Content-Disposition': `inline; filename="${filename}"`,
                'Cache-Control': 'public, max-age=31536000',
                'Access-Control-Allow-Origin': '*', // Allow cross-origin for localhost
            },
        });
    } catch (error: any) {
        console.error('❌ Error serving audio file:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            path: error.path
        });
        return NextResponse.json(
            { success: false, error: 'File not found', details: error.message },
            { status: 404 }
        );
    }
}
