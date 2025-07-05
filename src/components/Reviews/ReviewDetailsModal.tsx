import React, { useState, useRef } from 'react';
import { X, Package, User, Calendar, DollarSign, FileText, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import ChatPanel from '../Common/ChatPanel';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount);
};

interface ReviewDetailsModalProps {
  review: Order;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  review,
  onClose,
  onApprove,
  onReject
}) => {
  const { user } = useAuth();
  const { messages, setMessages } = useApp();

  // Lightbox state for previewing media
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Filter messages for this specific order/job
  const orderMessages = messages.filter(msg => msg.jobId === review.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'review_submitted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Awaiting Review';
      case 'review_submitted':
        return 'Review Submitted';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleApprove = () => {
    onApprove?.();
    onClose();
  };

  const handleReject = () => {
    onReject?.();
    onClose();
  };

  // Open lightbox
  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  // Helper for media
  const hasMedia =
    review.reviewSubmission &&
    Array.isArray(review.reviewSubmission.media) &&
    review.reviewSubmission.media.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Left Panel - Review Details */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Review Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Review Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{review.campaignTitle}</h3>
                <p className="text-gray-600">Order #{review.id}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(review.status)}`}>
                {getStatusLabel(review.status)}
              </span>
            </div>

            {/* Review Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-medium text-gray-900">{review.productName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Talent</p>
                    <p className="font-medium text-gray-900">{review.talentName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Payout</p>
                    <p className="font-medium text-green-600">RM{review.payout}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Order Created</p>
                    <p className="font-medium text-gray-900">{review.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>

                {review.reviewSubmission && (
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Review Submitted</p>
                      <p className="font-medium text-gray-900">
                        {review.reviewSubmission.submittedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Progress Timeline</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Product Delivered</p>
                    <p className="text-sm text-gray-600">Product successfully delivered to talent</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    review.reviewSubmission
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Review Content</p>
                    <p className="text-sm text-gray-600">
                      {review.reviewSubmission
                        ? `Media submitted`
                        : 'Waiting for talent to submit review content'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    review.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : review.status === 'review_submitted'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    <Star className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Review Approval</p>
                    <p className="text-sm text-gray-600">
                      {review.status === 'completed'
                        ? 'Review approved and job completed'
                        : review.status === 'review_submitted'
                          ? 'Pending your approval'
                          : 'Waiting for review submission'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Breakdown - Show for review_submitted status */}
            {review.status === 'review_submitted' && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Breakdown</h4>
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-5 border border-yellow-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="text-yellow-800 font-medium">Talent Payment</span>
                      </div>
                      <span className="font-bold text-yellow-900">{formatCurrency(review.payout)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="text-yellow-800 font-medium">Admin Fee (10%)</span>
                      </div>
                      <span className="font-bold text-yellow-900">{formatCurrency(review.payout * 0.1)}</span>
                    </div>
                    
                    <div className="border-t border-yellow-300 pt-3 mt-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-yellow-700 mr-2" />
                          <span className="text-yellow-900 font-semibold">Total Deduction</span>
                        </div>
                        <span className="font-bold text-lg text-yellow-900">{formatCurrency(review.payout * 1.1)}</span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-2">
                        This amount will be deducted from your wallet balance upon approval.
                        The talent will receive {formatCurrency(review.payout)} and {formatCurrency(review.payout * 0.1)} will be charged as platform fee.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Content: Render multiple images/videos with Lightbox */}
            {hasMedia && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Submitted Review Content</h4>
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {review.reviewSubmission.media.map((media, idx) =>
                      media.type === 'image' ? (
                        <img
                          key={idx}
                          src={media.url}
                          alt={`Review submission ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-green-200 cursor-pointer"
                          onClick={() => openLightbox(idx)}
                        />
                      ) : (
                        <video
                          key={idx}
                          src={media.url}
                          controls
                          className="w-full h-48 rounded-lg border border-green-200 cursor-pointer"
                          onClick={() => openLightbox(idx)}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lightbox Modal for full media preview */}
            {lightboxOpen && hasMedia && (
              <div className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex flex-col items-center justify-center transition-all">
                <button
                  className="absolute top-6 right-6 text-white text-2xl"
                  onClick={closeLightbox}
                  aria-label="Close"
                >
                  <X className="w-10 h-10" />
                </button>
                <div className="max-w-3xl max-h-[80vh] flex items-center justify-center">
                  {review.reviewSubmission.media[lightboxIndex].type === 'image' ? (
                    <img
                      src={review.reviewSubmission.media[lightboxIndex].url}
                      alt={`Review submission ${lightboxIndex + 1}`}
                      className="max-h-[80vh] max-w-full rounded-lg shadow-lg"
                    />
                  ) : (
                    <video
                      src={review.reviewSubmission.media[lightboxIndex].url}
                      controls
                      autoPlay
                      className="max-h-[80vh] max-w-full rounded-lg shadow-lg"
                    />
                  )}
                </div>
                {review.reviewSubmission.media.length > 1 && (
                  <div className="mt-6 flex space-x-4">
                    {review.reviewSubmission.media.map((m, idx) => (
                      <button
                        key={idx}
                        className={`w-16 h-16 rounded border-2 ${lightboxIndex === idx ? 'border-blue-400' : 'border-transparent'}`}
                        onClick={() => setLightboxIndex(idx)}
                      >
                        {m.type === 'image' ? (
                          <img src={m.url} alt="" className="w-full h-full object-cover rounded" />
                        ) : (
                          <video src={m.url} className="w-full h-full object-cover rounded" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>

            {review.status === 'review_submitted' && (
              <>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>Request Revision</span>
                </button>

                <button
                  onClick={handleApprove}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Approve Review</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <ChatPanel 
          jobId={review.id}
          recipientName={review.talentName}
          recipientRole="talent"
          messages={orderMessages}
        />
      </div>
    </div>
  );
};

export default ReviewDetailsModal;