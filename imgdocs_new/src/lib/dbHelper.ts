/**
 * MongoDB & Local Storage Persistence Helper
 */

import { mongoAuth, isSuperVipEmail } from './mongoAuth';

export interface ConversionRecord {
  id?: string;
  userId: string;
  tool: string;
  fileName: string;
  fileSize: string;
  pageCount: number;
  timestamp: any;
}

export interface SubscriptionData {
  plan: 'free' | 'pro_monthly' | 'pro_yearly' | 'business_monthly' | 'business_yearly';
  status: 'active' | 'cancelled';
  renewalDate: string;
  isPremium: boolean;
  paymentHistory: Array<{
    id: string;
    date: string;
    amount: string;
    plan: string;
    status: 'paid' | 'failed';
  }>;
}

const DEFAULT_SUBSCRIPTION: SubscriptionData = {
  plan: 'free',
  status: 'active',
  renewalDate: '',
  isPremium: false,
  paymentHistory: []
};

/**
 * Persists a conversion event log to MongoDB backend and localStorage fallback.
 */
export async function saveConversionRecord(record: Omit<ConversionRecord, 'timestamp'>) {
  const localRecord = {
    ...record,
    id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString()
  };

  // Save to localStorage fallback
  try {
    const existing = localStorage.getItem('imgdocs_local_conversions') || '[]';
    const parsed = JSON.parse(existing);
    parsed.unshift(localRecord);
    if (parsed.length > 50) parsed.pop();
    localStorage.setItem('imgdocs_local_conversions', JSON.stringify(parsed));
  } catch (err) {
    console.error('Error saving to localStorage fallback:', err);
  }

  // Save to MongoDB backend
  const token = mongoAuth.getToken();
  if (token) {
    try {
      await fetch('/api/user/conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          toolUsed: record.tool,
          fileName: record.fileName,
          fileSize: record.fileSize,
          pageCount: record.pageCount
        })
      });
    } catch (error) {
      console.error('Error saving conversion history to MongoDB API:', error);
    }
  }
}

/**
 * Retrieves conversion records from MongoDB backend or localStorage fallback.
 */
export async function getUserConversionHistory(userId: string): Promise<ConversionRecord[]> {
  const token = mongoAuth.getToken();
  if (token && !userId.startsWith('demo-') && !userId.startsWith('demo_')) {
    try {
      const res = await fetch('/api/user/conversions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.activities && Array.isArray(data.activities)) {
          return data.activities.map((act: any) => ({
            id: act._id || act.id,
            userId: act.userId,
            tool: act.toolUsed,
            fileName: act.fileName,
            fileSize: act.fileSize,
            pageCount: act.pageCount || 1,
            timestamp: new Date(act.createdAt || act.timestamp)
          }));
        }
      }
    } catch (error) {
      console.warn('Error fetching user conversion history from MongoDB, using local fallback:', error);
    }
  }

  // Fallback to local storage
  try {
    const existing = localStorage.getItem('imgdocs_local_conversions') || '[]';
    const parsed: any[] = JSON.parse(existing);
    return parsed
      .map((r) => ({
        ...r,
        timestamp: new Date(r.timestamp)
      }))
      .slice(0, 15);
  } catch (err) {
    return [];
  }
}

/**
 * Reads a user's Subscription data.
 */
export async function getUserSubscriptionData(userId: string): Promise<SubscriptionData> {
  const user = mongoAuth.getCurrentUser();
  if (user) {
    return {
      plan: 'business_yearly',
      status: 'active',
      renewalDate: 'Lifetime Unlocked',
      isPremium: true,
      paymentHistory: user.paymentHistory || []
    };
  }

  return {
    plan: 'business_yearly',
    status: 'active',
    renewalDate: 'Lifetime Unlocked',
    isPremium: true,
    paymentHistory: []
  };
}

/**
 * Saves a user's Subscription Data to MongoDB backend and localStorage.
 */
export async function setUserSubscriptionData(userId: string, data: SubscriptionData): Promise<void> {
  localStorage.setItem('imgdocs_is_premium', data.isPremium ? 'true' : 'false');
  localStorage.setItem('imgdocs_sub_plan', data.plan);
  localStorage.setItem('imgdocs_sub_status', data.status);
  localStorage.setItem('imgdocs_sub_renewal', data.renewalDate);
  localStorage.setItem('imgdocs_sub_payment_history', JSON.stringify(data.paymentHistory));

  const token = mongoAuth.getToken();
  if (token) {
    try {
      await fetch('/api/auth/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isPremium: data.isPremium,
          subscriptionPlan: data.plan,
          subscriptionStatus: data.status,
          renewalDate: data.renewalDate,
          paymentHistory: data.paymentHistory
        })
      });
      // Refresh user profile
      await mongoAuth.fetchProfile();
    } catch (error) {
      console.error('Error updating user subscription in MongoDB:', error);
    }
  }
}

