/**
 * MongoDB Auth Client Engine
 */

export interface AuthUser {
  uid: string;
  name?: string;
  email: string;
  isPremium: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  renewalDate?: string;
  paymentHistory?: any[];
}

export const SUPER_VIP_EMAILS = ['dubairak099@gmail.com'];

export function isSuperVipEmail(email?: string): boolean {
  if (!email) return false;
  return SUPER_VIP_EMAILS.includes(email.toLowerCase().trim());
}

type AuthListener = (user: AuthUser | null) => void;

class MongoAuthManager {
  private listeners: AuthListener[] = [];
  private currentUser: AuthUser | null = null;

  constructor() {
    this.loadInitialUser();
  }

  private loadInitialUser() {
    try {
      const storedUser = localStorage.getItem('imgdocs_mongo_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === 'object' && parsed.email) {
          if (isSuperVipEmail(parsed?.email)) {
            parsed.isPremium = true;
            parsed.subscriptionPlan = 'business_yearly';
            parsed.subscriptionStatus = 'active';
            parsed.renewalDate = '2099-12-31';
          }
          this.currentUser = parsed;
          return;
        }
      }
      // Clean start for non-authenticated visitors
      this.currentUser = null;
    } catch (e) {
      this.currentUser = null;
    }
  }

  public getToken(): string | null {
    return localStorage.getItem('imgdocs_mongo_token');
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public onAuthStateChanged(callback: AuthListener): () => void {
    this.listeners.push(callback);
    // Fire immediately with current state
    callback(this.currentUser);

    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  private setSession(token: string, user: AuthUser) {
    if (isSuperVipEmail(user?.email)) {
      user.isPremium = true;
      user.subscriptionPlan = 'business_yearly';
      user.subscriptionStatus = 'active';
      user.renewalDate = '2099-12-31';
    }
    localStorage.setItem('imgdocs_mongo_token', token);
    localStorage.setItem('imgdocs_mongo_user', JSON.stringify(user));
    localStorage.setItem('imgdocs_is_premium', user.isPremium ? 'true' : 'false');
    localStorage.setItem('imgdocs_sub_plan', user.subscriptionPlan || 'free');
    localStorage.setItem('imgdocs_sub_status', user.subscriptionStatus || 'active');
    localStorage.setItem('imgdocs_sub_renewal', user.renewalDate || '');
    if (user.paymentHistory) {
      localStorage.setItem('imgdocs_sub_payment_history', JSON.stringify(user.paymentHistory));
    }
    this.currentUser = user;
    this.notifyListeners();
  }

  public async loginVip(email: string): Promise<AuthUser> {
    try {
      const res = await fetch('/api/auth/vip-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        this.setSession(data.token, data.user);
        return data.user;
      }
    } catch (e) {
      console.warn('VIP direct login fallback:', e);
    }
    const isVip = isSuperVipEmail(email);
    const vipUser: AuthUser = {
      uid: `user_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      isPremium: isVip,
      subscriptionPlan: isVip ? 'business_yearly' : 'free',
      subscriptionStatus: 'active',
      renewalDate: isVip ? '2099-12-31' : '',
      paymentHistory: isVip ? [{
        id: 'inv_vip_lifetime',
        date: new Date().toISOString().split('T')[0],
        amount: 'LIFETIME VIP',
        plan: 'Business Enterprise Unlimited',
        status: 'paid'
      }] : []
    };
    this.setSession(`token_${Date.now()}`, vipUser);
    return vipUser;
  }

  public async login(email: string, password: string): Promise<AuthUser> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }

    this.setSession(data.token, data.user);
    return data.user;
  }

  public async signup(name: string, email: string, password: string): Promise<AuthUser> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed. Please try again.');
    }

    this.setSession(data.token, data.user);
    return data.user;
  }

  public async loginWithGoogle(payload: { email?: string; name?: string; googleId?: string; credential?: string; accessToken?: string }): Promise<AuthUser> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Google Login failed.');
    }

    this.setSession(data.token, data.user);
    return data.user;
  }

  public logout() {
    localStorage.removeItem('imgdocs_mongo_token');
    localStorage.removeItem('imgdocs_mongo_user');
    this.currentUser = null;
    this.notifyListeners();
  }

  public async fetchProfile(): Promise<AuthUser | null> {
    const token = this.getToken();
    if (!token) {
      this.currentUser = null;
      this.notifyListeners();
      return null;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        this.logout();
        return null;
      }

      const data = await res.json();
      this.currentUser = data.user;
      localStorage.setItem('imgdocs_mongo_user', JSON.stringify(data.user));
      localStorage.setItem('imgdocs_is_premium', data.user.isPremium ? 'true' : 'false');
      this.notifyListeners();
      return data.user;
    } catch (e) {
      return this.currentUser;
    }
  }

  public simulateGuestSession(demoEmail: string): AuthUser {
    const demoUser: AuthUser = {
      uid: `demo_${Date.now()}`,
      name: 'Guest Demo User',
      email: demoEmail,
      isPremium: false,
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      renewalDate: ''
    };
    this.setSession('demo_token_guest', demoUser);
    return demoUser;
  }
}

export const mongoAuth = new MongoAuthManager();
