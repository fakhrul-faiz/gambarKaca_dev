import React, { useState, useRef } from 'react';
import { X, Upload, Camera, VideoIcon, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { Order } from '../../types';
import { supabase } from '../../lib/supabase';
import { updateOrder } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface MediaPreview {
  file: File;
  url: string;
  type: 'image' | 'video';
  previewLoading: boolean;
}

interface SubmitReviewModalProps {
  job: Order;
  onClose: () => void;
  onSuccess: (jobId: string, reviewData: any) => void;
}

const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({ job, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Helper: detect file type
  const getFileTypeFromMime = (file: File) => {
    if (file.type.startsWith('image')) return 'image';
    if (file.type.startsWith('video')) return 'video';
    return null;
  };

  // Add files (multi-select, image or video)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    try{
    const files = Array.from(e.target.files || []);
    let nextFiles = [...mediaFiles];

    files.forEach(file => {
      const fileType = getFileTypeFromMime(file);
      if (!fileType) return;
      const maxSize = fileType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File ${file.name} too large. Max ${fileType === 'image' ? '10MB' : '50MB'}.`);
        return;
      }
      // Prevent duplicates
      if (nextFiles.some(mf => mf.file.name === file.name && mf.file.size === file.size)) return;
      nextFiles.push({
        file,
        url: URL.createObjectURL(file),
        type: fileType,
        previewLoading: true,
      });
    });

    setMediaFiles(nextFiles);
        } catch (error) {
    console.error('Error processing files:', error);
    alert('Failed to process files. Please try again.');
  } finally {
    setUploading(false);
  }
  };

  // Remove a single file
  const removeFile = (idx: number) => {
    setMediaFiles(files => files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!mediaFiles.length) {
      setError('Please select at least one photo or video.');
      return;
    }
    if (!user) {
      setError('User not found. Please login again.');
      return;
    }
    setLoading(true);

    try {
      const uploadedMedia: { url: string; type: 'image' | 'video' }[] = [];
      for (const media of mediaFiles) {
        const timestamp = Date.now();
        const filePath = `${user.id}/${timestamp}_${media.file.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from('review-submissions')
          .upload(filePath, media.file);

        if (uploadError) {
          setError(`Upload failed: ${media.file.name}: ${uploadError.message}`);
          setLoading(false);
          return;
        }
        const { data } = supabase.storage.from('review-submissions').getPublicUrl(filePath);
        const publicUrl = data?.publicUrl;
        if (!publicUrl) {
          setError('Failed to retrieve file URL.');
          setLoading(false);
          return;
        }
        uploadedMedia.push({ url: publicUrl, type: media.type });
      }

      // Save review with new media array format
      await updateOrder(job.id, {
        status: 'review_submitted',
        review_media: uploadedMedia,
        review_submitted_at: new Date().toISOString(),
        notes: reviewNotes,
      });

      onSuccess(job.id, {
        media: uploadedMedia,
        notes: reviewNotes,
      });

      setLoading(false);
      onClose();
    } catch (err: any) {
      setError('Unexpected error: ' + (err.message || err));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Submit Review Content</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photos or Videos *
            </label>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />

                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag files
                </p>
                <p className="text-xs text-gray-500">
                  Images: PNG, JPG, JPEG (max 10MB)<br />
                  Videos: MP4, MOV, AVI (max 50MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                required={mediaFiles.length === 0}
                disabled={uploading}
              />
            </label>
            {/* Previews for all selected files */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {mediaFiles.map((media, idx) => (
                  <div key={idx} className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow text-red-600 hover:text-red-900"
                      onClick={() => removeFile(idx)}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-32 object-cover"
                        onLoad={() => {
                          setMediaFiles(files =>
                            files.map((f, i) => i === idx ? { ...f, previewLoading: false } : f)
                          );
                        }}
                        style={{ opacity: media.previewLoading ? 0.5 : 1 }}
                      />
                    ) : (
                      <video
                        src={media.url}
                        controls
                        className="w-full h-32"
                        onLoadedData={() => {
                          setMediaFiles(files =>
                            files.map((f, i) => i === idx ? { ...f, previewLoading: false } : f)
                          );
                        }}
                        style={{ opacity: media.previewLoading ? 0.5 : 1 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Notes */}
          <div>
            <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="reviewNotes"
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any notes about your review content or creative approach..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-2 text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !mediaFiles.length}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{loading ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitReviewModal;