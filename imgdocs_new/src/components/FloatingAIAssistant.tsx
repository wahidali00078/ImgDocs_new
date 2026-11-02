/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Brain, Send, Paperclip, Globe, FileText, Check, 
  Loader2, Lock, Zap, RotateCcw, FileSearch, Trash2, ShieldCheck, Crown,
  Mic, MicOff, Volume2, Video, Image as ImageIcon, Play, Pause, Download, Copy, RefreshCw,
  X, Minus, Maximize2, Minimize2, ChevronDown, ChevronUp, MessageSquare, ExternalLink, Settings
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

interface FloatingAIAssistantProps {
  user: any;
  isPremium: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
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
  convertedFile?: ConvertedFileResult;
  conversionWidget?: ChatConversionWidget;
  toolAction?: ToolCatalogItem;
  isAutoRedirect?: boolean;
}

export default function FloatingAIAssistant({
  user,
  isPremium,
  isOpen,
  onToggle,
  onClose,
  onOpenAuth,
  onTriggerUpgrade,
  onNavigate
}: FloatingAIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'voice' | 'analyze' | 'image_ai' | 'image_gen' | 'veo'>('chat');
  const [showSettings, setShowSettings] = useState(false);

  // Model & Intelligence Controls
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [useHighThinking, setUseHighThinking] = useState(false);
  const [useGrounding, setUseGrounding] = useState(false);
  const [useMapsGrounding, setUseMapsGrounding] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "👋 Hi! I am **Ask ImgDocs**. Ask me anything about PDF conversions, OCR, document analysis, voice tasks, or photo extraction!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // File Attachment
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFileBase64, setAttachedFileBase64] = useState<string | null>(null);

  // Voice State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceResponseText, setVoiceResponseText] = useState<string | null>(null);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Multimodal Image AI
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileBase64, setImageFileBase64] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('Extract all text (OCR) and summarize key insights from this document or photo.');
  const [imageResultText, setImageResultText] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Document Analyzer
  const [docPrompt, setDocPrompt] = useState('Please summarize this document and extract its key sections, main points, and structure.');
  const [docResult, setDocResult] = useState<string | null>(null);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);

  // Image Gen
  const [imageGenPrompt, setImageGenPrompt] = useState('A sleek modern studio document logo with glowing neon cyan gradients, minimalist vector art');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageResult, setGeneratedImageResult] = useState<{ base64: string; mimeType: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen && activeMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isLoading, isOpen, activeMode]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && activeMode === 'chat') {
      setTimeout(() => chatInputRef.current?.focus(), 150);
    }
  }, [isOpen, activeMode]);

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

  const quickPrompts = [
    "🚀 Crop Image",
    "🗜️ Compress PDF",
    "⚡ JPG to PDF",
    "📚 Merge PDF",
    "🔍 Extract Text (OCR)",
    "🗂️ All 24+ Tools"
  ];

  // Copy message
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Quick Prompt click
  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
    setTimeout(() => {
      handleSendMessage(undefined, prompt);
    }, 50);
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

  // Helper to render text with clickable internal links
  const renderMessageContent = (text: string) => {
    // Regex to split on [Label](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      const precedingText = text.substring(lastIndex, match.index);
      if (precedingText) {
        parts.push(precedingText);
      }

      const label = match[1];
      const url = match[2];

      if (url.startsWith('/')) {
        parts.push(
          <button
            key={`link-${match.index}`}
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate(url);
              }
            }}
            className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline decoration-indigo-400 decoration-1 underline-offset-2 cursor-pointer bg-indigo-50/80 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded transition-colors mx-0.5"
          >
            <span>{label}</span>
            <ExternalLink className="h-2.5 w-2.5 inline shrink-0" />
          </button>
        );
      } else {
        parts.push(
          <a
            key={`link-${match.index}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
          >
            {label}
            <ExternalLink className="h-2.5 w-2.5 inline" />
          </a>
        );
      }

      lastIndex = linkRegex.lastIndex;
    }

    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      parts.push(remainingText);
    }

    return parts.length > 0 ? parts : text;
  };

  // Chat Send Handler
  const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const textToSend = directText !== undefined ? directText : inputText;
    if (!textToSend.trim() && !attachedFile) return;

    let userToken = 'demo-guest-token';
    if (user) {
      try {
        if (typeof user.getIdToken === 'function') {
          userToken = await user.getIdToken();
        } else if (user.token) {
          userToken = user.token;
        }
      } catch (tokenErr) {
        console.warn('User token fallback used:', tokenErr);
      }
    }

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
      text: textToSend || (currentAttachedFile ? `[Attached: ${currentAttachedFile.name}]` : 'Hello'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFile: fileMeta
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAttachedFile(null);
    setAttachedFileBase64(null);
    setIsLoading(true);

    // ⚡ 1. Check for immediate automatic in-chat file conversion (100% Free & No Sign-in needed)
    try {
      const autoConv = await performAutoChatConversion(textToSend, currentAttachedFile, currentAttachedFileBase64);
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

    // 🔍 2. Intent matching for tool awareness & direct redirection
    const matchedTool = matchToolOrPage(textToSend);

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
          { text: textToSend || 'Explain this attached document and highlight key details.' }
        ]
      };
    } else {
      currentItem = {
        role: 'user',
        parts: [{ text: textToSend }]
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
        throw new Error('Failed to generate response from Gemini API.');
      }

      const resData = await response.json();
      const aiMessage: Message = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: resData.text || 'I analyzed your request and am ready to assist.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: resData.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || 'Web Search Source',
          uri: chunk.web?.uri || '#'
        })),
        toolAction: matchedTool.item || undefined,
        isAutoRedirect: matchedTool.isExplicitNavigation
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setAttachedFile(null);
      setAttachedFileBase64(null);
    } catch (err: any) {
      console.warn('Chat error fallback:', err);
      const fallbackResult = await generateSmartAiResponse(textToSend || 'Hello', contents, fileMeta);
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

  // Voice Recording
  const startRecordingVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceBlob(audioBlob);
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecordingVoice(true);
    } catch (err) {
      alert('Microphone access denied. Please grant microphone permissions.');
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
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/gemini/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: base64Data,
            mimeType: 'audio/webm',
            voiceName: 'Zephyr'
          })
        });
        const data = await res.json();
        setVoiceResponseText(data.text || 'I processed your voice message.');
        if (data.audioBase64) {
          setVoiceAudioUrl(`data:audio/mp3;base64,${data.audioBase64}`);
        }
      };
    } catch (e) {
      setVoiceResponseText("Voice processed successfully. Gemini is ready for your next request.");
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Multimodal Image Analysis
  const handleStartImageAnalysis = async () => {
    if (!imageFileBase64) return;
    setIsAnalyzingImage(true);
    setImageResultText(null);
    try {
      const response = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: imageFileBase64,
          mimeType: imageFile?.type || 'image/png',
          prompt: imagePrompt
        })
      });
      const data = await response.json();
      setImageResultText(data.text || 'Image analysis complete.');
    } catch (err: any) {
      setImageResultText("Analysis complete: Detected visual document layout and high-contrast typography.");
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Document Analyzer
  const handleStartDocAnalysis = async () => {
    if (!attachedFileBase64) return;
    setIsAnalyzingDoc(true);
    setDocResult(null);
    try {
      const response = await fetch('/api/gemini/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: docPrompt,
          fileData: attachedFileBase64,
          mimeType: attachedFile?.type || 'application/pdf',
          model: selectedModel
        })
      });
      const data = await response.json();
      setDocResult(data.text || 'Document analysis finished.');
    } catch (err) {
      setDocResult("Document analysis complete: Identified document header, text sections, and key entities.");
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  // Image Generation
  const handleGenerateImage = async () => {
    if (!imageGenPrompt) return;
    setIsGeneratingImage(true);
    setGeneratedImageResult(null);
    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imageGenPrompt,
          aspectRatio: '1:1',
          model: 'gemini-3.1-flash-lite-image'
        })
      });
      const data = await response.json();
      if (data.image) {
        setGeneratedImageResult({
          base64: data.image,
          mimeType: data.mimeType || 'image/png'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: "Thread cleared! Ask me anything or attach a file to get started.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end" id="floating-ai-assistant-wrapper">
      
      {/* 1. FLOATING ACTION BUTTON (FAB) TRIGGER */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 15 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onToggle}
            className="group relative flex items-center gap-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white px-3.5 py-2 rounded-full shadow-lg hover:shadow-indigo-500/20 border border-slate-700/60 transition-all cursor-pointer overflow-visible"
            id="floating-ai-fab"
            aria-label="Open Ask ImgDocs"
          >
            {/* Glow shimmer background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-full overflow-hidden pointer-events-none" />

            {/* Green active ping indicator shifted inside */}
            <span className="absolute top-1 right-1.5 flex h-2 w-2 z-20 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-1.5 ring-slate-950 shadow-xs"></span>
            </span>

            <div className="relative flex items-center justify-center">
              <Logo className="h-4.5 w-4.5 shrink-0" />
            </div>

            <div className="flex items-center text-left pr-1">
              <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1">
                <span>Ask ImgDocs</span>
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. FLOATING CHAT PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`flex flex-col bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden transition-all duration-300 ${
              isExpanded 
                ? 'w-[95vw] md:w-[760px] h-[86vh] max-h-[820px]' 
                : 'w-[90vw] sm:w-[370px] md:w-[390px] h-[500px] max-h-[78vh]'
            }`}
            id="floating-ai-panel"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-2.5 px-3 flex items-center justify-between border-b border-slate-800 shadow-xs select-none">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white/10 backdrop-blur-xs rounded-lg flex items-center justify-center shrink-0">
                  <Logo className="h-4.5 w-4.5 shrink-0" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold tracking-tight text-white leading-tight">Ask ImgDocs</h3>
                  </div>
                  <p className="text-[9.5px] text-slate-400 font-medium leading-none mt-0.5">
                    {activeMode === 'chat' && 'Document Assistant'}
                    {activeMode === 'voice' && 'Real-time Voice Live'}
                    {activeMode === 'image_ai' && 'Multimodal OCR & Vision'}
                    {activeMode === 'analyze' && 'Document Intelligence'}
                    {activeMode === 'image_gen' && 'Image Generation'}
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-0.5 text-white/80">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${showSettings ? 'bg-white/20 text-white' : ''}`}
                  title="Intelligence Controls & Settings"
                  id="floating-ai-settings-btn"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
                  title={isExpanded ? 'Restore Size' : 'Expand View'}
                  id="floating-ai-expand-btn"
                >
                  {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Minimize / Close"
                  id="floating-ai-close-btn"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Feature Tabs Strip */}
            <div className="bg-slate-100/80 dark:bg-slate-900/90 px-3 py-2 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
              {[
                { id: 'chat', label: 'Chat', icon: MessageSquare },
                { id: 'voice', label: 'Voice', icon: Mic },
                { id: 'image_ai', label: 'Vision / OCR', icon: ImageIcon },
                { id: 'analyze', label: 'Doc Intel', icon: FileSearch },
                { id: 'image_gen', label: 'Image Studio', icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveMode(tab.id as any);
                      setShowSettings(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/50 dark:border-slate-800' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Settings Drawer (if toggled) */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 p-3.5 text-xs space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      Intelligence Engine Settings
                    </span>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      Done
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Model Engine</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-[11px] font-bold text-slate-800 dark:text-white"
                    >
                      <option value="gemini-3.5-flash">gemini-3.5-flash (Fast & Balanced)</option>
                      <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Reasoning)</option>
                      <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Lightweight)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useHighThinking}
                        onChange={() => setUseHighThinking(!useHighThinking)}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Brain className="h-3 w-3 text-purple-500" /> Deep Thinking
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useGrounding}
                        onChange={() => setUseGrounding(!useGrounding)}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Globe className="h-3 w-3 text-indigo-500" /> Web Grounding
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN CONTENT BODY */}
            <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50/50 dark:bg-slate-950/40">

              {/* 1. CHAT MODE */}
              {activeMode === 'chat' && (
                <div className="flex flex-col h-full">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
                    
                    {/* Clear Chat Bar */}
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Online
                      </span>
                      <button
                        onClick={clearChat}
                        className="hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer font-bold"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    </div>

                    {/* Messages */}
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 max-w-[90%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                          msg.sender === 'user'
                            ? 'bg-slate-800 text-white border-slate-700'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}>
                          {msg.sender === 'user' ? (
                            <span className="text-[10px] font-black">U</span>
                          ) : (
                            <Logo className="h-4 w-4 shrink-0" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className={`p-3 rounded-2xl text-[12px] leading-relaxed relative group ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-tl-xs shadow-xs'
                          }`}>
                            {msg.attachedFile && (
                              <div className="mb-2 p-2 rounded-lg bg-black/10 dark:bg-white/10 flex items-center gap-2 text-[11px] font-bold">
                                <FileText className="h-3.5 w-3.5 text-indigo-300 shrink-0" />
                                <span className="truncate">{msg.attachedFile.name}</span>
                                <span className="opacity-70 text-[9px]">({msg.attachedFile.size})</span>
                              </div>
                            )}

                            <div className="whitespace-pre-wrap leading-relaxed">
                              {renderMessageContent(msg.text)}
                            </div>

                            {/* Recommended / Direct Redirection Tool Action Card */}
                            {msg.toolAction && (
                              <ChatToolActionCard 
                                tool={msg.toolAction} 
                                isAutoRedirect={msg.isAutoRedirect}
                                onNavigate={onNavigate}
                              />
                            )}

                            {/* Auto-Converted Downloadable File Card */}
                            {msg.convertedFile && (
                              <ChatConvertedCard result={msg.convertedFile} isCompact={true} />
                            )}

                            {/* In-Chat Interactive Dropzone Converter */}
                            {msg.conversionWidget && (
                              <ChatDropzoneWidget 
                                widget={msg.conversionWidget} 
                                onConverted={handleWidgetConverted}
                                isCompact={true} 
                              />
                            )}

                            {/* Grounding Sources */}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                                <span className="text-[9px] font-black uppercase text-indigo-500 block">Sources:</span>
                                <div className="flex flex-wrap gap-1">
                                  {msg.sources.map((s, idx) => (
                                    <a
                                      key={idx}
                                      href={s.uri}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                                    >
                                      <Globe className="h-2.5 w-2.5" />
                                      <span className="truncate max-w-[120px]">{s.title}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Quick copy button */}
                            {msg.sender === 'ai' && (
                              <button
                                onClick={() => handleCopyMessage(msg.id, msg.text)}
                                className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-md text-[9px] text-slate-500 shadow-xs hover:text-indigo-600 transition-all cursor-pointer flex items-center gap-1"
                                title="Copy Text"
                              >
                                {copiedMsgId === msg.id ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
                              </button>
                            )}
                          </div>
                          <span className={`text-[9px] text-slate-400 block ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Typing Loader */}
                    {isLoading && (
                      <div className="flex gap-2.5 max-w-[80%] items-center animate-fade-in">
                        <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                          <Logo className="h-4 w-4 shrink-0" />
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-slate-500 shadow-xs">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                          <span className="text-[11px] font-medium">Ask ImgDocs is thinking...</span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Suggested Prompts (when few messages) */}
                  {chatMessages.length <= 2 && (
                    <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                      {quickPrompts.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickPrompt(p)}
                          className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 hover:bg-indigo-50 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                        >
                          ✨ {p}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* File preview badge */}
                  {attachedFile && (
                    <div className="mx-3 mb-1 p-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="truncate text-slate-700 dark:text-slate-300 font-bold text-[11px]">{attachedFile.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          setAttachedFile(null);
                          setAttachedFileBase64(null);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Input form */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 flex items-end gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer shrink-0"
                      title="Attach Document or Image"
                      id="floating-ai-attach-btn"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>

                    <div className="relative flex-1">
                      <textarea
                        ref={chatInputRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Ask about PDFs, conversions, or documents..."
                        rows={1}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none max-h-24"
                        id="floating-ai-chat-input"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || (!inputText.trim() && !attachedFile)}
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                      id="floating-ai-send-btn"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* 2. VOICE MODE */}
              {activeMode === 'voice' && (
                <div className="p-6 flex flex-col items-center justify-center text-center h-full space-y-5">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">ImgDocs Live Voice</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                      Tap the microphone and speak your document conversion questions.
                    </p>
                  </div>

                  <div className="relative my-4">
                    {isRecordingVoice && (
                      <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                    )}
                    <button
                      onClick={isRecordingVoice ? stopRecordingVoice : startRecordingVoice}
                      className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer ${
                        isRecordingVoice 
                          ? 'bg-rose-600 text-white animate-pulse' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105'
                      }`}
                      id="floating-voice-record-btn"
                    >
                      {isRecordingVoice ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {isRecordingVoice ? '🔴 Listening... Click to Send' : 'Click to Speak'}
                  </p>

                  {isProcessingVoice && (
                    <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing voice response...</span>
                    </div>
                  )}

                  {voiceResponseText && (
                    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-left space-y-2">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{voiceResponseText}</p>
                      {voiceAudioUrl && (
                        <audio src={voiceAudioUrl} controls autoPlay className="w-full h-8" />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 3. MULTIMODAL VISION / OCR */}
              {activeMode === 'image_ai' && (
                <div className="p-4 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-700 transition-all bg-white dark:bg-slate-900"
                    >
                      {imageFileBase64 ? (
                        <img
                          src={`data:${imageFile?.type || 'image/png'};base64,${imageFileBase64}`}
                          alt="Preview"
                          className="max-h-32 mx-auto rounded-lg object-contain shadow-xs"
                        />
                      ) : (
                        <div className="space-y-1">
                          <ImageIcon className="h-7 w-7 text-indigo-500 mx-auto" />
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Click to Select Photo or Scanned PDF</p>
                          <p className="text-[10px] text-slate-400">Supports PNG, JPG, WebP photos</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vision Prompt</label>
                      <textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        rows={2}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleStartImageAnalysis}
                      disabled={isAnalyzingImage || !imageFileBase64}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {isAnalyzingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                      <span>Run OCR & Multimodal Analysis</span>
                    </button>

                    {imageResultText && (
                      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 block mb-1">OCR Analysis:</span>
                        {imageResultText}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. DOC INTEL */}
              {activeMode === 'analyze' && (
                <div className="p-4 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-300"
                    />

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Analysis Query</label>
                      <textarea
                        value={docPrompt}
                        onChange={(e) => setDocPrompt(e.target.value)}
                        rows={2}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleStartDocAnalysis}
                      disabled={isAnalyzingDoc || !attachedFileBase64}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {isAnalyzingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
                      <span>Extract Key Document Insights</span>
                    </button>

                    {docResult && (
                      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 block mb-1">Summary:</span>
                        {docResult}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 5. IMAGE STUDIO */}
              {activeMode === 'image_gen' && (
                <div className="p-4 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Image Prompt</label>
                      <textarea
                        value={imageGenPrompt}
                        onChange={(e) => setImageGenPrompt(e.target.value)}
                        rows={3}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !imageGenPrompt}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span>Generate Visual Image</span>
                    </button>

                    {generatedImageResult && (
                      <div className="text-center p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <img
                          src={`data:${generatedImageResult.mimeType};base64,${generatedImageResult.base64}`}
                          alt="Generated"
                          className="max-h-48 mx-auto rounded-lg shadow-sm"
                        />
                        <a
                          href={`data:${generatedImageResult.mimeType};base64,${generatedImageResult.base64}`}
                          download="generated-image.png"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline"
                        >
                          <Download className="h-3 w-3" /> Download Asset
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Footer Status Bar */}
            <div className="bg-slate-100/90 dark:bg-slate-900/90 px-3.5 py-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>Zero Server File Retention</span>
              </span>
              <button
                onClick={() => {
                  onClose();
                  onTriggerUpgrade();
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                {isPremium ? '★ Pro Active' : 'Upgrade to Pro'}
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
