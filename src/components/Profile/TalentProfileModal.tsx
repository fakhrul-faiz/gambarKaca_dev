import React, { useState, useRef } from 'react';
import { X, User, Mail, Star, Save, Camera, Instagram, Youtube, Plus, Upload, Video, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Talent } from '../../types';
import ImageUploadModal from './ImageUploadModal';
import { supabase } from '../../lib/supabase';

interface TalentProfileModalProps {
  onClose: () => void;
}

const TalentProfileModal: React.FC<TalentProfileModalProps> = ({ onClose }) => {
  const { user, updateProfile } = useAuth();
  const { earnings, refreshData } = useApp();
  const talent = user as Talent;
  
  const [loading, setLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(talent.avatar || '');
  const [formData, setFormData] = useState({
    name: talent.name || '',
    email: talent.email || '',
    bio: talent.bio || '',
    skills: talent.skills || [],
    socialMedia: {
      instagram: talent.socialMedia?.instagram || '',
      youtube: talent.socialMedia?.youtube || '',
    },
  });
  const [newSkill, setNewSkill] = useState('');
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<{url: string, type: 'image' | 'video'}[]>(
    talent.portfolio?.map(url => ({
      url,
      type: url.includes('.mp4') || url.includes('video') ? 'video' : 'image'
    })) || []
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value,
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setPortfolioUploading(true);
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('User not authenticated');

      const uploadedItems = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          console.warn(`${file.name} is not a valid image or video file.`);
          continue;
        }
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.warn(`${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        const fileExt = file.name.split('.').pop();
        const fileName = `${authUser.id}/portfolio-${Date.now()}-${i}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('portfolio')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error('Error uploading file:', error);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('portfolio')
          .getPublicUrl(data.path);

        uploadedItems.push({
          url: publicUrlData.publicUrl,
          type: fileType as 'image' | 'video'
        });
      }

      // Add new items to portfolio
      setPortfolioItems(prev => [...prev, ...uploadedItems]);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading portfolio items:', error);
      alert('Failed to upload some files. Please try again.');
    } finally {
      setPortfolioUploading(false);
    }
  };

  const handleRemovePortfolioItem = async (index: number) => {
    try {
      const item = portfolioItems[index];
      
      // Extract file path from URL
      const url = new URL(item.url);
      const pathMatch = url.pathname.match(/\/portfolio\/(.+)$/);
      
      if (pathMatch && pathMatch[1]) {
        const filePath = decodeURIComponent(pathMatch[1]);
        
        // Delete from storage
        const { error } = await supabase.storage
          .from('portfolio')
          .remove([filePath]);
          
        if (error) {
          console.error('Error removing file from storage:', error);
        }
      }
      
      // Remove from state
      setPortfolioItems(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error removing portfolio item:', error);
    }
  };

  const handleAvatarSave = (imageUrl: string) => {
    setAvatarPreview(imageUrl);
    setShowImageUpload(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user profile
      const updatedTalent: Talent = {
        ...talent,
        ...formData,
        avatar: avatarPreview,
        portfolio: portfolioItems.map(item => item.url),
      };
      
      await updateProfile?.(updatedTalent);
      await refreshData();
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  // Calculate talent statistics
  const totalEarnings = earnings.filter(e => e.talentId === talent.id && e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  const completedJobs = earnings.filter(e => e.talentId === talent.id && e.status === 'paid').length;
  const pendingEarnings = earnings.filter(e => e.talentId === talent.id && e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

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

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {talent.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowImageUpload(true)}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  title="Change Avatar"
                >
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{talent.name}</h3>
                <p className="text-gray-600">{talent.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                    Talent
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRateLevelColor(talent.rateLevel)}`}>
                    {talent.rateLevel} Star Level
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEarnings)}</div>
                <div className="text-sm text-green-700">Total Earnings</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{completedJobs}</div>
                <div className="text-sm text-blue-700">Completed Jobs</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingEarnings)}</div>
                <div className="text-sm text-yellow-700">Pending Earnings</div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself, your experience, and what makes you unique as a content creator..."
              />
            </div>

            {/* Skills Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h4>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a skill (e.g., Photography, Video Editing)"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
                
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Social Media Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="socialMedia.instagram" className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Instagram className="h-5 w-5 text-pink-500" />
                    </div>
                    <input
                      type="text"
                      id="socialMedia.instagram"
                      name="socialMedia.instagram"
                      value={formData.socialMedia.instagram}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="socialMedia.youtube" className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Youtube className="h-5 w-5 text-red-500" />
                    </div>
                    <input
                      type="text"
                      id="socialMedia.youtube"
                      name="socialMedia.youtube"
                      value={formData.socialMedia.youtube}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Channel URL"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h4>
              
              {/* Upload Button */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload images or videos to showcase your work
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handlePortfolioUpload}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <button
                    type="button"
                    onClick={handleFileSelect}
                    disabled={portfolioUploading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {portfolioUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>Choose Files</>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Max file size: 10MB. Supported formats: JPG, PNG, MP4, MOV
                  </p>
                </div>
              </div>

              {/* Portfolio Gallery */}
              {portfolioItems.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Portfolio Gallery</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {portfolioItems.map((item, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {item.type === 'image' ? (
                            <img
                              src={item.url}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="relative w-full h-full">
                              <video
                                src={item.url}
                                className="w-full h-full object-cover"
                                controls
                              />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <Video className="h-8 w-8 text-white drop-shadow-lg" />
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePortfolioItem(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || portfolioUploading}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUploadModal
          onClose={() => setShowImageUpload(false)}
          onSave={handleAvatarSave}
          title="Update Profile Picture"
          currentImage={avatarPreview}
        />
      )}
    </>
  );
};

export default TalentProfileModal;