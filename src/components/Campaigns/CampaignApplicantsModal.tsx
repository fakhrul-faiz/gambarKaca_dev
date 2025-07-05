import React, { useState, useEffect } from 'react';
import { X, Users, Star, Eye, Check, XCircle, Search, Mail, Calendar, Award, Instagram, Youtube, Camera, Video, Play } from 'lucide-react';
import { Campaign, Talent, Order, Earning, Transaction, Founder } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import TalentProfileModal from './TalentProfileModal';
import { updateApplicationStatus, createOrder, createTransaction, updateProfile } from '../../lib/api';


interface CampaignApplicantsModalProps {
  campaignId: string;
  onClose: () => void;
}

const CampaignApplicantsModal: React.FC<CampaignApplicantsModalProps> = ({
  campaignId,
  onClose,
}) => {
  const { user, updateProfile } = useAuth();
  const { campaigns, talents, setCampaigns, orders, setOrders, earnings, setEarnings, transactions, setTransactions, refreshData } = useApp();
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingTalentId, setProcessingTalentId] = useState<string | null>(null);

  // Find the campaign using the campaignId
  const campaign = campaigns.find(c => c.id === campaignId);
  
  if (!campaign) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <p>Campaign not found. Please try again.</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Get applicant talents
  const applicantTalents = talents.filter(talent => campaign.applicants.includes(talent.id));

  // Filter applicants based on search term
  const filteredApplicants = applicantTalents.filter(talent =>
    talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    talent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    talent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRateLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-blue-100 text-blue-800';
      case 3:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const isVideoUrl = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || 
           url.includes('video') || url.endsWith('.mp4');
  };

  const handleApprove = async (talentId: string) => {
    setProcessingTalentId(talentId);
    
    try {
      // Check if founder has sufficient balance
      const founder = user as Founder;
      if (founder.walletBalance < campaign.price) {
        alert('Insufficient wallet balance. Please top up your wallet before approving talents.');
        return;
      }

      // Update application status in the database
      await updateApplicationStatus(campaign.id, talentId, 'approved');

      // Update campaign in local state: remove from applicants, add to approved talents
      const updatedCampaign = {
        ...campaign,
        // Don't remove from applicants yet - this will happen on refresh
        approvedTalents: [...campaign.approvedTalents, talentId]
      };

      setCampaigns(campaigns.map(c => c.id === campaign.id ? updatedCampaign : c));

      // Create new order
      try {
        const talent = talents.find(t => t.id === talentId);
        if (talent) {
          // Create order in database first to get proper UUID
          const newOrder = await createOrder({
            campaignId: campaign.id,
            talentId: talentId,
            founderId: user?.id || '',
            status: 'pending_shipment',
            payout: campaign.price,
          });

          // Add to local state
          setOrders([newOrder, ...orders]);

          // Now create hold transaction with proper order ID
          const holdTransaction = await createTransaction({
            userId: founder.id,
            type: 'debit',
            amount: campaign.price,
            description: `Payment Hold - ${campaign.title} (Talent Approved)`,
            relatedJobId: newOrder.id, // Use the actual order ID from database
          });

          setTransactions([holdTransaction, ...transactions]);

          // Refresh data to ensure everything is in sync
          await refreshData();
          onClose();
          // Show success message
          alert(`Talent ${talent?.name} has been approved! Order created and payment held.`);
          
          // If the selected talent was approved, close the talent details modal
          if (selectedTalent && selectedTalent.id === talentId) {
            setSelectedTalent(null);
          }
        }
      } catch (error) {
        console.error('Error creating order or transaction:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error approving talent:', error);
      alert('Failed to approve talent. Please try again.');
    } finally {
      setProcessingTalentId(null);
    }
  };

  const handleReject = async (talentId: string) => {
    setProcessingTalentId(talentId);
    
    try {
      // Update application status in the database
      await updateApplicationStatus(campaign.id, talentId, 'rejected');

      // Update campaign in local state
      const updatedCampaign = {
        ...campaign,
        applicants: campaign.applicants.filter(id => id !== talentId)
      };

      setCampaigns(campaigns.map(c => c.id === campaign.id ? updatedCampaign : c));
      
      // Refresh data to ensure everything is in sync
      await refreshData();
      
      const talent = talents.find(t => t.id === talentId);
      alert(`Talent ${talent?.name} application has been rejected.`);
      
      // If the selected talent was rejected, close the talent details modal
      if (selectedTalent && selectedTalent.id === talentId) {
        setSelectedTalent(null);
      }
    } catch (error) {
      console.error('Error rejecting talent:', error);
      alert('Failed to reject talent. Please try again.');
    } finally {
      setProcessingTalentId(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Campaign Applicants</h2>
              <p className="text-gray-600">{campaign.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Campaign Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">{campaign.title}</h3>
                  <p className="text-blue-700 text-sm">{campaign.productName} • {campaign.category}</p>
                  <p className="text-blue-700 text-sm">Payment: {formatCurrency(campaign.price)} per approved talent</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-900 font-medium">{applicantTalents.length} Applicants</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search applicants by name, email, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Applicants List */}
            {filteredApplicants.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredApplicants.map((talent) => (
                  <div key={talent.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        {talent.avatar ? (
                          <img 
                            src={talent.avatar} 
                            alt={talent.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                            {talent.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-lg">{talent.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRateLevelColor(talent.rateLevel)}`}>
                            {talent.rateLevel} Star
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-600 text-sm">{talent.email}</p>
                        </div>

                        {talent.bio && (
                          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{talent.bio}</p>
                        )}

                        {/* Skills */}
                        {talent.skills.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Skills:</p>
                            <div className="flex flex-wrap gap-1">
                              {talent.skills.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                              {talent.skills.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  +{talent.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Social Media */}
                        {talent.socialMedia && (Object.values(talent.socialMedia).some(val => val)) && (
                          <div className="flex items-center space-x-3 mb-3">
                            {talent.socialMedia.instagram && (
                              <div className="flex items-center space-x-1">
                                <Instagram className="h-4 w-4 text-pink-500" />
                                <span className="text-xs text-gray-600">{talent.socialMedia.instagram}</span>
                              </div>
                            )}
                            {talent.socialMedia.youtube && (
                              <div className="flex items-center space-x-1">
                                <Youtube className="h-4 w-4 text-red-500" />
                                <span className="text-xs text-gray-600">YouTube</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Portfolio Preview */}
                        {talent.portfolio && talent.portfolio.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Portfolio:</p>
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                              {talent.portfolio.slice(0, 4).map((item, index) => (
                                <div key={index} className="relative flex-shrink-0">
                                  {isVideoUrl(item) ? (
                                    <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center relative">
                                      <Video className="h-6 w-6 text-gray-400" />
                                      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
                                        <video
                                          src={item}
                                          className="w-full h-full object-cover"
                                          muted
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <img
                                      src={item}
                                      alt={`Portfolio ${index + 1}`}
                                      className="w-16 h-16 object-cover rounded border border-gray-200"
                                    />
                                  )}
                                </div>
                              ))}
                              {talent.portfolio.length > 4 && (
                                <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">+{talent.portfolio.length - 4}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedTalent(talent)}
                            className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-300"
                          >
                            <Eye className="h-4 w-4 inline mr-1" />
                            View Details
                          </button>
                          
                          <button
                            onClick={() => handleApprove(talent.id)}
                            disabled={processingTalentId === talent.id}
                            className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingTalentId === talent.id ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </span>
                            ) : (
                              <>
                                <Check className="h-4 w-4 inline mr-1" />
                                Approve
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleReject(talent.id)}
                            disabled={processingTalentId === talent.id}
                            className="px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingTalentId === talent.id ? (
                              <span className="flex items-center">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </span>
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No matching applicants' : 'No applicants yet'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Applicants will appear here when talents apply to your campaign'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Talent Details Modal */}
      {selectedTalent && (
        <TalentProfileModal
          talent={selectedTalent}
          onClose={() => setSelectedTalent(null)}
          onApprove={() => {
            handleApprove(selectedTalent.id);
            setSelectedTalent(null);
          }}
          onReject={() => {
            handleReject(selectedTalent.id);
            setSelectedTalent(null);
          }}
        />
      )}
    </>
  );
};

export default CampaignApplicantsModal;