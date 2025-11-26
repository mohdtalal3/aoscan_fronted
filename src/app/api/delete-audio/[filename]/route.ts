import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        
        // Validate filename to prevent directory traversal attacks
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return NextResponse.json(
                { success: false, error: 'Invalid filename' },
                { status: 400 }
            );
        }

        // Get the file path
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const filepath = path.join(uploadsDir, filename);

        // Delete the file
        await unlink(filepath);
        
        console.log(`🗑️  Deleted audio file: ${filename}`);

        return NextResponse.json({
            success: true,
            message: 'Audio file deleted successfully',
            filename
        });
    } catch (error: any) {
        // File not found is not necessarily an error in this context
        if (error.code === 'ENOENT') {
            console.log(`⚠️  Audio file not found (already deleted?): ${error}`);
            return NextResponse.json({
                success: true,
                message: 'File not found (may already be deleted)',
            });
        }
        
        console.error('❌ Error deleting audio file:', error);
        return NextResponse.json(
            { success: false, error: 'Error deleting file' },
            { status: 500 }
        );
    }
}
