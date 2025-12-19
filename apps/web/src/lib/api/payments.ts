import apiClient from './client';
import type { ApiResponse } from '@/types';

interface CheckoutSession {
  sessionId: string;
  url: string;
}

interface SubscriptionStatus {
  status: 'active' | 'canceled' | 'past_due' | 'none';
  plan: string | null;
  currentPeriodEnd: string | null;
}

export const paymentsApi = {
  createCheckoutSession: async (
    priceId: string,
    mode: 'payment' | 'subscription' = 'subscription'
  ): Promise<ApiResponse<CheckoutSession>> => {
    const response = await apiClient.post('/payments/checkout', { priceId, mode });
    return response.data;
  },

  createSubscriptionCheckout: async (
    plan: 'hero' | 'guild'
  ): Promise<ApiResponse<CheckoutSession>> => {
    const response = await apiClient.post('/payments/subscription', { plan });
    return response.data;
  },

  getSubscriptionStatus: async (): Promise<ApiResponse<SubscriptionStatus>> => {
    const response = await apiClient.get('/payments/subscription/status');
    return response.data;
  },

  cancelSubscription: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete('/payments/subscription');
    return response.data;
  },
};

export default paymentsApi;
