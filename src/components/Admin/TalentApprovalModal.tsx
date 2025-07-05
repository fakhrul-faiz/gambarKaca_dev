import React, { useState } from 'react';
import { X, Star, CheckCircle, User, Mail, Calendar, Award, Instagram, Youtube, Camera } from 'lucide-react';
import { Talent } from '../../types';

interface TalentApprovalModalProps {
  talent: Talent;
  onClose: () => void;
  onApprove: (talentId: string, rateLevel: 1 | 2 | 3) => void;
}

const TalentApprovalModal: React.FC<TalentApprovalModalProps> = ({ 
  talent, 
  onClose, 
  onApprove 
}) => {
  const [selectedRateLevel, setSelectedRateLevel] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  const getRateLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-green-100 text-green-800 border-green-300';
      case 2:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 3:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRateLevelDescription = (level: number) => {
    switch (level) {
      case 1:
        return 'Entry level talent with basic content creation skills. Suitable for simple product reviews and basic social media content.';
      case 2:
        return 'Intermediate talent with proven content creation experience. Can handle more complex campaigns and has established audience engagement.';
      case 3:
        return 'Premium talent with exceptional content quality and significant audience reach. Best for high-value campaigns and brand partnerships.';
      default:
        return '';
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(talent.id, selectedRateLevel);
    } catch (error) {
      console.error('Error approving talent:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Approve Talent Application</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Talent Profile Header */}
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {talent.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{talent.name}</h3>
              <p className="text-gray-600">{talent.email}</p>
              <div className="flex items-center space-x-3 mt-2">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Pending Approval
                </span>
                <span className="text-sm text-gray-500">
                  Applied: {talent.createdAt.toLocaleDateString()}
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

          {/* Skills Section */}
          {talent.skills && talent.skills.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {talent.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Section */}
          {talent.socialMedia && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Social Media Presence</h4>
              <div className="space-y-2">
                {talent.socialMedia.instagram && (
                  <div className="flex items-center space-x-3">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <span className="text-gray-700">{talent.socialMedia.instagram}</span>
                  </div>
                )}
                {talent.socialMedia.youtube && (
                  <div className="flex items-center space-x-3">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">{talent.socialMedia.youtube}</span>
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
                    <img
                      src={item}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rate Level Selection */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Assign Rate Level</h4>
            <p className="text-gray-600 mb-4">
              Select the appropriate rate level based on the talent's experience, portfolio quality, and social media presence.
            </p>
            
            <div className="space-y-3">
              {[1, 2, 3].map((level) => (
                <label
                  key={level}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedRateLevel === level
                      ? getRateLevelColor(level)
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rateLevel"
                    value={level}
                    checked={selectedRateLevel === level}
                    onChange={(e) => setSelectedRateLevel(Number(e.target.value) as 1 | 2 | 3)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= level ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {level} Star Level - {level === 1 ? 'Entry' : level === 2 ? 'Intermediate' : 'Premium'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {getRateLevelDescription(level)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Approval Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Approval Summary</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>• Talent will be approved with {selectedRateLevel} star level</p>
              <p>• They will gain access to campaigns up to their rate level</p>
              <p>• Account status will change from "Pending" to "Active"</p>
              <p>• Talent will receive email notification of approval</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleApprove}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{loading ? 'Approving...' : `Approve as ${selectedRateLevel} Star Talent`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalentApprovalModal;