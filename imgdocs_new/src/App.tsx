/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { mongoAuth, AuthUser, isSuperVipEmail } from './lib/mongoAuth';
import { 
  saveConversionRecord, getUserPremiumStatus, setUserPremiumStatus,
  getUserSubscriptionData, setUserSubscriptionData, SubscriptionData
} from './lib/dbHelper';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import UserHistory from './components/UserHistory';
import PricingPage from './components/PricingPage';
import UserDashboard from './components/UserDashboard';

// Tools import
import UploadZone from './components/UploadZone';
import UploadingScreen from './components/UploadingScreen';
import ThumbnailGrid from './components/ThumbnailGrid';
import OptionsPanel from './components/OptionsPanel';
import ConvertingScreen from './components/ConvertingScreen';
import ResultScreen from './components/ResultScreen';
import CompressTool from './components/CompressTool';
import PdfToJpgTool from './components/PdfToJpgTool';
import CropImageTool from './components/CropImageTool';
import BottomToolsSwitcher from './components/BottomToolsSwitcher';

import { generatePdfFromImages } from './lib/pdfGenerator';
import { UploadedImage, AppState, ConverterOptions, UploadStats } from './types';
import { AlertTriangle, History, ShieldAlert, UserPlus, Crown, CreditCard } from 'lucide-react';

import Homepage from './components/Homepage';
import SEOHandler from './components/SEOHandler';
import ToolSEOContent from './components/ToolSEOContent';
import UnifiedToolSimulator from './components/UnifiedToolSimulator';
import { BlogDirectory, BlogPostReader } from './components/BlogSystem';
import { 
  AboutUs, ContactUs, FeatureRequests, HelpCenter, 
  ReleaseNotes, ApiDoc, Careers, LegalPage,
  ToolsDirectoryPage, SecurityArchitecturePage, ReviewsPage, TemplatesPage
} from './components/InfoPages';
import { toolsList } from './data/toolsData';
import AIAssistant from './components/AIAssistant';
import FloatingAIAssistant from './components/FloatingAIAssistant';
import HtmlSitemap from './components/HtmlSitemap';
import NotFound from './components/NotFound';
import PageNavigation from './components/PageNavigation';
import { resolveRoute, getPathFromTab } from './lib/routes';
import { trackToolUsage } from './lib/toolTracker';

