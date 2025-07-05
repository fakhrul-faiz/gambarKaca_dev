import React from 'react';
import { X, Star, Instagram, Youtube, Video, Camera, Award, Calendar, DollarSign, ExternalLink, Play } from 'lucide-react';
import { Talent } from '../../types';

interface TalentProfileModalProps {
  talent: Talent;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

const TalentProfileModal: React.FC<TalentProfileModalProps> = ({ 
  talent, 
  onClose, 
  onApprove, 
  onReject, 
  showActions = true 
}) => {
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

  const formatEarnings = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const isVideoUrl = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || 
           url.includes('video') || url.endsWith('.mp4');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Talent Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 overflow-hidden rounded-full flex-shrink-0">
              {talent.avatar ? (
                <img 
                  src={talent.avatar} 
                  alt={talent.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {talent.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{talent.name}</h3>
              <p className="text-gray-600">{talent.email}</p>
              <div className="flex items-center space-x-3 mt-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRateLevelColor(talent.rateLevel)}`}>
                  {talent.rateLevel} Star Level
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  talent.status === 'active' ? 'bg-green-100 text-green-800' :
                  talent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {talent.status.charAt(0).toUpperCase() + talent.status.slice(1)}
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

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-blue-600 font-medium">Rate Level</p>
              <p className="text-xl font-bold text-blue-900">{talent.rateLevel} Star</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-green-600 font-medium">Total Earnings</p>
              <p className="text-xl font-bold text-green-900">{formatEarnings(talent.totalEarnings)}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm text-purple-600 font-medium">Member Since</p>
              <p className="text-xl font-bold text-purple-900">
                {talent.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
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
              <div className="space-y-3">
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

          {/* Performance Metrics */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Performance Metrics</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-lg font-semibold text-gray-900">94%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Jobs</p>
                  <p className="text-lg font-semibold text-gray-900">23</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <div className="flex items-center">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= 4.8 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">4.8</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-lg font-semibold text-gray-900">2 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
            <button
              onClick={onReject}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Reject
            </button>
            <button
              onClick={onApprove}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors"
            >
              Approve Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentProfileModal;