// Audio recording configuration
export const SAMPLE_RATE = 4100; // 4.1 kHz as specified
export const CHANNELS = 2; // Stereo
export const BIT_DEPTH = 16; // 16-bit
export const RECORDING_DURATION = 10; // 10 seconds

export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private audioContext: AudioContext | null = null;
    private stream: MediaStream | null = null;

    async startRecording(): Promise<void> {
        this.audioChunks = [];

        // Request microphone access
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: CHANNELS,
                sampleRate: SAMPLE_RATE,
                // @ts-ignore - sampleSize is not in TypeScript types but is valid
                sampleSize: BIT_DEPTH,
            },
        });

        // Create audio context
        this.audioContext = new (window.AudioContext ||
            // @ts-ignore - webkitAudioContext for Safari
            window.webkitAudioContext)({
                sampleRate: SAMPLE_RATE,
            });

        // Create media recorder
        const options: MediaRecorderOptions = {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: SAMPLE_RATE * CHANNELS * BIT_DEPTH,
        };

        // Fallback for browsers that don't support the preferred mime type
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'audio/webm';
        }

        this.mediaRecorder = new MediaRecorder(this.stream, options);

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };

        this.mediaRecorder.start();
    }

    async stopRecording(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error('MediaRecorder not initialized'));
                return;
            }

            this.mediaRecorder.onstop = async () => {
                try {
                    const blob = new Blob(this.audioChunks, { type: 'audio/webm' });

                    // Convert to WAV format
                    const wavBlob = await this.convertToWAV(blob);

                    // Stop all tracks
                    this.stream?.getTracks().forEach((track) => track.stop());

                    resolve(wavBlob);
                } catch (error) {
                    reject(error);
                }
            };

            this.mediaRecorder.stop();
        });
    }

    isRecording(): boolean {
        return this.mediaRecorder?.state === 'recording';
    }

    private async convertToWAV(webmBlob: Blob): Promise<Blob> {
        try {
            if (!this.audioContext) {
                throw new Error('AudioContext not initialized');
            }

            const arrayBuffer = await webmBlob.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            // Resample to target sample rate
            const offlineContext = new OfflineAudioContext(
                CHANNELS,
                audioBuffer.duration * SAMPLE_RATE,
                SAMPLE_RATE
            );

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineContext.destination);
            source.start(0);

            const resampledBuffer = await offlineContext.startRendering();

            // Convert to WAV
            const wavBlob = this.audioBufferToWav(resampledBuffer);
            return wavBlob;
        } catch (error) {
            console.error('Error converting to WAV:', error);
            // Fallback: return original blob
            return webmBlob;
        }
    }

    private audioBufferToWav(audioBuffer: AudioBuffer): Blob {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length;
        const bytesPerSample = BIT_DEPTH / 8;

        // Create buffer
        const buffer = new ArrayBuffer(44 + length * numChannels * bytesPerSample);
        const view = new DataView(buffer);

        // Write WAV header
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + length * numChannels * bytesPerSample, true);
        this.writeString(view, 8, 'WAVE');
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // PCM chunk size
        view.setUint16(20, 1, true); // PCM format
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
        view.setUint16(32, numChannels * bytesPerSample, true);
        view.setUint16(34, BIT_DEPTH, true);
        this.writeString(view, 36, 'data');
        view.setUint32(40, length * numChannels * bytesPerSample, true);

        // Write audio data
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                const sample = Math.max(
                    -1,
                    Math.min(1, audioBuffer.getChannelData(channel)[i])
                );
                const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
                view.setInt16(offset, intSample, true);
                offset += 2;
            }
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }

    private writeString(view: DataView, offset: number, string: string): void {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}
