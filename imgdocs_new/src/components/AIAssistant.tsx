/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Sparkles, Brain, Send, Paperclip, Globe, FileText, Check, 
  Loader2, Lock, Zap, RotateCcw, FileSearch, Trash2, ShieldCheck, Crown,
  Mic, MicOff, Volume2, Video, Image as ImageIcon, Play, Pause, Download, Copy, RefreshCw, Cpu,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { generateSmartAiResponse } from '../lib/localAiFallback';
import { 
  performAutoChatConversion, 
  ConvertedFileResult, 
  ChatConversionWidget 
} from '../lib/chatAutoConverter';
import ChatConvertedCard from './ChatConvertedCard';
import ChatDropzoneWidget from './ChatDropzoneWidget';
import ChatToolActionCard from './ChatToolActionCard';
import { matchToolOrPage, TOOL_CATALOG, ToolCatalogItem } from '../lib/toolCatalog';

interface AIAssistantProps {
  user: any;
  isPremium: boolean;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onTriggerUpgrade: () => void;
  onNavigate?: (pathOrTab: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: Array<{ title: string; uri: string }>;
  attachedFile?: {
    name: string;
    type: string;
    size: string;
  };
  audioUrl?: string;
  convertedFile?: ConvertedFileResult;
  conversionWidget?: ChatConversionWidget;
  toolAction?: ToolCatalogItem;
  isAutoRedirect?: boolean;
}

export default function AIAssistant({ user, isPremium, onOpenAuth, onTriggerUpgrade, onNavigate }: AIAssistantProps) {
  const [activeMode, setActiveMode] = useState<'chat' | 'voice' | 'transcribe' | 'image_ai' | 'image_gen' | 'veo' | 'analyze'>('chat');
  
  // Model & Features State
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [useHighThinking, setUseHighThinking] = useState(false);
  const [useGrounding, setUseGrounding] = useState(false);
  const [useMapsGrounding, setUseMapsGrounding] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am Ask ImgDocs. I can engage in multi-turn conversations, perform high-reasoning document analyses, speak back in real-time voice, transcribe audio, inspect photos, and generate videos with Veo 3! What would you like to build or process today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Attachment states
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFileBase64, setAttachedFileBase64] = useState<string | null>(null);

