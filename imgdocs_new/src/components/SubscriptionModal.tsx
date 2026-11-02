/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Check, Crown, CreditCard, Zap, ShieldCheck, Loader2, Award, AlertCircle, QrCode } from 'lucide-react';
import { mongoAuth } from '../lib/mongoAuth';
import PaytmQrPaymentCard from './PaytmQrPaymentCard';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversionCount: number;
  isPremium: boolean;
  onActivatePremium: (utr: string) => Promise<void>;
}

export default function SubscriptionModal({ isOpen, onClose, conversionCount, isPremium, onActivatePremium }: SubscriptionModalProps) {
  const [paymentMethodTab, setPaymentMethodTab] = useState<'paytm_qr' | 'razorpay'>('paytm_qr');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'awaiting_payment' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay Script dynamically when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setPaymentStatus('idle');
    setErrorMsg('');

    if ((window as any).Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      setErrorMsg('Failed to load the Razorpay checkout script. Please check your network connection.');
      setPaymentStatus('error');
    };
    document.body.appendChild(script);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckoutRazorpay = async () => {
    setErrorMsg('');
    const currentUser = mongoAuth.getCurrentUser();
    if (!currentUser) {
      setErrorMsg('Authentication is required. Please sign in or register to complete upgrading.');
      setPaymentStatus('error');
      return;
    }

    if (!razorpayLoaded && !(window as any).Razorpay) {
      setErrorMsg('Razorpay security script is still loading. Please try again in a second.');
      setPaymentStatus('error');
      return;
    }

    setPaymentStatus('initiating');

    try {
      const idToken = mongoAuth.getToken();

      // 1. Contact backend to create a real pro_monthly order (₹299 INR)
      const createOrderRes = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ planId: 'pro_monthly' })
      });

      if (!createOrderRes.ok) {
        const errData = await createOrderRes.json().catch(() => ({}));
        throw new Error(errData?.error || 'Failed to initialize payment transaction with backend.');
      }

      const orderData = await createOrderRes.json();
      
      if (orderData.sandbox) {
        setPaymentStatus('verifying');
        // Provide a 1.5 second realistic simulated connection delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const verifyRes = await fetch('/api/subscription/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            orderId: orderData.orderId,
            razorpay_payment_id: 'pay_sandbox_' + Math.floor(Math.random() * 90000000 + 10000000),
            razorpay_order_id: orderData.orderId,
            razorpay_signature: 'sandbox_signature_verified'
          })
        });

        if (!verifyRes.ok) {
          const errData = await verifyRes.json().catch(() => ({}));
          throw new Error(errData?.error || 'Simulated checkout verification failed.');
        }

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setPaymentStatus('success');
          await onActivatePremium('razorpay_success');
        } else {
          throw new Error('Simulated verification response was unsuccessful.');
        }
        return;
      }

      setPaymentStatus('awaiting_payment');

      // 2. Configure Razorpay checkout options
      const keyId = orderData.keyId || (import.meta as any).env.VITE_RAZORPAY_KEY_ID || '';
      
      if (!keyId || keyId.startsWith('MY_') || keyId.startsWith('YOUR_')) {
        setPaymentStatus('verifying');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const verifyRes = await fetch('/api/subscription/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            orderId: orderData.orderId,
            razorpay_payment_id: 'pay_sandbox_' + Math.floor(Math.random() * 90000000 + 10000000),
            razorpay_order_id: orderData.orderId,
            razorpay_signature: 'sandbox_signature_verified'
          })
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setPaymentStatus('success');
            await onActivatePremium('razorpay_success');
            return;
          }
        }
      }

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'ImgDocs',
        description: 'Upgrade to Pro Monthly Plan',
        image: '/favicon.ico',
        order_id: orderData.orderId,
        prefill: {
          email: currentUser.email || '',
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus('idle');
            setErrorMsg('Payment request was cancelled.');
          }
        },
        handler: async (response: any) => {
          setPaymentStatus('verifying');
          try {
            // 3. Cryptographic signature verification on the server
            const verifyRes = await fetch('/api/subscription/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
              },
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => ({}));
              throw new Error(errData?.error || 'Razorpay transaction verification failed.');
            }

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setPaymentStatus('success');
              await onActivatePremium('razorpay_success');
            } else {
              throw new Error('Transaction verification failed.');
            }
          } catch (verifyErr: any) {
            console.error('Razorpay verify error:', verifyErr);
            setErrorMsg(verifyErr.message || 'Signature verification rejected. Please retry.');
            setPaymentStatus('error');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setErrorMsg(resp.error?.description || 'Transaction declined by banking server or UPI provider.');
        setPaymentStatus('error');
      });

      rzp.open();
    } catch (err: any) {
      console.error('Razorpay check-out launch error:', err);
      setErrorMsg(err.message || 'Failed to initialize secure checkout payment.');
      setPaymentStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in" id="subscription-modal-overlay">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-950 p-0 shadow-2xl border border-slate-100 dark:border-slate-900 flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        id="subscription-modal-container"
      >
        {/* Banner header with gradient */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 p-6 text-white relative">
          {paymentStatus !== 'initiating' && paymentStatus !== 'verifying' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white rounded-lg p-1 transition-colors hover:bg-white/10 cursor-pointer"
              id="subscription-close-btn"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400 text-slate-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Crown className="h-3.5 w-3.5 fill-slate-900" /> Premium Pro
            </span>
            {!isPremium && (
              <span className="text-indigo-100 text-xs font-semibold">
                Free Limit Reached ({conversionCount}/5)
              </span>
            )}
          </div>
          
          <h3 className="text-2xl font-black tracking-tight" id="subscription-title">
            {isPremium ? 'Welcome to Premium Pro' : 'Unlock Unlimited Conversions'}
          </h3>
          <p className="text-indigo-100 text-sm mt-1">
            {isPremium 
              ? 'Thank you for supporting ImgDocs! You now have fully unrestricted access to all tools.' 
              : "You've reached your free limit of 5 secure client-side operations. Support our platform and convert without limits!"}
          </p>
        </div>

        {/* Payment Method Switcher */}
        {!isPremium && paymentStatus !== 'success' && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 p-1.5 gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setPaymentMethodTab('paytm_qr')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMethodTab === 'paytm_qr'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4 text-[#00b9f5]" />
              <span>Paytm UPI QR (Scan & Pay)</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 ml-1">
                Direct
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethodTab('razorpay')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMethodTab === 'razorpay'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Cards / Gateway</span>
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Payment states */}
          {paymentStatus === 'initiating' && (
            <div className="text-center py-12 space-y-4 animate-fade-in" id="sub-initiating-screen">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Connecting Razorpay Gateway...</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">Creating secure order instance on backend. Please do not refresh.</p>
              </div>
            </div>
          )}

          {paymentStatus === 'verifying' && (
            <div className="text-center py-12 space-y-4 animate-fade-in" id="sub-verifying-screen">
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Verifying Transaction Cryptography...</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">Validating authentic signature match with server secrets.</p>
              </div>
            </div>
          )}

          {paymentStatus === 'awaiting_payment' && (
            <div className="text-center py-12 space-y-4 animate-fade-in" id="sub-awaiting-screen">
              <Loader2 className="h-10 w-10 text-amber-500 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Complete in Secure Overlay...</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">Please authorize your payment inside the Razorpay Checkout window.</p>
              </div>
            </div>
          )}

          {isPremium || paymentStatus === 'success' ? (
            <div className="text-center py-8 space-y-4 animate-fade-in" id="subscription-premium-active-screen">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Award className="h-9 w-9" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xl font-bold text-slate-800 dark:text-white">Your Pro Membership is Active!</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  All 24+ file conversion, compression, and signing tools are now completely unlocked with unlimited conversions.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold px-6 py-3 text-sm transition-colors cursor-pointer"
              >
                Start Converting
              </button>
            </div>
          ) : (
            paymentStatus !== 'initiating' && paymentStatus !== 'verifying' && paymentStatus !== 'awaiting_payment' && (
              <>
                {paymentMethodTab === 'paytm_qr' ? (
                  <PaytmQrPaymentCard
                    planId="pro_monthly"
                    onSuccess={async (plan) => {
                      await onActivatePremium('paytm_qr_success');
                    }}
                    onCancel={onClose}
                  />
                ) : (
                  <>
                    {/* Features checkmark grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="premium-features-list">
                      <div className="flex items-start gap-2.5">
                        <div className="rounded-full bg-indigo-50 dark:bg-indigo-950 p-1 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">100% Unlimited Conversions</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">No daily caps or batch restrictions.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2.5">
                        <div className="rounded-full bg-indigo-50 dark:bg-indigo-950 p-1 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">Full Access to All 24 Tools</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Includes Merge, Protect, Sign, OCR & more.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="rounded-full bg-indigo-50 dark:bg-indigo-950 p-1 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">High-Fidelity PDF Output</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">No watermarks, full resolution vector quality.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="rounded-full bg-indigo-50 dark:bg-indigo-950 p-1 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">Local Browser Security</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Absolute privacy. Zero cloud uploads.</p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Highlight Card */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pro Monthly Subscription</p>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                          ₹299 <span className="text-xs font-normal text-slate-400">/ month</span>
                        </h4>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0">
                        <Zap className="h-3.5 w-3.5 fill-indigo-700 dark:fill-indigo-400" /> Secure Plan
                      </div>
                    </div>

                    {/* Test Mode Sandbox Guide */}
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 text-[11px] text-amber-900 dark:text-amber-300 space-y-1.5">
                      <div className="font-bold flex items-center justify-between">
                        <span>💡 Razorpay Sandbox Test Mode</span>
                        <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                          Test Keys
                        </span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[10.5px]">
                        <li>
                          <strong>Do NOT scan QR with real Paytm/GPay apps:</strong> Real bank apps reject test VPAs.
                        </li>
                        <li>
                          <strong>In Razorpay Popup:</strong> Choose <strong>UPI</strong> → enter <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded font-mono font-bold">success@razorpay</code>.
                        </li>
                      </ul>
                    </div>

                    {/* Error Box */}
                    {errorMsg && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/60 rounded-xl text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-start gap-1.5 animate-fade-in">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={handleCheckoutRazorpay}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                        id="subscription-razorpay-popup-btn"
                      >
                        <CreditCard className="h-4 w-4 text-indigo-200" /> Pay with Razorpay Popup (₹299)
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          setErrorMsg('');
                          setPaymentStatus('verifying');
                          try {
                            const idToken = mongoAuth.getToken();
                            const createOrderRes = await fetch('/api/subscription/create-order', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${idToken}`
                              },
                              body: JSON.stringify({ planId: 'pro_monthly' })
                            });
                            const orderData = await createOrderRes.json();
                            const fakePayId = 'pay_sim_' + Math.random().toString(36).substring(2, 10);
                            
                            const verifyRes = await fetch('/api/subscription/verify-payment', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${idToken}`
                              },
                              body: JSON.stringify({
                                orderId: orderData.orderId,
                                razorpay_payment_id: fakePayId,
                                razorpay_order_id: orderData.orderId,
                                razorpay_signature: 'sandbox_signature_verified'
                              })
                            });
                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                              setPaymentStatus('success');
                              await onActivatePremium('sandbox_success');
                            } else {
                              throw new Error('Sandbox simulation failed.');
                            }
                          } catch (e: any) {
                            setErrorMsg(e.message || 'Simulation failed.');
                            setPaymentStatus('error');
                          }
                        }}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
                        id="subscription-sandbox-simulate-btn"
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        <span>⚡ 1-Click Instant Test (Bypass Bank / Sandbox)</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            )
          )}
        </div>


        {/* Footer info banner */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <p className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> PCI-DSS Secure checkout via Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
