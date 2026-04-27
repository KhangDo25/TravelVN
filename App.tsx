import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bus, 
  Plane, 
  Calendar, 
  MapPin, 
  Search, 
  User as UserIcon, 
  History, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  CheckCircle,
  LayoutDashboard,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  Lock,
  Loader2,
  Tag,
  Star,
  ArrowRight,
  Building2,
  Bed,
  Wifi,
  Coffee,
  Utensils,
  Info,
  Copy,
  TicketPercent,
  Home,
  Briefcase
} from 'lucide-react';
import { Trip, User, UserRole, VehicleType, Ticket, Hotel, TripStop } from './types';
import { AdminDashboard } from './components/AdminDashboard';
import { PartnerDashboard } from './components/PartnerDashboard';
import { Toast, ToastType } from './components/Toast';
import { TripDetailsModal } from './components/TripDetailsModal';

type AppView = 'home' | 'booking' | 'payment' | 'success' | 'history' | 'admin' | 'promotions' | 'partner';
type SearchMode = 'transport' | 'hotel';

// --- MOCK DATA GENERATORS ---
const CITIES = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Nha Trang', 'Đà Lạt', 'Hải Phòng', 'Cần Thơ'];

// Generate Mock Partners
const generatePartners = (): User[] => {
  return [
    { id: 'partner-1', name: 'Nhà Xe Thành Bưởi', email: 'partner1@travelvn.com', role: UserRole.PARTNER, status: 'ACTIVE', phone: '0909123456' },
    { id: 'partner-2', name: 'Hãng Xe Phương Trang', email: 'partner2@travelvn.com', role: UserRole.PARTNER, status: 'ACTIVE', phone: '0909654321' },
    { id: 'partner-3', name: 'Bamboo Airways', email: 'bamboo@travelvn.com', role: UserRole.PARTNER, status: 'ACTIVE', phone: '19001111' },
    { id: 'partner-4', name: 'VietJet Air', email: 'vietjet@travelvn.com', role: UserRole.PARTNER, status: 'ACTIVE', phone: '19002222' },
    { id: 'partner-bad', name: 'Xe Khách Kém Chất Lượng', email: 'bad@travelvn.com', role: UserRole.PARTNER, status: 'BANNED', banUntil: null, phone: '0900000000' }
  ];
};

const generateTripStops = (from: string, to: string, startTime: string, durationStr: string, type: VehicleType): TripStop[] => {
  const stops: TripStop[] = [];
  const [hours, minutes] = startTime.split(':').map(Number);
  const startTotalMinutes = hours * 60 + minutes;
  
  // Parse duration rough estimate (e.g., "5h 30m" -> minutes)
  const durHours = parseInt(durationStr.split('h')[0]) || 0;
  const durMins = parseInt(durationStr.split(' ')[1]?.replace('m', '')) || 0;
  const totalDurationMinutes = durHours * 60 + durMins;

  // 1. Pickup
  stops.push({
    id: 'stop-1',
    time: startTime,
    location: type === VehicleType.PLANE ? `Sân bay ${from}` : `Bến xe ${from}`,
    description: type === VehicleType.PLANE ? 'Check-in và làm thủ tục.' : 'Đón khách và xếp hành lý.',
    type: 'PICKUP'
  });

  // 2. Middle stops (Rest/Meal) - Only for long road trips
  if (type !== VehicleType.PLANE && totalDurationMinutes > 240) { // > 4 hours
    const restTimeMinutes = startTotalMinutes + Math.floor(totalDurationMinutes / 2);
    const rh = Math.floor(restTimeMinutes / 60) % 24;
    const rm = restTimeMinutes % 60;
    stops.push({
      id: 'stop-2',
      time: `${rh.toString().padStart(2, '0')}:${rm.toString().padStart(2, '0')}`,
      location: 'Trạm dừng nghỉ',
      description: 'Nghỉ ngơi, ăn uống và vệ sinh cá nhân (30 phút).',
      type: 'MEAL'
    });
  }

  // 3. Dropoff
  const endTotalMinutes = startTotalMinutes + totalDurationMinutes;
  const eh = Math.floor(endTotalMinutes / 60) % 24;
  const em = endTotalMinutes % 60;

  stops.push({
    id: 'stop-end',
    time: `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`,
    location: type === VehicleType.PLANE ? `Sân bay ${to}` : `Bến xe ${to}`,
    description: 'Trả khách, kết thúc hành trình.',
    type: 'DROP'
  });

  return stops;
};

const generateTrips = (): Trip[] => {
  const trips: Trip[] = [];
  const roadVehicles = [VehicleType.BUS, VehicleType.COACH];
  
  // Generate Bus/Coach trips
  for (let i = 0; i < 60; i++) {
    const from = CITIES[Math.floor(Math.random() * CITIES.length)];
    let to = CITIES[Math.floor(Math.random() * CITIES.length)];
    while (to === from) to = CITIES[Math.floor(Math.random() * CITIES.length)];

    const type = roadVehicles[Math.floor(Math.random() * roadVehicles.length)];
    const time = `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`;
    const duration = `${4 + Math.floor(Math.random() * 8)}h ${Math.random() > 0.5 ? '00' : '30'}m`;

    // Assign to mock partners (1 or 2)
    const partnerId = Math.random() > 0.5 ? 'partner-1' : 'partner-2';

    trips.push({
      id: `trip-road-${i}`,
      from,
      to,
      date: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time,
      price: Math.floor(150000 + Math.random() * 400000), // 150k - 550k
      vehicleId: `v-road-${i}`,
      vehicleType: type,
      duration,
      availableSeats: Math.floor(Math.random() * 20) + 5,
      totalSeats: 40,
      stops: generateTripStops(from, to, time, duration, type),
      amenities: ['Wifi', 'Nước uống', 'Cổng sạc', 'Bảo hiểm', type === VehicleType.COACH ? 'Chăn đắp' : ''],
      status: 'APPROVED', 
      partnerId: partnerId,
      transportDetails: {
        plateNumber: `29B-${Math.floor(100 + Math.random() * 900)}.${Math.floor(10 + Math.random() * 90)}`,
        driverName: 'Nguyễn Văn Tài',
        driverPhone: '0912345678',
        driverId: '00109000xxxx',
        vehicleDoc: 'doc_verified.png'
      }
    });
  }

  // Generate Plane trips
  for (let i = 0; i < 40; i++) {
    const from = CITIES[Math.floor(Math.random() * CITIES.length)];
    let to = CITIES[Math.floor(Math.random() * CITIES.length)];
    while (to === from) to = CITIES[Math.floor(Math.random() * CITIES.length)];

    const time = `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`;
    const duration = `1h ${15 + Math.floor(Math.random() * 4) * 15}m`;

    // Assign to mock partners (3 or 4)
    const partnerId = Math.random() > 0.5 ? 'partner-3' : 'partner-4';

    trips.push({
      id: `trip-air-${i}`,
      from,
      to,
      date: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time,
      price: Math.floor(1200000 + Math.random() * 2000000), // 1.2m - 3.2m
      vehicleId: `v-air-${i}`,
      vehicleType: VehicleType.PLANE,
      duration,
      availableSeats: Math.floor(Math.random() * 50) + 10,
      totalSeats: 180,
      stops: generateTripStops(from, to, time, duration, VehicleType.PLANE),
      amenities: ['Suất ăn', 'Nước uống', 'Bảo hiểm', 'Tạp chí'],
      status: 'APPROVED',
      partnerId: partnerId,
      transportDetails: {
        plateNumber: `VN${Math.floor(100 + Math.random() * 900)}`,
        driverName: 'Captain Tùng',
        driverPhone: 'N/A',
        driverId: 'N/A',
        vehicleDoc: 'airline_cert.png'
      }
    });
  }
  
  return trips.sort((a, b) => a.time.localeCompare(b.time));
};

