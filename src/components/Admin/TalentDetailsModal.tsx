import React from 'react';
import { X, Mail, Calendar, DollarSign, CheckCircle, Ban, Star, Award, Instagram, Youtube, Camera, Video, Play, ExternalLink } from 'lucide-react';

interface Talent {
  id: string;
  email: string;
  name: string;
  role: 'talent';
  status: 'active' | 'pending' | 'suspended';
  avatar?: string;
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
  completedJobs: number;
  averageRating: number;
  createdAt: Date;
  lastLogin?: Date;
}

interface TalentDetailsModalProps {
  talent: Talent;
  onClose: () => void;
  onStatusChange: (talentId: string, newStatus: 'active' | 'suspended') => void;
}

const TalentDetailsModal: React.FC<TalentDetailsModalProps> = ({ 
  talent, 
  onClose, 
  onStatusChange 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const handleStatusChange = (newStatus: 'active' | 'suspended') => {
    onStatusChange(talent.id, newStatus);
    onClose();
  };

  const isVideoUrl = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || 
           url.includes('video') || url.endsWith('.mp4');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Talent Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
              {talent.avatar ? (
                <img 
                  src={talent.avatar} 
                  alt={talent.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {talent.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{talent.name}</h3>
              <p className="text-gray-600">{talent.email}</p>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(talent.status)}`}>
                  {talent.status.charAt(0).toUpperCase() + talent.status.slice(1)}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRateLevelColor(talent.rateLevel)}`}>
                  {talent.rateLevel} Star Level
                </span>
                <span className="text-sm text-gray-500">
                  ID: {talent.id}
                </span>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {talent.bio && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">About</h4>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">{talent.bio}</p>
            </div>
          )}

          {/* Performance Statistics */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Performance Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(talent.totalEarnings)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Completed Jobs</p>
                    <p className="text-2xl font-bold text-blue-900">{talent.completedJobs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Average Rating</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {talent.averageRating > 0 ? talent.averageRating.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {talent.completedJobs > 0 ? '94%' : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          {talent.skills && talent.skills.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {talent.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Section */}
          {talent.socialMedia && (Object.values(talent.socialMedia).some(val => val)) && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Social Media</h4>
              <div className="space-y-2">
                {talent.socialMedia.instagram && (
                  <div className="flex items-center space-x-3">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <a
                      href={`https://instagram.com/${talent.socialMedia.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                    >
                      {talent.socialMedia.instagram}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
                {talent.socialMedia.youtube && (
                  <div className="flex items-center space-x-3">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <a
                      href={talent.socialMedia.youtube.startsWith('http') ? talent.socialMedia.youtube : `https://youtube.com/${talent.socialMedia.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                    >
                      {talent.socialMedia.youtube}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Portfolio Section */}
          {talent.portfolio && talent.portfolio.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Portfolio</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {talent.portfolio.map((item, index) => (
                  <div key={index} className="relative group">
                    {isVideoUrl(item) ? (
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                        <video
                          src={item}
                          className="w-full h-full object-cover"
                          controls
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-10 w-10 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={item}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Timeline */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Account Timeline</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Account Created</p>
                  <p className="font-medium text-gray-900">{talent.createdAt.toLocaleDateString()}</p>
                </div>
              </div>

              {talent.lastLogin && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="font-medium text-gray-900">{talent.lastLogin.toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Submitted review for "Tech Product Launch" campaign - 2 days ago</p>
                <p>• Applied to "Fashion Collection Review" campaign - 1 week ago</p>
                <p>• Completed job for "Gaming Headset Review" - 2 weeks ago</p>
                <p>• Updated portfolio with new content - 3 weeks ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
          
          {talent.status === 'pending' && (
            <button
              onClick={() => handleStatusChange('active')}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Approve Account</span>
            </button>
          )}
          
          {talent.status === 'active' && (
            <button
              onClick={() => handleStatusChange('suspended')}
              className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Ban className="h-4 w-4" />
              <span>Suspend Account</span>
            </button>
          )}
          
          {talent.status === 'suspended' && (
            <button
              onClick={() => handleStatusChange('active')}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Reactivate Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentDetailsModal;