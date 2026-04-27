import React, { useState } from 'react';
import { 
  Plus, 
  DollarSign, 
  Users, 
  Bus, 
  Clock, 
  Trash2,
  Briefcase,
  FileText,
  User as UserIcon,
  AlertCircle,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { Trip, Ticket, VehicleType, TransportDetails } from '../types';

interface PartnerDashboardProps {
  trips: Trip[];
  tickets: Ticket[];
  onAddTrip: (tripData: any) => void;
  onDeleteTrip: (tripId: string) => void;
  onCancelTicket?: (ticketId: string) => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ trips, tickets, onAddTrip, onDeleteTrip, onCancelTicket }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'customers'>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [from, setFrom] = useState('Hà Nội');
  const [to, setTo] = useState('Đà Nẵng');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('08:00');
  const [price, setPrice] = useState(200000);
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.BUS);
  const [totalSeats, setTotalSeats] = useState(40);
  const [duration, setDuration] = useState('5h 30m');

  // New Transport Details State
  const [plateNumber, setPlateNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverId, setDriverId] = useState('');
  const [vehicleDoc, setVehicleDoc] = useState('');

  // Stats Calculation
  const allPartnerTickets = tickets.filter(t => t.tripDetails);
  const partnerTickets = allPartnerTickets.filter(t => t.status === 'BOOKED');
  // Mock Revenue calculation for demonstration
  const currentMonthRevenue = partnerTickets.reduce((acc, t) => acc + (t.tripDetails?.price || 0), 0);
  const totalBookings = partnerTickets.length;
  
  const activeTripsList = trips.filter(t => t.status === 'APPROVED');
  const pendingTripsList = trips.filter(t => t.status === 'PENDING');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate 3-day rule
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 3);

    if (selectedDate < minDate) {
      alert("Quy định: Bạn phải đăng ký chuyến đi trước ít nhất 3 ngày so với ngày khởi hành.");
      return;
    }

    const transportDetails: TransportDetails = {
      plateNumber,
      driverName,
      driverPhone,
      driverId,
      vehicleDoc
    };

    onAddTrip({
      from,
      to,
      date,
      time,
      price: Number(price),
      vehicleType,
      totalSeats: Number(totalSeats),
      duration,
      transportDetails
    });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setPrice(200000);
    setPlateNumber('');
    setDriverName('');
    setDriverPhone('');
    setDriverId('');
    setVehicleDoc('');
    setDate('');
  };

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition">
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {subtext && <p className="text-xs text-green-600 mt-1 font-medium">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" /> Kênh Đối Tác & Nhà Xe
          </h2>
          <p className="text-slate-500">Quản lý đội xe, lịch trình và doanh thu.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <Plus className="h-5 w-5" /> Đăng ký chuyến mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Doanh thu tháng này" 
          value={`${currentMonthRevenue.toLocaleString()} đ`} 
          icon={DollarSign} 
          color="bg-emerald-500"
          subtext="+12% so với tháng trước"
        />
        <StatCard 
          title="Tổng vé đã bán" 
          value={totalBookings} 
          icon={Users} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Chuyến đang chạy" 
          value={activeTripsList.length} 
          icon={Bus} 
          color="bg-orange-500"
        />
        <StatCard 
          title="Chuyến chờ duyệt" 
          value={pendingTripsList.length} 
          icon={Clock} 
          color="bg-yellow-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-1 text-sm font-bold transition border-b-2 ${
            activeTab === 'active' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Đang hoạt động ({activeTripsList.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-1 text-sm font-bold transition border-b-2 ${
            activeTab === 'pending' 
              ? 'border-yellow-500 text-yellow-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Chờ duyệt ({pendingTripsList.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 px-1 text-sm font-bold transition border-b-2 ${
            activeTab === 'customers' 
              ? 'border-emerald-500 text-emerald-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Khách hàng ({allPartnerTickets.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'customers' ? (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-semibold">
                <tr>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Liên hệ</th>
                  <th className="p-4">Chuyến đi</th>
                  <th className="p-4">Ghế/Phòng</th>
                  <th className="p-4">Ngày đặt</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allPartnerTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Users className="h-10 w-10 opacity-50" />
                        <span>Chưa có khách hàng nào đặt vé.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  allPartnerTickets.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()).map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{ticket.userDetails?.name || 'Khách vãng lai'}</div>
                        <div className="text-xs text-slate-500">ID: {ticket.userId.substring(0, 8)}...</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-700">{ticket.userDetails?.email || '--'}</div>
                        <div className="text-slate-500 text-xs">{ticket.userDetails?.phone || '--'}</div>
                      </td>
                      <td className="p-4">
                        {ticket.tripDetails ? (
                          <>
                            <div className="font-medium text-slate-900">
                              {ticket.tripDetails.from} → {ticket.tripDetails.to}
                            </div>
                            <div className="text-xs text-slate-500">
                              {ticket.tripDetails.date} {ticket.tripDetails.time}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                      <td className="p-4 font-medium text-slate-900">
                        {ticket.seatNumber || ticket.roomType || '--'}
                      </td>
                      <td className="p-4 text-slate-700">
                        {new Date(ticket.bookingDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          ticket.status === 'BOOKED' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {ticket.status === 'BOOKED' ? 'Đã thanh toán' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {ticket.status === 'BOOKED' && onCancelTicket && (
                          <button 
                            onClick={() => onCancelTicket(ticket.id)}
                            className="text-xs px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                          >
                            Hủy vé
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-semibold">
                <tr>
                  <th className="p-4">Hành trình</th>
                  <th className="p-4">Phương tiện</th>
                  <th className="p-4">Thông tin vận hành</th>
                  <th className="p-4">Ngày giờ</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeTab === 'active' ? activeTripsList : pendingTripsList).length === 0 ? (
                   <tr>
                     <td colSpan={6} className="p-12 text-center">
                       <div className="flex flex-col items-center gap-3 text-slate-400">
                         <FileText className="h-10 w-10 opacity-50" />
                         <span>{activeTab === 'active' ? 'Chưa có chuyến đang hoạt động.' : 'Không có chuyến nào đang chờ duyệt.'}</span>
                       </div>
                     </td>
                   </tr>
                ) : (
                  (activeTab === 'active' ? activeTripsList : pendingTripsList).map((trip) => (
                    <tr key={trip.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {trip.from} <span className="text-slate-400">→</span> {trip.to}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold
                          ${trip.vehicleType === VehicleType.PLANE 
                            ? 'bg-sky-100 text-sky-700' 
                            : 'bg-orange-100 text-orange-700'}`}>
                          {trip.vehicleType}
                        </span>
                      </td>
                      <td className="p-4">
                        {trip.transportDetails ? (
                          <div className="text-xs space-y-1">
                            <div className="font-bold text-slate-700">{trip.transportDetails.plateNumber}</div>
                            <div className="flex items-center gap-1"><UserIcon size={12}/> {trip.transportDetails.driverName}</div>
                            <div className="text-slate-500">{trip.transportDetails.driverPhone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">--</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{trip.date}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {trip.time} ({trip.duration})
                        </div>
                      </td>
                      <td className="p-4">
                        {trip.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            <CheckCircle className="h-3 w-3" /> Đã duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                            <Clock className="h-3 w-3" /> Chờ duyệt
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTrip(trip.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Xóa chuyến"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Đăng ký chuyến đi mới</h3>
            <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-6 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              Lưu ý: Chuyến đi phải được đăng ký trước ít nhất 3 ngày. Sau khi đăng ký, chuyến đi sẽ ở trạng thái "Chờ duyệt" để Admin kiểm tra thông tin.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Lịch trình & Giá */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase">1. Thông tin lịch trình</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Điểm đi</label>
                    <input type="text" required value={from} onChange={e => setFrom(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Điểm đến</label>
                    <input type="text" required value={to} onChange={e => setTo(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày khởi hành (Min +3 ngày)</label>
                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giờ khởi hành</label>
                    <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Thời gian bay/chạy</label>
                    <input type="text" required value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" placeholder="VD: 5h 30m" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giá vé (VND)</label>
                    <input type="number" required min="0" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số ghế</label>
                     <input type="number" required min="1" max="500" value={totalSeats} onChange={e => setTotalSeats(Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50" />
                  </div>
                </div>
              </div>

              {/* Thông tin phương tiện */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase">2. Thông tin phương tiện & Tài xế</h4>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loại phương tiện</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[VehicleType.BUS, VehicleType.COACH, VehicleType.PLANE].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setVehicleType(t)}
                        className={`py-2 px-1 rounded-lg text-sm font-medium border transition ${vehicleType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      {vehicleType === VehicleType.PLANE ? 'Số hiệu chuyến bay (VN...)' : 'Biển số xe'}
                    </label>
                    <input type="text" required value={plateNumber} onChange={e => setPlateNumber(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" placeholder="VD: 29B-123.45 hoặc VN123" />
                  </div>
                   <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giấy tờ phương tiện</label>
                    <input type="text" required value={vehicleDoc} onChange={e => setVehicleDoc(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" placeholder="Nhập mã giấy tờ hoặc link ảnh" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      {vehicleType === VehicleType.PLANE ? 'Cơ trưởng' : 'Tên tài xế'}
                    </label>
                    <input type="text" required value={driverName} onChange={e => setDriverName(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SĐT liên hệ</label>
                    <input type="text" required value={driverPhone} onChange={e => setDriverPhone(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CCCD/CMND</label>
                    <input type="text" required value={driverId} onChange={e => setDriverId(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">Gửi duyệt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};