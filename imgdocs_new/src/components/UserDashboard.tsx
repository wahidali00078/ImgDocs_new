/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, ShieldCheck, Download, AlertTriangle, 
  Trash2, RefreshCw, Key, UserCheck, Star, Crown, Zap, 
  History, CreditCard, HelpCircle, ArrowRight
} from 'lucide-react';
import { getUserConversionHistory, ConversionRecord, SubscriptionData } from '../lib/dbHelper';
import { isSuperVipEmail } from '../lib/mongoAuth';
import jsPDF from 'jspdf';

interface UserDashboardProps {
  user: any;
  subscription: SubscriptionData;
  conversionCount: number;
  onUpdateSubscription: (data: SubscriptionData) => Promise<void>;
  onTriggerUpgrade: () => void;
  onNavigateTab: (tab: string) => void;
  initialSubTab?: 'overview' | 'subscription' | 'history' | 'profile';
}

export default function UserDashboard({
  user,
  subscription,
  conversionCount,
  onUpdateSubscription,
  onTriggerUpgrade,
  onNavigateTab,
  initialSubTab = 'overview'
}: UserDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'subscription' | 'history' | 'profile'>(initialSubTab);
  const [historyLogs, setHistoryLogs] = useState<ConversionRecord[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const fetchHistory = async () => {
    if (user) {
      setLoadingLogs(true);
      const records = await getUserConversionHistory(user.uid);
      setHistoryLogs(records);
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const showActionMsg = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleCancelSub = async () => {
    const updated: SubscriptionData = {
      ...subscription,
      status: 'cancelled'
    };
    await onUpdateSubscription(updated);
    showActionMsg('Your subscription cancellation is processed. You will retain Pro access until the current period ends.');
  };

  const handleResumeSub = async () => {
    const updated: SubscriptionData = {
      ...subscription,
      status: 'active'
    };
    await onUpdateSubscription(updated);
    showActionMsg('Success! Your Pro membership subscription has been fully resumed.');
  };

  const handleDowngrade = async () => {
    const updated: SubscriptionData = {
      plan: 'free',
      status: 'active',
      renewalDate: '',
      isPremium: false,
      paymentHistory: subscription.paymentHistory
    };
    await onUpdateSubscription(updated);
    showActionMsg('Your plan has been downgraded to Free Forever. Limits are now applied.');
  };

  const generateInvoicePDF = (invoice: any) => {
    try {
      const doc = new jsPDF();
      
      // Top header band
      doc.setFillColor(37, 99, 235); // Blue primary color
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('ImgDocs Inc.', 15, 18);
      
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text('Local Browser-Native PDF Suite', 15, 25);
      doc.text('billing@imgdocs.com | https://imgdocs.com', 15, 30);
      
      doc.setFontSize(20);
      doc.setFont('Helvetica', 'bold');
      doc.text('INVOICE', 150, 25);

      // Invoice Details
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'bold');
      doc.text('Billed To:', 15, 55);
      doc.setFont('Helvetica', 'normal');
      doc.text(user?.email || 'customer@imgdocs.com', 15, 62);
      doc.text(`User ID: ${user?.uid || 'N/A'}`, 15, 68);

      doc.setFont('Helvetica', 'bold');
      doc.text('Invoice Info:', 140, 55);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Invoice ID: ${invoice.id}`, 140, 62);
      doc.text(`Date: ${invoice.date}`, 140, 68);
      doc.text('Status: PAID', 140, 74);

      // Line items table header
      doc.setFillColor(240, 244, 248);
      doc.rect(15, 85, 180, 8, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.text('Description', 20, 90);
      doc.text('Billing Period', 100, 90);
      doc.text('Amount', 170, 90);

      // Line items
      doc.setFont('Helvetica', 'normal');
      doc.text(invoice.plan, 20, 103);
      doc.text('1 Month (Automatic Renewal)', 100, 103);
      doc.text(invoice.amount, 170, 103);

      // Total block
      doc.setDrawColor(220, 225, 230);
      doc.line(15, 115, 195, 115);
      
      doc.setFont('Helvetica', 'bold');
      doc.text('Total Charged (USD):', 110, 125);
      doc.text(invoice.amount, 170, 125);

      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Processed securely via Stripe API Gateway. No server files were captured during checkout.', 15, 150);
      doc.text('Thank you for supporting private local document compilers!', 15, 156);

      // Save PDF
      doc.save(`ImgDocs-Invoice-${invoice.id}.pdf`);
      showActionMsg(`Invoice ${invoice.id} downloaded successfully!`);
    } catch (err) {
      console.error('Invoice compilation failed:', err);
    }
  };

  const getLimitLabel = () => {
    if (subscription.isPremium) return 'Unlimited';
    return user ? '15 operations/day' : '5 operations/day';
  };

  const getRemainingConversions = () => {
    if (subscription.isPremium) return 'No Limit';
    const limit = user ? 15 : 5;
    return Math.max(0, limit - conversionCount);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-fade-in" id="dashboard-system-container">
      
      {/* Action status message popup */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xl border border-slate-800 flex items-center gap-2 animate-fade-in">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Banner Area */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2.5">
            {subscription.isPremium ? (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <Crown className="h-3.5 w-3.5 fill-slate-950 text-slate-950" /> Premium Active
              </span>
            ) : (
              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Free Forever Tier
              </span>
            )}
            <span className="text-slate-400 text-[11px] font-semibold">Account Dashboard</span>
          </div>

          <div>
            <h1 className="text-xl md:text-3xl font-black font-display tracking-tight">
              Welcome back, <span className="text-indigo-400">{user?.email?.split('@')[0]}</span>!
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Securely compile, optimize, and organize your vector layers locally in your secure sandbox browser.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 backdrop-blur-md rounded-xl p-4 border border-slate-800 flex items-center gap-4 shrink-0 shadow-inner">
          <div className="text-center border-r border-slate-800 pr-4">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan Type</span>
            <span className="text-sm font-black text-white mt-1 block">
              100% Free Forever (Unlocked)
            </span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Conversions Left</span>
            <span className="text-sm font-black text-emerald-400 mt-1 block">
              Unlimited ∞
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid content with dashboard navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Sidebar navigation */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none border-b lg:border-b-0 border-slate-100 lg:space-y-1">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Overview Stats</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Conversion History</span>
          </button>

          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Profile Security</span>
          </button>
        </div>

        {/* Right Side: Tab Displays */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[400px]">
          
          {/* 1. OVERVIEW BLOCK */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-black font-display text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-900 pb-3">
                Account Security & Conversion Analytics
              </h2>

              {/* Mini bento-grid stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/30">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Plan</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-black text-slate-800 dark:text-white">
                      Unlimited Free Suite
                    </span>
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    All 24+ Tools Completely Unlocked
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/30">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Limit Tracker</span>
                  <span className="text-xl font-black text-emerald-500 mt-2 block">
                    Unlimited (No Caps)
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Zero conversion or page restrictions
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/30">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Conversions</span>
                  <span className="text-xl font-black text-slate-800 dark:text-white mt-2 block">
                    {conversionCount} operations
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Files converted in your active workspace
                  </span>
                </div>
              </div>

              {/* Compliance & local storage disclaimer */}
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/20 text-xs text-slate-400 space-y-1.5 leading-relaxed">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Sandboxed Local Operations
                </span>
                <p>
                  At ImgDocs, user safety is paramount. All PDF operations, conversions, splitting, rotation, and signature encryptions execute inside the client browser’s secure thread pool using compiled WebAssembly. Your business records or legal documents never reach external clouds, adhering to absolute non-disclosure protocols.
                </p>
              </div>
            </div>
          )}

          {/* 2. SUBSCRIPTION & BILLING BLOCK */}
          {activeSubTab === 'subscription' && (
            <div className="space-y-6 animate-fade-in" id="billing-console">
              <h2 className="text-lg font-black font-display text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-900 pb-3">
                Subscription Management & Billing Console
              </h2>

              {/* Subscription details and actions grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Plan Overview Panel */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-900/30 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Current Plan</span>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-800 dark:text-white">
                        {subscription.isPremium 
                          ? `${subscription.plan === 'pro_monthly' ? 'Pro Monthly Plan (₹299/mo)' : subscription.plan === 'pro_yearly' ? 'Pro Yearly Plan (₹2,999/yr)' : 'Business Plan (₹799/mo)'}` 
                          : 'Free Tier Plan'}
                      </h3>
                      {subscription.isPremium && <Crown className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Next Billing Date</span>
                      <span className="font-extrabold text-slate-800 dark:text-white mt-1 block">
                        {subscription.isPremium && subscription.status === 'active' ? subscription.renewalDate : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Renewal Date</span>
                      <span className="font-extrabold text-slate-800 dark:text-white mt-1 block">
                        {subscription.isPremium ? subscription.renewalDate : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 text-xs">
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Payment Method</span>
                    <span className="font-extrabold text-slate-800 dark:text-white mt-1 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      {subscription.isPremium ? 'Visa ending in 4242 (Stripe)' : 'None linked'}
                    </span>
                  </div>

                  {subscription.isPremium && subscription.status === 'cancelled' && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs font-bold text-amber-700 dark:text-amber-400 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                      <span>Your subscription will expire on {subscription.renewalDate || 'N/A'}</span>
                    </div>
                  )}
                </div>

                {/* Sub Management Action Center */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-900/30 flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Actions Console</span>
                    <p className="text-xs text-slate-500 leading-relaxed">Modify your tier level, opt-out of automatic renewals, or fully resume your billing preferences instantly.</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {subscription.isPremium ? (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          {subscription.status === 'active' ? (
                            <button
                              onClick={handleCancelSub}
                              className="w-full py-2.5 border border-red-200 hover:bg-red-50 hover:text-red-600 text-red-500 font-bold rounded-lg text-xs transition-colors cursor-pointer text-center"
                            >
                              Cancel Subscription
                            </button>
                          ) : (
                            <button
                              onClick={handleResumeSub}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer text-center"
                            >
                              Resume Subscription
                            </button>
                          )}
                          <button
                            onClick={handleDowngrade}
                            className="w-full py-2.5 border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold rounded-lg text-xs transition-colors cursor-pointer text-center"
                          >
                            Downgrade to Free
                          </button>
                        </div>
                        
                        {subscription.plan === 'pro_monthly' && (
                          <button
                            onClick={onTriggerUpgrade}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer text-center mt-1"
                          >
                            Upgrade to Annual (Save 17%)
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={onTriggerUpgrade}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-black rounded-lg text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Zap className="h-4 w-4 fill-white text-white" />
                        <span>Upgrade to Premium Tier</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Invoices History Table */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-900">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Billing Invoice History</h3>
                  <span className="text-[10px] text-slate-400 font-bold">PDF receipt on checkout</span>
                </div>

                {subscription.paymentHistory && subscription.paymentHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5">Invoice ID</th>
                          <th className="py-2.5">Billing Date</th>
                          <th className="py-2.5">Subscribed Plan</th>
                          <th className="py-2.5">Amount Paid</th>
                          <th className="py-2.5 text-right">Receipt Download</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {subscription.paymentHistory.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                            <td className="py-3 font-mono text-[11px] text-slate-500">{inv.id}</td>
                            <td className="py-3 font-mono text-slate-500">{inv.date}</td>
                            <td className="py-3 font-medium text-slate-800 dark:text-white">{inv.plan}</td>
                            <td className="py-3 font-mono text-[11px] text-emerald-600 font-bold">{inv.amount}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => generateInvoicePDF(inv)}
                                className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-bold text-xs cursor-pointer"
                                title="Get Invoice PDF"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Invoice PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400 font-bold">No active premium invoice logs found.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Upgrade your membership to unlock invoicing histories.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. HISTORY BLOCK */}
          {activeSubTab === 'history' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
                <h2 className="text-lg font-black font-display text-slate-900 dark:text-white">
                  Local Document Conversion Logs
                </h2>
                <button
                  onClick={fetchHistory}
                  disabled={loadingLogs}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-50 cursor-pointer"
                  title="Reload history log"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingLogs ? (
                <div className="text-center py-12 text-slate-400">
                  <RefreshCw className="h-7 w-7 animate-spin text-primary mx-auto mb-2" />
                  <span className="text-xs font-semibold">Syncing Firestore activity pipeline...</span>
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-bold">No conversions recorded yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Your files converted in this workspace will list here instantly.</p>
                  <button
                    onClick={() => onNavigateTab('home')}
                    className="mt-4 rounded-xl bg-slate-950 text-white font-bold px-4 py-2 text-xs hover:bg-slate-900 cursor-pointer"
                  >
                    Open Compiler Workspace
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5">Tool Category</th>
                        <th className="py-2.5">Document File</th>
                        <th className="py-2.5">Size</th>
                        <th className="py-2.5">Pages</th>
                        <th className="py-2.5 text-right">Processed On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {historyLogs.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="py-3">
                            <span className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                              {h.tool.replace('_', ' ').replace('-', ' ')}
                            </span>
                          </td>
                          <td className="py-3 font-display font-medium text-slate-800 dark:text-white max-w-[200px] truncate" title={h.fileName}>
                            {h.fileName}
                          </td>
                          <td className="py-3 font-mono text-[11px] text-slate-500">{h.fileSize}</td>
                          <td className="py-3 text-slate-500">{h.pageCount} {h.pageCount === 1 ? 'item' : 'items'}</td>
                          <td className="py-3 text-right font-mono text-[10px] text-slate-400">
                            {h.timestamp ? new Date(h.timestamp).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Just now'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 4. PROFILE BLOCK */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6 animate-fade-in" id="profile-console">
              <h2 className="text-lg font-black font-display text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-900 pb-3">
                Security Profile & API Integration
              </h2>

              <div className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Primary Email</span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-900 text-xs font-bold text-slate-800 dark:text-white">
                      {user?.email || 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Account Status</span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-900 text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <UserCheck className="h-4 w-4" />
                      <span>{user?.emailVerified ? 'Verified Account' : 'Standard Guest'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">SaaS Identity Token</span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-900 text-xs font-mono text-slate-400 truncate select-all">
                    {user?.uid || 'N/A'}
                  </div>
                </div>

                {/* API Developer Key integration */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-900 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-indigo-700 dark:text-indigo-400 tracking-wider">
                    <Key className="h-4 w-4 shrink-0" />
                    <span>Developer API Tokens</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Integrate local high-fidelity compilers inside your corporate terminal or backend services. Developer keys are restricted to Business Plan members.
                  </p>

                  {subscription.plan === 'business_monthly' ? (
                    <div className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-100 flex items-center justify-between font-mono text-xs text-indigo-800">
                      <span>sdk_live_imgdocs_a546...62b3</span>
                      <button className="text-xs text-indigo-700 hover:text-indigo-900 font-bold">Copy Key</button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-900 text-xs text-slate-500 flex items-center justify-between">
                      <span>Developer credentials locked. Upgrade to Business Plan to unlock keys.</span>
                      <button
                        onClick={onTriggerUpgrade}
                        className="text-primary hover:text-primary-hover font-bold flex items-center gap-1 text-[11px] shrink-0"
                      >
                        Unlock <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