const generateHotels = (): Hotel[] => {
  const hotels: Hotel[] = [];
  const hotelNames = ['Grand Hotel', 'Sunrise Resort', 'Blue Sky Hotel', 'City View Hostel', 'Luxury Palace', 'Ocean Breeze'];
  const amenitiesList = ['Wifi', 'Pool', 'Breakfast', 'Gym', 'Spa', 'Bar'];
  const images = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80'
  ];

  for (let i = 0; i < 50; i++) {
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    // Randomly assign 0 available rooms to some hotels to test "Sold Out"
    const isSoldOut = Math.random() > 0.85;
    hotels.push({
      id: `hotel-${i}`,
      name: `${hotelNames[Math.floor(Math.random() * hotelNames.length)]} ${city}`,
      city: city,
      address: `${Math.floor(Math.random() * 200) + 1} Đường Nguyễn Huệ, ${city}`,
      pricePerNight: Math.floor(500000 + Math.random() * 3000000),
      rating: 3 + Math.random() * 2,
      image: images[Math.floor(Math.random() * images.length)],
      amenities: amenitiesList.filter(() => Math.random() > 0.4),
      availableRooms: isSoldOut ? 0 : Math.floor(Math.random() * 20) + 2,
      distance: Math.floor(Math.random() * 10) + 1
    });
  }
  return hotels;
};

// --- SUB-COMPONENTS ---

