export enum VehicleType {
  BUS = 'Xe Khách',
  COACH = 'Bus Giường Nằm',
  PLANE = 'Máy Bay'
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  PARTNER = 'PARTNER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  // New fields for Partner Management
  status?: 'ACTIVE' | 'BANNED';
  banUntil?: string | null; // ISO Date string or null
  phone?: string;
}

export interface TripStop {
  id: string;
  time: string; // HH:mm
  location: string;
  description: string;
  type: 'PICKUP' | 'DROP' | 'REST' | 'MEAL' | 'STATION';
}

// Thông tin chi tiết về vận hành (chỉ dành cho Partner/Admin xem)
export interface TransportDetails {
  plateNumber: string; // Biển số xe hoặc Số hiệu chuyến bay (VN123)
  driverName: string; // Tên tài xế hoặc Cơ trưởng
  driverPhone: string;
  driverId: string; // CCCD
  vehicleDoc: string; // Giấy tờ xe (URL hoặc tên file mô phỏng)
}

export interface Trip {
  id: string;
  from: string;
  to: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  price: number;
  vehicleId: string;
  vehicleType: VehicleType;
  duration: string;
  availableSeats: number;
  totalSeats: number;
  stops: TripStop[]; 
  amenities: string[]; 
  
  // New fields for Partner management
  partnerId?: string; // Link to the Partner User ID
  status: 'APPROVED' | 'PENDING'; // Trạng thái duyệt
  transportDetails?: TransportDetails; // Thông tin vận hành
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  pricePerNight: number;
  rating: number; // 1-5
  image: string;
  amenities: string[];
  availableRooms: number;
  distance: number; // Distance from city center in km
}

export interface Ticket {
  id: string;
  tripId?: string; 
  hotelId?: string; 
  userId: string;
  seatNumber?: string; 
  roomType?: string; 
  bookingDate: string;
  status: 'BOOKED' | 'CANCELLED';
  tripDetails?: Trip; 
  hotelDetails?: Hotel; 
  userDetails?: User;
  totalPrice?: number;
}