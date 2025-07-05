import React, { useState, useRef } from 'react';
import { Upload, X, Save, Camera, Video, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Campaign } from '../../types';
import { updateCampaign } from '../../lib/api';
import { supabase } from '../../lib/supabase';

interface EditCampaignFormProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: () => void;
}

const EditCampaignForm: React.FC<EditCampaignFormProps> = ({ campaign, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { campaigns, setCampaigns } = useApp();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: campaign.title,
    description: campaign.description,
    productName: campaign.productName,
    category: campaign.category,
    duration: campaign.duration,
    rateLevel: campaign.rateLevel,
    mediaType: campaign.mediaType,
  });
  const [productImages, setProductImages] = useState<string[]>(campaign.productImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const durationOptions = [
    { value: '30sec', label: '30 Seconds' },
    { value: '1min', label: '1 Minute' },
    { value: '3min', label: '3 Minutes' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rateLevel' ? Number(value) : value
    }));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('User not authenticated');

      const uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          console.warn(`${file.name} is not a valid image or video file.`);
          continue;
        }
        
        // Check file size (max 20MB)
        if (file.size > 20 * 1024 * 1024) {
          console.warn(`${file.name} is too large. Maximum size is 20MB.`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${authUser.id}/campaign-${campaign.id}-${Date.now()}-${i}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('campaign-media')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error('Error uploading file:', error);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('campaign-media')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // Add new images to product images
      setProductImages(prev => [...prev, ...uploadedUrls]);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload some files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    try {
      const imageUrl = productImages[index];
      
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/campaign-media\/(.+)$/);
      
      if (pathMatch && pathMatch[1]) {
        const filePath = decodeURIComponent(pathMatch[1]);
        
        // Delete from storage
        const { error } = await supabase.storage
          .from('campaign-media')
          .remove([filePath]);
          
        if (error) {
          console.error('Error removing file from storage:', error);
        }
      }
      
      // Remove from state
      setProductImages(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const updatedCampaign: Campaign = {
        ...campaign,
        title: formData.title,
        description: formData.description,
        productName: formData.productName,
        category: formData.category,
        duration: formData.duration,
        productImages: productImages,
        rateLevel: formData.rateLevel,
        mediaType: formData.mediaType,
      };

      // Update campaign in database
      await updateCampaign(campaign.id, {
        title: formData.title,
        description: formData.description,
        product_name: formData.productName,
        category: formData.category,
        duration: formData.duration,
        product_images: productImages,
        rate_level: formData.rateLevel,
        media_type: formData.mediaType,
      });

      // Update campaigns list
      setCampaigns(campaigns.map(c => c.id === campaign.id ? updatedCampaign : c));
      
      onSuccess();
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isVideoUrl = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || 
           url.includes('video') || url.endsWith('.mp4');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter campaign title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your campaign and what you're looking for"
            />
          </div>

          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="productName"
              name="productName"
              required
              value={formData.productName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Content Duration *
              </label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rateLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Rate Level *
              </label>
              <select
                id="rateLevel"
                name="rateLevel"
                value={formData.rateLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1 Star - Entry Level</option>
                <option value={2}>2 Star - Intermediate</option>
                <option value={3}>3 Star - Premium</option>
              </select>
            </div>

            <div>
              <label htmlFor="mediaType" className="block text-sm font-medium text-gray-700 mb-2">
                Media Type *
              </label>
              <select
                id="mediaType"
                name="mediaType"
                value={formData.mediaType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="image">Image Only</option>
                <option value="video">Video Only</option>
                <option value="both">Both Image & Video</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images & Videos
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> product media
                    </p>
                    <p className="text-xs text-gray-500">Images & Videos (MAX. 20MB each)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    disabled={uploading}
                  />
                </label>
              </div>

              {uploading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Uploading media...</p>
                </div>
              )}

              {productImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {productImages.map((item, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {isVideoUrl(item) ? (
                          <div className="relative w-full h-full">
                            <video
                              src={item}
                              className="w-full h-full object-cover"
                              controls
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                              <Video className="h-8 w-8 text-white drop-shadow-lg" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Updating...' : 'Update Campaign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCampaignForm;