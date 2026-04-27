import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Users, Ticket, TrendingUp, DollarSign, CheckCircle, XCircle, Clock, Ban, Eye, Unlock, AlertTriangle } from 'lucide-react';
import { Trip, Ticket as TicketType, User, VehicleType } from '../types';

interface AdminDashboardProps {
  tickets: TicketType[];
  trips: Trip[];
  partners: User[];
  onApproveTrip: (tripId: string) => void;
  onRejectTrip: (tripId: string) => void;
  onBanPartner: (partnerId: string, durationDays: number | null) => void; // null = permanent
  onUnbanPartner: (partnerId: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  tickets, 
  trips, 
  partners,
  onApproveTrip, 
  onRejectTrip,
  onBanPartner,
  onUnbanPartner
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'partners'>('overview');
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banDuration, setBanDuration] = useState<string>('permanent'); // 'permanent' | '7' | '30'
  const [viewingPartnerTrips, setViewingPartnerTrips] = useState<Trip[] | null>(null);

  // Calculate stats
  const totalRevenue = tickets.reduce((acc, ticket) => {
    if (ticket.status === 'BOOKED' && ticket.tripDetails) {
      return acc + ticket.tripDetails.price;
    }
    return acc;
  }, 0);

  const activeTrips = trips.filter(t => t.status === 'APPROVED').length;
  const pendingTrips = trips.filter(t => t.status === 'PENDING');
  const ticketsSold = tickets.filter(t => t.status === 'BOOKED').length;

  // Mock data for Charts
  const weeklySalesData = [
    { name: 'T2', sales: 4000000 },
    { name: 'T3', sales: 3000000 },
    { name: 'T4', sales: 2000000 },
    { name: 'T5', sales: 2780000 },
    { name: 'T6', sales: 1890000 },
    { name: 'T7', sales: 6390000 },
    { name: 'CN', sales: 7490000 },
  ];

