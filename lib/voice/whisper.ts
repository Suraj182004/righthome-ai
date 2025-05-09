/**
 * Utility functions for using OpenAI's Whisper API for voice transcription
 */

/**
 * Transcribe audio to text using Whisper API
 * @param audioBlob The audio blob to transcribe
 * @returns The transcribed text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  
  try {
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('model', 'whisper-1');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Whisper API error: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

/**
 * Convert browser audio recording to a format compatible with Whisper API
 * @param audioBlob Browser audio recording blob (usually in webm format)
 * @returns Converted audio blob in mp3 format
 */
export async function convertAudioForWhisper(audioBlob: Blob): Promise<Blob> {
  // In a real implementation, we would convert the audio to a format supported by Whisper
  // This could be done using the Web Audio API or a library like ffmpeg.wasm
  // For simplicity, we'll just return the original blob in this example
  
  // This is a placeholder for the actual conversion logic
  return audioBlob;
} 