export default function App() {
  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'login' | 'signup'>('login');
  const [showHistory, setShowHistory] = useState(false);

  // Subscription States & Daily Limits
  const [conversionCount, setConversionCount] = useState<number>(() => {
    const saved = localStorage.getItem('imgdocs_conversion_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  // All features unlocked forever for all users
  const [isPremium, setIsPremium] = useState<boolean>(true);

  const [dailyOps, setDailyOps] = useState<number>(0);

  // Free & Unlocked plan data
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: 'business_yearly',
    status: 'active',
    renewalDate: 'Lifetime Unlocked',
    isPremium: true,
    paymentHistory: []
  });

  const [dashboardSubTab, setDashboardSubTab] = useState<'overview' | 'subscription' | 'history' | 'profile'>('overview');

  // Active Tool state: can be 'home', 'blog', 'blog-post', static page names, or specific tools
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null);
  const [floatingAIOpen, setFloatingAIOpen] = useState<boolean>(false);

  // JPG to PDF flow states
  const [jpgState, setJpgState] = useState<AppState>('UPLOAD');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [showCovers, setShowCovers] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [options, setOptions] = useState<ConverterOptions>({
    orientation: 'portrait',
    pageSize: 'fit',
    margin: 'none',
    merge: true
  });

  const [uploadStats, setUploadStats] = useState<UploadStats>({
    currentFile: 0,
    totalFiles: 0,
    progress: 0,
    timeLeft: 0,
    speed: 0,
    source: null
  });

  const [conversionStats, setConversionStats] = useState({
    currentIndex: 0,
    progress: 0
  });

  const [result, setResult] = useState<{
    blob: Blob | null;
    fileName: string;
    fileSize: string;
    pageCount: number;
  }>({
    blob: null,
    fileName: '',
    fileSize: '',
    pageCount: 0
  });

  // Auto-open floating assistant when navigating to ai-assistant
  useEffect(() => {
    if (activeTab === 'ai-assistant') {
      setFloatingAIOpen(true);
    }
  }, [activeTab]);

  // QA simulator switch
  const [simulateConnectionError, setSimulateConnectionError] = useState(false);

  // Clean Route Synchronization and Redirect Management
  useEffect(() => {
    const handleRouteSync = () => {
      const resolved = resolveRoute(window.location.pathname, window.location.search);
      if (resolved.redirectPath) {
        window.history.replaceState(null, '', resolved.redirectPath);
      }
      setActiveTab(resolved.activeTab);
      setActiveBlogSlug(resolved.activeBlogSlug);
    };

    handleRouteSync();

    const handlePopState = () => {
      handleRouteSync();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync window.location when activeTab or activeBlogSlug change
  useEffect(() => {
    const targetPath = getPathFromTab(activeTab, activeBlogSlug);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ activeTab, activeBlogSlug }, '', targetPath);
    }
  }, [activeTab, activeBlogSlug]);

  // Global Keyboard Shortcuts ('/' to focus search bar on homepage, 'Escape' to close active modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger '/' if user is typing inside an input/textarea
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).isContentEditable
      );

      if (e.key === 'Escape') {
        if (authModalOpen) setAuthModalOpen(false);
        if (showHistory) setShowHistory(false);
      } else if (e.key === '/' && !isTyping) {
        e.preventDefault();
        if (activeTab !== 'home') {
          handleNavigatePath('home');
        }
        setTimeout(() => {
          const searchInput = document.getElementById('homepage-search-input') as HTMLInputElement | null;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          } else {
            const el = document.getElementById('tools-dashboard');
            el?.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, authModalOpen, showHistory]);

  const handleNavigatePath = (pathOrTab: string) => {
    let target = pathOrTab;
    if (!pathOrTab.startsWith('/')) {
      target = getPathFromTab(pathOrTab);
    }
    const resolved = resolveRoute(target, '');
    setActiveTab(resolved.activeTab);
    setActiveBlogSlug(resolved.activeBlogSlug);
    const cleanPath = getPathFromTab(resolved.activeTab, resolved.activeBlogSlug);
    if (window.location.pathname !== cleanPath) {
      window.history.pushState(null, '', cleanPath);
    }
  };

  const refreshSubscriptionStatus = async (authUser: AuthUser | null) => {
    setIsPremium(true);
    setSubscription({
      plan: 'business_yearly',
      status: 'active',
      renewalDate: 'Lifetime Unlocked',
      isPremium: true,
      paymentHistory: []
    });
  };

  // Auth observer
  useEffect(() => {
    const unsubscribe = mongoAuth.onAuthStateChanged(async (mongoUser) => {
      setUser(mongoUser);
      if (mongoUser) {
        setShowHistory(true);
        await refreshSubscriptionStatus(mongoUser);
      } else {
        setShowHistory(false);
        setIsPremium(true);
        setSubscription({
          plan: 'business_yearly',
          status: 'active',
          renewalDate: 'Lifetime Unlocked',
          isPremium: true,
          paymentHistory: []
        });
      }
    });
    return unsubscribe;
  }, []);

  // Safe file size retriever helper
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      img.onload = () => {
        resolve({ width: img.naturalWidth || 800, height: img.naturalHeight || 600 });
        URL.revokeObjectURL(objectUrl);
      };
      img.onerror = () => {
        resolve({ width: 800, height: 600 });
        URL.revokeObjectURL(objectUrl);
      };
    });
  };

  const isSuperVip = true;
  const effectiveIsPremium = true;
  const isLimitReached = false;

  // Safe callback function to handle db recording
  const recordSuccessfulConversion = async (
    tool: string,
    fileName: string,
    fileSize: string,
    pageCount: number
  ) => {
    trackToolUsage(tool);
    const today = new Date().toDateString();
    const nextDailyOps = dailyOps + 1;
    setDailyOps(nextDailyOps);
    localStorage.setItem('imgdocs_ops_date', today);
    localStorage.setItem('imgdocs_ops_count', nextDailyOps.toString());

    const nextCount = conversionCount + 1;
    setConversionCount(nextCount);
    localStorage.setItem('imgdocs_conversion_count', nextCount.toString());

    if (user) {
      await saveConversionRecord({
        userId: user.uid,
        tool,
        fileName,
        fileSize,
        pageCount
      });
    }
  };

  // JPG to PDF selection flow
  const handleUploadFiles = async (files: File[], source: 'local' | 'drive' | 'dropbox' = 'local') => {
    setErrorMsg(null);
    setJpgState('UPLOADING');
    const total = files.length;

    if (source === 'drive' || source === 'dropbox') {
      setUploadStats({
        currentFile: 1,
        totalFiles: 1,
        progress: 25,
        timeLeft: 4,
        speed: 4.2,
        source
      });
      await new Promise(r => setTimeout(r, 1200));
      setJpgState('UPLOAD');
      setErrorMsg(`Cloud storage integration requires OAuth. Please upload images directly from your computer.`);
      return;
    }

    for (let i = 0; i < total; i++) {
      const file = files[i];
      const dimensions = await getImageDimensions(file);
      const src = URL.createObjectURL(file);

      const newImageItem: UploadedImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        file,
        name: file.name,
        src,
        rotation: 0,
        width: dimensions.width,
        height: dimensions.height
      };

      // Progress tick loops
      for (let step = 20; step <= 100; step += 20) {
        const speed = 11.5 + Math.random() * 4;
        const remainingBytes = file.size * (1 - step / 100);
        const timeLeft = Math.ceil(remainingBytes / (speed * 1024 * 1024));

        setUploadStats({
          currentFile: i + 1,
          totalFiles: total,
          progress: ((i + (step / 100)) / total) * 100,
          timeLeft: Math.max(0, timeLeft),
          speed,
          source: 'local'
        });

        await new Promise(r => setTimeout(r, 40));
      }

      setImages(prev => [...prev, newImageItem]);
    }

    setUploadStats(prev => ({ ...prev, progress: 100 }));
    await new Promise(r => setTimeout(r, 450));
    setJpgState('EDITOR');
  };

  const handleAddMoreFiles = async (files: File[]) => {
    for (const file of files) {
      const dimensions = await getImageDimensions(file);
      const src = URL.createObjectURL(file);

      const newImageItem: UploadedImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        file,
        name: file.name,
        src,
        rotation: 0,
        width: dimensions.width,
        height: dimensions.height
      };

      setImages(prev => [...prev, newImageItem]);
    }
  };

  const handleReorder = (draggedIndex: number, targetIndex: number) => {
    setImages(prev => {
      const list = [...prev];
      const [removed] = list.splice(draggedIndex, 1);
      list.splice(targetIndex, 0, removed);
      return list;
    });
  };

  const handleSortByName = (ascending: boolean) => {
    setImages(prev => {
      const list = [...prev];
      list.sort((a, b) => {
        return ascending
          ? a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
          : b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
      });
      return list;
    });
  };

  const handleRotate = (id: string) => {
    setImages(prev =>
      prev.map(img => (img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img))
    );
  };

  const handleDelete = (id: string) => {
    setImages(prev => {
      const itemToDelete = prev.find(img => img.id === id);
      if (itemToDelete) {
        URL.revokeObjectURL(itemToDelete.src);
      }
      const filtered = prev.filter(img => img.id !== id);
      if (filtered.length === 0) {
        setJpgState('UPLOAD');
      }
      return filtered;
    });
  };

  const handleStartConversion = async () => {
    if (images.length === 0) return;
    if (isLimitReached) {
      setActiveTab('pricing');
      return;
    }
    setJpgState('CONVERTING');
    setConversionStats({ currentIndex: 1, progress: 0 });

    if (simulateConnectionError) {
      await new Promise(r => setTimeout(r, 1200));
      setJpgState('EDITOR');
      setErrorMsg('Woops! Something is wrong with your Internet connection. Please verify your network state and retry.');
      return;
    }

    try {
      const resultData = await generatePdfFromImages(images, options, (currentIndex, total, percentage) => {
        setConversionStats({
          currentIndex,
          progress: percentage
        });
      });

      const sizeBytes = resultData.blob.size;
      const sizeLabel = sizeBytes < 1024 * 1024
        ? `${(sizeBytes / 1024).toFixed(1)} KB`
        : `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;

      setResult({
        blob: resultData.blob,
        fileName: resultData.fileName,
        fileSize: sizeLabel,
        pageCount: images.length
      });

      // Save to Firebase logs
      await recordSuccessfulConversion(
        'jpg_to_pdf',
        resultData.fileName,
        sizeLabel,
        images.length
      );

      setJpgState('RESULT');
    } catch (err) {
      console.error(err);
      setJpgState('EDITOR');
      setErrorMsg('Woops! An error occurred compiling PDF pages. Please retry.');
    }
  };

  const handleDownloadFile = () => {
    if (!result.blob) return;
    const downloadUrl = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleResetConverter = () => {
    images.forEach(img => URL.revokeObjectURL(img.src));
    setImages([]);
    setResult({ blob: null, fileName: '', fileSize: '', pageCount: 0 });
    setErrorMsg(null);
    setJpgState('UPLOAD');
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthDefaultMode(mode);
    setAuthModalOpen(true);
  };

  const handleDirectNavigation = (pathOrTab: string) => {
    let clean = pathOrTab.trim();
    if (clean.startsWith('/')) clean = clean.substring(1);
    if (!clean) clean = 'jpg-to-pdf';
    setActiveTab(clean);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200" id="imgdocs-root">
      
      {/* Client-side dynamic SEO and JSON-LD schema orchestrator */}
      <SEOHandler activeTab={activeTab} activeBlogSlug={activeBlogSlug} />
      
      {/* Navbar header with active authentication context */}
      <Header
        user={user}
        isPremium={effectiveIsPremium}
        onOpenAuth={handleOpenAuth}
        onToggleHistory={() => setShowHistory(!showHistory)}
        showHistory={showHistory}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onToggleAIAssistant={() => setFloatingAIOpen(!floatingAIOpen)}
        isAIAssistantOpen={floatingAIOpen}
        onSignOut={() => {
          mongoAuth.logout();
          setUser(null);
          setShowHistory(false);
          setIsPremium(false);
          localStorage.setItem('imgdocs_is_premium', 'false');
          localStorage.removeItem('imgdocs_sub_plan');
          localStorage.removeItem('imgdocs_sub_status');
          localStorage.removeItem('imgdocs_sub_renewal');
          localStorage.removeItem('imgdocs_sub_payment_history');
          setSubscription({
            plan: 'free',
            status: 'active',
            renewalDate: '',
            isPremium: false,
            paymentHistory: []
          });
        }}
        onNavigateDashboardTab={(subTab) => {
          setDashboardSubTab(subTab);
        }}
      />

      <main className="flex-1 px-4 py-8 md:px-6 md:py-12" id="app-main-content">
        <div className="mx-auto max-w-7xl space-y-8">
          
          {/* Universal Sticky Back Button & Breadcrumbs Navigation for all non-home pages */}
          {activeTab !== 'home' && (
            <PageNavigation
              activeTab={activeTab}
              activeBlogSlug={activeBlogSlug}
              onNavigate={handleNavigatePath}
              onGoBack={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  window.history.back();
                } else {
                  handleNavigatePath('home');
                }
              }}
            />
          )}

          {/* Dynamic Welcome Callout prompting to sign up */}
          {!user && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl bg-slate-900 text-white p-6 shadow-xl relative overflow-hidden" id="auth-upsell-callout">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/10 blur-xl" />
              <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-xl" />
              
              <div className="space-y-1.5 text-center md:text-left z-10">
                <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-bold text-red-400 uppercase tracking-widest">
                  <span>Free Cloud Accounts Available</span>
                </div>
                <h2 className="text-xl font-bold font-display">Want to save your conversion history logs?</h2>
                <p className="text-xs text-slate-300 font-medium">Create a free account to track and access lists of all your converted documents securely.</p>
              </div>

              <div className="flex items-center gap-3 z-10">
                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-red-500/10"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Create Free Account</span>
                </button>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-3 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </div>
          )}

          {/* User History Overlay Panel */}
          {user && showHistory && (
            <div className="transition-all animate-fade-in" id="history-overlay">
              <UserHistory userId={user.uid} />
            </div>
          )}

          {/* Global error banner */}
          {errorMsg && (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-red-50 p-5 border border-red-200 text-red-800 shadow-sm animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Conversion Issue</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{errorMsg}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="rounded-lg bg-red-100 hover:bg-red-200 px-3.5 py-1.5 text-xs font-bold text-primary transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Render Active Tool view */}
          <div className="animate-fade-in" id="active-tool-viewport">
            
            <>
                {/* 1. Homepage */}
            {activeTab === 'home' && (
              <Homepage
                onSelectTool={(id) => {
                  let targetId = id;
                  if (id === 'jpg-to-pdf') targetId = 'jpg_to_pdf';
                  if (id === 'pdf-to-jpg') targetId = 'pdf_to_jpg';
                  if (id === 'compress-pdf') targetId = 'compress';
                  
                  setActiveTab(targetId);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateBlog={(slug) => {
                  if (slug) {
                    setActiveBlogSlug(slug);
                    setActiveTab('blog-post');
                  } else {
                    setActiveTab('blog');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* 2. Blog Directory */}
            {activeTab === 'blog' && (
              <BlogDirectory
                onSelectPost={(slug) => {
                  if (slug) {
                    setActiveBlogSlug(slug);
                    setActiveTab('blog-post');
                  } else {
                    setActiveTab('blog');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* 3. Blog Reader */}
            {activeTab === 'blog-post' && (
              <BlogPostReader
                activeSlug={activeBlogSlug}
                onSelectPost={(slug) => {
                  if (slug) {
                    setActiveBlogSlug(slug);
                    setActiveTab('blog-post');
                  } else {
                    setActiveTab('blog');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* 4. Company Static & Utility Pages */}
            {activeTab === 'about' && <AboutUs />}
            {activeTab === 'contact' && <ContactUs />}
            {activeTab === 'feature-requests' && <FeatureRequests />}
            {activeTab === 'help' && <HelpCenter />}
            {activeTab === 'releases' && <ReleaseNotes />}
            {activeTab === 'api' && <ApiDoc />}
            {activeTab === 'careers' && <Careers />}
            {activeTab === 'tools' && (
              <ToolsDirectoryPage onSelectTool={(id) => {
                setActiveTab(id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            )}
            {activeTab === 'security' && <SecurityArchitecturePage />}
            {activeTab === 'reviews' && <ReviewsPage />}
            {activeTab === 'templates' && (
              <TemplatesPage onSelectTool={(id) => {
                setActiveTab(id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            )}

            {activeTab === 'ai-assistant' && (
              <AIAssistant
                user={user}
                isPremium={effectiveIsPremium}
                onOpenAuth={(mode) => {
                  setAuthDefaultMode(mode);
                  setAuthModalOpen(true);
                }}
                onTriggerUpgrade={() => {
                  setActiveTab('pricing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigate={handleDirectNavigation}
              />
            )}
            
            {activeTab === 'pricing' && (
              <PricingPage
                user={user}
                isPremium={effectiveIsPremium}
                activePlan={effectiveIsPremium ? 'business_yearly' : (subscription?.plan || 'free')}
                onOpenAuth={(mode) => {
                  setAuthDefaultMode(mode);
                  setAuthModalOpen(true);
                }}
                onSelectPlan={() => {
                  setActiveTab('home');
                }}
                onNavigateHome={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'dashboard' && (
              <UserDashboard
                user={user}
                subscription={effectiveIsPremium ? {
                  plan: subscription?.plan || 'business_yearly',
                  status: 'active',
                  renewalDate: subscription?.renewalDate || '2099-12-31',
                  isPremium: true,
                  paymentHistory: subscription?.paymentHistory || []
                } : subscription}
                conversionCount={conversionCount}
                initialSubTab={dashboardSubTab}
                onUpdateSubscription={async (updated) => {
                  if (user) {
                    await setUserSubscriptionData(user.uid, updated);
                    await refreshSubscriptionStatus(user);
                  }
                }}
                onTriggerUpgrade={() => {
                  setActiveTab('pricing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* 5. Legal Static Compliance Pages */}
            {['privacy', 'terms', 'cookie', 'disclaimer', 'dmca', 'refund-policy'].includes(activeTab) && (
              <LegalPage type={activeTab as any} />
            )}

            {/* 5b. HTML Sitemap */}
            {activeTab === 'html-sitemap' && (
              <HtmlSitemap onNavigate={handleNavigatePath} />
            )}

            {/* 5c. 404 Page Not Found */}
            {activeTab === '404' && (
              <NotFound onNavigate={handleNavigatePath} />
            )}

            {/* 6. JPG to PDF high-fidelity converter */}
            {activeTab === 'jpg_to_pdf' && (
              <div className="space-y-6">
                {jpgState === 'UPLOAD' && (
                  <div className="space-y-8">
                    <UploadZone
                      onFilesSelected={handleUploadFiles}
                      onCloudAction={(source) => handleUploadFiles([], source)}
                    />
                  </div>
                )}

                {jpgState === 'UPLOADING' && (
                  <div className="flex min-h-[350px] items-center justify-center">
                    <UploadingScreen stats={uploadStats} />
                  </div>
                )}

                {jpgState === 'EDITOR' && (
                  <div className="flex flex-col gap-8 lg:flex-row items-start">
                    <ThumbnailGrid
                      images={images}
                      showCovers={showCovers}
                      onRotate={handleRotate}
                      onDelete={handleDelete}
                      onReorder={handleReorder}
                      onSortByName={handleSortByName}
                      onToggleCovers={() => setShowCovers(!showCovers)}
                      onAddFiles={handleAddMoreFiles}
                    />

                    <OptionsPanel
                      options={options}
                      onChange={setOptions}
                      onConvert={handleStartConversion}
                      disabled={images.length === 0}
                    />
                  </div>
                )}

                {jpgState === 'CONVERTING' && (
                  <div className="flex min-h-[350px] items-center justify-center">
                    <ConvertingScreen
                      currentIndex={conversionStats.currentIndex}
                      totalImages={images.length}
                      progress={conversionStats.progress}
                    />
                  </div>
                )}

                {jpgState === 'RESULT' && (
                  <div className="flex min-h-[350px] items-center justify-center">
                    <ResultScreen
                      fileName={result.fileName}
                      fileSize={result.fileSize}
                      isMerge={options.merge}
                      pageCount={result.pageCount}
                      onDownload={handleDownloadFile}
                      onReset={handleResetConverter}
                    />
                  </div>
                )}
                
                {/* Dynamically injected 800-1200 words explanatory copy, breadcrumbs, guide, benefits, and FAQs for JPG to PDF */}
                <ToolSEOContent toolId="jpg-to-pdf" onNavigateTool={setActiveTab} />
              </div>
            )}

            {/* 7. PDF to JPG high-fidelity converter */}
            {activeTab === 'pdf_to_jpg' && (
              <div className="space-y-6">
                <PdfToJpgTool
                  onSuccess={async (name, size, count) => {
                    await recordSuccessfulConversion('pdf_to_jpg', name, size, count);
                  }}
                  userId={user?.uid}
                  isLimitReached={isLimitReached}
                  onLimitTrigger={() => setActiveTab('pricing')}
                />
                <ToolSEOContent toolId="pdf-to-jpg" onNavigateTool={setActiveTab} />
              </div>
            )}

            {/* 8. Compress high-fidelity converter */}
            {activeTab === 'compress' && (
              <div className="space-y-6">
                <CompressTool
                  onSuccess={async (name, size, count) => {
                    await recordSuccessfulConversion('compress', name, size, count);
                  }}
                  userId={user?.uid}
                  isLimitReached={isLimitReached}
                  onLimitTrigger={() => setActiveTab('pricing')}
                />
                <ToolSEOContent toolId="compress-pdf" onNavigateTool={setActiveTab} />
              </div>
            )}

            {/* 8b. Crop Image interactive tool */}
            {(activeTab === 'crop-image' || activeTab === 'crop_image') && (
              <div className="space-y-6">
                <CropImageTool
                  onSuccess={async (name, size, count) => {
                    await recordSuccessfulConversion('crop-image', name, size, count);
                  }}
                  userId={user?.uid}
                  isLimitReached={isLimitReached}
                  onLimitTrigger={() => setActiveTab('pricing')}
                />
                <ToolSEOContent toolId="crop-image" onNavigateTool={setActiveTab} />
              </div>
            )}

            {/* 9. Remaining Tools mapped dynamically from toolsList */}
            {(() => {
              // Convert kebab-case / snake_case back and forth
              const normalizedActive = activeTab.replace('_', '-');
              const matchedTool = toolsList.find(t => t.id === activeTab || t.id === normalizedActive);

              if (matchedTool && !['jpg-to-pdf', 'pdf-to-jpg', 'compress-pdf', 'crop-image'].includes(matchedTool.id)) {
                return (
                  <div className="space-y-6">
                    <UnifiedToolSimulator
                      toolId={matchedTool.id}
                      toolTitle={matchedTool.title}
                      toolCategory={matchedTool.category}
                      limits={matchedTool.limits}
                      formats={matchedTool.formats}
                      benefits={matchedTool.benefits}
                      stepByStep={matchedTool.stepByStep}
                      faqs={matchedTool.faqs}
                      onSuccess={async (name, size, count) => {
                        await recordSuccessfulConversion(matchedTool.id, name, size, count);
                      }}
                      isLimitReached={isLimitReached}
                      onLimitTrigger={() => setActiveTab('pricing')}
                    />
                    <ToolSEOContent toolId={matchedTool.id} onNavigateTool={setActiveTab} />
                  </div>
                );
              }
              return null;
            })()}
            </>
          </div>

          {/* Bottom Tools Switcher displaying all tools */}
          <BottomToolsSwitcher activeTab={activeTab} onChangeTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />

        </div>
      </main>

      {/* Auth tab overlay modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authDefaultMode}
        onSimulateLogin={(email) => {
          const fakeUser = {
            uid: 'demo-' + Date.now(),
            email: email,
            emailVerified: true,
            isAnonymous: false,
            metadata: {},
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: async () => {},
            getIdToken: async () => '',
            getIdTokenResult: async () => ({} as any),
            reload: async () => {},
            toJSON: () => ({})
          } as any;
          setUser(fakeUser);
          setShowHistory(true);
        }}
      />



      {/* Floating AI Assistant Widget */}
      <FloatingAIAssistant
        user={user}
        isPremium={effectiveIsPremium}
        isOpen={floatingAIOpen}
        onToggle={() => setFloatingAIOpen(!floatingAIOpen)}
        onClose={() => setFloatingAIOpen(false)}
        onOpenAuth={handleOpenAuth}
        onTriggerUpgrade={() => {
          setActiveTab('pricing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigate={handleDirectNavigation}
      />

      <Footer onChangeTab={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />
    </div>
  );
}
