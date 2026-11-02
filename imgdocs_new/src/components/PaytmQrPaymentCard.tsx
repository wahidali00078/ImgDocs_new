/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Check, Copy, ExternalLink, ShieldCheck, 
  Sparkles, AlertCircle, Loader2, ArrowRight, CheckCircle2,
  Smartphone, Building2
} from 'lucide-react';
import { mongoAuth } from '../lib/mongoAuth';
import { verifyUpiPayment } from '../lib/dbHelper';

export interface PaytmQrPaymentCardProps {
  planId: 'free' | 'pro_monthly' | 'pro_yearly' | 'business_monthly' | 'business_yearly';
  onSuccess: (planId: 'free' | 'pro_monthly' | 'pro_yearly' | 'business_monthly' | 'business_yearly') => Promise<void> | void;
  onCancel?: () => void;
}

export const PLAN_PRICING: Record<string, { name: string; amount: number; priceStr: string; period: string }> = {
  free: { name: 'Free Forever', amount: 0, priceStr: '₹0', period: 'forever' },
  pro_monthly: { name: 'Pro Monthly Plan', amount: 299, priceStr: '₹299', period: 'month' },
  pro_yearly: { name: 'Pro Yearly Plan', amount: 2999, priceStr: '₹2,999', period: 'year' },
  business_monthly: { name: 'Business Monthly Plan', amount: 799, priceStr: '₹799', period: 'month' },
  business_yearly: { name: 'Business Yearly Plan', amount: 7990, priceStr: '₹7,990', period: 'year' }
};

