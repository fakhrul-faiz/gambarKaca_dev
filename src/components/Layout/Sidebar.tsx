import React from 'react';
import { 
  Home, 
  Users, 
  Star, 
  Megaphone, 
  Wallet, 
  FileText, 
  MessageCircle,
  Package,
  BarChart3,
  Settings,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'founders', label: 'Founders', icon: Users },
          { id: 'talents', label: 'Talents', icon: Star },
          { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ];
      case 'founder':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
          { id: 'orders', label: 'Orders', icon: Package },
          { id: 'reviews', label: 'Reviews', icon: FileText },
          { id: 'wallet', label: 'E-Wallet', icon: Wallet },
        ];
      case 'talent':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'marketplace', label: 'Marketplace', icon: Megaphone },
          { id: 'jobs', label: 'My Jobs', icon: Package },
          { id: 'earnings', label: 'Earnings', icon: Wallet },
          { id: 'profile', label: 'Profile', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 shadow-md w-64 min-h-screen border-r border-gray-200">
      <div className="p-6">
        <nav className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-white hover:shadow-sm'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;