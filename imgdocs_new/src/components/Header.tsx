/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { mongoAuth, AuthUser } from '../lib/mongoAuth';
import { 
  FileText, LogIn, UserPlus, LogOut, History, 
  UserCheck, ChevronDown, PenTool, Crown, Shield, Activity, Receipt, Key, User as UserIcon,
  Sparkles
} from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { toolsList } from '../data/toolsData';

interface HeaderProps {
  user: AuthUser | null;
  isPremium: boolean;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onToggleHistory: () => void;
  showHistory: boolean;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onSignOut?: () => void;
  onNavigateDashboardTab?: (subTab: 'overview' | 'subscription' | 'history' | 'profile') => void;
  onToggleAIAssistant?: () => void;
  isAIAssistantOpen?: boolean;
}

export default function Header({
  user,
  isPremium,
  onOpenAuth,
  onToggleHistory,
  showHistory,
  activeTab,
  onChangeTab,
  onSignOut,
  onNavigateDashboardTab,
  onToggleAIAssistant,
  isAIAssistantOpen
}: HeaderProps) {
  
  const [isToolsOpen, setIsToolsOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  
  const handleSignOut = async () => {
    try {
      mongoAuth.logout();
    } catch (err) {
      console.error('Error signing out:', err);
    }
    if (onSignOut) {
      onSignOut();
    }
    setIsUserMenuOpen(false);
  };

  const getActiveToolLabel = () => {
    if (activeTab === 'home') return 'Tools Menu';
    if (activeTab === 'blog') return 'Guides & Blog';
    if (activeTab === 'jpg_to_pdf') return 'JPG to PDF';
    if (activeTab === 'pdf_to_jpg') return 'PDF to JPG';
    if (activeTab === 'compress') return 'Compress PDF';
    if (activeTab === 'crop-image' || activeTab === 'crop_image') return 'Crop Image';
    if (activeTab === 'pricing') return 'Pricing Plans';
    if (activeTab === 'dashboard') return 'User Dashboard';
    
    const matched = toolsList.find(t => t.id === activeTab);
    return matched ? matched.title : 'Tools Console';
  };

  const categories = Array.from(new Set(toolsList.map(t => t.category)));

  const handleDashboardNavigate = (subTab: 'overview' | 'subscription' | 'history' | 'profile') => {
    onChangeTab('dashboard');
    if (onNavigateDashboardTab) {
      onNavigateDashboardTab(subTab);
    }
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full h-[56px] md:h-[64px] border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md px-3 md:px-6 flex items-center" id="app-header">
      <div className="mx-auto w-full max-w-7xl flex items-center justify-between gap-2">
        
        {/* Left Section: Logo & Main Navigation */}
        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={() => {
              onChangeTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 hover:opacity-90 cursor-pointer bg-transparent border-none p-0 focus:outline-none"
            id="header-logo-container"
          >
            <Logo className="h-6 w-6 md:h-7 md:w-7 shrink-0 text-primary" />
            <span className="font-display text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Img<span className="text-primary">Docs</span>
            </span>
          </button>

          {/* Desktop Single-Row Navigation */}
          <nav className="hidden lg:flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
            <button
              onClick={() => onChangeTab('home')}
              className={`hover:text-primary transition-colors cursor-pointer ${activeTab === 'home' ? 'text-primary' : ''}`}
            >
              Home
            </button>
            
            {/* Tools Dropdown trigger */}
            <div className="relative" id="tool-dropdown-container">
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`flex items-center gap-1 hover:text-primary transition-colors cursor-pointer font-bold ${
                  !['home', 'blog', 'blog-post', 'about', 'contact', 'pricing', 'help', 'privacy', 'terms', 'cookie', 'disclaimer', 'dmca', 'dashboard'].includes(activeTab) 
                    ? 'text-primary' 
                    : ''
                }`}
              >
                <span>Tools</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {isToolsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsToolsOpen(false)} />
                  <div 
                    className="absolute left-0 mt-3 w-[460px] max-h-[380px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-xl z-20 animate-fade-in grid gap-3 grid-cols-2"
                    id="header-tools-dropdown-list"
                  >
                    <div className="col-span-2 pb-1.5 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
                      <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        Document Tools
                      </p>
                      <span className="text-[9px] font-bold text-emerald-500 uppercase">100% Private</span>
                    </div>
                    
                    {categories.map((cat) => {
                      const catTools = toolsList.filter(t => t.category === cat);
                      return (
                        <div key={cat} className="space-y-1">
                          <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-600 px-1">
                            {cat}
                          </h4>
                          <div className="space-y-0.5">
                            {catTools.map((tool) => {
                              let mappedId = tool.id;
                              if (tool.id === 'jpg-to-pdf') mappedId = 'jpg_to_pdf';
                              if (tool.id === 'pdf-to-jpg') mappedId = 'pdf_to_jpg';
                              if (tool.id === 'compress-pdf') mappedId = 'compress';

                              const isSelected = activeTab === mappedId;

                              return (
                                <button
                                  key={tool.id}
                                  onClick={() => {
                                    onChangeTab(mappedId);
                                    setIsToolsOpen(false);
                                  }}
                                  className={`flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-50 dark:bg-slate-900 text-primary font-bold'
                                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                >
                                  {tool.id === 'esign-pdf' ? (
                                    <PenTool className="h-3 w-3 text-slate-400 shrink-0" />
                                  ) : (
                                    <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                                  )}
                                  <span className="truncate">{tool.title.replace(' with Password', '').replace(' Text Extractor', '')}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => onChangeTab('tools')}
              className={`hover:text-primary transition-colors cursor-pointer ${activeTab === 'tools' ? 'text-primary' : ''}`}
            >
              All Tools
            </button>
            <button
              onClick={() => onChangeTab('blog')}
              className={`hover:text-primary transition-colors cursor-pointer ${activeTab === 'blog' || activeTab === 'blog-post' ? 'text-primary' : ''}`}
            >
              Blog
            </button>
            <button
              onClick={() => {
                if (onToggleAIAssistant) {
                  onToggleAIAssistant();
                } else {
                  onChangeTab('ai-assistant');
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                isAIAssistantOpen || activeTab === 'ai-assistant'
                  ? 'bg-slate-900 dark:bg-slate-800 text-white font-extrabold shadow-xs' 
                  : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 font-bold border border-slate-200/80 dark:border-slate-800'
              }`}
              id="header-ai-assistant-nav-btn"
            >
              <Logo className="h-4 w-4 shrink-0" />
              <span>Ask ImgDocs</span>
            </button>

            <button
              onClick={() => onChangeTab('security')}
              className={`hover:text-primary transition-colors cursor-pointer ${activeTab === 'security' ? 'text-primary' : ''}`}
            >
              Security
            </button>
            <button
              onClick={() => onChangeTab('templates')}
              className={`hover:text-primary transition-colors cursor-pointer ${activeTab === 'templates' ? 'text-primary' : ''}`}
            >
              Templates
            </button>
            <button
              onClick={() => onChangeTab('reviews')}
              className={`hover:text-primary transition-colors cursor-pointer ${activeTab === 'reviews' ? 'text-primary' : ''}`}
            >
              Reviews
            </button>
            <button
              onClick={() => onChangeTab('about')}
              className={`hover:text-primary transition-colors cursor-pointer ${activeTab === 'about' ? 'text-primary' : ''}`}
            >
              About
            </button>
            <button
              onClick={() => onChangeTab('contact')}
              className={`hover:text-primary transition-colors cursor-pointer ${activeTab === 'contact' ? 'text-primary' : ''}`}
            >
              Contact
            </button>
          </nav>
        </div>

        {/* Mobile quick tools dropdown / indicators */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300"
          >
            <span>{getActiveToolLabel()}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {isToolsOpen && (
            <>
              <div className="fixed inset-0 z-10 bg-black/10" onClick={() => setIsToolsOpen(false)} />
              <div className="absolute left-2 right-2 top-[52px] max-h-[300px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-xl z-20 flex flex-col gap-3">
                <button
                  onClick={() => { onChangeTab('home'); setIsToolsOpen(false); }}
                  className="text-left text-xs font-bold py-1 border-b border-slate-100"
                >
                  Home
                </button>
                <button
                  onClick={() => { onChangeTab('blog'); setIsToolsOpen(false); }}
                  className="text-left text-xs font-bold py-1 border-b border-slate-100"
                >
                  Blog Library
                </button>
                <button
                  onClick={() => {
                    if (onToggleAIAssistant) {
                      onToggleAIAssistant();
                    } else {
                      onChangeTab('ai-assistant');
                    }
                    setIsToolsOpen(false);
                  }}
                  className="text-left text-xs font-bold py-1 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
                >
                  <Logo className="h-3.5 w-3.5 shrink-0" />
                  <span>Ask ImgDocs</span>
                </button>

                {user && (
                  <button
                    onClick={() => { onChangeTab('dashboard'); setIsToolsOpen(false); }}
                    className="text-left text-xs font-bold py-1 border-b border-slate-100 text-indigo-600"
                  >
                    User Dashboard
                  </button>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">All Tools</p>
                  {toolsList.map((tool) => {
                    let mappedId = tool.id;
                    if (tool.id === 'jpg-to-pdf') mappedId = 'jpg_to_pdf';
                    if (tool.id === 'pdf-to-jpg') mappedId = 'pdf_to_jpg';
                    if (tool.id === 'compress-pdf') mappedId = 'compress';
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          onChangeTab(mappedId);
                          setIsToolsOpen(false);
                        }}
                        className="flex w-full items-center gap-2 py-1 text-[11px] text-slate-600 dark:text-slate-300"
                      >
                        <FileText className="h-3 w-3 shrink-0" />
                        <span>{tool.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Section: Compact buttons & CTA Dashboard Link */}
        <div className="flex items-center gap-2" id="header-actions">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2" id="user-controls-logged-in">
              {/* User Account Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
                  id="user-profile-menu-trigger"
                >
                  <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 p-2 shadow-2xl z-20 animate-fade-in flex flex-col gap-0.5">
                      <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-900 mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account email</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate" title={user.email}>{user.email}</p>
                      </div>

                      <button
                        type="button"
                        id="user-menu-saas-dashboard-btn"
                        onClick={() => handleDashboardNavigate('overview')}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                      >
                        <Activity className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span>Account Dashboard</span>
                      </button>

                      <button
                        type="button"
                        id="user-menu-profile-btn"
                        onClick={() => handleDashboardNavigate('profile')}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                      >
                        <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>My Profile</span>
                      </button>

                      <button
                        type="button"
                        id="user-menu-history-btn"
                        onClick={() => handleDashboardNavigate('history')}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                      >
                        <History className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>Downloads History</span>
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-slate-900 my-1" />

                      <button
                        type="button"
                        id="user-menu-logout-btn"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>
          ) : (
            <div className="flex items-center gap-1.5" id="user-controls-logged-out">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                id="login-btn"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                id="signup-btn"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

