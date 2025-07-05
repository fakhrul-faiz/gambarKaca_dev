import React, { useState } from 'react';
import { FileText, Search, Filter, Eye, CheckCircle, Clock, Star, Calendar, User, Package, Download, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Order, Founder, Transaction, Earning } from '../../types';
import ReviewDetailsModal from './ReviewDetailsModal';
import { deleteReviewMedia, updateOrder, createEarning, createTransaction } from '../../lib/api';

const ReviewsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { orders, setOrders, earnings, setEarnings, transactions, setTransactions, refreshData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter orders for the current founder that have been delivered or have reviews
  const founderReviews = orders.filter(order => 
    order.founderId === user?.id && 
    (order.status === 'delivered' || order.status === 'review_submitted' || order.status === 'completed')
  );

  // Apply search and status filters
  const filteredReviews = founderReviews.filter(review => {
    const matchesSearch = review.talentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Clock className="h-4 w-4" />;
      case 'review_submitted':
        return <FileText className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Product delivered! Waiting for talent to submit review content.';
      case 'review_submitted':
        return 'Review content submitted and ready for your approval.';
      case 'completed':
        return 'Review approved and talent has been paid.';
      default:
        return '';
    }
  };

 const handleApproveReview = async (orderId: string) => {
  setLoading(true);
  try {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Calculate amounts
    const talentPayment = order.payout;
    const adminFee = talentPayment * 0.1;
    const totalDeduction = talentPayment + adminFee;

    // Update order status in DB
    await updateOrder(orderId, { status: 'completed' });

    // Create earning record
    await createEarning({
      talentId: order.talentId,
      orderId: order.id,
      campaignTitle: order.campaignTitle,
      amount: order.payout,
      status: 'paid',
      paidAt: new Date()
    });

    // Create transaction records
    await createTransaction({
      userId: order.talentId,
      type: 'credit',
      amount: talentPayment,
      description: `Payment Received - ${order.campaignTitle}`,
      relatedJobId: orderId
    });
    await createTransaction({
      userId: order.founderId,
      type: 'debit',
      amount: totalDeduction,
      description: `Campaign Payout - ${order.campaignTitle} (includes 10% admin fee)`,
      relatedJobId: orderId
    });
    await createTransaction({
      userId: '066e9f3d-9570-405e-8a43-ab1ed542e9a7',
      type: 'credit',
      amount: adminFee,
      description: `Admin Fee (10%) - ${order.campaignTitle}`,
      relatedJobId: orderId
    });

    // Update founder wallet
    const founder = user as Founder;
    if (founder && updateProfile) {
      const updatedFounder: Founder = {
        ...founder,
        walletBalance: founder.walletBalance - totalDeduction,
      };
      await updateProfile(updatedFounder);
    }

    // Refresh all data/UI
    await refreshData();
  } catch (error) {
    alert('Failed to approve review. Please try again.');
    console.error('handleApproveReview error:', error);
  } finally {
    setLoading(false);
  }
};


  const handleRejectReview = async (orderId: string) => {
    const order = orders.find(order => order.id === orderId);
    if (!order) return;

    try {
      // Delete review media from Supabase Storage if exists
     if (
      order.reviewSubmission &&
      Array.isArray(order.reviewSubmission.media) &&
      order.reviewSubmission.media.length > 0
    ) {
      for (const mediaItem of order.reviewSubmission.media) {
        if (mediaItem.url) {
          await deleteReviewMedia(order.id, mediaItem.url);
        }
      }
    }

      // Update order in DB (status and nullify review_media)
      await updateOrder(orderId, {
        status: 'delivered',
        review_media: null,
        review_submitted_at: null,
      });

      // Update local state
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? { ...o, status: 'delivered', reviewSubmission: undefined }
            : o
        )
      );

      // Refresh all data/UI
      if (typeof refreshData === 'function') {
        await refreshData();
      }
    } catch (err: any) {
      alert('Failed to reject review: ' + (err.message || err));
      console.error('handleRejectReview error:', err);
    }
  };

  const getDaysAgo = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600">Monitor talent job progress and review submissions</p>
        </div>
      </div>

      {/* Payment Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Star className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Payment Information</h4>
            <p className="text-sm text-blue-700">
              When you approve a review, the talent will receive their payment as shown in the campaign price. 
              Additionally, a 10% admin fee will be charged to support platform operations.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Awaiting Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {founderReviews.filter(r => r.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {founderReviews.filter(r => r.status === 'review_submitted').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {founderReviews.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by talent, campaign, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="delivered">Awaiting Review</option>
            <option value="review_submitted">Review Submitted</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const talentPayment = review.payout;
            const adminFee = talentPayment * 0.1;
            const totalCost = talentPayment + adminFee;

            return (
              <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{review.campaignTitle}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(review.status)}`}>
                        {getStatusIcon(review.status)}
                        <span>{getStatusLabel(review.status)}</span>
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{getStatusDescription(review.status)}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Product: <span className="font-medium text-gray-900">{review.productName}</span></p>
                        <div className="flex items-center mt-1">
                          <User className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-sm text-gray-600">Talent: <span className="font-medium text-gray-900">{review.talentName}</span></p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Talent Payment: <span className="font-medium text-green-600">{formatCurrency(talentPayment)}</span></p>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-sm text-gray-600">
                            Delivered: {getDaysAgo(review.createdAt)} days ago
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    {review.status === 'review_submitted' && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">Payment Breakdown (upon approval):</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-yellow-700">Talent Payment:</span>
                            <span className="font-medium text-yellow-900">{formatCurrency(talentPayment)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-700">Admin Fee (10%):</span>
                            <span className="font-medium text-yellow-900">{formatCurrency(adminFee)}</span>
                          </div>
                          <div className="border-t border-yellow-300 pt-1 mt-2">
                            <div className="flex justify-between">
                              <span className="font-medium text-yellow-800">Total Deduction:</span>
                              <span className="font-bold text-yellow-900">{formatCurrency(totalCost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Review Progress */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Product Delivered</span>
                          </div>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              review.reviewSubmission ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            <span className="text-sm text-gray-600">Review Submitted</span>
                          </div>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              review.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            <span className="text-sm text-gray-600">Approved</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Submission Preview */}
                    {review.reviewSubmission && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-green-800 mb-2">Review Content Submitted</h4>
                            <p className="text-sm text-green-700 mb-3">
                              Submitted on {review.reviewSubmission.submittedAt.toLocaleDateString()}
                            </p>
                            <div className="flex items-center space-x-3">
                              {review.reviewSubmission.mediaType === 'image' ? (
                                <img
                                  src={review.reviewSubmission.mediaUrl}
                                  alt="Review submission"
                                  className="w-20 h-20 object-cover rounded-lg border border-green-200"
                                />
                              ) : (
                                <video
                                  src={review.reviewSubmission.mediaUrl}
                                  className="w-20 h-20 rounded-lg border border-green-200"
                                  controls
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm text-green-700 capitalize">
                                  {review.reviewSubmission.mediaType} content
                                </p>
                                <p className="text-xs text-green-600">
                                  Ready for your review and approval
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {review.status === 'review_submitted' && (
                      <>
                        <button
                          onClick={() => handleApproveReview(review.id)}
                          className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-1"
                          title="Approve Review"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>Approve</span>
                        </button>
                        
                        <button
                          onClick={() => handleRejectReview(review.id)}
                          className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-1"
                          title="Request Revision"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          <span>Revise</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No reviews found</h3>
            <p className="text-sm">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Reviews will appear here after products are delivered to talents'
              }
            </p>
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      {selectedReview && (
        <ReviewDetailsModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onApprove={() => handleApproveReview(selectedReview.id)}
          onReject={() => handleRejectReview(selectedReview.id)}
        />
      )}
    </div>
  );
};

export default ReviewsPage;
