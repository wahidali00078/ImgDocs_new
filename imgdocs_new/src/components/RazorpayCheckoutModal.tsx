/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { mongoAuth } from '../lib/mongoAuth';

export interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number; // In Rupees (e.g., 299)
  amountInPaise?: number; // In Paise (e.g., 29900)
  itemName?: string;
  itemDescription?: string;
  planId?: 'free' | 'pro_monthly' | 'pro_yearly' | 'business_monthly' | 'business_yearly' | null;
  onSuccess?: (paymentDetails: { paymentId: string; orderId: string; signature: string }) => void | Promise<void>;
}

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  amount = 299,
  amountInPaise,
  itemName = 'ImgDocs Pro Upgrade',
  itemDescription = 'Instant access to unlimited document conversions, ultra-compression, and OCR.',
  planId = 'pro_monthly',
  onSuccess
}: RazorpayCheckoutModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'awaiting_payment' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ paymentId: string; orderId: string } | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const finalPaise = amountInPaise || Math.round(amount * 100);
  const displayRupees = (finalPaise / 100).toFixed(2);

  // Ensure script is loaded
  useEffect(() => {
    if (!isOpen) return;

    setPaymentStatus('idle');
    setErrorMsg('');
    setSuccessInfo(null);

    if ((window as any).Razorpay) {
      setRazorpayReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => {
      setErrorMsg('Failed to load Razorpay Standard Checkout SDK. Please check your connection.');
      setPaymentStatus('error');
    };
    document.body.appendChild(script);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartCheckout = async () => {
    setErrorMsg('');
    setPaymentStatus('initiating');

    try {
      const currentUser = mongoAuth.getCurrentUser();
      const idToken = mongoAuth.getToken();

      // Step 1: Request order creation from backend
      const endpoint = planId ? '/api/subscription/create-order' : '/api/create-order';
      const payload = planId ? { planId } : { amount: finalPaise, currency: 'INR', receipt: `rec_${Date.now()}` };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const orderRes = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData?.error || 'Unable to establish payment order.');
      }

      const orderData = await orderRes.json();
      const activeOrderId = orderData.orderId || orderData.id;
      const keyId = orderData.keyId || orderData.key_id || (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TUFqlVPXTqk2ZS';

      setPaymentStatus('awaiting_payment');

      // Step 2: Open Razorpay Modal
      const options = {
        key: keyId,
        amount: orderData.amount || finalPaise,
        currency: orderData.currency || 'INR',
        name: 'ImgDocs',
        description: itemName,
        image: '/favicon.svg',
        order_id: activeOrderId,
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || 'customer@example.com',
          contact: ''
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus('idle');
            setErrorMsg('Payment cancelled by user.');
          }
        },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          setPaymentStatus('verifying');
          try {
            // Step 3: Verify signature on backend
            const verifyEndpoint = planId ? '/api/subscription/verify-payment' : '/api/verify-payment';
            const verifyRes = await fetch(verifyEndpoint, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                orderId: activeOrderId,
                order_id: activeOrderId,
                razorpay_order_id: response.razorpay_order_id || activeOrderId,
                razorpay_payment_id: response.razorpay_payment_id,
                payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                signature: response.razorpay_signature
              })
            });

            if (!verifyRes.ok) {
              const verifyErrData = await verifyRes.json().catch(() => ({}));
              throw new Error(verifyErrData?.error || 'HMAC payment signature verification failed.');
            }

            const verifyResult = await verifyRes.json();
            if (verifyResult.success) {
              setSuccessInfo({
                paymentId: response.razorpay_payment_id,
                orderId: activeOrderId
              });
              setPaymentStatus('success');

              if (onSuccess) {
                await onSuccess({
                  paymentId: response.razorpay_payment_id,
                  orderId: activeOrderId,
                  signature: response.razorpay_signature
                });
              }
            } else {
              throw new Error('Payment verification unsuccessful.');
            }
          } catch (verErr: any) {
            console.error('Razorpay verification error:', verErr);
            setErrorMsg(verErr.message || 'Signature mismatch or verification failed.');
            setPaymentStatus('error');
          }
        }
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', (failResp: any) => {
        setErrorMsg(failResp.error?.description || 'Payment was declined by your bank or UPI app.');
        setPaymentStatus('error');
      });
      rzpInstance.open();

    } catch (err: any) {
      console.error('Razorpay checkout error:', err);
      setErrorMsg(err.message || 'Failed to start Razorpay payment.');
      setPaymentStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in" id="razorpay-modal-overlay">
      <div 
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-950 p-0 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        id="razorpay-modal-content"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-5 text-white relative">
          {paymentStatus !== 'initiating' && paymentStatus !== 'verifying' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white rounded-lg p-1 transition-colors hover:bg-white/10 cursor-pointer"
              id="razorpay-close-button"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-950" /> Standard Checkout
            </span>
            <span className="text-indigo-100 text-xs font-semibold">Razorpay Gateway</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight" id="razorpay-checkout-title">
            {itemName}
          </h3>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {paymentStatus === 'initiating' && (
            <div className="text-center py-10 space-y-3" id="razorpay-initiating-state">
              <Loader2 className="h-9 w-9 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Creating Razorpay Order...</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Communicating securely with backend servers.</p>
            </div>
          )}

          {paymentStatus === 'awaiting_payment' && (
            <div className="text-center py-10 space-y-3" id="razorpay-awaiting-state">
              <Loader2 className="h-9 w-9 text-amber-500 animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Awaiting Payment Confirmation...</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Please complete your payment in the Razorpay popup.</p>
            </div>
          )}

          {paymentStatus === 'verifying' && (
            <div className="text-center py-10 space-y-3" id="razorpay-verifying-state">
              <Loader2 className="h-9 w-9 text-emerald-600 animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Verifying Cryptographic Signature...</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Validating HMAC-SHA256 signature with server secret.</p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center py-8 space-y-4 animate-fade-in" id="razorpay-success-state">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-md">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Payment Verified! 🎉</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Thank you! Your transaction has been verified and your account is upgraded.
                </p>
                {successInfo && (
                  <p className="text-[10px] text-slate-400 font-mono mt-2">
                    Payment ID: {successInfo.paymentId}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Continue to App
              </button>
            </div>
          )}

          {(paymentStatus === 'idle' || paymentStatus === 'error') && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Item</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{itemName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">₹{displayRupees}</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {itemDescription}
              </p>

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
                    <strong>Do NOT scan QR with real Paytm/GPay apps:</strong> Real bank apps reject test VPAs with <em>"Receiver's UPI provider facing technical issues"</em>.
                  </li>
                  <li>
                    <strong>In Razorpay Popup:</strong> Choose <strong>UPI</strong> → enter test ID <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded font-mono font-bold">success@razorpay</code>.
                  </li>
                  <li>
                    <strong>To accept real money:</strong> Switch to <strong>Live Mode</strong> in Razorpay Dashboard and update with <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded font-mono">rzp_live_...</code> keys.
                  </li>
                </ul>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleStartCheckout}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  id="razorpay-pay-now-btn"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Open Razorpay Popup (₹{displayRupees})</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setErrorMsg('');
                    setPaymentStatus('verifying');
                    try {
                      const idToken = mongoAuth.getToken();
                      const endpoint = planId ? '/api/subscription/create-order' : '/api/create-order';
                      const payload = planId ? { planId } : { amount: finalPaise, currency: 'INR', receipt: `rec_${Date.now()}` };

                      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

                      const orderRes = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
                      const orderData = await orderRes.json();
                      const fakePayId = 'pay_sim_' + Math.random().toString(36).substring(2, 10);

                      const verifyEndpoint = planId ? '/api/subscription/verify-payment' : '/api/verify-payment';
                      const verifyRes = await fetch(verifyEndpoint, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                          orderId: orderData.orderId || orderData.id,
                          order_id: orderData.orderId || orderData.id,
                          razorpay_payment_id: fakePayId,
                          payment_id: fakePayId,
                          razorpay_order_id: orderData.orderId || orderData.id,
                          razorpay_signature: 'sandbox_signature_verified',
                          signature: 'sandbox_signature_verified'
                        })
                      });
                      const verifyResult = await verifyRes.json();
                      if (verifyResult.success) {
                        setSuccessInfo({ paymentId: fakePayId, orderId: orderData.orderId || orderData.id });
                        setPaymentStatus('success');
                        if (onSuccess) {
                          await onSuccess({
                            paymentId: fakePayId,
                            orderId: orderData.orderId || orderData.id,
                            signature: 'sandbox_signature_verified'
                          });
                        }
                      } else {
                        throw new Error('Sandbox simulation failed.');
                      }
                    } catch (e: any) {
                      setErrorMsg(e.message || 'Simulation failed.');
                      setPaymentStatus('error');
                    }
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
                  id="razorpay-sandbox-simulate-btn"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                  <span>⚡ 1-Click Instant Test (Bypass Bank / Sandbox)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <p className="flex items-center gap-1 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> 256-Bit SSL Encryption
          </p>
          <p className="font-semibold text-slate-400">Razorpay</p>
        </div>
      </div>
    </div>
  );
}
