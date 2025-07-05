import React, { useState, useRef } from 'react';
import { X, Package, Calendar, DollarSign, MapPin, Truck, CheckCircle, User, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import ChatPanel from '../Common/ChatPanel';

interface JobDetailsModalProps {
  job: Order;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
  const { user } = useAuth();
  const { messages } = useApp();
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleOpenLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };
  const handleCloseLightbox = () => setLightboxOpen(false);

  // Filter messages for this specific job
  const jobMessages = messages.filter(msg => msg.jobId === job.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_shipment': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'review_submitted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_shipment': return 'Waiting for Shipment';
      case 'shipped': return 'Product Shipped';
      case 'delivered': return 'Product Delivered';
      case 'review_submitted': return 'Review Submitted';
      case 'completed': return 'Job Completed';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(amount);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Left Panel - Job Details */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Job Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{job.campaignTitle}</h3>
                <p className="text-gray-600">Job #{job.id}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(job.status)}`}>
                {getStatusLabel(job.status)}
              </span>
            </div>

            {/* Job Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-medium text-gray-900">{job.productName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Talent</p>
                    <p className="font-medium text-gray-900">{job.talentName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Payout</p>
                    <p className="font-medium text-green-600">{formatCurrency(job.payout)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Job Started</p>
                    <p className="font-medium text-gray-900">{job.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Job Progress</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['pending_shipment', 'shipped', 'delivered', 'review_submitted', 'completed'].includes(job.status)
                      ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Job Assigned</p>
                    <p className="text-sm text-gray-600">You were approved for this campaign</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['shipped', 'delivered', 'review_submitted', 'completed'].includes(job.status)
                      ? 'bg-green-500 text-white' : job.status === 'pending_shipment' ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Product Shipped</p>
                    <p className="text-sm text-gray-600">
                      {job.status === 'pending_shipment' ? 'Waiting for shipment' : 'Product has been shipped to you'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['delivered', 'review_submitted', 'completed'].includes(job.status)
                      ? 'bg-green-500 text-white' : job.status === 'shipped' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Product Delivered</p>
                    <p className="text-sm text-gray-600">
                      {['delivered', 'review_submitted', 'completed'].includes(job.status) 
                        ? 'Product delivered successfully' 
                        : job.status === 'shipped' 
                          ? 'Product is in transit' 
                          : 'Waiting for delivery'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['review_submitted', 'completed'].includes(job.status)
                      ? 'bg-green-500 text-white' : job.status === 'delivered' ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Review Submitted</p>
                    <p className="text-sm text-gray-600">
                      {['review_submitted', 'completed'].includes(job.status) 
                        ? 'Review content submitted for approval' 
                        : job.status === 'delivered' 
                          ? 'Ready to create and submit review' 
                          : 'Waiting for product delivery'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            {job.deliveryInfo && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h4>
                {job.deliveryInfo.trackingNumber && (
                  <div className="flex items-center space-x-3 mb-4">
                    <Truck className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-medium text-gray-900">{job.deliveryInfo.trackingNumber}</p>
                    </div>
                  </div>
                )}
                {job.deliveryInfo.courier && (
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Courier</p>
                      <p className="font-medium text-gray-900">{job.deliveryInfo.courier}</p>
                    </div>
                  </div>
                )}
                {job.deliveryInfo.address && (
                  <div className="flex items-center space-x-3 mt-4">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Delivery Address</p>
                      <p className="font-medium text-gray-900">{job.deliveryInfo.address}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Review Submission with Lightbox Preview */}
            {job.reviewSubmission && job.reviewSubmission.media && job.reviewSubmission.media.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Review Submission</h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-2">
                    Review submitted on {job.reviewSubmission.submittedAt.toLocaleDateString()}
                  </p>
                  {job.reviewSubmission.notes && (
                    <div className="mt-2 mb-4 p-2 bg-white rounded text-gray-700 border border-green-100">
                      <p className="font-semibold mb-1">Talent's Notes:</p>
                      <p className="text-sm">{job.reviewSubmission.notes}</p>
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {job.reviewSubmission.media.map((media, idx) =>
                      media.type === 'image' ? (
                        <div key={idx} className="relative group">
                          <img
                            src={media.url}
                            alt={`Review submission ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-lg cursor-pointer"
                            onClick={() => handleOpenLightbox(idx)}
                          />
                          <a
                            href={media.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1 shadow transition group-hover:bg-green-200"
                            title="Download"
                            onClick={e => e.stopPropagation()}
                          >
                            <Download className="h-4 w-4 text-green-600" />
                          </a>
                        </div>
                      ) : (
                        <div key={idx} className="relative group">
                          <video
                            src={media.url}
                            controls
                            className="w-full h-48 rounded-lg cursor-pointer"
                            onClick={() => handleOpenLightbox(idx)}
                          />
                          <a
                            href={media.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1 shadow transition group-hover:bg-green-200"
                            title="Download"
                            onClick={e => e.stopPropagation()}
                          >
                            <Download className="h-4 w-4 text-green-600" />
                          </a>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lightbox Modal for Fullscreen Media */}
            {lightboxOpen && job.reviewSubmission && job.reviewSubmission.media && (
              <div className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex flex-col items-center justify-center transition-all">
                <button
                  className="absolute top-6 right-6 text-white text-2xl"
                  onClick={handleCloseLightbox}
                  aria-label="Close"
                >
                  <X className="w-10 h-10" />
                </button>
                <div className="max-w-3xl max-h-[80vh] flex items-center justify-center">
                  {job.reviewSubmission.media[lightboxIndex].type === 'image' ? (
                    <img
                      src={job.reviewSubmission.media[lightboxIndex].url}
                      alt={`Review submission ${lightboxIndex + 1}`}
                      className="max-h-[80vh] max-w-full rounded-lg shadow-lg"
                    />
                  ) : (
                    <video
                      src={job.reviewSubmission.media[lightboxIndex].url}
                      controls
                      autoPlay
                      className="max-h-[80vh] max-w-full rounded-lg shadow-lg"
                    />
                  )}
                </div>
                {job.reviewSubmission.media.length > 1 && (
                  <div className="mt-6 flex space-x-4">
                    {job.reviewSubmission.media.map((m, idx) => (
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
        </div>
        
        {/* Right Panel - Chat */}
        <ChatPanel 
          jobId={job.id}
          recipientName="Founder"
          recipientRole="founder"
          messages={jobMessages}
        />
      </div>
    </div>
  );
};

export default JobDetailsModal;