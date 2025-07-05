import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campaign, Job, Message, Transaction, Order, Earning, Founder, Talent } from '../types';
import { 
  getCampaigns, 
  getOrders, 
  getTransactions, 
  getEarnings, 
  getMessages,
  getFounders,
  getTalents,
  subscribeToMessages,
  subscribeToOrders
} from '../lib/api';
import { useAuth } from './AuthContext';

interface AppContextType {
  campaigns: Campaign[];
  jobs: Job[];
  messages: Message[];
  transactions: Transaction[];
  orders: Order[];
  earnings: Earning[];
  founders: Founder[];
  talents: Talent[];
  setCampaigns: (campaigns: Campaign[]) => void;
  setJobs: (jobs: Job[]) => void;
  setMessages: (messages: Message[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setOrders: (orders: Order[]) => void;
  setEarnings: (earnings: Earning[]) => void;
  setFounders: (founders: Founder[]) => void;
  setTalents: (talents: Talent[]) => void;
  refreshData: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    if (!user) {
      console.log('No user found, skipping data refresh');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting data refresh for user:', user.role, user.email);

      // Load data based on user role
      if (user.role === 'admin') {
        console.log('Loading admin data...');
        
        // Admin gets all data
        const [
          campaignsData, 
          ordersData, 
          transactionsData, 
          earningsData, 
          messagesData, 
          foundersData, 
          talentsData
        ] = await Promise.allSettled([
          getCampaigns(),
          getOrders(),
          getTransactions(),
          getEarnings(),
          getMessages(),
          getFounders(),
          getTalents(),
        ]);

        // Handle results with proper error handling
        if (campaignsData.status === 'fulfilled') {
          console.log('Campaigns loaded:', campaignsData.value.length);
          setCampaigns(campaignsData.value);
        } else {
          console.error('Failed to load campaigns:', campaignsData.reason);
          setCampaigns([]);
        }

        if (ordersData.status === 'fulfilled') {
          console.log('Orders loaded:', ordersData.value.length);
          setOrders(ordersData.value);
        } else {
          console.error('Failed to load orders:', ordersData.reason);
          setOrders([]);
        }

        if (transactionsData.status === 'fulfilled') {
          console.log('Transactions loaded:', transactionsData.value.length);
          setTransactions(transactionsData.value);
        } else {
          console.error('Failed to load transactions:', transactionsData.reason);
          setTransactions([]);
        }

        if (earningsData.status === 'fulfilled') {
          console.log('Earnings loaded:', earningsData.value.length);
          setEarnings(earningsData.value);
        } else {
          console.error('Failed to load earnings:', earningsData.reason);
          setEarnings([]);
        }

        if (messagesData.status === 'fulfilled') {
          console.log('Messages loaded:', messagesData.value.length);
          setMessages(messagesData.value);
        } else {
          console.error('Failed to load messages:', messagesData.reason);
          setMessages([]);
        }

        if (foundersData.status === 'fulfilled') {
          console.log('Founders loaded:', foundersData.value.length);
          setFounders(foundersData.value);
        } else {
          console.error('Failed to load founders:', foundersData.reason);
          setFounders([]);
        }

        if (talentsData.status === 'fulfilled') {
          console.log('Talents loaded:', talentsData.value.length);
          setTalents(talentsData.value);
        } else {
          console.error('Failed to load talents:', talentsData.reason);
          setTalents([]);
        }

      } else {
      // Founders also get talents, other users do not
      const [
        campaignsData, 
        ordersData, 
        transactionsData, 
        earningsData, 
        messagesData
      ] = await Promise.allSettled([
        getCampaigns(),
        getOrders(user.id),
        getTransactions(user.id),
        user.role === 'talent' ? getEarnings(user.id) : getEarnings(),
        getMessages(),
      ]);

      if (campaignsData.status === 'fulfilled') setCampaigns(campaignsData.value); else setCampaigns([]);
      if (ordersData.status === 'fulfilled') setOrders(ordersData.value); else setOrders([]);
      if (transactionsData.status === 'fulfilled') setTransactions(transactionsData.value); else setTransactions([]);
      if (earningsData.status === 'fulfilled') setEarnings(earningsData.value); else setEarnings([]);
      if (messagesData.status === 'fulfilled') setMessages(messagesData.value); else setMessages([]);

      if (user.role === 'founder') {
        try {
          const talents = await getTalents();
          setTalents(talents);
          console.log('Talents loaded for founder:', talents.length);
        } catch (err) {
          setTalents([]);
          console.error('Failed to load talents for founder:', err);
        }
      } else {
        setTalents([]); // talents only for founders/admins
      }
      setFounders([]); // founders only for admin
    }

    console.log('Data refresh completed successfully');
  } catch (error) {
    console.error('Critical error during data refresh:', error);
    // Don't clear existing data on error, just log it
  } finally {
    setLoading(false);
  }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      console.log('User changed, refreshing data for:', user.role, user.email);
      refreshData();
    } else {
      // Clear data when user logs out
      console.log('User logged out, clearing data');
      setCampaigns([]);
      setOrders([]);
      setTransactions([]);
      setEarnings([]);
      setMessages([]);
      setFounders([]);
      setTalents([]);
      setJobs([]);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const subscriptions: any[] = [];

    try {
      // Subscribe to order updates
      const orderSub = subscribeToOrders(user.id, () => {
        console.log('Order update received, refreshing orders...');
        // Refresh orders when there are changes
        if (user.role === 'admin') {
          getOrders().then(setOrders).catch(console.error);
        } else {
          getOrders(user.id).then(setOrders).catch(console.error);
        }
      });
      subscriptions.push(orderSub);

      // Subscribe to messages for user's orders
      orders.forEach(order => {
        const messageSub = subscribeToMessages(order.id, (newMessage) => {
          console.log('New message received:', newMessage);
          setMessages(prev => [...prev, newMessage]);
        });
        subscriptions.push(messageSub);
      });
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
    }

    return () => {
      subscriptions.forEach(sub => {
        try {
          sub.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      });
    };
  }, [user, orders]);

  return (
    <AppContext.Provider
      value={{
        campaigns,
        jobs,
        messages,
        transactions,
        orders,
        earnings,
        founders,
        talents,
        setCampaigns,
        setJobs,
        setMessages,
        setTransactions,
        setOrders,
        setEarnings,
        setFounders,
        setTalents,
        refreshData,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};