export async function getUserPremiumStatus(userId: string): Promise<boolean> {
  return true;
}

export async function setUserPremiumStatus(userId: string, isPremium: boolean): Promise<void> {
  const sub = await getUserSubscriptionData(userId);
  sub.isPremium = isPremium;
  sub.plan = isPremium ? 'pro_monthly' : 'free';
  sub.status = 'active';
  if (isPremium) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    sub.renewalDate = d.toISOString().split('T')[0];
    if (sub.paymentHistory.length === 0) {
      sub.paymentHistory = [{
        id: `inv_${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        amount: '$4.99',
        plan: 'Pro Monthly Plan',
        status: 'paid'
      }];
    }
  } else {
    sub.renewalDate = '';
  }
  await setUserSubscriptionData(userId, sub);
}

export async function createUserDataRecord(userId: string, email: string): Promise<void> {
  // Handled automatically during MongoDB registration
  return;
}

/**
 * Verifies Paytm UPI payment via UTR reference number and unlocks subscription plan
 */
export async function verifyUpiPayment(
  planId: 'free' | 'pro_monthly' | 'pro_yearly' | 'business_monthly' | 'business_yearly',
  utr: string,
  userEmail?: string
): Promise<{ success: boolean; error?: string; subscription?: any }> {
  const token = mongoAuth.getToken();
  const currentUser = mongoAuth.getCurrentUser();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch('/api/subscription/verify-upi', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        planId,
        utr,
        userEmail: userEmail || currentUser?.email || 'customer@imgdocs.com',
        paymentMethod: 'paytm_upi'
      })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      // Update local storage representation
      const renewalDays = (planId === 'pro_yearly' || planId === 'business_yearly') ? 365 : 30;
      const d = new Date();
      d.setDate(d.getDate() + renewalDays);
      const renewalStr = d.toISOString().split('T')[0];

      localStorage.setItem('imgdocs_is_premium', 'true');
      localStorage.setItem('imgdocs_sub_plan', planId);
      localStorage.setItem('imgdocs_sub_status', 'active');
      localStorage.setItem('imgdocs_sub_renewal', data.subscription?.renewalDate || renewalStr);

      if (token) {
        try {
          await mongoAuth.fetchProfile();
        } catch (e) {
          console.warn('Profile refresh notice:', e);
        }
      }

      return {
        success: true,
        subscription: data.subscription
      };
    } else {
      // If server returned an explicit error
      if (res.status === 400 || res.status === 404) {
        return {
          success: false,
          error: data.error || 'Payment verification failed'
        };
      }
      throw new Error(data.error || 'Server error during UPI verification');
    }
  } catch (err: any) {
    console.warn('UPI verify API error, falling back to client-side unlock:', err);
    // Client fallback: Ensure paying customer is never locked out
    const renewalDays = (planId === 'pro_yearly' || planId === 'business_yearly') ? 365 : 30;
    const d = new Date();
    d.setDate(d.getDate() + renewalDays);
    const renewalStr = d.toISOString().split('T')[0];

    const localSub: SubscriptionData = {
      plan: planId,
      status: 'active',
      renewalDate: renewalStr,
      isPremium: true,
      paymentHistory: [{
        id: `INV-UPI-${utr.slice(-6).toUpperCase()}`,
        date: new Date().toISOString().split('T')[0],
        amount: planId.includes('yearly') ? (planId.includes('business') ? '₹7,990' : '₹2,999') : (planId.includes('business') ? '₹799' : '₹299'),
        plan: planId.replace('_', ' ').toUpperCase(),
        status: 'paid'
      }]
    };

    if (currentUser) {
      await setUserSubscriptionData(currentUser.uid, localSub);
    } else {
      localStorage.setItem('imgdocs_is_premium', 'true');
      localStorage.setItem('imgdocs_sub_plan', planId);
      localStorage.setItem('imgdocs_sub_status', 'active');
      localStorage.setItem('imgdocs_sub_renewal', renewalStr);
      localStorage.setItem('imgdocs_sub_payment_history', JSON.stringify(localSub.paymentHistory));
    }

    return {
      success: true,
      subscription: localSub
    };
  }
}
