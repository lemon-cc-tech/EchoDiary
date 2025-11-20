import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export const useSpeechRecognition = (onFinalResult: (text: string) => void): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isHeldRef = useRef(false); // Tracks if the user is physically holding the button
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Optimization from brief

    recognition.onresult = (event: any) => {
      let finalChunk = '';
      let interimChunk = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalChunk += event.results[i][0].transcript;
        } else {
          interimChunk += event.results[i][0].transcript;
        }
      }

      if (finalChunk) {
        setTranscript(prev => {
          const newVal = prev + ' ' + finalChunk;
          return newVal.trim();
        });
      }
      setInterimTranscript(interimChunk);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied.');
        setIsListening(false);
        isHeldRef.current = false;
      }
    };

    recognition.onend = () => {
      // Crucial logic: If button is still held, restart immediately.
      if (isHeldRef.current) {
        try {
          recognition.start();
        } catch(e) {
           // ignore double start errors
        }
      } else {
        setIsListening(false);
        setInterimTranscript('');
      }
    };

    recognitionRef.current = recognition;
    
    return () => {
        recognition.stop();
    }
  }, []);

  const startListening = useCallback(() => {
    if (error) return;
    setError(null);
    isHeldRef.current = true;
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.log("Already started");
    }
    
    // Failsafe timeout
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (isHeldRef.current) stopListening();
    }, 45000); // 45s safety stop
  }, [error]);

  const stopListening = useCallback(() => {
    isHeldRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    // Wait a tick to let final results process, then trigger callback
    setTimeout(() => {
        setTranscript(current => {
            if (current.trim()) {
                onFinalResult(current.trim());
            }
            return ''; // Reset internal transcript for next session
        });
        setInterimTranscript('');
    }, 500);

  }, [onFinalResult]);

  const resetTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
};