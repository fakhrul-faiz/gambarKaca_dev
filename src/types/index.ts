export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'founder' | 'talent';
  status: 'active' | 'pending' | 'suspended';
  avatar?: string;
  createdAt: Date;
}

export interface Founder extends User {
  company?: string;
  phone?: string;
  address?: string;
  walletBalance: number;
}

export interface Talent extends User {
  bio?: string;
  portfolio: string[];
  rateLevel: 1 | 2 | 3;
  skills: string[];
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  totalEarnings: number;
}

export interface Campaign {
  id: string;
  founderId: string;
  title: string;
  description: string;
  productName: string;
  category: string;
  duration: '30sec' | '1min' | '3min';
  productImages: string[];
  rateLevel: 1 | 2 | 3;
  mediaType: 'image' | 'video' | 'both';
  budget: number;
  price: number; // Calculated price based on rate level and duration
  status: 'draft' | 'active' | 'paused' | 'completed' | 'rejected';
  applicants: string[];
  approvedTalents: string[];
  createdAt: Date;
  deadline?: Date;
}

export interface Job {
  id: string;
  campaignId: string;
  talentId: string;
  founderId: string;
  status: 'assigned' | 'shipped' | 'review_submitted' | 'completed' | 'rejected';
  deliveryInfo?: {
    address: string;
    trackingNumber?: string;
    courier?: string;
  };
  reviewSubmission?: {
    media: { url: string; type: 'image' | 'video' }[];
    submittedAt: Date;
  };
  payout: number;
  createdAt: Date;
  trackingNumber?: string;
  courier?: string;
}

export interface Order {
  id: string;
  campaignId: string;
  talentId: string;
  founderId: string;
  talentName: string;
  campaignTitle: string;
  productName: string;
  status: 'pending_shipment' | 'shipped' | 'delivered' | 'review_submitted' | 'completed';
  payout: number;
  updatedAt?: Date;
  createdAt: Date;
  deliveryInfo?: {
    address: string;
    trackingNumber?: string;
    courier?: string;
  };
  reviewSubmission?: {
    media: { url: string; type: 'image' | 'video' }[];
    submittedAt: Date;
  };
  trackingNumber?: string;
  courier?: string;
}

export interface Message {
  id: string;
  jobId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  relatedJobId?: string;
  createdAt: Date;
}

export interface Earning {
  id: string;
  talentId: string;
  orderId: string;
  campaignTitle: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  earnedAt: Date;
  paidAt?: Date;
}

// Updated pricing configuration with your exact prices
export const PRICING_CONFIG = {
  rateLevel: {
    1: { // 1 Star Level
      '30sec': 65,
      '1min': 70,
      '3min': 125,
    },
    2: { // 2 Star Level
      '30sec': 97.50,
      '1min': 105,
      '3min': 187.50,
    },
    3: { // 3 Star Level
      '30sec': 130,
      '1min': 140,
      '3min': 250,
    },
  },
};

export const calculateCampaignPrice = (rateLevel: 1 | 2 | 3, duration: '30sec' | '1min' | '3min'): number => {
  return PRICING_CONFIG.rateLevel[rateLevel][duration];
};