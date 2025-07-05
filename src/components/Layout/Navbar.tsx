import React, { useState } from 'react';
import { User, LogOut, Menu, X, Wallet, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Founder, Talent } from '../../types';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { earnings } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isFounder = user?.role === 'founder';
  const isTalent = user?.role === 'talent';
  const founderUser = user as Founder;
  const talentUser = user as Talent;

  // Calculate talent's total earnings
  const talentTotalEarnings = isTalent 
    ? earnings.filter(e => e.talentId === user.id && e.status === 'paid').reduce((sum, e) => sum + e.amount, 0)
    : 0;

  return (
    <nav className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                GambarKaca
              </h1>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Wallet Balance for Founders */}
              {isFounder && founderUser.walletBalance !== undefined && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded-lg border border-green-200">
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">
                    {formatCurrency(founderUser.walletBalance)}
                  </span>
                </div>
              )}

              {/* Total Earnings for Talents */}
              {isTalent && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 px-3 py-2 rounded-lg border border-purple-200">
                  <Wallet className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700">
                    {formatCurrency(talentTotalEarnings)}
                  </span>
                </div>
              )}

              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium block">{user?.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full capitalize">
                      {user?.role}
                    </span>
                  </div>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-gray-200">
                    <div className="py-2">
                      {/* Profile Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            {user?.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {user?.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Balance/Earnings in Dropdown for Mobile */}
                      {isFounder && founderUser.walletBalance !== undefined && (
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Wallet Balance</span>
                            <div className="flex items-center space-x-1">
                              <Wallet className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-700">
                                {formatCurrency(founderUser.walletBalance)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {isTalent && (
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Earnings</span>
                            <div className="flex items-center space-x-1">
                              <Wallet className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-semibold text-purple-700">
                                {formatCurrency(talentTotalEarnings)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Profile Settings */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          window.dispatchEvent(new CustomEvent('openProfileModal'));
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Profile Settings
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white bg-opacity-50 backdrop-blur-sm rounded-lg my-2">
              {/* Profile Info */}
              <div className="flex items-center space-x-3 px-3 py-3 bg-white bg-opacity-70 rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Balance/Earnings for Mobile */}
              {isFounder && founderUser.walletBalance !== undefined && (
                <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 mx-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Wallet Balance</span>
                    <div className="flex items-center space-x-1">
                      <Wallet className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-bold text-green-700">
                        {formatCurrency(founderUser.walletBalance)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isTalent && (
                <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 mx-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Earnings</span>
                    <div className="flex items-center space-x-1">
                      <Wallet className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-bold text-purple-700">
                        {formatCurrency(talentTotalEarnings)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Settings for Mobile */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('openProfileModal'));
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4 mr-3" />
                Profile Settings
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;