import React, { useState } from 'react';
import { Package, Search, Filter, Eye, Truck, CheckCircle, Clock, MapPin, User, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import OrderDetailsModal from './OrderDetailsModal';
import ShipOrderModal from './ShipOrderModal';
import { updateOrder } from '../../lib/api';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, setOrders, refreshData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter orders for the current founder
  const founderOrders = orders.filter(order => order.founderId === user?.id);

  // Apply search and status filters
  const filteredOrders = founderOrders.filter(order => {
    const matchesSearch = order.talentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_shipment':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'review_submitted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_shipment':
        return <Clock className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <MapPin className="h-4 w-4" />;
      case 'review_submitted':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_shipment':
        return 'Pending Shipment';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'review_submitted':
        return 'Review Submitted';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleShipOrder = (order: Order) => {
    setShippingOrder(order);
  };

  const handleShipSuccess = async (orderId: string, deliveryInfo: any) => {
    setLoading(true);
    try {
      // Update order in database
      await updateOrder(orderId, {
        status: 'shipped',
        delivery_address: deliveryInfo.address,
        tracking_number: deliveryInfo.trackingNumber,
        courier: deliveryInfo.courier,
      });

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'shipped', deliveryInfo }
          : order
      ));
      
      setShippingOrder(null);
      await refreshData();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    setLoading(true);
    try {
      // Update order in database
      await updateOrder(orderId, {
        status: 'delivered',
      });

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'delivered' }
          : order
      ));
      
      await refreshData();
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      alert('Failed to update order status. Please try again.');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage product shipments to approved talents</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Shipment</p>
              <p className="text-2xl font-bold text-gray-900">
                {founderOrders.filter(o => o.status === 'pending_shipment').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shipped</p>
              <p className="text-2xl font-bold text-gray-900">
                {founderOrders.filter(o => o.status === 'shipped').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Review Submitted</p>
              <p className="text-2xl font-bold text-gray-900">
                {founderOrders.filter(o => o.status === 'review_submitted').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {founderOrders.length}
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
            placeholder="Search orders by talent, campaign, or product..."
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
            <option value="pending_shipment">Pending Shipment</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="review_submitted">Review Submitted</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{order.campaignTitle}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{getStatusLabel(order.status)}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Product: <span className="font-medium text-gray-900">{order.productName}</span></p>
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 text-gray-400 mr-1" />
                        <p className="text-sm text-gray-600">Talent: <span className="font-medium text-gray-900">{order.talentName}</span></p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payout: <span className="font-medium text-green-600">{formatCurrency(order.payout)}</span></p>
                      <p className="text-sm text-gray-600">Created: {order.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Delivery Information */}
                  {order.deliveryInfo && (order.deliveryInfo.address || order.deliveryInfo.trackingNumber) && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Delivery Information:</h4>
                      <div className="space-y-1 text-sm text-blue-700">
                        {order.deliveryInfo.address && (
                          <p><span className="font-medium">Address:</span> {order.deliveryInfo.address}</p>
                        )}
                        {order.deliveryInfo.trackingNumber && (
                          <p><span className="font-medium">Tracking:</span> {order.deliveryInfo.trackingNumber}</p>
                        )}
                        {order.deliveryInfo.courier && (
                          <p><span className="font-medium">Courier:</span> {order.deliveryInfo.courier}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Review Submission Preview */}
                  {order.reviewSubmission && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="text-sm font-medium text-green-800 mb-2">Review Submitted:</h4>
                      <p className="text-sm text-green-700 mb-2">
                        Submitted on {order.reviewSubmission.submittedAt.toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-3">
                        {order.reviewSubmission.mediaType === 'image' ? (
                          <img
                            src={order.reviewSubmission.mediaUrl}
                            alt="Review submission"
                            className="w-20 h-20 object-cover rounded-lg border border-green-200"
                          />
                        ) : (
                          <video
                            src={order.reviewSubmission.mediaUrl}
                            className="w-20 h-20 rounded-lg border border-green-200"
                            controls
                          />
                        )}
                        <div>
                          <p className="text-sm text-green-700 capitalize">
                            {order.reviewSubmission.mediaType} content
                          </p>
                          <p className="text-xs text-green-600">
                            {order.status === 'review_submitted' ? 'Pending your approval' : 'Approved'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  {order.status === 'pending_shipment' && (
                    <button
                      onClick={() => handleShipOrder(order)}
                      disabled={loading}
                      className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Ship Order'}
                    </button>
                  )}
                  
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleMarkDelivered(order.id)}
                      disabled={loading}
                      className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Mark Delivered'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-sm">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Orders will appear here when you approve talent applications'
              }
            </p>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Ship Order Modal */}
      {shippingOrder && (
        <ShipOrderModal
          order={shippingOrder}
          onClose={() => setShippingOrder(null)}
          onSuccess={handleShipSuccess}
        />
      )}
    </div>
  );
};

export default OrdersPage;