import React, { useState } from 'react';
import { Search, Filter, Star, Megaphone, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import CampaignCard from './CampaignCard';
import { Talent } from '../../types';
import { applyCampaign } from '../../lib/api';
import CampaignDetailsModal from './CampaignDetailsModal'; 

const MarketplacePage: React.FC = () => {
  const { campaigns, refreshData, talents } = useApp();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRateLevel, setSelectedRateLevel] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [appliedCampaignTitle, setAppliedCampaignTitle] = useState('');
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [viewingCampaignDetails, setViewingCampaignDetails] = useState(null);
  
  const talent = user as Talent;
  const userRateLevel = talent?.rateLevel || 1;
  const isApproved = talent?.status === 'active';

  const rateOptions = [];
  for (let i = 1; i <= userRateLevel; i++) {
    rateOptions.push(i);
  }
  
  const categories = [
    'Technology',
    'Fashion & Beauty',
    'Food & Beverage',
    'Health & Fitness',
    'Travel & Lifestyle',
    'Gaming',
    'Education',
    'Home & Garden',
    'Sports',
    'Entertainment',
    'Business & Finance',
    'Automotive',
    'Other'
  ];

  // If talent is not approved, show approval pending message
  if (!isApproved) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600">Find and apply to campaigns that match your skills</p>
        </div>

        {/* Approval Pending Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-yellow-100 rounded-full">
              <Lock className="h-12 w-12 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Account Pending Approval</h3>
              <p className="text-yellow-700 mb-4">
                Your talent account is currently under review by our admin team. 
                You'll be able to view and apply to campaigns once your account is approved.
              </p>
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">What happens next?</h4>
                <ul className="text-sm text-yellow-700 space-y-1 text-left">
                  <li>• Admin will review your profile and portfolio</li>
                  <li>• Your rate level (1-3 stars) will be assigned</li>
                  <li>• You'll receive email notification when approved</li>
                  <li>• Access to marketplace will be automatically enabled</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-3">While you wait, complete your profile:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h5 className="font-medium mb-2">Profile Information</h5>
              <ul className="space-y-1">
                <li>• Add a professional bio</li>
                <li>• Upload portfolio samples</li>
                <li>• List your skills and expertise</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Social Media</h5>
              <ul className="space-y-1">
                <li>• Connect Instagram account</li>
                <li>• Add YouTube channel</li>
                <li>• Showcase your content style</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter campaigns based on talent's rate level and search term
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||               campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||          campaign.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       campaign.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRateLevel = selectedRateLevel ? campaign.rateLevel === selectedRateLevel : campaign.rateLevel <= userRateLevel;
    const matchesCategory = selectedCategory ? campaign.category === selectedCategory : true;
    const isActive = campaign.status === 'active';
    const notAlreadyApplied = !campaign.applicants.includes(user?.id || '');
    const notAlreadyApproved = !campaign.approvedTalents.includes(user?.id || '');
    
    return matchesSearch && matchesRateLevel && matchesCategory && isActive && notAlreadyApplied && notAlreadyApproved;
  });

  const handleApply = async (campaignId: string) => {
    if (!user) return;

    setLoading(prev => new Set(prev).add(campaignId));
    try {
      
      // Apply to campaign via API
      await applyCampaign(campaignId, user.id);
      
      // Find campaign title for success message
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign) {
        setAppliedCampaignTitle(campaign.title);
      }

      // Refresh data to update UI
      await refreshData();
      
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error applying to campaign:', error);
      alert('Failed to apply to campaign. Please try again.');
    } finally {
      setLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(campaignId);
      return newSet;
    });
    }
  };

  const appliedCampaigns = campaigns.filter(campaign => 
    campaign.applicants.includes(user?.id || '')
  );

  const approvedCampaigns = campaigns.filter(campaign => 
    campaign.approvedTalents.includes(user?.id || '')
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-600">Find and apply to campaigns that match your skills</p>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-green-800 font-medium">Application Submitted!</p>
            <p className="text-green-700 text-sm">You've successfully applied to "{appliedCampaignTitle}". The founder will review your application.</p>
          </div>
        </div>
      )}

      {/* Talent Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Your Rate Level</h3>
            <p className="text-sm text-gray-600">You can apply to campaigns up to your rate level</p>
          </div>
          <div className="flex items-center">
            {[1, 2, 3].map((level) => (
              <Star
                key={level}
                className={`h-5 w-5 ${
                  level <= userRateLevel ? 'text-yellow-500 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 font-medium text-gray-900">{userRateLevel} Star</span>
          </div>
        </div>
      </div>

      {/* Applied Campaigns Summary */}
      {(appliedCampaigns.length > 0 || approvedCampaigns.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-blue-800 font-medium">Your Applications</p>
              <p className="text-blue-700 text-sm">
                {appliedCampaigns.length > 0 && (
                  <span>You have applied to {appliedCampaigns.length} campaign{appliedCampaigns.length !== 1 ? 's' : ''}. </span>
                )}
                {approvedCampaigns.length > 0 && (
                  <span>You have been approved for {approvedCampaigns.length} campaign{approvedCampaigns.length !== 1 ? 's' : ''}. </span>
                )}
                Check your dashboard for updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search campaigns, products, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          <select
            value={selectedRateLevel || ''}
            onChange={(e) => setSelectedRateLevel(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
              <option value="">All Levels</option>
            {rateOptions.map(level => (
              <option key={level} value={level}>{level} Star</option>
            ))}
          </select>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-500">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Available Campaigns</p>
              <p className="text-xl font-bold text-gray-900">{filteredCampaigns.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-500">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Your Applications</p>
              <p className="text-xl font-bold text-gray-900">{appliedCampaigns.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-500">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Eligible Level</p>
              <p className="text-xl font-bold text-gray-900">Up to {userRateLevel} Star</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onApply={() => handleApply(campaign.id)}
              showApplyButton={true}
              loading={() => loading.has(campaign.id)}
              onView={() => setViewingCampaignDetails(campaign)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No campaigns available</h3>
              <p className="text-sm">
                {searchTerm || selectedCategory || selectedRateLevel ? 
                  'Try adjusting your search terms or filters' : 
                  'Check back later for new opportunities that match your rate level'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {viewingCampaignDetails && (
        <CampaignDetailsModal
          campaign={viewingCampaignDetails}
          isTalentView={true}
          onClose={() => setViewingCampaignDetails(null)}
          // DO NOT pass onEdit, onDelete, onStatusChange!
        />
      )}
    </div>
  );
};

export default MarketplacePage;