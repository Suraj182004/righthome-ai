import { NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/voice/whisper';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Whisper API key not configured' },
        { status: 500 }
      );
    }

    // Get the audio file from the request
    const formData = await req.formData();
    const audioFile = formData.get('file') as Blob;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Transcribe the audio file
    const transcription = await transcribeAudio(audioFile);

    return NextResponse.json({ transcription });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during transcription' },
      { status: 500 }
    );
  }
} 