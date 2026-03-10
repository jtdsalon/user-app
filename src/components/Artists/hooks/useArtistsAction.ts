import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ARTISTS } from '../constants';
import { DiagnosticProfile } from '../types';
import { optimizeImage } from '@/lib/util/imageProcessor';
import { ARTISTS_PROPERTIES } from '../properties';

export type VibeType = 'Minimalist' | 'Opulent' | 'Avant-Garde';

export interface Message {
  role: 'user' | 'ai';
  content: string;
  image?: string;
  generatedImage?: string;
}

export function useArtistsAction() {
  const [phase, setPhase] = useState<'vibe' | 'diagnostic' | 'consult'>('vibe');
  const [vibe, setVibe] = useState<VibeType | null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticProfile>({
    concerns: [],
    intensity: 'Standard',
    history: '',
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [analyticalStep, setAnalyticalStep] = useState(0);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const analyticalMessages = ARTISTS_PROPERTIES.analytical;

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setAnalyticalStep((prev) => (prev + 1) % analyticalMessages.length);
      }, 1800);
      return () => clearInterval(interval);
    }
  }, [isLoading, analyticalMessages.length]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  }, [isListening]);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const startConsultation = useCallback(() => {
    setPhase('consult');
    setMessages([
      {
        role: 'ai',
        content: ARTISTS_PROPERTIES.consult.welcomeMessage,
      },
    ]);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setErrorToast(ARTISTS_PROPERTIES.errors.cameraDenied);
      setCameraOpen(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraOpen(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setIsProcessingImage(true);
        setErrorToast(null);
        try {
          const optimized = await optimizeImage(file, {
            maxWidth: 1024,
            quality: 0.8,
          });
          setImage(optimized);
        } catch {
          setErrorToast(ARTISTS_PROPERTIES.errors.imageProcessFailed);
        } finally {
          setIsProcessingImage(false);
          if (e.target) e.target.value = '';
        }
      }
    },
    []
  );

  const handleDownload = useCallback((dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() && !image) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      image: image || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    const currentImage = image;
    setInput('');
    setImage(null);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const promptParts: any[] = [];
      const modelName = currentImage
        ? 'gemini-2.5-flash-image'
        : 'gemini-3-flash-preview';

      if (currentImage) {
        promptParts.push({
          inlineData: {
            data: currentImage.split(',')[1],
            mimeType: 'image/jpeg',
          },
        });
      }

      const artistContext = ARTISTS.map(
        (a) =>
          `${a.name} (Specialty: ${a.services.map((s) => s.label).join(', ')}, Rating: ${a.rating})`
      ).join('\n');

      const systemInstruction = `You are a professional virtual stylist and high-end image generation expert.
        Generate realistic, high-quality preview images for style requests (beards, hair, makeup).
        
        IDENTITY PRESERVATION & STYLE RULES:
        1. Preserve the user's exact facial identity, proportions, and skin tone.
        2. Transformations (e.g. beards) MUST suit the user's specific face shape naturally.
        3. Maintain original hair color and skin tone exactly.
        4. Apply professional grooming with clean, precise edges and realistic hair density/texture.
        5. Ensure natural studio lighting and high-resolution output.
        
        CONTEXT:
        - Aesthetic Direction: ${vibe}
        - Personal History: ${diagnostic.history}
        - Available Artisans for Implementation: ${artistContext}

        IF AN IMAGE IS PROVIDED:
        - YOUR FIRST PART should be a generated image showing the requested look on their face. 
        - FOLLOWED BY a second part which is a text response providing your expert architectural advice.`;

      promptParts.push({
        text:
          currentInput ||
          ARTISTS_PROPERTIES.consult.defaultPrompt,
      });

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ parts: promptParts }],
        config: { systemInstruction },
      });

      let aiContent = '';
      let aiGeneratedImage: string | undefined;

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            aiGeneratedImage = `data:image/png;base64,${part.inlineData.data}`;
          } else if (part.text) {
            aiContent += part.text;
          }
        }
      }

      const aiResponse: Message = {
        role: 'ai',
        content: aiContent || ARTISTS_PROPERTIES.consult.aiFallback,
        generatedImage: aiGeneratedImage,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: ARTISTS_PROPERTIES.consult.aiError,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, image, vibe, diagnostic.history]);

  return {
    phase,
    setPhase,
    vibe,
    setVibe,
    diagnostic,
    setDiagnostic,
    messages,
    input,
    setInput,
    image,
    setImage,
    isLoading,
    isProcessingImage,
    analyticalStep,
    analyticalMessages,
    errorToast,
    setErrorToast,
    isListening,
    cameraOpen,
    videoRef,
    chatEndRef,
    toggleListening,
    startConsultation,
    startCamera,
    stopCamera,
    capturePhoto,
    handleImageUpload,
    handleDownload,
    handleSend,
  };
}
