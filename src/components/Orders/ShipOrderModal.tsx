import React, { useState } from 'react';
import { X, Truck, MapPin, Package, AlertCircle } from 'lucide-react';
import { Order } from '../../types';

interface ShipOrderModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: (orderId: string, deliveryInfo: any) => void;
}

const ShipOrderModal: React.FC<ShipOrderModalProps> = ({ order, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    trackingNumber: '',
    courier: 'DHL',
  });

  const couriers = [
    'DHL',
    'FedEx',
    'UPS',
    'USPS',
    'J&T Express',
    'SiCepat',
    'JNE',
    'Pos Malaysia',
    'City-Link Express',
    'GDex',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSuccess(order.id, deliveryInfo);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Ship Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Order Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">{order.campaignTitle}</h3>
              <div className="space-y-1 text-xs sm:text-sm">
                <p className="text-blue-700">
                  <span className="font-medium">Product:</span> {order.productName}
                </p>
                <p className="text-blue-700">
                  <span className="font-medium">Talent:</span> {order.talentName}
                </p>
                <p className="text-blue-700">
                  <span className="font-medium">Payout:</span> {formatCurrency(order.payout)}
                </p>
                <p className="text-blue-700">
                  <span className="font-medium">Order ID:</span> #{order.id}
                </p>
              </div>
            </div>

            {/* Shipping Guidelines */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800 text-sm sm:text-base mb-2">Shipping Guidelines</h4>
                  <ul className="text-xs sm:text-sm text-yellow-700 space-y-1">
                    <li>• Ensure product is securely packaged</li>
                    <li>• Include campaign details in the package</li>
                    <li>• Use a reliable courier service</li>
                    <li>• Provide accurate tracking information</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={4}
                  value={deliveryInfo.address}
                  onChange={handleInputChange}
                  className="w-full pl-10 sm:pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                  placeholder="Enter complete delivery address including postal code, city, and state"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Include postal code, city, and state for accurate delivery
              </p>
            </div>

            {/* Courier Service */}
            <div>
              <label htmlFor="courier" className="block text-sm font-medium text-gray-700 mb-2">
                Courier Service *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <select
                  id="courier"
                  name="courier"
                  required
                  value={deliveryInfo.courier}
                  onChange={handleInputChange}
                  className="w-full pl-10 sm:pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base appearance-none bg-white"
                >
                  {couriers.map((courier) => (
                    <option key={courier} value={courier}>
                      {courier}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tracking Number */}
            <div>
              <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="trackingNumber"
                  name="trackingNumber"
                  required
                  value={deliveryInfo.trackingNumber}
                  onChange={handleInputChange}
                  className="w-full pl-10 sm:pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter tracking number"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Provide the tracking number from your courier service
              </p>
            </div>

            {/* Shipping Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Shipping Summary</h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Campaign:</span>
                  <span className="font-medium text-gray-900 text-right">{order.campaignTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium text-gray-900 text-right">{order.productName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Talent:</span>
                  <span className="font-medium text-gray-900 text-right">{order.talentName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payout:</span>
                  <span className="font-medium text-green-600 text-right">{formatCurrency(order.payout)}</span>
                </div>
                {deliveryInfo.courier && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Courier:</span>
                    <span className="font-medium text-gray-900 text-right">{deliveryInfo.courier}</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !deliveryInfo.address || !deliveryInfo.trackingNumber}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Shipping...</span>
              </>
            ) : (
              <>
                <Truck className="h-4 w-4" />
                <span>Ship Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipOrderModal;