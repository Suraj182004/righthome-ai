'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';

type VoiceAssistantProps = {
  onTranscription: (text: string) => void;
};

export default function VoiceAssistant({ onTranscription }: VoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const startRecording = async () => {
    if (isRecording || isProcessing) return;
    
    try {
      audioChunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event listeners
      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });
      
      mediaRecorder.addEventListener('stop', async () => {
        setIsRecording(false);
        setIsProcessing(true);
        
        try {
          // Create audio blob from chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Create form data to send to the API
          const formData = new FormData();
          formData.append('file', audioBlob);
          
          // Send to our transcription API
          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Error transcribing audio');
          }
          
          const data = await response.json();
          
          // Pass the transcribed text to the parent component
          if (data.transcription) {
            onTranscription(data.transcription);
          } else {
            throw new Error('No transcription received');
          }
        } catch (error) {
          console.error('Error processing voice recording:', error);
          alert('Sorry, there was a problem processing your voice. Please try again.');
        } finally {
          setIsProcessing(false);
          
          // Stop all audio tracks
          stream.getTracks().forEach(track => track.stop());
        }
      });
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Automatically stop recording after 8 seconds as a fallback
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 8000);
      
    } catch (error) {
      console.error('Error starting voice recording:', error);
      setIsRecording(false);
      alert('Sorry, there was a problem accessing your microphone. Please check your browser permissions and try again.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
      className={`rounded-full h-9 w-9 flex items-center justify-center transition-colors ${
        isRecording 
          ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
          : isProcessing 
            ? 'bg-slate-100 text-slate-400 pointer-events-none' 
            : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
      }`}
      title={isRecording ? "Stop Recording" : "Start Voice Search"}
      disabled={isProcessing}
    >
      {isRecording ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <circle cx="12" cy="12" r="10" />
          <rect x="9" y="9" width="6" height="6" />
        </svg>
      ) : isProcessing ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin h-5 w-5">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      )}
      <span className="sr-only">
        {isRecording ? 'Stop Recording' : isProcessing ? 'Processing...' : 'Start Voice Search'}
      </span>
    </Button>
  );
} 