const Navbar = ({ 
  user, 
  onLogout, 
  onLoginClick,
  currentView,
  setView 
}: { 
  user: User | null, 
  onLogout: () => void, 
  onLoginClick: () => void,
  currentView: AppView,
  setView: (v: AppView) => void
}) => (
  <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 transition-all duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center cursor-pointer group" onClick={() => setView('home')}>
          <div className="bg-blue-600 p-2 rounded-lg mr-2 group-hover:bg-blue-700 transition">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">TravelVN</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => setView('home')} 
            className={`text-sm font-medium transition ${currentView === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Trang chủ
          </button>
          
          <button 
            onClick={() => setView('promotions')} 
            className={`text-sm font-medium flex items-center gap-1 transition ${currentView === 'promotions' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <TicketPercent className="h-4 w-4" /> Ưu đãi
          </button>

          {user ? (
            <>
              {user.role === UserRole.ADMIN ? (
                 <button 
                   onClick={() => setView('admin')} 
                   className={`text-sm font-medium flex items-center gap-1 transition ${currentView === 'admin' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                 >
                   <LayoutDashboard className="h-4 w-4" /> Quản trị
                 </button>
              ) : user.role === UserRole.PARTNER ? (
                 <button 
                   onClick={() => setView('partner')} 
                   className={`text-sm font-medium flex items-center gap-1 transition ${currentView === 'partner' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                 >
                   <Briefcase className="h-4 w-4" /> Kênh đối tác
                 </button>
              ) : (
                <button 
                  onClick={() => setView('history')} 
                  className={`text-sm font-medium flex items-center gap-1 transition ${currentView === 'history' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <History className="h-4 w-4" /> Vé của tôi
                </button>
              )}
              
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    {user.role === UserRole.ADMIN ? 'Administrator' : user.role === UserRole.PARTNER ? 'Partner' : 'Member'}
                  </p>
                </div>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold border ${
                  user.role === UserRole.PARTNER 
                    ? 'bg-purple-100 text-purple-600 border-purple-200' 
                    : 'bg-blue-100 text-blue-600 border-blue-200'
                }`}>
                  {user.name.charAt(0)}
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                  title="Đăng xuất"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2"
            >
              <UserIcon className="h-4 w-4" />
              Đăng Nhập
            </button>
          )}
        </div>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-blue-600 p-1.5 rounded-md">
                <Bus className="h-5 w-5 text-white" />
             </div>
             <span className="font-bold text-xl text-white">TravelVN</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Nền tảng đặt vé xe, máy bay và khách sạn hàng đầu Việt Nam. Kết nối hàng triệu hành trình mỗi năm.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Về chúng tôi</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Giới thiệu</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Tuyển dụng</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Tin tức</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Liên hệ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Câu hỏi thường gặp</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Điều khoản sử dụng</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Hướng dẫn đặt vé</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Kết nối</h4>
          <div className="flex gap-4 mb-4">
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 transition"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-pink-600 transition"><Instagram className="h-5 w-5" /></a>
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-sky-500 transition"><Twitter className="h-5 w-5" /></a>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@travelvn.com</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1900 123 456</div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
        &copy; 2024 TravelVN. All rights reserved.
      </div>
    </div>
  </footer>
);

interface SearchHeroProps {
  onSearch: (mode: SearchMode, criteria: any) => void;
}

const SearchHero: React.FC<SearchHeroProps> = ({ onSearch }) => {
  const [mode, setMode] = useState<SearchMode>('transport');
  
  // Transport State
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('all');
  const [timeRange, setTimeRange] = useState('all');

  // Hotel State
  const [hotelCity, setHotelCity] = useState('');
  const [checkIn, setCheckIn] = useState('');

  const handleSearchClick = () => {
    if (mode === 'transport') {
      onSearch('transport', { from, to, date, type, timeRange });
    } else {
      onSearch('hotel', { city: hotelCity, checkIn });
    }
  };

  return (
    <div className="relative bg-slate-900 py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={mode === 'transport' 
            ? "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            : "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          }
          alt="Travel background" 
          className="w-full h-full object-cover opacity-40 scale-105 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="text-center mb-8 max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
            {mode === 'transport' ? 'Vi vu muôn nơi' : 'Nghỉ dưỡng tuyệt vời'} <br/> 
            <span className="text-blue-400">{mode === 'transport' ? 'Cùng TravelVN' : 'Tại khách sạn đẳng cấp'}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 drop-shadow-sm">
            {mode === 'transport' 
              ? 'Đặt vé xe khách, xe bus và máy bay nhanh chóng với mạng lưới rộng khắp.' 
              : 'Hàng ngàn khách sạn, resort giá tốt đang chờ đón bạn.'}
          </p>
        </div>

        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
          
          {/* Tabs */}
          <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-2">
            <button 
              onClick={() => setMode('transport')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${mode === 'transport' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Bus className="h-5 w-5" /> Vé xe & Máy bay
            </button>
            <button 
              onClick={() => setMode('hotel')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${mode === 'hotel' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Building2 className="h-5 w-5" /> Khách sạn
            </button>
          </div>

          {mode === 'transport' ? (
            /* TRANSPORT FORM */
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative group">
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wide">Điểm đi</label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200 group-focus-within:ring-2 ring-blue-500 transition">
                    <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                    <select 
                      className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none cursor-pointer"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                    >
                      <option value="">Chọn nơi đi</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wide">Điểm đến</label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200 group-focus-within:ring-2 ring-blue-500 transition">
                    <MapPin className="h-5 w-5 text-red-500 mr-2" />
                    <select 
                      className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none cursor-pointer"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                    >
                      <option value="">Chọn nơi đến</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wide">Ngày đi</label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200 group-focus-within:ring-2 ring-blue-500 transition">
                    <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                    <input 
                      type="date" 
                      className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none cursor-pointer"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wide">Phương tiện</label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200 group-focus-within:ring-2 ring-blue-500 transition">
                    <Bus className="h-5 w-5 text-indigo-500 mr-2" />
                    <select 
                      className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none cursor-pointer"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="all">Tất cả phương tiện</option>
                      <option value={VehicleType.BUS}>{VehicleType.BUS}</option>
                      <option value={VehicleType.COACH}>{VehicleType.COACH}</option>
                      <option value={VehicleType.PLANE}>{VehicleType.PLANE}</option>
                    </select>
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wide">Giờ khởi hành</label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200 group-focus-within:ring-2 ring-blue-500 transition">
                    <Clock className="h-5 w-5 text-orange-500 mr-2" />
                    <select 
                      className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none cursor-pointer"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="all">Tất cả khung giờ</option>
                      <option value="00:00-06:00">Sáng sớm (00:00 - 06:00)</option>
                      <option value="06:00-12:00">Buổi sáng (06:00 - 12:00)</option>
                      <option value="12:00-18:00">Buổi chiều (12:00 - 18:00)</option>
                      <option value="18:00-23:59">Buổi tối (18:00 - 24:00)</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={handleSearchClick}
                    className="w-full h-[50px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl flex items-center justify-center transition shadow-lg shadow-blue-200 hover:shadow-blue-300 transform active:scale-95"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Tìm kiếm ngay
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* HOTEL FORM */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group">
                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wide">Điểm đến / Thành phố</label>
                <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200 group-focus-within:ring-2 ring-blue-500 transition">
                  <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                  <select 
                    className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none cursor-pointer"
                    value={hotelCity}
                    onChange={(e) => setHotelCity(e.target.value)}
                  >
                    <option value="">Chọn thành phố</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="relative group">
                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wide">Ngày nhận phòng</label>
                <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200 group-focus-within:ring-2 ring-blue-500 transition">
                  <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                  <input 
                    type="date" 
                    className="bg-transparent w-full text-slate-800 font-semibold focus:outline-none cursor-pointer"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleSearchClick}
                  className="w-full h-[50px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl flex items-center justify-center transition shadow-lg shadow-blue-200 hover:shadow-blue-300 transform active:scale-95"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Tìm khách sạn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PromotionProps {
  onCopy: (code: string) => void;
}

const PromotionSection: React.FC<PromotionProps> = ({ onCopy }) => (
  <div className="py-12">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Tag className="h-6 w-6 text-red-500" />
        Ưu đãi nổi bật
      </h2>
      <a href="#" className="text-blue-600 font-medium hover:underline text-sm">Xem tất cả</a>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { title: 'Giảm 20% vé máy bay', code: 'FLY20', color: 'bg-blue-500' },
        { title: 'Giảm 50k vé xe khách', code: 'BUS50', color: 'bg-orange-500' },
        { title: 'Combo Khách sạn Hè', code: 'HOTEL2024', color: 'bg-purple-500' }
      ].map((promo, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition">
           <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${promo.color} transition-transform group-hover:scale-110`}></div>
           <h3 className="text-lg font-bold text-slate-800 mb-1">{promo.title}</h3>
           <p className="text-sm text-slate-500 mb-4">Áp dụng cho mọi hành trình trong tháng này.</p>
           <div className="flex items-center gap-2">
             <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-mono font-bold border border-slate-200 border-dashed">
               {promo.code}
             </span>
             <button 
              onClick={() => onCopy(promo.code)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
             >
               <Copy className="h-3 w-3" /> Sao chép
             </button>
           </div>
        </div>
      ))}
    </div>
  </div>
);

const PopularDestinations = () => (
  <div className="py-12 border-t border-slate-200">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Star className="h-6 w-6 text-yellow-500" />
        Điểm đến hàng đầu
      </h2>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[
        { name: 'Đà Nẵng', img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=500&q=60' },
        { name: 'Hội An', img: 'https://images.unsplash.com/photo-1545638531-9f93310023a9?auto=format&fit=crop&w=500&q=60' },
        { name: 'Đà Lạt', img: 'https://images.unsplash.com/photo-1553503977-6f9473855e92?auto=format&fit=crop&w=500&q=60' },
        { name: 'Phú Quốc', img: 'https://images.unsplash.com/photo-1540202404-a6f646352c40?auto=format&fit=crop&w=500&q=60' }
      ].map((dest, i) => (
        <div key={i} className="group relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer">
          <img 
            src={dest.img} 
            alt={dest.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
            <div className="absolute bottom-4 left-4">
              <span className="text-white font-bold text-xl">{dest.name}</span>
              <div className="flex items-center gap-1 text-white/80 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                <span>Khám phá ngay</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TripCard: React.FC<{ trip: Trip, onBook: (t: Trip) => void, onViewDetails: (t: Trip) => void }> = ({ trip, onBook, onViewDetails }) => {
  const isPlane = trip.vehicleType === VehicleType.PLANE;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition duration-200">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        
        <div className="flex gap-4 items-center">
          <div className={`p-3 rounded-xl ${isPlane ? 'bg-sky-100 text-sky-600' : 'bg-orange-100 text-orange-600'}`}>
            {isPlane ? <Plane className="h-6 w-6" /> : <Bus className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg text-slate-800">{trip.time}</span>
              <div className="h-[2px] w-8 bg-slate-200"></div>
              <span className="text-sm text-slate-500">{trip.duration}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <span className="font-medium">{trip.from}</span>
              <span className="text-slate-400">→</span>
              <span className="font-medium">{trip.to}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{trip.vehicleType} • {trip.date}</p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
          <div className="text-right">
            <span className="block text-xs text-slate-500">Giá vé từ</span>
            <span className="block text-xl font-bold text-blue-600">{trip.price.toLocaleString()} đ</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => onViewDetails(trip)}
              className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-2 rounded-lg text-sm font-semibold transition"
              title="Xem chi tiết"
            >
              <Info className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onBook(trip)}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Chọn chuyến
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HotelCard: React.FC<{ hotel: Hotel, onBook: (h: Hotel) => void }> = ({ hotel, onBook }) => {
  const isSoldOut = hotel.availableRooms === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition duration-200 flex flex-col md:flex-row h-full">
      <div className="w-full md:w-1/3 h-48 md:h-auto relative">
        <img src={hotel.image} alt={hotel.name} className={`w-full h-full object-cover ${isSoldOut ? 'grayscale' : ''}`} />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {hotel.rating.toFixed(1)}
        </div>
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
             <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm transform -rotate-12 border-2 border-white">HẾT PHÒNG</span>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">{hotel.name}</h3>
          <div className="flex items-start gap-1 text-slate-500 text-sm mb-1">
             <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
             <span>{hotel.address}</span>
          </div>
          <div className="text-xs text-slate-400 mb-3">
            Cách trung tâm {hotel.distance} km
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {hotel.amenities.slice(0, 4).map((am, i) => (
              <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                {am}
              </span>
            ))}
            {hotel.amenities.length > 4 && <span className="text-xs text-slate-400 pt-1">+{hotel.amenities.length - 4}</span>}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-2">
           <div className={`text-xs font-bold ${isSoldOut ? 'text-red-500' : 'text-green-600'}`}>
             {isSoldOut ? 'Hết phòng' : `Còn ${hotel.availableRooms} phòng`}
           </div>
           <div className="text-right">
             <div className="text-lg font-bold text-blue-600">{hotel.pricePerNight.toLocaleString()} đ</div>
             <div className="text-xs text-slate-400">/ đêm</div>
           </div>
           <button 
             disabled={isSoldOut}
             onClick={() => onBook(hotel)}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition
                ${isSoldOut 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
           >
             {isSoldOut ? 'Hết phòng' : 'Đặt phòng'}
           </button>
        </div>
      </div>
    </div>
  );
};

const SeatSelector = ({ trip, onConfirm }: { trip: Trip, onConfirm: (seats: string[]) => void }) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  // Generate simple grid
  const rows = ['A', 'B', 'C', 'D'];
  const cols = 5;

  const toggleSeat = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(prev => prev.filter(s => s !== seat));
    } else {
      if (selectedSeats.length >= 5) {
        alert("Bạn chỉ được đặt tối đa 5 vé một lần");
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-800">Chọn ghế ngồi</h3>
        <p className="text-slate-500 text-sm">{trip.vehicleType} - {trip.from} tới {trip.to}</p>
      </div>
      
      <div className="p-8">
        <div className="flex justify-center gap-8 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-200"></div>
            <span className="text-sm text-slate-600">Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600"></div>
            <span className="text-sm text-slate-600">Đang chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-400 opacity-50"></div>
            <span className="text-sm text-slate-600">Đã bán</span>
          </div>
        </div>

        <div className="grid gap-4 justify-center">
          {rows.map(row => (
            <div key={row} className="flex gap-4">
              {Array.from({ length: cols }).map((_, idx) => {
                const seatId = `${row}${idx + 1}`;
                const isSelected = selectedSeats.includes(seatId);
                const isSold = Math.random() > 0.8; // Mock sold status

                return (
                  <button
                    key={seatId}
                    disabled={isSold}
                    onClick={() => toggleSeat(seatId)}
                    className={`w-10 h-10 rounded-lg text-xs font-bold transition flex items-center justify-center
                      ${isSold 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : isSelected 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                          : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                  >
                    {seatId}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 p-6 flex justify-between items-center">
        <div>
          <span className="block text-sm text-slate-500">Ghế đã chọn: {selectedSeats.join(', ') || 'Chưa chọn'}</span>
          <span className="block text-lg font-bold text-blue-600">Tổng: {(selectedSeats.length * trip.price).toLocaleString()} đ</span>
        </div>
        <button
          disabled={selectedSeats.length === 0}
          onClick={() => onConfirm(selectedSeats)}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

// --- LOGIN FORM ---

const AuthModal = ({ onClose, onLogin }: { onClose: () => void, onLogin: (user: User) => void }) => {
  const [activeTab, setActiveTab] = useState<'user' | 'partner'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Logic for authentication
      if (email === 'admin@gmail.com' && password === 'admin99') {
        const adminUser: User = {
          id: 'admin-1',
          name: 'Administrator',
          email: email,
          role: UserRole.ADMIN,
          status: 'ACTIVE'
        };
        onLogin(adminUser);
      } else if (activeTab === 'partner') {
        // Partner login logic
        const partnerAccounts = generatePartners();
        
        // For backwards compatibility with previous demo, also allow partner@travelvn.com for Thành Bưởi
        const targetEmail = email === 'partner@travelvn.com' ? 'partner1@travelvn.com' : email;
        
        const foundPartner = partnerAccounts.find(p => p.email === targetEmail);
        
        if (foundPartner && password === 'partner99') {
          onLogin(foundPartner as User);
        } else {
          setError('Email hoặc mật khẩu đối tác không đúng. (Mật khẩu mặc định: partner99)');
        }
      } else {
        // Regular user login
        if (email.includes('@travelvn.com')) {
            setError('Tài khoản đối tác vui lòng đăng nhập bên tab Đối tác.');
            setLoading(false);
            return;
        }

        const newUser: User = {
          id: Math.random().toString(),
          name: 'Nguyễn Văn A',
          email: email,
          role: UserRole.USER,
          status: 'ACTIVE'
        };
        onLogin(newUser);
      }
      setLoading(false);
    }, 1500);
  };

  const isUserTab = activeTab === 'user';
  const themeColor = isUserTab ? 'blue' : 'purple';
  const Icon = isUserTab ? UserIcon : Briefcase;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center mb-6">
          <div className={`bg-${themeColor}-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300`}>
             <Icon className={`h-6 w-6 text-${themeColor}-600 transition-colors duration-300`} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Đăng nhập</h2>
          <p className="text-slate-500 text-sm mt-1">Chào mừng bạn quay trở lại với TravelVN</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => { setActiveTab('user'); setError(''); }}
            className={`py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'user' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Khách hàng
          </button>
          <button
            onClick={() => { setActiveTab('partner'); setError(''); }}
            className={`py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'partner' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Đối tác / Nhà xe
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
             <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
             <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent transition`}
                  placeholder="name@example.com"
                />
             </div>
           </div>
           
           <div>
             <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mật khẩu</label>
             <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent transition`}
                  placeholder="••••••••"
                />
             </div>
           </div>

           {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}

           <div className="flex items-center justify-between text-sm">
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" className={`rounded border-slate-300 text-${themeColor}-600 focus:ring-${themeColor}-500`} />
               <span className="text-slate-600">Ghi nhớ đăng nhập</span>
             </label>
             <a href="#" className={`text-${themeColor}-600 hover:underline`}>Quên mật khẩu?</a>
           </div>

           <button 
             type="submit"
             disabled={loading}
             className={`w-full bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-${themeColor}-200 flex items-center justify-center gap-2 disabled:opacity-70`}
           >
             {loading && <Loader2 className="h-4 w-4 animate-spin" />}
             {loading ? 'Đang xử lý...' : `Đăng nhập ${isUserTab ? '' : 'Đối tác'}`}
           </button>
        </form>

        <div className="mt-6 text-center">
           <p className="text-xs text-slate-400 mb-2">Hoặc tiếp tục với</p>
           <div className="flex justify-center gap-3">
             <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"><Facebook className={`h-5 w-5 text-${themeColor}-600`} /></button>
             <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"><Mail className="h-5 w-5 text-red-500" /></button>
           </div>
        </div>
        
        <div className="text-center text-sm text-slate-500 mt-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
          {activeTab === 'user' ? (
             <>
                <div>Admin: <strong>admin@gmail.com / admin99</strong></div>
                <div className="mt-1 text-xs text-slate-400">Hoặc nhập email bất kỳ để đăng nhập khách hàng</div>
             </>
          ) : (
             <>
                <div>Thành Bưởi: <strong>partner1@travelvn.com</strong></div>
                <div>Phương Trang: <strong>partner2@travelvn.com</strong></div>
                <div>Bamboo: <strong>bamboo@travelvn.com</strong></div>
                <div>VietJet: <strong>vietjet@travelvn.com</strong></div>
                <div className="mt-1 text-xs text-slate-400">Mật khẩu chung: <strong>partner99</strong></div>
             </>
          )}
        </div>
      </div>
    </div>
  );
}

const PromotionsPage: React.FC<{ onCopy: (code: string) => void }> = ({ onCopy }) => {
  const promotions = [
    { title: 'Giảm 20% vé máy bay', code: 'FLY20', color: 'bg-blue-500', desc: 'Áp dụng cho mọi chuyến bay nội địa.', validUntil: '30/04/2026' },
    { title: 'Giảm 50k vé xe khách', code: 'BUS50', color: 'bg-orange-500', desc: 'Áp dụng cho các tuyến xe khách đường dài.', validUntil: '15/05/2026' },
    { title: 'Combo Khách sạn Hè', code: 'HOTEL2024', color: 'bg-purple-500', desc: 'Giảm 15% khi đặt phòng từ 3 đêm trở lên.', validUntil: '31/08/2026' },
    { title: 'Chào bạn mới', code: 'NEWBIE100', color: 'bg-emerald-500', desc: 'Giảm 100k cho đơn hàng đầu tiên trên TravelVN.', validUntil: 'Không giới hạn' },
    { title: 'Flash Sale Cuối Tuần', code: 'WEEKEND', color: 'bg-rose-500', desc: 'Giảm thêm 10% khi đặt vé vào Thứ 7, Chủ Nhật.', validUntil: 'Mỗi cuối tuần' },
    { title: 'Ưu đãi thành viên VIP', code: 'VIPPRO', color: 'bg-amber-500', desc: 'Giảm 5% mọi dịch vụ cho hạng thẻ Vàng trở lên.', validUntil: '31/12/2026' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-3">
          <TicketPercent className="h-10 w-10 text-red-500" />
          Kho Ưu Đãi Độc Quyền
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Khám phá hàng ngàn mã giảm giá và chương trình khuyến mãi hấp dẫn chỉ có tại TravelVN. Đặt vé ngay, tiết kiệm liền tay!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {promotions.map((promo, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
             <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 ${promo.color} transition-transform duration-500 group-hover:scale-125`}></div>
             
             <div className="flex justify-between items-start mb-4 relative z-10">
               <div className={`w-12 h-12 rounded-xl ${promo.color} bg-opacity-10 flex items-center justify-center text-${promo.color.replace('bg-', '')}`}>
                 <Tag className="h-6 w-6" />
               </div>
               <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                 HSD: {promo.validUntil}
               </span>
             </div>

             <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{promo.title}</h3>
             <p className="text-slate-500 mb-6 text-sm relative z-10 h-10">{promo.desc}</p>
             
             <div className="flex items-center justify-between pt-4 border-t border-slate-100 border-dashed relative z-10">
               <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 border-dashed">
                 <span className="font-mono font-bold text-slate-700 tracking-wider">{promo.code}</span>
               </div>
               <button 
                onClick={() => onCopy(promo.code)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
               >
                 <Copy className="h-4 w-4" /> Lưu mã
               </button>
             </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h2 className="text-3xl font-bold mb-4 relative z-10">Bạn chưa tìm thấy ưu đãi phù hợp?</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto relative z-10">
          Đăng ký nhận bản tin để không bỏ lỡ bất kỳ chương trình khuyến mãi nào từ TravelVN. Chúng tôi sẽ gửi mã giảm giá trực tiếp vào email của bạn.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto relative z-10">
          <input 
            type="email" 
            placeholder="Nhập email của bạn..." 
            className="px-6 py-3 rounded-full text-slate-800 w-full focus:outline-none focus:ring-4 focus:ring-blue-400/50"
          />
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors whitespace-nowrap shadow-md">
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

function App() {
  const [view, setView] = useState<AppView>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  
  // Data State
  const [allTrips, setAllTrips] = useState<Trip[]>(generateTrips());
  const [partners, setPartners] = useState<User[]>(generatePartners()); // Manage Partners State
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  
  const [allHotels] = useState<Hotel[]>(generateHotels());
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [suggestedHotels, setSuggestedHotels] = useState<Hotel[]>([]); // Hotels suggested after trip search

  const [searchMode, setSearchMode] = useState<SearchMode>('transport');
  const [currentSearchType, setCurrentSearchType] = useState('all'); 
  const [isSearching, setIsSearching] = useState(false); 
  
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  
  // New State for viewing details
  const [viewingTripDetails, setViewingTripDetails] = useState<Trip | null>(null);

  const [bookingSeats, setBookingSeats] = useState<string[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cancellingTicketId, setCancellingTicketId] = useState<string | null>(null);

  // Hotel filtering and sorting state
  const [hotelSortBy, setHotelSortBy] = useState<'price_asc' | 'price_desc' | 'rating_desc' | 'distance_asc'>('price_asc');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const displayedHotels = useMemo(() => {
    let result = [...filteredHotels];
    if (selectedAmenities.length > 0) {
      result = result.filter(hotel => 
        selectedAmenities.every(amenity => hotel.amenities.includes(amenity))
      );
    }
    result.sort((a, b) => {
      if (hotelSortBy === 'price_asc') return a.pricePerNight - b.pricePerNight;
      if (hotelSortBy === 'price_desc') return b.pricePerNight - a.pricePerNight;
      if (hotelSortBy === 'rating_desc') return b.rating - a.rating;
      if (hotelSortBy === 'distance_asc') return a.distance - b.distance;
      return 0;
    });
    return result;
  }, [filteredHotels, selectedAmenities, hotelSortBy]);

  // Notification State
  const [notification, setNotification] = useState<{ message: string, type: ToastType } | null>(null);

  const showNotification = (message: string, type: ToastType = 'info') => {
    setNotification({ message, type });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showNotification(`Đã sao chép mã giảm giá: ${code}`, 'success');
  };

  // Initial Load
  useEffect(() => {
    // Only show Approved trips to users
    setFilteredTrips(allTrips.filter(t => t.status === 'APPROVED'));
    setFilteredHotels(allHotels);
  }, [allTrips, allHotels]);

  // Handle Add Trip for Partners
  const handleAddTrip = (tripData: any) => {
    if (!user || user.status === 'BANNED') {
      showNotification('Tài khoản của bạn đã bị khóa hoặc không có quyền thực hiện.', 'error');
      return;
    }
    
    const newTrip: Trip = {
      id: `trip-partner-${Date.now()}`,
      ...tripData,
      vehicleId: `v-partner-${Date.now()}`,
      availableSeats: tripData.totalSeats,
      stops: generateTripStops(tripData.from, tripData.to, tripData.time, tripData.duration, tripData.vehicleType),
      amenities: ['Wifi', 'Nước uống', 'Cổng sạc', 'Bảo hiểm'],
      status: 'PENDING',
      partnerId: user.id
    };
    
    setAllTrips(prev => [newTrip, ...prev]);
    showNotification('Đã gửi yêu cầu tạo chuyến! Vui lòng chờ Admin duyệt.', 'success');
  };
  
  const handleDeleteTrip = (tripId: string) => {
    setAllTrips(prev => prev.filter(t => t.id !== tripId));
    showNotification('Đã xóa chuyến đi thành công.', 'success');
  };

  const handleApproveTrip = (tripId: string) => {
    setAllTrips(prev => prev.map(t => 
      t.id === tripId ? { ...t, status: 'APPROVED' } : t
    ));
    showNotification('Đã phê duyệt chuyến đi thành công.', 'success');
  };

  const handleRejectTrip = (tripId: string) => {
    setAllTrips(prev => prev.filter(t => t.id !== tripId));
    showNotification('Đã từ chối chuyến đi.', 'info');
  };

  const handleBanPartner = (partnerId: string, durationDays: number | null) => {
    setPartners(prev => prev.map(p => {
       if (p.id === partnerId) {
          const banUntil = durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString() : null;
          return { ...p, status: 'BANNED', banUntil };
       }
       return p;
    }));
    showNotification('Đã khóa tài khoản đối tác thành công.', 'success');
  };

  const handleUnbanPartner = (partnerId: string) => {
    setPartners(prev => prev.map(p => 
      p.id === partnerId ? { ...p, status: 'ACTIVE', banUntil: null } : p
    ));
    showNotification('Đã mở khóa tài khoản đối tác.', 'success');
  };

  const handleSearch = (mode: SearchMode, criteria: any) => {
    setIsSearching(true);
    setSearchMode(mode);

    if (mode === 'transport') {
      const { from, to, date, type, timeRange } = criteria;
      setCurrentSearchType(type); 
      // Filter only approved trips
      let results = allTrips.filter(t => t.status === 'APPROVED');
      
      if (from) results = results.filter(t => t.from === from);
      if (to) results = results.filter(t => t.to === to);
      if (date) results = results.filter(t => t.date === date);
      
      if (type && type !== 'all') {
        results = results.filter(t => t.vehicleType === type);
      }

      if (timeRange && timeRange !== 'all') {
        const [startStr, endStr] = timeRange.split('-');
        const start = parseInt(startStr.replace(':', ''));
        const end = parseInt(endStr.replace(':', ''));
        
        results = results.filter(t => {
          const tripTime = parseInt(t.time.replace(':', ''));
          return tripTime >= start && tripTime <= end;
        });
      }

      setFilteredTrips(results);

      // Filter hotels for suggestion based on 'to'
      if (to) {
        const suggestion = allHotels.filter(h => h.city === to);
        setSuggestedHotels(suggestion.slice(0, 3)); // Suggest up to 3 hotels
      } else {
        setSuggestedHotels([]);
      }

    } else {
      // Hotel Search
      const { city } = criteria;
      let results = allHotels;
      if (city) results = results.filter(h => h.city === city);
      setFilteredHotels(results);
    }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
    setIsSearching(false);
  };

  const handleStartBooking = (trip: Trip) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    
    // Check if user is admin or partner
    if (user.role === UserRole.ADMIN || user.role === UserRole.PARTNER) {
      showNotification(`${user.role === UserRole.ADMIN ? 'Quản trị viên' : 'Đối tác'} không thể thực hiện đặt vé. Vui lòng sử dụng tài khoản Khách hàng.`, 'error');
      return;
    }

    setSelectedTrip(trip);
    setSelectedHotel(null);
    setView('booking');
  };

  const handleViewDetails = (trip: Trip) => {
    setViewingTripDetails(trip);
  };

  const handleStartHotelBooking = (hotel: Hotel) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Check if user is admin or partner
    if (user.role === UserRole.ADMIN || user.role === UserRole.PARTNER) {
      showNotification(`${user.role === UserRole.ADMIN ? 'Quản trị viên' : 'Đối tác'} không thể thực hiện đặt phòng. Vui lòng sử dụng tài khoản Khách hàng.`, 'error');
      return;
    }

    setSelectedHotel(hotel);
    setSelectedTrip(null);
    // Directly go to payment for simplified hotel flow
    // In real app, we'd have date selection etc again.
    setBookingSeats(['Standard Room']); // Mock booking item
    setView('payment');
  };

  const handleConfirmSeats = (seats: string[]) => {
    setBookingSeats(seats);
    setView('payment');
  };

  const handlePaymentSuccess = () => {
    if (selectedTrip && user) {
      const newTickets: Ticket[] = bookingSeats.map(seat => ({
        id: Math.random().toString(36).substr(2, 9),
        tripId: selectedTrip.id,
        userId: user.id,
        seatNumber: seat,
        bookingDate: new Date().toISOString(),
        status: 'BOOKED',
        tripDetails: selectedTrip,
        userDetails: user
      }));
      setTickets([...tickets, ...newTickets]);
      setAllTrips(prev => prev.map(t => t.id === selectedTrip.id ? { ...t, availableSeats: t.availableSeats - bookingSeats.length } : t));
      showNotification('Đặt vé thành công! Vé đã được gửi đến email của bạn.', 'success');
      setView('success');
    } else if (selectedHotel && user) {
      const newTicket: Ticket = {
        id: Math.random().toString(36).substr(2, 9),
        hotelId: selectedHotel.id,
        userId: user.id,
        roomType: 'Standard Room',
        bookingDate: new Date().toISOString(),
        status: 'BOOKED',
        hotelDetails: selectedHotel,
        userDetails: user,
        totalPrice: selectedHotel.pricePerNight // Mock 1 night
      };
      setTickets([...tickets, newTicket]);
      showNotification('Đặt phòng thành công! Chúc bạn kỳ nghỉ vui vẻ.', 'success');
      setView('success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => setAuthModalOpen(true)}
        currentView={view}
        setView={setView}
      />

      {/* Main Content Router */}
      <main className="flex-grow">
        {view === 'home' && (
          <>
            <SearchHero onSearch={handleSearch} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {isSearching ? (
                 /* SEARCH RESULTS VIEW */
                 <>
                   <div className="flex items-center justify-between mb-6">
                     <h2 className="text-2xl font-bold text-slate-800">
                       {searchMode === 'transport' ? 'Kết quả tìm kiếm chuyến đi' : 'Khách sạn phù hợp'}
                     </h2>
                     <button onClick={() => setIsSearching(false)} className="text-blue-600 hover:underline">Xóa bộ lọc</button>
                   </div>
                   
                   {/* TRANSPORT RESULTS */}
                   {searchMode === 'transport' && (
                     <>
                       {filteredTrips.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500 mb-2">Không tìm thấy chuyến đi nào phù hợp.</p>
                            <button onClick={() => setIsSearching(false)} className="text-blue-600 font-medium">Thử tìm kiếm lại</button>
                          </div>
                       ) : (
                          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                             {/* Group Logic or List Logic */}
                             {currentSearchType !== 'all' ? (
                               <div className="grid gap-4">
                                 {filteredTrips.map(trip => (
                                   <TripCard 
                                     key={trip.id} 
                                     trip={trip} 
                                     onBook={handleStartBooking}
                                     onViewDetails={handleViewDetails}
                                   />
                                 ))}
                               </div>
                             ) : (
                               <>
                                 {filteredTrips.some(t => t.vehicleType === VehicleType.PLANE) && (
                                   <div>
                                      <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                                        <div className="p-2 bg-sky-100 rounded-lg text-sky-600"><Plane size={20}/></div>
                                        Máy Bay
                                      </h3>
                                      <div className="grid gap-4">
                                         {filteredTrips.filter(t => t.vehicleType === VehicleType.PLANE).map(trip => (
                                           <TripCard 
                                              key={trip.id} 
                                              trip={trip} 
                                              onBook={handleStartBooking}
                                              onViewDetails={handleViewDetails}
                                            />
                                         ))}
                                      </div>
                                   </div>
                                 )}

                                 {filteredTrips.some(t => t.vehicleType !== VehicleType.PLANE) && (
                                   <div className={filteredTrips.some(t => t.vehicleType === VehicleType.PLANE) ? "mt-8" : ""}>
                                      <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Bus size={20}/></div>
                                        Xe Khách & Bus
                                      </h3>
                                      <div className="grid gap-4">
                                         {filteredTrips.filter(t => t.vehicleType !== VehicleType.PLANE).map(trip => (
                                           <TripCard 
                                            key={trip.id} 
                                            trip={trip} 
                                            onBook={handleStartBooking}
                                            onViewDetails={handleViewDetails}
                                           />
                                         ))}
                                      </div>
                                   </div>
                                 )}
                               </>
                             )}
                          </div>
                       )}

                       {/* HOTEL SUGGESTIONS BELOW TRIP RESULTS */}
                       {suggestedHotels.length > 0 && (
                         <div className="mt-12 pt-8 border-t border-slate-200">
                           <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                             <Building2 className="h-6 w-6 text-purple-600" />
                             Gợi ý khách sạn tại điểm đến
                           </h2>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {suggestedHotels.map(hotel => (
                               <div key={hotel.id} className="h-full">
                                  <HotelCard hotel={hotel} onBook={handleStartHotelBooking} />
                               </div>
                             ))}
                           </div>
                           <div className="mt-6 text-center">
                             <button 
                               onClick={() => {
                                 setSearchMode('hotel');
                                 // Optionally filter strictly by destination
                                 setFilteredHotels(allHotels.filter(h => h.city === suggestedHotels[0].city));
                                 window.scrollTo({ top: 0, behavior: 'smooth' });
                               }}
                               className="text-blue-600 font-bold hover:underline"
                             >
                               Xem thêm khách sạn tại {suggestedHotels[0].city} →
                             </button>
                           </div>
                         </div>
                       )}
                     </>
                   )}

                   {/* HOTEL RESULTS */}
                   {searchMode === 'hotel' && (
                     <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4">
                       {/* Sidebar Filters */}
                       <div className="w-full md:w-1/4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm h-fit">
                         <h3 className="font-bold text-slate-800 mb-4">Sắp xếp theo</h3>
                         <div className="space-y-2 mb-6">
                           <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="sort" checked={hotelSortBy === 'price_asc'} onChange={() => setHotelSortBy('price_asc')} className="text-blue-600 focus:ring-blue-500" />
                             <span className="text-sm text-slate-600">Giá tăng dần</span>
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="sort" checked={hotelSortBy === 'price_desc'} onChange={() => setHotelSortBy('price_desc')} className="text-blue-600 focus:ring-blue-500" />
                             <span className="text-sm text-slate-600">Giá giảm dần</span>
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="sort" checked={hotelSortBy === 'rating_desc'} onChange={() => setHotelSortBy('rating_desc')} className="text-blue-600 focus:ring-blue-500" />
                             <span className="text-sm text-slate-600">Đánh giá cao nhất</span>
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="sort" checked={hotelSortBy === 'distance_asc'} onChange={() => setHotelSortBy('distance_asc')} className="text-blue-600 focus:ring-blue-500" />
                             <span className="text-sm text-slate-600">Gần trung tâm nhất</span>
                           </label>
                         </div>

                         <h3 className="font-bold text-slate-800 mb-4">Tiện ích</h3>
                         <div className="space-y-2">
                           {['Wifi', 'Pool', 'Breakfast', 'Gym', 'Spa', 'Bar'].map(amenity => (
                             <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                               <input 
                                 type="checkbox" 
                                 checked={selectedAmenities.includes(amenity)}
                                 onChange={(e) => {
                                   if (e.target.checked) {
                                     setSelectedAmenities(prev => [...prev, amenity]);
                                   } else {
                                     setSelectedAmenities(prev => prev.filter(a => a !== amenity));
                                   }
                                 }}
                                 className="rounded text-blue-600 focus:ring-blue-500" 
                               />
                               <span className="text-sm text-slate-600">{amenity}</span>
                             </label>
                           ))}
                         </div>
                       </div>

                       {/* Results */}
                       <div className="w-full md:w-3/4">
                         <div className="grid grid-cols-1 gap-6">
                           {displayedHotels.length === 0 ? (
                              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                <p className="text-slate-500 mb-2">Không tìm thấy khách sạn nào phù hợp với bộ lọc.</p>
                                <button onClick={() => { setSelectedAmenities([]); setHotelSortBy('price_asc'); }} className="text-blue-600 font-medium hover:underline">Xóa bộ lọc</button>
                              </div>
                           ) : (
                              displayedHotels.map(hotel => (
                                <HotelCard key={hotel.id} hotel={hotel} onBook={handleStartHotelBooking} />
                              ))
                           )}
                         </div>
                       </div>
                     </div>
                   )}
                 </>
              ) : (
                /* LANDING PAGE CONTENT */
                <div className="animate-in fade-in duration-500">
                  <PromotionSection onCopy={handleCopyCode} />
                  <PopularDestinations />
                  
                  {/* Why Choose Us */}
                  <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-slate-200 mt-12">
                     <div className="p-6">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                           <CheckCircle className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Đặt vé nhanh chóng</h3>
                        <p className="text-slate-500">Thao tác đơn giản, xác nhận vé ngay lập tức qua email.</p>
                     </div>
                     <div className="p-6">
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                           <Tag className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Giá tốt nhất</h3>
                        <p className="text-slate-500">Luôn có ưu đãi độc quyền và giá cạnh tranh nhất thị trường.</p>
                     </div>
                     <div className="p-6">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                           <Phone className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Hỗ trợ 24/7</h3>
                        <p className="text-slate-500">Đội ngũ hỗ trợ chuyên nghiệp, sẵn sàng giải đáp mọi thắc mắc.</p>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'booking' && selectedTrip && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <button onClick={() => setView('home')} className="mb-4 text-blue-600 font-medium hover:underline flex items-center gap-1">
              <ArrowRight className="h-4 w-4 rotate-180" /> Quay lại tìm kiếm
            </button>
            <SeatSelector trip={selectedTrip} onConfirm={handleConfirmSeats} />
          </div>
        )}

        {view === 'payment' && (selectedTrip || selectedHotel) && (
          <div className="max-w-xl mx-auto px-4 py-12">
             <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
               <div className="flex justify-center mb-6">
                 <div className="p-4 bg-blue-50 rounded-full">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                 </div>
               </div>
               <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Thanh toán</h2>
               <p className="text-center text-slate-500 mb-8">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
               
               <div className="space-y-4 mb-8 bg-slate-50 p-6 rounded-xl">
                 {selectedTrip ? (
                   <>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-500">Chuyến đi</span>
                      <span className="font-medium">{selectedTrip.from} - {selectedTrip.to}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-500">Số lượng ghế</span>
                      <span className="font-medium">{bookingSeats.length} ({bookingSeats.join(', ')})</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-500">Tổng tiền</span>
                      <span className="font-bold text-xl text-blue-600">{(selectedTrip.price * bookingSeats.length).toLocaleString()} đ</span>
                    </div>
                   </>
                 ) : selectedHotel ? (
                   <>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-500">Khách sạn</span>
                      <span className="font-medium">{selectedHotel.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-500">Loại phòng</span>
                      <span className="font-medium">Tiêu chuẩn</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                      <span className="text-slate-500">Tổng tiền</span>
                      <span className="font-bold text-xl text-blue-600">{selectedHotel.pricePerNight.toLocaleString()} đ</span>
                    </div>
                   </>
                 ) : null}
               </div>

               <button 
                onClick={handlePaymentSuccess}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition"
               >
                 Xác nhận thanh toán (Mô phỏng)
               </button>
               <button 
                onClick={() => setView('home')}
                className="w-full mt-3 text-slate-500 py-2 font-medium hover:text-slate-800"
               >
                 Hủy bỏ
               </button>
             </div>
          </div>
        )}

        {view === 'success' && (
          <div className="max-w-xl mx-auto px-4 py-12 text-center">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-6 ring-8 ring-green-50 animate-in zoom-in">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Đặt {selectedHotel ? 'phòng' : 'vé'} thành công!</h2>
            <p className="text-slate-600 mb-8">Cảm ơn bạn đã sử dụng dịch vụ. Thông tin đã được gửi tới email của bạn.</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setView('history')}
                className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition"
              >
                Xem lịch sử đặt
              </button>
              <button 
                onClick={() => setView('home')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        )}

        {view === 'history' && user && (
          <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <History className="h-8 w-8 text-blue-600" /> Lịch sử giao dịch
              </h2>
            </div>
            
            <div className="space-y-6 mb-8">
              {tickets.filter(t => t.userId === user.id).length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <History className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa có giao dịch nào</h3>
                  <p className="text-slate-500">Bạn chưa thực hiện bất kỳ đặt vé hay phòng nào.</p>
                  <button 
                    onClick={() => setView('home')}
                    className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
                  >
                    Khám phá ngay
                  </button>
                </div>
              ) : (
                tickets.filter(t => t.userId === user.id).sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()).map(ticket => {
                  
                  const isCancellable = () => {
                    if (ticket.status !== 'BOOKED') return false;
                    return true; // Allow cancellation anytime for demo
                  };

                  return (
                    <div key={ticket.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${ticket.status === 'BOOKED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                             {ticket.status === 'BOOKED' ? 'ĐẶT THÀNH CÔNG' : 'ĐÃ HỦY'}
                           </span>
                           <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Mã: #{ticket.id.toUpperCase()}</span>
                           <span className="text-sm text-slate-500 flex items-center gap-1">
                             <Calendar className="h-3.5 w-3.5" /> 
                             Đặt lúc: {new Date(ticket.bookingDate).toLocaleString('vi-VN')}
                           </span>
                        </div>
                        
                        {ticket.tripDetails ? (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                {ticket.tripDetails.vehicleType === VehicleType.PLANE ? <Plane className="h-5 w-5" /> : <Bus className="h-5 w-5" />}
                              </div>
                              <div>
                                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                  {ticket.tripDetails.from} <ArrowRight className="h-4 w-4 text-slate-400" /> {ticket.tripDetails.to}
                                </h4>
                                <p className="text-sm font-medium text-blue-600">{ticket.tripDetails.vehicleType}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Ngày đi</p>
                                <p className="text-sm font-medium text-slate-800">{ticket.tripDetails.date}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Giờ đi</p>
                                <p className="text-sm font-medium text-slate-800">{ticket.tripDetails.time}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Số ghế</p>
                                <p className="text-sm font-medium text-slate-800">{ticket.seatNumber}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Thời gian</p>
                                <p className="text-sm font-medium text-slate-800">{ticket.tripDetails.duration}</p>
                              </div>
                            </div>
                          </div>
                        ) : ticket.hotelDetails ? (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg text-slate-800">
                                  {ticket.hotelDetails.name}
                                </h4>
                                <p className="text-sm font-medium text-purple-600 flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" /> {ticket.hotelDetails.city}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Loại phòng</p>
                                <p className="text-sm font-medium text-slate-800">{ticket.roomType}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Địa chỉ</p>
                                <p className="text-sm font-medium text-slate-800 truncate" title={ticket.hotelDetails.address}>{ticket.hotelDetails.address}</p>
                              </div>
                            </div>
                          </div>
                        ) : null}
                        
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                        <div className="text-left md:text-right">
                          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Tổng tiền</p>
                          <p className="font-bold text-2xl text-blue-600">
                            {(ticket.totalPrice || ticket.tripDetails?.price || ticket.hotelDetails?.pricePerNight || 0).toLocaleString()} đ
                          </p>
                        </div>
                        
                        {ticket.status === 'BOOKED' && (
                          isCancellable() ? (
                            <button 
                              onClick={() => setCancellingTicketId(ticket.id)}
                              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition"
                            >
                              Hủy vé
                            </button>
                          ) : (
                            <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 text-center max-w-[150px]">
                              Không thể hủy (quá hạn 24h)
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {tickets.filter(t => t.userId === user.id).length > 0 && (
              <div className="text-center border-t border-slate-200 pt-8">
                 <button 
                   onClick={() => setView('home')}
                   className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition flex items-center gap-2 mx-auto shadow-sm"
                 >
                   <Home className="h-5 w-5" /> Quay về trang chủ
                 </button>
              </div>
            )}

          </div>
        )}

        {view === 'admin' && user?.role === UserRole.ADMIN && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <AdminDashboard 
              tickets={tickets} 
              trips={allTrips} 
              partners={partners}
              onApproveTrip={handleApproveTrip}
              onRejectTrip={handleRejectTrip}
              onBanPartner={handleBanPartner}
              onUnbanPartner={handleUnbanPartner}
            />
          </div>
        )}

        {view === 'promotions' && (
          <PromotionsPage onCopy={handleCopyCode} />
        )}

        {view === 'partner' && user?.role === UserRole.PARTNER && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <PartnerDashboard 
              trips={allTrips.filter(t => t.partnerId === user.id)}
              tickets={tickets.filter(t => t.tripDetails?.partnerId === user.id)}
              onAddTrip={handleAddTrip}
              onDeleteTrip={handleDeleteTrip}
              onCancelTicket={(ticketId) => setCancellingTicketId(ticketId)}
            />
          </div>
        )}
      </main>

      {/* Cancel Confirmation Modal */}
      {cancellingTicketId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận hủy vé</h3>
            <p className="text-slate-600 mb-6">Bạn có chắc chắn muốn hủy giao dịch này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setCancellingTicketId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
              >
                Đóng
              </button>
              <button 
                onClick={() => {
                  const ticketToCancel = tickets.find(t => t.id === cancellingTicketId);
                  if (ticketToCancel && ticketToCancel.tripId) {
                    setAllTrips(prev => prev.map(t => t.id === ticketToCancel.tripId ? { ...t, availableSeats: t.availableSeats + 1 } : t));
                  }
                  setTickets(prev => prev.map(t => t.id === cancellingTicketId ? { ...t, status: 'CANCELLED' } : t));
                  setCancellingTicketId(null);
                  showNotification('Đã hủy thành công.', 'success');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Đồng ý hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} />
      )}

      {/* Trip Details Modal */}
      {viewingTripDetails && (
        <TripDetailsModal 
          trip={viewingTripDetails} 
          onClose={() => setViewingTripDetails(null)} 
          onBook={(t) => {
            handleStartBooking(t);
            // Modal closes via onClose in the component, but we ensure state flow here
          }}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
}

export default App;