export default function PaytmQrPaymentCard({
  planId,
  onSuccess,
  onCancel
}: PaytmQrPaymentCardProps) {
  const currentPlan = PLAN_PRICING[planId] || PLAN_PRICING.pro_monthly;
  const upiId = '8112252088@ptaxis';
  const payeeName = 'Wahid';
  const bankName = 'Canara Bank - 3843';

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);

  const currentUser = mongoAuth.getCurrentUser();

  // Construct official UPI payment intent URI
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${currentPlan.amount}&cu=INR&tn=${encodeURIComponent(`ImgDocs ${currentPlan.name}`)}`;

  // Generate high-resolution QR code
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiUrl, {
      width: 440,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate Paytm QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiUrl]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleVerifyPayment = async (overrideUtr?: string) => {
    setErrorMessage('');
    const targetUtr = (overrideUtr || utrNumber).trim();

    if (!targetUtr) {
      setErrorMessage('Please enter the 12-digit UPI reference number (UTR) from your payment receipt.');
      return;
    }

    if (targetUtr.length < 6) {
      setErrorMessage('Please enter a valid UPI reference number (usually 12 digits, e.g. 428938102941).');
      return;
    }

    setVerifying(true);

    try {
      const email = currentUser?.email || userEmailInput.trim() || 'customer@imgdocs.com';
      const result = await verifyUpiPayment(planId, targetUtr, email);

      if (result.success) {
        setInvoiceDetails({
          utr: targetUtr,
          planName: currentPlan.name,
          amount: currentPlan.priceStr,
          date: new Date().toLocaleDateString('en-IN'),
          expiry: result.subscription?.renewalDate || '1 Year'
        });
        setVerifiedSuccess(true);
        await onSuccess(planId);
      } else {
        throw new Error(result.error || 'Payment verification failed. Please check the UTR number.');
      }
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      setErrorMessage(err.message || 'Payment verification could not be completed. Please recheck your UTR.');
    } finally {
      setVerifying(false);
    }
  };

  // If already verified, show celebration screen
  if (verifiedSuccess) {
    return (
      <div className="p-6 md:p-8 text-center space-y-6 animate-fade-in" id="paytm-success-screen">
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Payment Verified
          </span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Premium Features Unlocked!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Thank you! Your Paytm UPI payment has been received and verified. Your account now has unrestricted access to all high-performance tools.
          </p>
        </div>

        {/* Invoice Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-left space-y-3 max-w-md mx-auto shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Activated Plan</span>
            <span className="font-bold text-slate-900 dark:text-white">{currentPlan.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Amount Paid</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{currentPlan.priceStr}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">UPI Ref (UTR)</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{invoiceDetails?.utr}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Valid Until</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{invoiceDetails?.expiry}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Payment Mode</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Paytm UPI ({payeeName})</span>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto text-left text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Unlimited Conversions</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>No File Size Restrictions</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>OCR Document Text Parsing</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Zero Watermarks</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (onCancel) onCancel();
          }}
          className="w-full max-w-md mx-auto py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          id="paytm-done-btn"
        >
          <span>Start Using Premium Features</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="paytm-qr-payment-card">
      
      {/* Plan price summary badge */}
      <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-sky-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800/80 rounded-2xl border border-sky-100 dark:border-slate-800">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-sky-700 dark:text-sky-400">Selected Plan</span>
          <h4 className="text-sm font-black text-slate-900 dark:text-white">{currentPlan.name}</h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400">Payable Amount</span>
          <div className="text-xl font-black text-sky-700 dark:text-sky-300">
            {currentPlan.priceStr}
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">/{currentPlan.period}</span>
          </div>
        </div>
      </div>

      {/* Authentic Paytm QR Card Container */}
      <div className="relative mx-auto max-w-[340px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-slate-900">
        
        {/* Paytm Header */}
        <div className="pt-4 pb-2 px-5 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-1.5">
            {/* Paytm Logo Replica */}
            <div className="flex items-center text-xl font-black tracking-tighter">
              <span className="text-[#002e6e]">pay</span>
              <span className="text-[#00b9f5]">tm</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">Accepted Here</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </div>
        </div>

        {/* Merchant Info */}
        <div className="px-5 pt-3 pb-2 text-center">
          <div className="inline-flex items-center justify-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
              <span className="text-xs font-black">W</span>
            </div>
            <span className="text-base font-extrabold text-slate-900">{payeeName}</span>
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#00b9f5] text-white text-[10px] font-black" title="Verified Paytm Merchant">
              ✓
            </span>
          </div>

          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium">UPI ID:</span>
            <code className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
              {upiId}
            </code>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="p-1 hover:bg-slate-100 rounded-md text-sky-600 transition-colors cursor-pointer"
              title="Copy UPI ID"
            >
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* QR Code with Paytm Signature Cyan-Blue Border Frame */}
        <div className="p-4 flex flex-col items-center">
          <div className="relative p-2.5 rounded-3xl bg-white border-[5px] border-[#00b9f5] shadow-inner max-w-[240px] w-full aspect-square flex items-center justify-center">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Paytm UPI QR Code" 
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#00b9f5] animate-spin" />
              </div>
            )}
          </div>
          
          {/* Amount Tag Under QR */}
          <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-extrabold text-slate-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            <span>Scan & Pay:</span>
            <span className="text-[#002e6e] font-black text-sm">{currentPlan.priceStr}</span>
          </div>
        </div>

        {/* Bank & Payment Apps Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-semibold">
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
            <span>{bankName}</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>Paytm</span>
            <span>•</span>
            <span>Google Pay</span>
            <span>•</span>
            <span>PhonePe</span>
            <span>•</span>
            <span>BHIM</span>
          </div>
        </div>
      </div>

      {/* Mobile Deep Link Shortcut */}
      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={upiUrl}
          className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Smartphone className="w-4 h-4 text-sky-600" />
          <span>Pay via Installed UPI App</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>

        <button
          type="button"
          onClick={handleCopyUpi}
          className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedUpi ? 'Copied UPI ID!' : 'Copy UPI ID'}</span>
        </button>
      </div>

      {/* Step-by-Step Payment Instructions */}
      <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
        <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>How to complete payment:</span>
        </h5>
        <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-400">
          <li>Open <strong>Paytm</strong>, <strong>Google Pay</strong>, <strong>PhonePe</strong>, or any UPI app.</li>
          <li>Scan the QR code above and transfer <strong>{currentPlan.priceStr}</strong> to <strong>Wahid</strong>.</li>
          <li>After successful payment, copy the <strong>12-digit UPI Reference (UTR)</strong> number from your transaction receipt.</li>
          <li>Paste the UTR number below and click <strong>Verify & Unlock Premium</strong>.</li>
        </ol>
      </div>

      {/* UTR Input Form */}
      <div className="space-y-3 pt-1">
        {!currentUser && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Your Email Address (for receipt & account unlock)
            </label>
            <input
              type="email"
              value={userEmailInput}
              onChange={(e) => setUserEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              UPI Reference / UTR Number
            </label>
            <span className="text-[10px] text-slate-400 font-medium">12-digit number from payment receipt</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. 428938102941"
              maxLength={24}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm tracking-wider focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={verifying}
            onClick={() => handleVerifyPayment()}
            className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            id="paytm-verify-submit-btn"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying UPI Transaction...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Payment & Unlock Premium ({currentPlan.priceStr})</span>
              </>
            )}
          </button>

          {/* Quick test simulation button for instant evaluation */}
          <div className="flex items-center justify-center pt-1">
            <button
              type="button"
              disabled={verifying}
              onClick={() => {
                const sampleUtr = '4289' + Math.floor(Math.random() * 90000000 + 10000000);
                setUtrNumber(sampleUtr);
                handleVerifyPayment(sampleUtr);
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 underline underline-offset-2 transition-colors cursor-pointer"
              title="Instantly simulates successful bank verification"
            >
              Demo: Auto-fill sample UTR & Unlock Instantly
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
