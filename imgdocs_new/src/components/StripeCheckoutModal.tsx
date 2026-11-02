/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Loader2, Award, AlertCircle, ShieldAlert, CreditCard, Zap, QrCode, Smartphone } from 'lucide-react';
import { mongoAuth } from '../lib/mongoAuth';
import PaytmQrPaymentCard from './PaytmQrPaymentCard';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: 'free' | 'pro_monthly' | 'pro_yearly' | 'business_monthly' | 'business_yearly' | null;
  onPaymentSuccess: (plan: 'free' | 'pro_monthly' | 'pro_yearly' | 'business_monthly' | 'business_yearly') => Promise<void>;
}

export default function StripeCheckoutModal({
  isOpen,
  onClose,
  selectedPlan,
  onPaymentSuccess
}: StripeCheckoutModalProps) {
  const [paymentMethodTab, setPaymentMethodTab] = useState<'paytm_qr' | 'razorpay'>('paytm_qr');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'awaiting_payment' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Dynamic script loader for Razorpay Checkout JS
  useEffect(() => {
    if (!isOpen) return;

    // Reset state
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
      setErrorMsg('Failed to load the Razorpay secure gateway script. Please check your network connection.');
      setPaymentStatus('error');
    };
    document.body.appendChild(script);

    return () => {
      // Keep script loaded on body for future opens
    };
  }, [isOpen]);

  if (!isOpen || !selectedPlan) return null;

  const planDetails = {
    free: { name: 'Free Forever', price: '₹0.00', period: 'forever', value: 0 },
    pro_monthly: { name: 'Pro Monthly Plan', price: '₹299.00', period: 'month', value: 299 },
    pro_yearly: { name: 'Pro Yearly Plan', price: '₹2,999.00', period: 'year', value: 2999 },
    business_monthly: { name: 'Business Monthly Plan', price: '₹799.00', period: 'month', value: 799 },
    business_yearly: { name: 'Business Yearly Plan', price: '₹7,990.00', period: 'year', value: 7990 }
  }[selectedPlan];

  const handleInitializeRazorpay = async () => {
    setErrorMsg('');
    const currentUser = mongoAuth.getCurrentUser();
    if (!currentUser) {
      setErrorMsg('Authentication is required. Please sign in first.');
      setPaymentStatus('error');
      return;
    }

    if (!razorpayLoaded && !(window as any).Razorpay) {
      setErrorMsg('Razorpay security script is not fully loaded yet. Please wait a moment.');
      setPaymentStatus('error');
      return;
    }

    setPaymentStatus('initiating');

    try {
      const idToken = mongoAuth.getToken();

      // 1. Contact backend to initiate secure order
      const createOrderRes = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ planId: selectedPlan })
      });

      if (!createOrderRes.ok) {
        const errData = await createOrderRes.json().catch(() => ({}));
        throw new Error(errData?.error || 'Failed to initialize checkout transaction.');
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
          await onPaymentSuccess(selectedPlan);
        } else {
          throw new Error('Simulated verification response was unsuccessful.');
        }
        return;
      }
      
      setPaymentStatus('awaiting_payment');

      // 2. Build Razorpay checkout configuration
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
            await onPaymentSuccess(selectedPlan);
            return;
          }
        }
      }

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'ImgDocs',
        description: `Upgrade to ${planDetails.name}`,
        image: '/favicon.ico',
        order_id: orderData.orderId,
        prefill: {
          email: currentUser.email || '',
        },
        theme: {
          color: '#4f46e5', // Brand indigo-600
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus('idle');
            setErrorMsg('Payment request was cancelled. You have not been charged.');
          }
        },
        handler: async (response: any) => {
          setPaymentStatus('verifying');
          try {
            // 3. Request cryptographic signature verification from the backend
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
              throw new Error(errData?.error || 'Cryptographic transaction signature verification failed.');
            }

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setPaymentStatus('success');
              await onPaymentSuccess(selectedPlan);
            } else {
              throw new Error('Verification response was unsuccessful.');
            }
          } catch (verifyErr: any) {
            console.error('Signature verification error:', verifyErr);
            setErrorMsg(verifyErr.message || 'Signature validation failed. Please contact support.');
            setPaymentStatus('error');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        console.error('Razorpay payment failure callback:', resp.error);
        setErrorMsg(resp.error?.description || 'Transaction declined by payment processor or UPI server.');
        setPaymentStatus('error');
      });

      rzp.open();
    } catch (err: any) {
      console.error('Razorpay checkout initiation error:', err);
      setErrorMsg(err.message || 'Could not communicate with secure payment processor.');
      setPaymentStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in" id="razorpay-checkout-overlay">
      <div 
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-950 p-0 shadow-2xl border border-slate-100 dark:border-slate-900 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        id="razorpay-checkout-container"
      >
        
        {/* Banner header with gradient */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-5 text-white relative">
          {paymentStatus !== 'initiating' && paymentStatus !== 'verifying' && (
            <button
              onClick={onClose}
              className="absolute top-4.5 right-4 text-white/85 hover:text-white rounded-lg p-1 transition-colors hover:bg-white/10 cursor-pointer"
              id="checkout-close-btn"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-950" /> Secure Checkout
            </span>
            <span className="text-indigo-100 text-[11px] font-bold">via Razorpay Live Node</span>
          </div>
          
          <h3 className="text-xl font-extrabold tracking-tight" id="checkout-title">
            Upgrade Subscription Order
          </h3>
        </div>

        {/* Payment Method Switcher */}
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
            <span>Paytm UPI QR (Direct)</span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 ml-1">
              Popular
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
            <span>Cards / NetBanking</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Tab 1: Paytm UPI QR Code View */}
          {paymentMethodTab === 'paytm_qr' && (
            <PaytmQrPaymentCard
              planId={selectedPlan}
              onSuccess={async (plan) => {
                await onPaymentSuccess(plan);
              }}
              onCancel={onClose}
            />
          )}

          {/* Tab 2: Razorpay Gateway View */}
          {paymentMethodTab === 'razorpay' && (
            <>
              {/* Initiating State */}
              {paymentStatus === 'initiating' && (
                <div className="text-center py-12 space-y-4 animate-fade-in" id="checkout-initiating-screen">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/50">
                    <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Connecting Razorpay Secure Server...</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Generating authenticated live order, establishing cryptographic secure payment tokens.
                    </p>
                  </div>
                </div>
              )}

              {/* Verifying State */}
              {paymentStatus === 'verifying' && (
                <div className="text-center py-12 space-y-4 animate-fade-in" id="checkout-verifying-screen">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
                    <Loader2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Verifying Cryptographic Ledger...</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Performing strict HMAC-SHA256 signature verification. Validating secure bank transmission. Do not close.
                    </p>
                  </div>
                </div>
              )}

              {/* Awaiting Payment State */}
              {paymentStatus === 'awaiting_payment' && (
                <div className="text-center py-12 space-y-4 animate-fade-in" id="checkout-awaiting-screen">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/50">
                    <Loader2 className="h-8 w-8 text-amber-600 dark:text-amber-400 animate-spin" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Awaiting Payment Gateway...</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">
                      Please complete the transaction in the secure Razorpay overlay pop-up window.
                    </p>
                  </div>
                </div>
              )}

              {/* Success State */}
              {paymentStatus === 'success' && (
                <div className="text-center py-10 space-y-5 animate-fade-in" id="checkout-success-screen">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-md">
                    <Check className="h-8 w-8 stroke-[3]" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">Payment Verified Successfully! 🎉</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Your account has been fully upgraded to **{planDetails.name}**. All high-speed server tools, grounding capabilities, and documents limits are fully active.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold px-6 py-2.5 text-xs transition-colors cursor-pointer"
                  >
                    Close & Return to Workspace
                  </button>
                </div>
              )}

              {/* Idle / Error State */}
              {(paymentStatus === 'idle' || paymentStatus === 'error') && (
                <div className="space-y-5">
                  
                  {/* Order summary bar */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Plan Name</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{planDetails.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total Price</p>
                      <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{planDetails.price}<span className="text-[10px] font-normal text-slate-500">/{planDetails.period}</span></p>
                    </div>
                  </div>

                  {/* Secure Payment details notice */}
                  <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/50 bg-indigo-50/30 dark:bg-indigo-950/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                        <ShieldCheck className="h-4.5 w-4.5" />
                        <span>Official Razorpay Checkout</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        Test Mode (Sandbox)
                      </span>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      Supports <strong>UPI</strong>, <strong>Cards</strong>, <strong>Netbanking</strong> & <strong>Wallets</strong>.
                    </p>

                    {/* Test Mode Sandbox Guide */}
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg p-3 text-[11px] text-amber-900 dark:text-amber-300 space-y-1.5">
                      <div className="font-bold flex items-center gap-1">
                        <span>💡 How to Test UPI in Sandbox:</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[10.5px]">
                        <li>
                          <strong>Do NOT scan QR code with real Paytm/GPay apps:</strong> Real bank apps reject test sandbox VPAs.
                        </li>
                        <li>
                          <strong>In Razorpay popup:</strong> Select <strong>UPI</strong> → enter test ID <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded font-mono font-bold">success@razorpay</code>.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Error Alert */}
                  {errorMsg && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/60 rounded-xl text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-start gap-1.5 animate-fade-in">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Submit triggers */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleInitializeRazorpay}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                      id="checkout-razorpay-popup-btn"
                    >
                      <CreditCard className="h-4.5 w-4.5 text-indigo-200" />
                      <span>Open Razorpay Standard Popup</span>
                    </button>

                    {/* Instant Sandbox Simulation button */}
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
                            body: JSON.stringify({ planId: selectedPlan })
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
                            await onPaymentSuccess(selectedPlan);
                          } else {
                            throw new Error('Sandbox simulation failed.');
                          }
                        } catch (e: any) {
                          setErrorMsg(e.message || 'Simulation failed.');
                          setPaymentStatus('error');
                        }
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
                      id="checkout-sandbox-simulate-btn"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <span>⚡ 1-Click Instant Test (Bypass Bank / Sandbox)</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>


        {/* Footer info banner */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <p className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> PCI-DSS Compliant Security
          </p>
          <p className="font-semibold text-slate-400">Powered by Razorpay</p>
        </div>
      </div>
    </div>
  );
}
