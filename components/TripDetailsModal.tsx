import React from 'react';
import { X, MapPin, Clock, Wifi, Coffee, Battery, Shield, Tv, Utensils } from 'lucide-react';
import { Trip, TripStop, VehicleType } from '../types';

interface TripDetailsModalProps {
  trip: Trip;
  onClose: () => void;
  onBook: (trip: Trip) => void;
}

export const TripDetailsModal: React.FC<TripDetailsModalProps> = ({ trip, onClose, onBook }) => {
  
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'nước uống': case 'đồ ăn nhẹ': return <Coffee className="h-4 w-4" />;
      case 'cổng sạc': return <Battery className="h-4 w-4" />;
      case 'bảo hiểm': return <Shield className="h-4 w-4" />;
      case 'màn hình tv': return <Tv className="h-4 w-4" />;
      case 'suất ăn': return <Utensils className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };
  
  // Helper to safely import CheckCircle if it falls to default, though we use generic logic
  const CheckCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold backdrop-blur-md">
                {trip.vehicleType}
              </span>
              <span className="text-blue-100 text-sm">{trip.date}</span>
            </div>
            <h2 className="text-2xl font-bold">{trip.from} <span className="opacity-70 mx-2">✈</span> {trip.to}</h2>
            <p className="text-blue-100 mt-1 flex items-center gap-2">
              <Clock className="h-4 w-4" /> {trip.duration} • {trip.stops.length} điểm dừng
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left: Timeline */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" /> Lịch trình chi tiết
            </h3>
            
            <div className="relative pl-4 border-l-2 border-slate-200 space-y-8 ml-2">
              {trip.stops.map((stop, index) => (
                <div key={stop.id} className="relative">
                  {/* Dot */}
                  <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white shadow-sm 
                    ${index === 0 ? 'bg-green-500' : index === trip.stops.length - 1 ? 'bg-red-500' : 'bg-blue-400'}`}>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-sm w-16 text-center shrink-0">
                      {stop.time}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{stop.location}</h4>
                      <p className="text-xs text-slate-500 mt-1">{stop.description}</p>
                      {stop.type === 'MEAL' && (
                        <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                          <Utensils className="h-3 w-3" /> Nghỉ ăn uống
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info & Amenities */}
          <div className="space-y-6">
            {/* Amenities */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide mb-4">Tiện ích chuyến đi</h3>
              <div className="grid grid-cols-2 gap-3">
                {trip.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="text-blue-500">{getAmenityIcon(item)}</div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide mb-4">Chính sách</h3>
              <ul className="space-y-2 text-sm text-slate-500 list-disc pl-4">
                <li>Có thể hủy vé trước 24h khởi hành (phí 10%).</li>
                <li>Trẻ em dưới 5 tuổi miễn phí vé.</li>
                <li>Hành lý ký gửi tối đa 20kg.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <div>
            <span className="block text-xs text-slate-500">Tổng tiền</span>
            <span className="block text-2xl font-bold text-blue-600">{trip.price.toLocaleString()} đ</span>
          </div>
          <button 
            onClick={() => {
              onBook(trip);
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition transform active:scale-95"
          >
            Đặt vé ngay
          </button>
        </div>

      </div>
    </div>
  );
};