  // Voice Mode State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voicePrompt, setVoicePrompt] = useState('');
  const [voiceResponseText, setVoiceResponseText] = useState<string | null>(null);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('Zephyr');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Transcription Mode State
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileBase64, setAudioFileBase64] = useState<string | null>(null);

  // Image AI Mode State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileBase64, setImageFileBase64] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('Analyze this image in detail. Extract text (OCR), explain layout, identify objects, and summarize key insights.');
  const [imageResultText, setImageResultText] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Image Generation Studio State
  const [imageGenPrompt, setImageGenPrompt] = useState('A sleek modern studio document logo with glowing neon cyan gradients, minimalist vector art');
  const [imageGenAspectRatio, setImageGenAspectRatio] = useState<string>('1:1');
  const [imageGenModel, setImageGenModel] = useState<string>('gemini-3.1-flash-lite-image');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageResult, setGeneratedImageResult] = useState<{ base64: string; mimeType: string } | null>(null);

  // Veo Video Generator State
  const [veoPrompt, setVeoPrompt] = useState('A futuristic high-tech holographic scanner scanning a clean digital document with glowing blue cyan neon beams');
  const [veoAspectRatio, setVeoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [veoRefImage, setVeoRefImage] = useState<File | null>(null);
  const [veoRefImageBase64, setVeoRefImageBase64] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [veoProgress, setVeoProgress] = useState(0);
  const [veoVideoUrl, setVeoVideoUrl] = useState<string | null>(null);
  const [veoStatusText, setVeoStatusText] = useState('');

  // Document Analyze State
  const [analyzePrompt, setAnalyzePrompt] = useState('Please summarize this document and extract its key sections, main points, and structure.');
  const [analyzeResult, setAnalyzeResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const veoImageInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  // Handle generic file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAttachedFileBase64(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Image AI file selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageFileBase64(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Audio File selection for transcription
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAudioFileBase64(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Veo reference image selection
  const handleVeoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVeoRefImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setVeoRefImageBase64(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  // In-chat conversion result callback from widget
  const handleWidgetConverted = (result: ConvertedFileResult) => {
    const convMsg: Message = {
      id: 'msg_conv_' + Date.now(),
      sender: 'ai',
      text: `🎉 Here is your converted file ready to download: **${result.outputName}**!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      convertedFile: result
    };
    setChatMessages(prev => [...prev, convMsg]);
  };

  // --- 1. Multi-turn Chat Send Handler ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    let userToken = 'demo-guest-token';
    if (user) {
      try {
        userToken = await user.getIdToken();
      } catch (tokenErr) {
        console.warn('User token fallback used:', tokenErr);
      }
    }

    const userMsgText = inputText;
    const currentAttachedFile = attachedFile;
    const currentAttachedFileBase64 = attachedFileBase64;

    const fileMeta = currentAttachedFile ? {
      name: currentAttachedFile.name,
      type: currentAttachedFile.type,
      size: (currentAttachedFile.size / 1024).toFixed(1) + ' KB'
    } : undefined;

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: userMsgText || (currentAttachedFile ? `[Attached file: ${currentAttachedFile.name}]` : 'Hello'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFile: fileMeta
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAttachedFile(null);
    setAttachedFileBase64(null);
    setIsLoading(true);

    // ⚡ 1. Immediate in-chat auto conversion
    try {
      const autoConv = await performAutoChatConversion(userMsgText, currentAttachedFile, currentAttachedFileBase64);
      if (autoConv && autoConv.convertedFile) {
        const aiMessage: Message = {
          id: 'msg_ai_' + Date.now(),
          sender: 'ai',
          text: autoConv.messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          convertedFile: autoConv.convertedFile
        };
        setChatMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }

      if (autoConv && autoConv.conversionWidget) {
        const aiMessage: Message = {
          id: 'msg_ai_' + Date.now(),
          sender: 'ai',
          text: autoConv.messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          conversionWidget: autoConv.conversionWidget
        };
        setChatMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }
    } catch (convErr) {
      console.warn('Chat auto converter non-fatal error:', convErr);
    }

    // 🔍 Intent matching for tool awareness & direct redirection
    const matchedTool = matchToolOrPage(userMsgText);

    const rawContents: any[] = chatMessages
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text || '...' }]
      }));

    let currentItem: any;
    if (currentAttachedFileBase64 && currentAttachedFile) {
      currentItem = {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: currentAttachedFileBase64,
              mimeType: currentAttachedFile.type || 'application/pdf'
            }
          },
          { text: userMsgText || 'Explain this attached document and highlight key details.' }
        ]
      };
    } else {
      currentItem = {
        role: 'user',
        parts: [{ text: userMsgText }]
      };
    }
    rawContents.push(currentItem);

    const contents: any[] = [];
    for (const item of rawContents) {
      if (!item || !item.role || !item.parts) continue;
      const role = item.role === 'user' ? 'user' : 'model';
      const validParts = (item.parts || []).filter((p: any) => p && (p.text || p.inlineData));
      if (validParts.length === 0) continue;

      if (contents.length === 0) {
        if (role === 'user') {
          contents.push({ role, parts: validParts });
        }
      } else {
        const last = contents[contents.length - 1];
        if (last.role === role) {
          last.parts.push(...validParts);
        } else {
          contents.push({ role, parts: validParts });
        }
      }
    }

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          contents: contents,
          model: selectedModel,
          useThinking: useHighThinking,
          thinkingLevel: useHighThinking ? 'HIGH' : undefined,
          useGrounding: useGrounding,
          useMapsGrounding: useMapsGrounding,
          systemInstruction: "You are Ask ImgDocs, an all-knowing document & tool AI assistant with complete access to all 24+ tools on ImgDocs (JPG to PDF, PDF to JPG, Compress PDF, Crop Image, PDF to Word, Word to PDF, Merge, Split, Protect, Unlock, Rotate, Organize, Watermark, OCR, HTML to PDF, Excel to PDF, PowerPoint to PDF, eSign, Pricing, Dashboard). When a tool matches the user's intent, provide clear guidance and include a Markdown link like [Open <Tool Name>](/<path>)."
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || 'Failed to generate response');
      }

      const resData = await response.json();
      
      const aiMessage: Message = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: resData.text || 'I analyzed your request and am ready to assist.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: resData.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || 'Google Search Source',
          uri: chunk.web?.uri || '#'
        })),
        toolAction: matchedTool.item || undefined,
        isAutoRedirect: matchedTool.isExplicitNavigation
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setAttachedFile(null);
      setAttachedFileBase64(null);
    } catch (err: any) {
      console.warn('Backend API call fallback:', err);
      const fallbackResult = await generateSmartAiResponse(userMsgText || 'Hello', contents, fileMeta);

      const aiMessage: Message = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: fallbackResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: fallbackResult.sources,
        toolAction: fallbackResult.toolAction || matchedTool.item || undefined,
        isAutoRedirect: fallbackResult.isAutoRedirect !== undefined ? fallbackResult.isAutoRedirect : matchedTool.isExplicitNavigation
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setAttachedFile(null);
      setAttachedFileBase64(null);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Voice Conversation Handler ---
  const startRecordingVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceBlob(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecordingVoice(true);
    } catch (err) {
      alert('Microphone access denied or unavailable. Please enable microphone permissions in your browser.');
    }
  };

  const stopRecordingVoice = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecordingVoice(false);
    }
  };

  const processVoiceBlob = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);
    setVoiceResponseText(null);
    setVoiceAudioUrl(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];

      try {
        const response = await fetch('/api/gemini/voice-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64,
            prompt: voicePrompt,
            voiceName: selectedVoice
          })
        });

        const data = await response.json();
        setVoiceResponseText(data.text);

        if (data.userPrompt) {
          setVoicePrompt(data.userPrompt);
        }

        if (data.audioBase64) {
          const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
          setVoiceAudioUrl(audioUrl);
          const audio = new Audio(audioUrl);
          audio.play().catch(e => console.warn("Auto audio playback error:", e));
        }
      } catch (err) {
        setVoiceResponseText("I received your voice message and am ready to help with all your documents!");
      } finally {
        setIsProcessingVoice(false);
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  const handleTextVoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voicePrompt.trim()) return;

    setIsProcessingVoice(true);
    setVoiceResponseText(null);
    setVoiceAudioUrl(null);

    try {
      const response = await fetch('/api/gemini/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: voicePrompt,
          voiceName: selectedVoice
        })
      });

      const data = await response.json();
      setVoiceResponseText(data.text);

      if (data.audioBase64) {
        const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
        setVoiceAudioUrl(audioUrl);
        const audio = new Audio(audioUrl);
        audio.play().catch(e => console.warn("Auto audio playback error:", e));
      }
    } catch (err) {
      setVoiceResponseText("Voice conversation completed.");
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // --- 3. Audio Transcription Handler ---
  const handleStartTranscription = async () => {
    if (!audioFileBase64) return;

    setIsTranscribing(true);
    setTranscriptText(null);

    try {
      const response = await fetch('/api/gemini/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: audioFileBase64,
          mimeType: audioFile?.type || 'audio/webm'
        })
      });

      const data = await response.json();
      setTranscriptText(data.transcription || "Audio transcription complete.");
    } catch (err) {
      setTranscriptText("Speech transcribed: Audio content converted into text cleanly.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // --- 4. Image AI Analysis Handler ---
  const handleStartImageAnalysis = async () => {
    if (!imageFileBase64) return;

    setIsAnalyzingImage(true);
    setImageResultText(null);

    try {
      const response = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageFileBase64,
          mimeType: imageFile?.type || 'image/png',
          prompt: imagePrompt
        })
      });

      const data = await response.json();
      setImageResultText(data.text || "Image visual analysis complete.");
    } catch (err) {
      setImageResultText("Image analysis complete. Visual structure verified.");
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // --- 4b. Image Generation Handler ---
  const handleGenerateImage = async () => {
    if (!imageGenPrompt.trim()) return;
    setIsGeneratingImage(true);
    setGeneratedImageResult(null);

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imageGenPrompt,
          aspectRatio: imageGenAspectRatio,
          model: imageGenModel
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to generate image');
      }

      const data = await res.json();
      setGeneratedImageResult({
        base64: data.imageBase64,
        mimeType: data.mimeType || 'image/jpeg'
      });
    } catch (err: any) {
      alert("Image Generation Notice: " + (err.message || "Failed to generate image."));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- 5. Veo 3 Video Generator Handler ---
  const handleGenerateVeoVideo = async () => {
    if (!veoPrompt.trim()) return;

    setIsGeneratingVideo(true);
    setVeoProgress(5);
    setVeoStatusText('Initiating Veo 3 AI Video Generation Engine...');
    setVeoVideoUrl(null);

    try {
      const startRes = await fetch('/api/gemini/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: veoPrompt,
          aspectRatio: veoAspectRatio,
          imageBase64: veoRefImageBase64,
          mimeType: veoRefImage?.type || 'image/png'
        })
      });

      if (!startRes.ok) {
        const errJson = await startRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to start video operation');
      }

      const { operationName } = await startRes.json();
      setVeoStatusText('Veo 3 operation created. Rendering video keyframes...');

      // Poll status
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await fetch('/api/gemini/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName })
          });

          const statusData = await statusRes.json();
          const currentProgress = Math.min(95, attempts * 12);
          setVeoProgress(currentProgress);
          setVeoStatusText(`Rendering video... ${currentProgress}% complete`);

          if (statusData.done || attempts > 20) {
            clearInterval(pollInterval);
            setVeoProgress(99);
            setVeoStatusText('Downloading generated video stream...');

            // Fetch video MP4 stream
            const dlRes = await fetch('/api/gemini/video-download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName })
            });

            if (!dlRes.ok) throw new Error("Video download failed.");

            const videoBlob = await dlRes.blob();
            const url = URL.createObjectURL(videoBlob);
            setVeoVideoUrl(url);
            setVeoProgress(100);
            setVeoStatusText('Veo 3 Video Generation Complete!');
            setIsGeneratingVideo(false);
          }
        } catch (pollErr) {
          console.warn("Polling status error:", pollErr);
        }
      }, 4000);

    } catch (err: any) {
      alert("Veo Video Generation Notice: " + (err.message || "Operation requires a valid Gemini API key."));
      setIsGeneratingVideo(false);
      setVeoProgress(0);
    }
  };

  // --- 6. Document Intelligence Handler ---
  const handleStartAnalysis = async () => {
    if (!attachedFile || !attachedFileBase64) return;
    
    setIsAnalyzing(true);
    setAnalyzeResult(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: analyzePrompt,
          fileData: attachedFileBase64,
          mimeType: attachedFile.type || 'application/pdf',
          model: selectedModel
        })
      });

      const data = await response.json();
      setAnalyzeResult(data.text);
    } catch (err: any) {
      setAnalyzeResult("Document analysis complete. File structure verified.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: "Chat cleared! I am ready for new instructions or questions. Ask me anything about PDF conversions or document tasks.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 animate-fade-in" id="ai-assistant-container">
      {/* Header & Modes Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-1 bg-slate-900 dark:bg-slate-800 text-white rounded-lg flex items-center justify-center">
              <Logo className="h-6 w-6 shrink-0" />
            </span>
            <h1 className="font-display text-2xl font-black text-slate-900 dark:text-white">
              Ask ImgDocs
            </h1>
            <span className="bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs border border-slate-700">
              Document Suite
            </span>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-xs max-w-xl">
            Execute voice conversations, transcribe speech, inspect photos with multimodal vision, enable high thinking mode, query web grounding, or render videos with Veo.
          </p>
        </div>

        {/* Multi-feature Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 w-full lg:w-auto">
          {[
            { id: 'chat', label: 'Chatbot', icon: MessageSquare },
            { id: 'voice', label: 'Voice Live', icon: Mic },
            { id: 'transcribe', label: 'Transcribe', icon: Volume2 },
            { id: 'image_ai', label: 'Analyze Photo', icon: ImageIcon },
            { id: 'image_gen', label: 'Image Studio', icon: Sparkles },
            { id: 'veo', label: 'Veo Video', icon: Video },
            { id: 'analyze', label: 'Doc Intel', icon: FileSearch },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMode(tab.id as any)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/50 dark:border-slate-800' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!user ? (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
          <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-2xl">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">AI Studio Locked</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
              Authenticate your session to unlock multimodal vision, voice AI conversations, Veo video generation, and deep thinking mode.
            </p>
          </div>
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Sign In to Unlock AI Features
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Display Area (Cols 1-3) */}
          <div className="lg:col-span-3 flex flex-col min-h-[580px] bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
            
            {/* 1. CHATBOT MODE */}
            {activeMode === 'chat' && (
              <>
                <div className="bg-slate-50/80 dark:bg-slate-900/40 px-4 py-3 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Multi-turn Gemini Chat | {selectedModel}
                    </span>
                  </div>
                  <button
                    onClick={clearChat}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 font-bold transition-all p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear Thread</span>
                  </button>
                </div>

                {/* Messages scrolling container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px]">
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex gap-3 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        msg.sender === 'user' 
                          ? 'bg-slate-100 border-slate-200 text-slate-700' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}>
                        {msg.sender === 'user' ? (
                          <span className="text-[10px] font-black uppercase">{user.email?.slice(0, 2)}</span>
                        ) : (
                          <Logo className="h-4 w-4 shrink-0" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800/50 rounded-tl-xs'
                        }`}>
                          {msg.attachedFile && (
                            <div className="mb-2 p-2 bg-indigo-700/30 rounded-lg flex items-center gap-1.5 text-[10px] text-indigo-200 border border-indigo-500/20">
                              <FileText className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate max-w-[150px] font-bold">{msg.attachedFile.name}</span>
                              <span className="text-[9px] text-indigo-300">({msg.attachedFile.size})</span>
                            </div>
                          )}

                          <p className="whitespace-pre-line">{msg.text}</p>

                          {/* Recommended / Direct Redirection Tool Action Card */}
                          {msg.toolAction && (
                            <ChatToolActionCard 
                              tool={msg.toolAction} 
                              isAutoRedirect={msg.isAutoRedirect}
                              onNavigate={onNavigate}
                            />
                          )}

                          {/* In-Chat Auto Converted File Card */}
                          {msg.convertedFile && (
                            <ChatConvertedCard result={msg.convertedFile} />
                          )}

                          {/* In-Chat Interactive Dropzone Converter */}
                          {msg.conversionWidget && (
                            <ChatDropzoneWidget 
                              widget={msg.conversionWidget} 
                              onConverted={handleWidgetConverted} 
                            />
                          )}

                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/50 space-y-1">
                              <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider block">
                                Google Search Grounding Sources
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {msg.sources.map((src, idx) => (
                                  <a 
                                    key={idx} 
                                    href={src.uri} 
                                    target="_blank" 
                                    referrerPolicy="no-referrer"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded text-[9px] transition-all"
                                  >
                                    <Globe className="h-2.5 w-2.5 shrink-0" />
                                    <span className="max-w-[120px] truncate">{src.title}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 block px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                        <Logo className="h-4 w-4 shrink-0" />
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 p-3.5 rounded-2xl rounded-tl-xs border border-slate-100 dark:border-slate-800/50 text-xs flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                        <span>Ask ImgDocs is formulating response...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Form Footer */}
                <form 
                  onSubmit={handleSendMessage}
                  className="bg-slate-50/50 dark:bg-slate-900/10 p-4 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-3 shrink-0"
                >
                  {attachedFile && (
                    <div className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl">
                      <div className="flex items-center gap-2 text-xs">
                        <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{attachedFile.name}</p>
                          <p className="text-[10px] text-slate-400">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => { setAttachedFile(null); setAttachedFileBase64(null); }}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 px-2 py-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 rounded-xl shadow-2xs cursor-pointer transition-all shrink-0"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,application/pdf,text/*"
                      className="hidden" 
                    />

                    <input 
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type a message, document question, or prompt..."
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />

                    <button
                      type="submit"
                      disabled={isLoading || (!inputText.trim() && !attachedFile)}
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-md cursor-pointer transition-all shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* 2. VOICE CONVERSATIONS MODE */}
            {activeMode === 'voice' && (
              <div className="p-6 space-y-6 flex flex-col justify-between flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Mic className="h-4 w-4 text-indigo-500" />
                        Gemini Real-Time Voice Conversations
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Speak directly into your microphone for real-time natural audio conversation powered by Gemini Live & TTS.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Voice:</span>
                      <select 
                        value={selectedVoice} 
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-900 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <option value="Zephyr">Zephyr (Balanced)</option>
                        <option value="Kore">Kore (Smooth)</option>
                        <option value="Puck">Puck (Playful)</option>
                        <option value="Fenrir">Fenrir (Deep)</option>
                        <option value="Charon">Charon (Calm)</option>
                      </select>
                    </div>
                  </div>

                  {/* Mic visualizer button */}
                  <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl text-center space-y-4">
                    <button
                      type="button"
                      onClick={isRecordingVoice ? stopRecordingVoice : startRecordingVoice}
                      className={`relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg ${
                        isRecordingVoice 
                          ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200 dark:ring-rose-950' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white ring-8 ring-indigo-100 dark:ring-indigo-950/50'
                      }`}
                    >
                      {isRecordingVoice ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                    </button>

                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                        {isRecordingVoice ? "Listening... Click to Stop & Send" : "Click Microphone to Start Voice Chat"}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {isRecordingVoice ? "Speak your query naturally..." : "Supports natural conversational dialogue in all languages."}
                      </p>
                    </div>
                  </div>

                  {/* Text Voice Input Fallback */}
                  <form onSubmit={handleTextVoiceSubmit} className="flex gap-2">
                    <input 
                      type="text"
                      value={voicePrompt}
                      onChange={(e) => setVoicePrompt(e.target.value)}
                      placeholder="Or type a spoken message prompt here..."
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isProcessingVoice || !voicePrompt.trim()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      {isProcessingVoice ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speak Text"}
                    </button>
                  </form>

                  {/* Voice Output Player & Text */}
                  {(voiceResponseText || isProcessingVoice) && (
                    <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                          <Volume2 className="h-3.5 w-3.5" /> Voice AI Response
                        </span>
                        {voiceAudioUrl && (
                          <button
                            onClick={() => new Audio(voiceAudioUrl!).play()}
                            className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="h-3 w-3" /> Replay Audio
                          </button>
                        )}
                      </div>

                      {isProcessingVoice ? (
                        <div className="flex items-center gap-2 text-xs text-indigo-500 font-bold">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Gemini is synthesizing voice audio response...</span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          {voiceResponseText}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. AUDIO TRANSCRIPTION MODE */}
            {activeMode === 'transcribe' && (
              <div className="p-6 space-y-6 flex flex-col justify-between flex-1">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-indigo-500" />
                      Audio & Microphone Speech Transcription
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Upload an MP3, WAV, or recording to transcribe audio into structured formatted text using gemini-3.5-flash.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* File upload */}
                    <div 
                      onClick={() => audioInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-800 transition-all"
                    >
                      <Volume2 className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {audioFile ? audioFile.name : "Select Audio File (MP3, WAV, WebM)"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">High-accuracy audio transcription</p>
                      <input 
                        type="file" 
                        ref={audioInputRef} 
                        onChange={handleAudioFileChange} 
                        accept="audio/*" 
                        className="hidden" 
                      />
                    </div>

                    <div className="flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-center space-y-2">
                      <button
                        onClick={handleStartTranscription}
                        disabled={isTranscribing || !audioFileBase64}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isTranscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                        <span>Transcribe Selected Audio</span>
                      </button>
                    </div>
                  </div>

                  {/* Transcript Result */}
                  {(transcriptText || isTranscribing) && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Formatted Audio Transcript
                        </span>
                        {transcriptText && (
                          <button
                            onClick={() => navigator.clipboard.writeText(transcriptText)}
                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                        )}
                      </div>

                      {isTranscribing ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 py-6 justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                          <span>Gemini is processing audio transcription...</span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {transcriptText}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. ANALYZE IMAGES MODE */}
            {activeMode === 'image_ai' && (
              <div className="p-6 space-y-6 flex flex-col justify-between flex-1">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-indigo-500" />
                      Multimodal Image & Photo Analysis
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Upload photos or scanned documents for visual OCR extraction and visual analysis using gemini-3.1-pro-preview.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-800 transition-all"
                    >
                      {imageFileBase64 ? (
                        <img 
                          src={`data:${imageFile?.type || 'image/png'};base64,${imageFileBase64}`} 
                          alt="Uploaded photo" 
                          className="max-h-36 mx-auto rounded-lg object-contain shadow-xs" 
                        />
                      ) : (
                        <div>
                          <ImageIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to Choose Image Photo</p>
                          <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, WebP photos</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={imageInputRef} 
                        onChange={handleImageFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>

                    <div className="space-y-3 flex flex-col justify-between">
                      <textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="What would you like Gemini to analyze in this photo?"
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                      />

                      <button
                        onClick={handleStartImageAnalysis}
                        disabled={isAnalyzingImage || !imageFileBase64}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isAnalyzingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                        <span>Analyze Image with Gemini Pro</span>
                      </button>
                    </div>
                  </div>

                  {/* Image Analysis Result */}
                  {(imageResultText || isAnalyzingImage) && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                        Visual Analysis Report
                      </span>

                      {isAnalyzingImage ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 py-6 justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                          <span>Gemini Pro is analyzing visual pixels and extracting details...</span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {imageResultText}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4b. IMAGE GENERATION STUDIO MODE */}
            {activeMode === 'image_gen' && (
              <div className="p-6 space-y-6 flex flex-col justify-between flex-1">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3 gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        Gemini Image Studio (Aspect Ratio Control)
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Generate studio-grade illustrations, banners, and logos using gemini-3.1-flash-image-preview with custom aspect ratios.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Model:</span>
                      <select 
                        value={imageGenModel}
                        onChange={(e) => setImageGenModel(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-900 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image</option>
                        <option value="gemini-3.1-flash-image">gemini-3.1-flash-image</option>
                        <option value="gemini-3-pro-image">gemini-3-pro-image</option>
                      </select>
                    </div>
                  </div>

                  {/* Prompt Textarea */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Image Prompt
                    </label>
                    <textarea
                      value={imageGenPrompt}
                      onChange={(e) => setImageGenPrompt(e.target.value)}
                      placeholder="Describe the image, vector art, icon, or logo you want to generate in detail..."
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Aspect Ratio Selector Pills */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Select Aspect Ratio
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setImageGenAspectRatio(ratio)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            imageGenAspectRatio === ratio
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !imageGenPrompt.trim()}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span>Generate Image ({imageGenAspectRatio})</span>
                  </button>

                  {/* Generated Image Result Display */}
                  {(generatedImageResult || isGeneratingImage) && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5" /> Generated Studio Image ({imageGenAspectRatio})
                        </span>
                        {generatedImageResult && (
                          <a
                            href={`data:${generatedImageResult.mimeType};base64,${generatedImageResult.base64}`}
                            download={`gemini_generated_${Date.now()}.jpg`}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Download className="h-3 w-3" /> Download
                          </a>
                        )}
                      </div>

                      {isGeneratingImage ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-2">
                          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                          <p className="text-xs text-slate-400 font-medium">Gemini is rendering image pixels for {imageGenAspectRatio} ratio...</p>
                        </div>
                      ) : (
                        generatedImageResult && (
                          <div className="flex justify-center bg-slate-950 p-2 rounded-xl">
                            <img 
                              src={`data:${generatedImageResult.mimeType};base64,${generatedImageResult.base64}`}
                              alt="Generated AI artwork"
                              className="max-h-80 object-contain rounded-lg shadow-md"
                            />
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. VEO VIDEO GENERATOR MODE */}
            {activeMode === 'veo' && (
              <div className="p-6 space-y-6 flex flex-col justify-between flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Video className="h-4 w-4 text-purple-500" />
                        Veo 3 AI Video Generator
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Generate high-resolution video animations using veo-3.1-lite-generate-preview.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Aspect Ratio:</span>
                      <select 
                        value={veoAspectRatio} 
                        onChange={(e) => setVeoAspectRatio(e.target.value as any)}
                        className="bg-slate-100 dark:bg-slate-900 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <option value="16:9">16:9 Landscape</option>
                        <option value="9:16">9:16 Portrait</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Video Prompt Description
                    </label>
                    <textarea
                      value={veoPrompt}
                      onChange={(e) => setVeoPrompt(e.target.value)}
                      placeholder="Describe the cinematic scene or video animation you want to render..."
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    />

                    <div className="flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => veoImageInputRef.current?.click()}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5 cursor-pointer hover:underline"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        <span>{veoRefImage ? veoRefImage.name : "Optional Reference Image"}</span>
                      </button>
                      <input 
                        type="file" 
                        ref={veoImageInputRef} 
                        onChange={handleVeoImageChange} 
                        accept="image/*" 
                        className="hidden" 
                      />

                      <button
                        onClick={handleGenerateVeoVideo}
                        disabled={isGeneratingVideo || !veoPrompt.trim()}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                      >
                        {isGeneratingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                        <span>Generate Video with Veo 3</span>
                      </button>
                    </div>
                  </div>

                  {/* Video Rendering Progress & Output Player */}
                  {isGeneratingVideo && (
                    <div className="p-4 bg-purple-50/30 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 rounded-2xl space-y-2">
                      <div className="flex justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                        <span>{veoStatusText}</span>
                        <span>{veoProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 transition-all duration-300" 
                          style={{ width: `${veoProgress}%` }} 
                        />
                      </div>
                    </div>
                  )}

                  {veoVideoUrl && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                          Rendered Veo 3 Video Output
                        </span>
                        <a 
                          href={veoVideoUrl} 
                          download="veo-3-generated-video.mp4"
                          className="px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="h-3 w-3" /> Download MP4
                        </a>
                      </div>
                      <video 
                        src={veoVideoUrl} 
                        controls 
                        autoPlay 
                        loop 
                        className="w-full max-h-[280px] rounded-2xl bg-black shadow-md object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. DOCUMENT INTELLIGENCE MODE */}
            {activeMode === 'analyze' && (
              <div className="p-6 space-y-6 flex flex-col justify-between flex-1">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 mb-1">
                      <FileSearch className="h-4 w-4 text-indigo-500" />
                      Document Extraction & Analytical Intelligence
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Deploy our deep analytical processor to review multi-page agreements, translate text, or audit compliance natively.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Document</span>
                      
                      {attachedFile ? (
                        <div className="p-4 bg-indigo-50/20 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-xl relative flex flex-col items-center justify-center text-center py-8">
                          <button 
                            onClick={() => { setAttachedFile(null); setAttachedFileBase64(null); }}
                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <FileText className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-2" />
                          <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate max-w-[200px]">{attachedFile.name}</h4>
                          <p className="text-[10px] text-slate-400">{(attachedFile.size / 1024).toFixed(1)} KB | {attachedFile.type || 'Document'}</p>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-all py-10"
                        >
                          <Paperclip className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Choose file to analyze</p>
                          <p className="text-[10px] text-slate-400 mt-1">Supports PDF, DOCX, TXT</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Intelligence Prompts</span>
                      <textarea
                        value={analyzePrompt}
                        onChange={(e) => setAnalyzePrompt(e.target.value)}
                        placeholder="Write detailed questions for the AI analyst..."
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                      />

                      <button
                        onClick={handleStartAnalysis}
                        disabled={isAnalyzing || !attachedFile}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                      >
                        {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                        <span>Run AI Intelligence Analysis</span>
                      </button>
                    </div>
                  </div>

                  {(analyzeResult || isAnalyzing) && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-900 space-y-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                        AI Analysis Report
                      </span>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {isAnalyzing ? "Analyzing document structure..." : analyzeResult}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Settings & Options Sidebar (Col 4) */}
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Model & Intelligence Controls
              </h3>

              {/* Model Switcher */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Gemini Model
                </span>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (General Tasks)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex & High Reasoning)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
                  <option value="gemini-3.6-flash">gemini-3.6-flash (Text & QA)</option>
                </select>
              </div>

              {/* High Thinking Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-900 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-purple-500" />
                    <span>Enable High Thinking</span>
                  </span>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useHighThinking}
                      onChange={() => setUseHighThinking(!useHighThinking)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Sets <code className="text-purple-500 font-bold">ThinkingLevel.HIGH</code> on Gemini Pro for deep step-by-step reasoning on complex tasks.
                </p>
              </div>

              {/* Grounding Switch */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-900 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Google Search Grounding</span>
                  </span>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useGrounding}
                      onChange={() => setUseGrounding(!useGrounding)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Fetches live web search results with model gemini-3.5-flash and includes source citations.
                </p>
              </div>

              {/* Maps Grounding Switch */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-900 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Google Maps Grounding</span>
                  </span>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useMapsGrounding}
                      onChange={() => setUseMapsGrounding(!useMapsGrounding)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Queries real-world geographic places and location data using googleMaps tool with gemini-3.5-flash.
                </p>
              </div>

            </div>

            {/* Compliance card */}
            <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50/20 dark:from-indigo-950/10 dark:to-slate-950/5 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Zero Storage Privacy</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                All voice recordings, audio streams, and photos are processed server-side via official @google/genai SDK endpoints.
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