  const monthlyRevenueData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return {
      name: `T${d.getMonth() + 1}`,
      revenue: Math.floor(Math.random() * 50000000) + 20000000
    };
  });

  const vehicleDistribution = [
    { name: 'Xe Khách', value: 400 },
    { name: 'Máy Bay', value: 300 },
    { name: 'Bus VIP', value: 300 },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  );

  const handleBanSubmit = () => {
    if (selectedPartner) {
      const duration = banDuration === 'permanent' ? null : parseInt(banDuration);
      onBanPartner(selectedPartner.id, duration);
      setIsBanModalOpen(false);
      setSelectedPartner(null);
    }
  };

  const openPartnerTrips = (partner: User) => {
    const partnerTrips = trips.filter(t => t.partnerId === partner.id);
    setViewingPartnerTrips(partnerTrips);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Hệ thống quản trị</h2>
          <span className="text-sm text-slate-500">Xin chào, Admin</span>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'partners' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Quản lý Đối tác
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Tổng Doanh Thu" value={`${(totalRevenue).toLocaleString()} đ`} icon={DollarSign} color="bg-emerald-500" />
            <StatCard title="Vé Đã Bán" value={ticketsSold} icon={Ticket} color="bg-blue-500" />
            <StatCard title="Chuyến Đã Duyệt" value={activeTrips} icon={TrendingUp} color="bg-indigo-500" />
            <StatCard title="Chờ Duyệt" value={pendingTrips.length} icon={Clock} color="bg-yellow-500" />
          </div>

          {/* PENDING APPROVALS SECTION */}
          {pendingTrips.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 overflow-hidden animate-in fade-in slide-in-from-top-4">
              <div className="p-6 border-b border-yellow-100 bg-yellow-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-yellow-800 flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Yêu cầu phê duyệt chuyến mới ({pendingTrips.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-white text-slate-900 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-4">Đối tác/Nhà xe</th>
                      <th className="p-4">Thông tin xe/lái xe</th>
                      <th className="p-4">Hành trình</th>
                      <th className="p-4">Ngày giờ</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingTrips.map((trip) => {
                       // Find partner name if possible, or use ID
                       const partner = partners.find(p => p.id === trip.partnerId);
                       return (
                        <tr key={trip.id} className="hover:bg-slate-50 transition">
                          <td className="p-4">
                             <div className="font-bold text-slate-800">{partner ? partner.name : 'Unknown Partner'}</div>
                             <div className="text-xs text-slate-500">{trip.vehicleType} • {trip.partnerId?.substring(0,6)}...</div>
                          </td>
                          <td className="p-4">
                             {trip.transportDetails ? (
                               <div className="text-xs space-y-1">
                                 <div><strong>Biển/Số hiệu:</strong> {trip.transportDetails.plateNumber}</div>
                                 <div><strong>Lái xe:</strong> {trip.transportDetails.driverName}</div>
                                 <div><strong>SĐT:</strong> {trip.transportDetails.driverPhone}</div>
                                 <div className="text-blue-600 underline cursor-pointer">Xem giấy tờ</div>
                               </div>
                             ) : <span className="text-slate-400">Thiếu thông tin</span>}
                          </td>
                          <td className="p-4 font-medium text-slate-900">
                            {trip.from} → {trip.to}
                          </td>
                          <td className="p-4">
                            <div className="font-bold">{trip.date}</div>
                            <div className="text-xs">{trip.time} ({trip.duration})</div>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => onApproveTrip(trip.id)}
                                className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold hover:bg-green-200 transition flex items-center gap-1"
                              >
                                <CheckCircle className="h-4 w-4" /> Duyệt
                              </button>
                              <button 
                                onClick={() => onRejectTrip(trip.id)}
                                className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-bold hover:bg-red-200 transition flex items-center gap-1"
                              >
                                <XCircle className="h-4 w-4" /> Từ chối
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
             <div className="bg-white p-8 text-center rounded-xl border border-dashed border-slate-300">
               <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
               <p className="text-slate-500">Tất cả các chuyến đã được xử lý. Không có yêu cầu nào đang chờ duyệt.</p>
             </div>
          )}

          {/* Charts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Xu hướng doanh thu (12 tháng qua)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value: number) => [`${value.toLocaleString()} đ`, 'Doanh thu']} />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Doanh thu 7 ngày qua</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklySalesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value: number) => [`${value.toLocaleString()} đ`, 'Doanh thu']} />
                    <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Tỷ lệ đặt theo phương tiện</h3>
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={vehicleDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value">
                      {vehicleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* PARTNERS TAB */
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Danh sách Nhà xe & Hãng bay ({partners.length})</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-slate-600">
               <thead className="bg-slate-50 text-slate-900 font-semibold">
                 <tr>
                   <th className="p-4">Tên Đối Tác</th>
                   <th className="p-4">Liên hệ</th>
                   <th className="p-4">Trạng thái</th>
                   <th className="p-4">Thời hạn cấm</th>
                   <th className="p-4 text-center">Hành động</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {partners.map(partner => (
                   <tr key={partner.id} className="hover:bg-slate-50 transition">
                     <td className="p-4 font-medium text-slate-900">
                       {partner.name}
                       <div className="text-xs text-slate-400 font-normal">ID: {partner.id}</div>
                     </td>
                     <td className="p-4">
                       <div>{partner.email}</div>
                       <div className="text-xs text-slate-500">{partner.phone || 'Chưa cập nhật SĐT'}</div>
                     </td>
                     <td className="p-4">
                       {partner.status === 'BANNED' ? (
                         <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                           <Ban className="h-3 w-3" /> Đã khóa
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                           <CheckCircle className="h-3 w-3" /> Hoạt động
                         </span>
                       )}
                     </td>
                     <td className="p-4 text-xs">
                        {partner.status === 'BANNED' ? (
                          partner.banUntil ? `Đến ${new Date(partner.banUntil).toLocaleDateString()}` : 'Vĩnh viễn'
                        ) : '--'}
                     </td>
                     <td className="p-4 text-center">
                       <div className="flex justify-center gap-2">
                         <button 
                           onClick={() => openPartnerTrips(partner)}
                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                           title="Xem chi tiết các chuyến xe"
                         >
                           <Eye className="h-4 w-4" />
                         </button>
                         {partner.status === 'BANNED' ? (
                            <button 
                              onClick={() => onUnbanPartner(partner.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Mở khóa tài khoản"
                            >
                              <Unlock className="h-4 w-4" />
                            </button>
                         ) : (
                            <button 
                              onClick={() => {
                                setSelectedPartner(partner);
                                setIsBanModalOpen(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Khóa tài khoản (Ban)"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                         )}
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* Ban Modal */}
      {isBanModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
             <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
               <AlertTriangle className="h-6 w-6 text-red-500" />
               Khóa tài khoản đối tác
             </h3>
             <p className="text-slate-600 mb-4">
               Bạn đang thực hiện khóa tài khoản <strong>{selectedPartner.name}</strong>. Nhà xe này sẽ không thể đăng nhập và tạo chuyến mới.
             </p>
             <div className="mb-6">
               <label className="block text-sm font-medium text-slate-700 mb-2">Thời gian khóa</label>
               <select 
                 className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                 value={banDuration}
                 onChange={(e) => setBanDuration(e.target.value)}
               >
                 <option value="permanent">Vĩnh viễn</option>
                 <option value="7">7 Ngày</option>
                 <option value="30">30 Ngày</option>
                 <option value="90">3 Tháng</option>
               </select>
             </div>
             <div className="flex justify-end gap-3">
               <button 
                 onClick={() => setIsBanModalOpen(false)}
                 className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
               >
                 Hủy bỏ
               </button>
               <button 
                 onClick={handleBanSubmit}
                 className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-200"
               >
                 Xác nhận Khóa
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Partner Trips Modal */}
      {viewingPartnerTrips && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-2xl animate-in zoom-in-95 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
               <h3 className="text-xl font-bold text-slate-800">Danh sách chuyến xe đã duyệt</h3>
               <button onClick={() => setViewingPartnerTrips(null)} className="p-2 hover:bg-slate-100 rounded-full transition"><XCircle className="h-6 w-6 text-slate-400" /></button>
            </div>
            
            <div className="overflow-y-auto flex-1">
               {viewingPartnerTrips.length === 0 ? (
                 <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-xl">Nhà xe này chưa có chuyến nào được duyệt.</div>
               ) : (
                 <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-900 font-semibold sticky top-0">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Hành trình</th>
                        <th className="p-3">Ngày/Giờ</th>
                        <th className="p-3">Phương tiện</th>
                        <th className="p-3">Biển số</th>
                        <th className="p-3 text-right">Giá vé</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingPartnerTrips.map(trip => (
                        <tr key={trip.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-xs">{trip.id}</td>
                          <td className="p-3 font-medium text-slate-900">{trip.from} - {trip.to}</td>
                          <td className="p-3">{trip.date} <br/> <span className="text-xs text-slate-400">{trip.time}</span></td>
                          <td className="p-3">{trip.vehicleType}</td>
                          <td className="p-3">{trip.transportDetails?.plateNumber || '--'}</td>
                          <td className="p-3 text-right font-bold text-blue-600">{trip.price.toLocaleString()} đ</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};