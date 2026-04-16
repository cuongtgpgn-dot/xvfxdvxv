/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Table as TableIcon, 
  ClipboardList, 
  Settings, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Users,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  PieChart,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Menu,
  Calendar,
  Edit2,
  Package,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  FileText,
  Download,
  Layers,
  Maximize,
  LogOut,
  LogIn,
  User as UserIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import * as XLSX from 'xlsx';
import { cn, formatCurrency, formatNumber } from './lib/utils';
import { MonthlyData, Order, DepartmentConfig, DEFAULT_DEPARTMENTS, WorkshopOrder, WorkshopStatus, Material, MaterialTransaction, Stone, StoneTransaction, UserRole, UserProfile } from './types';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, deleteDoc, updateDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { handleFirestoreError, OperationType } from './lib/firestore-utils';
import ErrorBoundary from './components/ErrorBoundary';

const INITIAL_STONES: Stone[] = [
  { id: 's1', name: 'Trắng Volakas', type: 'Marble', origin: 'Hy Lạp', thickness: 18, stockM2: 120, stockSlabs: 40, pricePerM2: 2500000 },
  { id: 's2', name: 'Đen Tia Chớp', type: 'Marble', origin: 'Tây Ban Nha', thickness: 18, stockM2: 85, stockSlabs: 25, pricePerM2: 1800000 },
  { id: 's3', name: 'Vàng Hoàng Gia', type: 'Granite', origin: 'Brazil', thickness: 20, stockM2: 200, stockSlabs: 60, pricePerM2: 1200000 },
];

const INITIAL_MATERIALS: Material[] = [
  { id: 'm1', code: 'KTV', name: 'Keo Teenax vàng', unit: 'Lon', price: 38333, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm2', code: 'AX', name: 'Axit', unit: 'Lọ', price: 15000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm3', code: 'KAB', name: 'Keo AB', unit: 'Cặp', price: 210000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm4', code: 'K502', name: 'Keo 502', unit: 'Lọ', price: 4000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm5', code: 'DCL', name: 'Decal', unit: 'Cuộn', price: 750000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm6', code: 'LTT', name: 'Lưới thủy tinh', unit: 'Cuộn', price: 480000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm7', code: 'LCG', name: 'Lưỡi cắt Granite', unit: 'Cái', price: 880000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm8', code: 'LCM', name: 'Lưỡi cắt Marble', unit: 'Cái', price: 780000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm9', code: 'LCN', name: 'Lưỡi cắt nung kết', unit: 'Cái', price: 0, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm10', code: 'LLO', name: 'Lưỡi layout 110', unit: 'Cái', price: 45000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm11', code: 'GK', name: 'Gạt keo', unit: 'Cái', price: 5000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm12', code: 'BKG', name: 'Băng keo giấy', unit: 'Cuộn', price: 8000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm13', code: 'BKT', name: 'Băng keo trong', unit: 'Cây', price: 16667, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm14', code: 'DRG', name: 'Lưỡi dao rọc giấy', unit: 'Hộp', price: 7500, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm15', code: 'TM', name: 'Tăng màu', unit: 'Lọ', price: 1650000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm16', code: 'CT', name: 'Chống thấm', unit: 'Can', price: 205000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm17', code: 'CN', name: 'Cana', unit: 'Lọ', price: 0, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm18', code: 'BLT', name: 'Bellin trắng', unit: 'Lọ', price: 90000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm19', code: 'BLD', name: 'Bellin đen', unit: 'Lọ', price: 90000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm20', code: 'BN', name: 'Bùi nhùi', unit: 'Cuộn', price: 15000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm21', code: 'BĐM', name: 'Bộ đánh bóng Marble', unit: 'Xô', price: 850000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm22', code: 'BĐG', name: 'Bột đánh bóng granite', unit: 'Lọ', price: 300000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm23', code: 'ĐNL', name: 'Đế nhựa gắn lá số', unit: 'Cái', price: 10000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm24', code: 'ĐS50', name: 'Đĩa sắt 50', unit: 'Cái', price: 125000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm25', code: 'ĐS200', name: 'Đĩa sắt 200', unit: 'Cái', price: 125000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm26', code: 'LSK0', name: 'Lá số khô 0', unit: 'Lá', price: 46000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm27', code: 'LSK1', name: 'Lá số khô 1', unit: 'Lá', price: 46000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm28', code: 'LSK2', name: 'Lá số khô 2', unit: 'Lá', price: 46000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm29', code: 'LSK3', name: 'Lá số khô 3', unit: 'Lá', price: 46000, stock: 0, category: 'VẬT TƯ DÁN' },
  { id: 'm46', code: 'HM80-1', name: 'Hạt mài máy 1', unit: 'Bao', price: 187500, stock: 0, category: 'VẬT TƯ MÁY' },
  { id: 'm47', code: 'HM80-2', name: 'Hạt mài máy 2', unit: 'Bao', price: 187500, stock: 0, category: 'VẬT TƯ MÁY' },
  { id: 'm48', code: 'HM80-3', name: 'Hạt mài máy 3', unit: 'Bao', price: 187500, stock: 0, category: 'VẬT TƯ MÁY' },
  { id: 'm49', code: '0D001-635762-M1', name: 'Béc cắt máy 1', unit: 'Cái', price: 900000, stock: 0, category: 'VẬT TƯ MÁY' },
  { id: 'm50', code: '0D001-635762-M2', name: 'Béc cắt máy 2', unit: 'Cái', price: 900000, stock: 0, category: 'VẬT TƯ MÁY' },
];

const INITIAL_WORKSHOP_ORDERS: WorkshopOrder[] = [
  {
    id: 'w1',
    customer: 'CHỊ THÚY DUY',
    category: 'HV SẢNH CHÍNH - NỀN ĐÁ ROSALIGHT - YC CHỐNG THẤM - TẠO RON 2MM - MÀI HONED MỜ MỊN, KO BÓNG (CÓ KÈM MẪU)',
    quantity: 1,
    area: 23.1,
    receivedDate: '2026-04-01',
    deliveryDate: '2026-04-11',
    isPacked: true,
    hasDecal: true,
    status: 'Dán hoa văn',
    note: '',
    imageUrl: 'https://picsum.photos/seed/stone1/800/400'
  }
];

// Mock Data for initial state
const INITIAL_MONTHLY_DATA: MonthlyData[] = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  year: 2026,
  revenue: 0,
  netSalary: 0,
  pieceRateSalary: 0,
  machineCost1: 0,
  machineCost2: 0,
  machineCost3: 0,
  electricity: 0,
  rent: 0,
  materials: 0,
  productionMaterials: 0,
}));

const INITIAL_ORDERS: Order[] = [
  { id: '1', customer: 'Anh Tùng', itemName: 'Boder 150mm', salesPerson: 'KIỀU MƠ', technicalPerson: 'KT NGUYÊN', quantityM2: 8, quantityMD: 0, totalAmount: 50000000, status: 'Đã chốt đơn', date: '2026-01-15' },
  { id: '2', customer: 'Công Ty TNHH ĐHC Út', itemName: 'HV Phòng Khách', salesPerson: 'KIỀU MƠ', technicalPerson: 'KT VƯƠNG', quantityM2: 16, quantityMD: 0, totalAmount: 100000000, status: 'Đã chốt đơn', date: '2026-01-18' },
  { id: '3', customer: 'Aqua Stone', itemName: 'GC Cắt Ghép Sàn', salesPerson: 'KIỀU MƠ', technicalPerson: 'KT NGUYÊN', quantityM2: 75, quantityMD: 0, totalAmount: 1000000000, status: 'Đang chờ khách', date: '2026-01-20' },
  { id: '4', customer: 'Anh Trúc Bình', itemName: 'GC Cắt Tia Nước Đá', salesPerson: 'KIỀU MƠ', technicalPerson: 'KT NGUYÊN', quantityM2: 0, quantityMD: 30.44, totalAmount: 5000000, status: 'Đã chốt đơn', date: '2026-02-05' },
  { id: '5', customer: 'Anh Đông', itemName: 'HV Tròn DK 1700mm', salesPerson: 'KIỀU MƠ', technicalPerson: 'KT VƯƠNG', quantityM2: 10, quantityMD: 0, totalAmount: 420000000, status: 'Đã chốt đơn', date: '2026-02-12' },
  { id: '6', customer: 'Anh Kiệt Q12', itemName: '2 HV Sảnh', salesPerson: 'KIỀU MƠ', technicalPerson: 'KT VƯƠNG', quantityM2: 10, quantityMD: 0, totalAmount: 79000000, status: 'Đang chờ khách', date: '2026-03-01' },
];

export default function App() {
  const [user, loading, error] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'monthly' | 'orders' | 'workshop' | 'materials' | 'stones' | 'settings'>('dashboard');
  
  // Initialize state (data will be loaded from Firestore)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>(INITIAL_MONTHLY_DATA);
  const [orders, setOrders] = useState<Order[]>([]);
  const [workshopOrders, setWorkshopOrders] = useState<WorkshopOrder[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stones, setStones] = useState<Stone[]>([]);
  const [stoneTransactions, setStoneTransactions] = useState<StoneTransaction[]>([]);
  const [transactions, setTransactions] = useState<MaterialTransaction[]>([]);
  const [departments, setDepartments] = useState<DepartmentConfig[]>(DEFAULT_DEPARTMENTS);

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.floor(new Date().getMonth() / 3) + 1);
  const [viewType, setViewType] = useState<'month' | 'quarter' | 'year'>('month');

  // [Tính năng mới] Phóng to ảnh
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const getPeriodLabel = () => {
    if (viewType === 'month') return `Tháng ${selectedMonth}`;
    if (viewType === 'quarter') return `Quý ${selectedQuarter}`;
    return `Năm ${selectedYear}`;
  };

  const parseOrderDate = (dateValue?: string) => {
    if (!dateValue) return new Date('');

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const [year, month, day] = dateValue.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
      const [day, month, year] = dateValue.split('/').map(Number);
      return new Date(year, month - 1, day);
    }

    return new Date(dateValue);
  };

  const normalizeOrderDate = (dateValue?: string) => {
    const parsedDate = parseOrderDate(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return new Date().toISOString().split('T')[0];

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>('all');
  const [selectedTechnicalPerson, setSelectedTechnicalPerson] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedTransactionType, setSelectedTransactionType] = useState<'all' | 'IMPORT' | 'EXPORT'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [isAddingWorkshopOrder, setIsAddingWorkshopOrder] = useState(false);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [isAddingStone, setIsAddingStone] = useState(false);
  const [editingStoneId, setEditingStoneId] = useState<string | null>(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingStoneTransaction, setIsAddingStoneTransaction] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWorkshopMaximized, setIsWorkshopMaximized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showStoneHistory, setShowStoneHistory] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<MaterialTransaction>>({
    type: 'IMPORT',
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    location: ''
  });
  const [newStoneTransaction, setNewStoneTransaction] = useState<Partial<StoneTransaction>>({
    type: 'IMPORT',
    slabs: 0,
    m2: 0,
    pricePerM2: 0,
    date: new Date().toISOString().split('T')[0],
    customerOrSupplier: '',
    note: ''
  });
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    code: '',
    name: '',
    unit: '',
    price: 0,
    stock: 0,
    category: 'VẬT TƯ DÁN'
  });
  const [newStone, setNewStone] = useState<Partial<Stone>>({
    name: '',
    type: 'Marble',
    origin: '',
    thickness: 18,
    stockM2: 0,
    stockSlabs: 0,
    pricePerM2: 0
  });
  const [editingWorkshopOrder, setEditingWorkshopOrder] = useState<WorkshopOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [workshopOrderToDelete, setWorkshopOrderToDelete] = useState<string | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [stoneToDelete, setStoneToDelete] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [stoneTransactionToDelete, setStoneTransactionToDelete] = useState<string | null>(null);
  const [isResettingData, setIsResettingData] = useState(false);
  const [isEditingMonthly, setIsEditingMonthly] = useState(false);
  const [tempMonthlyData, setTempMonthlyData] = useState<MonthlyData[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Firebase Auth and Profile Effect
  useEffect(() => {
    if (loading) return;
    
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          // Create default profile for new users
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Người dùng mới',
            role: user.email === 'cuong.tgpgn@gmail.com' ? 'manager' : 'sales', // Initial admin check
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, newProfile);
          setUserProfile(newProfile);
        }
        setIsAuthReady(true);
      }, (err) => {
        console.error("Error fetching user profile:", err);
        setIsAuthReady(true);
      });
      
      return () => unsubscribe();
    } else {
      setUserProfile(null);
      setIsAuthReady(true);
    }
  }, [user, loading]);

  // Role-based access control
// Cấu hình phân quyền chi tiết
  const canAccess = (tab: string) => {
    if (!userProfile) return false;
    const role = userProfile.role;
    
    // Quyền Manager: Xem tất cả mọi thứ
    if (role === 'manager') return true;
    
    // Quyền Warehouse (Mới): Chỉ xem Kho vật tư và Kho đá
    if (role === 'warehouse') {
      return ['materials', 'stones'].includes(tab);
    }
    
    // Quyền Workshop: Chỉ xem Tiến độ xưởng
    if (role === 'workshop') {
      return ['workshop'].includes(tab);
    }
    
    // Quyền Sales: Xem Đơn hàng và Tiến độ xưởng
    if (role === 'sales') {
      return ['orders', 'workshop'].includes(tab);
    }
    
    return false;
  };

  // Auto-redirect if current tab is not accessible
  useEffect(() => {
    if (isAuthReady && userProfile && !canAccess(activeTab)) {
      if (userProfile.role === 'workshop') setActiveTab('workshop');
      else if (userProfile.role === 'sales') setActiveTab('orders');
    }
  }, [activeTab, userProfile, isAuthReady]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login error:", err);
      showNotification("Đăng nhập thất bại", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification("Đã đăng xuất");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const renderLogin = () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-orange"></div>
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue font-bold border border-brand-blue/20 mx-auto text-2xl">
            TGP
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Hệ thống Quản lý TGP</h1>
            <p className="text-slate-400 mt-2">Vui lòng đăng nhập để tiếp tục</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all active:scale-[0.98] shadow-lg"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            Đăng nhập bằng Google
          </button>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
            © 2026 TGP Stone Management
          </p>
        </div>
      </div>
    </div>
  );

  // Firestore Data Listeners
  useEffect(() => {
    if (!isAuthReady || !user) return;

    const collectionsList = [
      { path: 'monthlyData', setter: setMonthlyData },
      { path: 'orders', setter: setOrders },
      { path: 'workshopOrders', setter: setWorkshopOrders },
      { path: 'materials', setter: setMaterials },
      { path: 'stones', setter: setStones },
      { path: 'transactions', setter: setTransactions },
      { path: 'stoneTransactions', setter: setStoneTransactions },
      { path: 'departments', setter: setDepartments }
    ];

    const unsubscribes = collectionsList.map(({ path, setter }) => {
      return onSnapshot(collection(db, path), (snapshot) => {
        const data = snapshot.docs.map(docItem => ({ ...docItem.data(), id: docItem.id }));
        if (data.length > 0 || path === 'monthlyData') {
          setter(data as any);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, path);
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [isAuthReady, user]);

  const workshopAlerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextPeriod = new Date(today);
    nextPeriod.setDate(nextPeriod.getDate() + 2);

    // Overdue: deliveryDate < today AND status not in ['Hoàn thiện - Chờ giao', 'Đã giao hàng']
    const overdue = workshopOrders.filter(order => {
      if (!order.deliveryDate) return false;
      if (['Hoàn thiện - Chờ giao', 'Đã giao hàng'].includes(order.status)) return false;
      const deliveryDate = new Date(order.deliveryDate);
      deliveryDate.setHours(0, 0, 0, 0);
      return deliveryDate.getTime() < today.getTime();
    }).sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

    const currentAlerts = workshopOrders.filter(order => {
      if (!order.deliveryDate || order.status === 'Đã giao hàng') return false;
      const deliveryDate = new Date(order.deliveryDate);
      deliveryDate.setHours(0, 0, 0, 0);
      return deliveryDate.getTime() >= today.getTime() && deliveryDate.getTime() <= nextPeriod.getTime();
    });

    return {
      overdue,
      today: currentAlerts.filter(o => {
        const d = new Date(o.deliveryDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      }),
      upcoming: currentAlerts.filter(o => {
        const d = new Date(o.deliveryDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() > today.getTime();
      }).sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
    };
  }, [workshopOrders]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customer: '',
    itemName: '',
    salesPerson: 'KIỀU MƠ',
    technicalPerson: 'KT NGUYÊN',
    quantityM2: 0,
    quantityMD: 0,
    totalAmount: 0,
    status: 'Đang chờ khách',
    date: new Date().toISOString().split('T')[0]
  });

  const [newWorkshopOrder, setNewWorkshopOrder] = useState<Partial<WorkshopOrder>>({
    customer: '',
    category: '',
    quantity: 1,
    area: 0,
    receivedDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    isPacked: false,
    hasDecal: false,
    status: 'Chưa sản xuất',
    note: ''
  });

  // Get unique staff lists for filters
  const salesStaff = useMemo(() => {
    const staff = new Set(orders.map(o => o.salesPerson));
    return Array.from(staff).sort();
  }, [orders]);

  const technicalStaff = useMemo(() => {
    const staff = new Set(orders.map(o => o.technicalPerson));
    return Array.from(staff).sort();
  }, [orders]);

  // Filtering orders by month/year, staff and search term
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const orderDate = parseOrderDate(order.date);
        const orderMonth = orderDate.getMonth() + 1;
        const orderYear = orderDate.getFullYear();
        
        let matchesTime = false;
        if (viewType === 'month') {
          matchesTime = orderMonth === selectedMonth && orderYear === selectedYear;
        } else if (viewType === 'quarter') {
          const quarter = Math.floor((orderMonth - 1) / 3) + 1;
          matchesTime = quarter === selectedQuarter && orderYear === selectedYear;
        } else {
          matchesTime = orderYear === selectedYear;
        }

        const matchesSales = selectedSalesPerson === 'all' || order.salesPerson === selectedSalesPerson;
        const matchesTechnical = selectedTechnicalPerson === 'all' || order.technicalPerson === selectedTechnicalPerson;
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            order.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTime && matchesSales && matchesTechnical && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = parseOrderDate(a.date).getTime();
        const dateB = parseOrderDate(b.date).getTime();

        if (dateA !== dateB) return dateA - dateB;
        return a.customer.localeCompare(b.customer, 'vi');
      });
  }, [orders, viewType, selectedMonth, selectedQuarter, selectedYear, selectedSalesPerson, selectedTechnicalPerson, selectedStatus, searchTerm]);

  const monthTotalRevenue = useMemo(() => {
    return filteredOrders
      .filter(o => ['Đã chốt đơn', 'Đã giao hàng'].includes(o.status))
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [filteredOrders]);

  const handleAddOrder = async () => {
    await handleSaveOrder();
  };

  const handleDeleteOrder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrderToDelete(id);
  };

  const confirmDeleteOrder = async () => {
    if (orderToDelete) {
      try {
        await deleteDoc(doc(db, 'orders', orderToDelete));
        setOrderToDelete(null);
        showNotification('Đã xóa đơn hàng.');
      } catch (errorItem) {
        handleFirestoreError(errorItem, OperationType.DELETE, 'orders');
      }
    }
  };

  const updateOrderStatus = async (id: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
    } catch (errorItem) {
      handleFirestoreError(errorItem, OperationType.UPDATE, 'orders');
    }
  };

  const handleDeleteWorkshopOrder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkshopOrderToDelete(id);
  };

  const confirmDeleteMaterial = async () => {
    if (materialToDelete) {
      try {
        await deleteDoc(doc(db, 'materials', materialToDelete));
        setMaterialToDelete(null);
        showNotification('Đã xóa vật tư!');
      } catch (errorItem) {
        handleFirestoreError(errorItem, OperationType.DELETE, 'materials');
      }
    }
  };

  const confirmDeleteTransaction = async () => {
    if (transactionToDelete) {
      const t = transactions.find(item => item.id === transactionToDelete);
      if (t) {
        try {
          // Revert stock
          const material = materials.find(m => m.id === t.materialId);
          if (material) {
            const revertQuantity = t.type === 'IMPORT' ? -t.quantity : t.quantity;
            await updateDoc(doc(db, 'materials', t.materialId), {
              stock: (material.stock || 0) + revertQuantity
            });
          }
          // Delete transaction
          await deleteDoc(doc(db, 'transactions', transactionToDelete));
          showNotification('Đã xóa lịch sử và hoàn lại số lượng tồn!');
        } catch (errorItem) {
          handleFirestoreError(errorItem, OperationType.DELETE, 'transactions');
        }
      }
      setTransactionToDelete(null);
    }
  };

  const confirmDeleteStone = async () => {
    if (stoneToDelete) {
      try {
        await deleteDoc(doc(db, 'stones', stoneToDelete));
        setStoneToDelete(null);
        showNotification('Đã xóa đá khỏi danh mục.');
      } catch (errorItem) {
        handleFirestoreError(errorItem, OperationType.DELETE, 'stones');
      }
    }
  };

  const confirmDeleteStoneTransaction = async () => {
    if (stoneTransactionToDelete) {
      const t = stoneTransactions.find(item => item.id === stoneTransactionToDelete);
      if (t) {
        try {
          // Reverse stock update
          const stone = stones.find(s => s.id === t.stoneId);
          if (stone) {
            const newStockM2 = t.type === 'IMPORT' 
              ? (stone.stockM2 || 0) - t.m2
              : (stone.stockM2 || 0) + t.m2;
            const newStockSlabs = t.type === 'IMPORT' 
              ? (stone.stockSlabs || 0) - t.slabs
              : (stone.stockSlabs || 0) + t.slabs;
            
            await updateDoc(doc(db, 'stones', t.stoneId), {
              stockM2: newStockM2,
              stockSlabs: newStockSlabs
            });
          }
          await deleteDoc(doc(db, 'stoneTransactions', stoneTransactionToDelete));
          showNotification('Đã xóa lịch sử giao dịch đá.');
        } catch (errorItem) {
          handleFirestoreError(errorItem, OperationType.DELETE, 'stoneTransactions');
        }
      }
      setStoneTransactionToDelete(null);
    }
  };

  const confirmDeleteWorkshopOrder = async () => {
    if (workshopOrderToDelete) {
      try {
        await deleteDoc(doc(db, 'workshopOrders', workshopOrderToDelete));
        setWorkshopOrderToDelete(null);
        showNotification('Đã xóa đơn hàng xưởng.');
      } catch (errorItem) {
        handleFirestoreError(errorItem, OperationType.DELETE, 'workshopOrders');
      }
    }
  };

  const handleAddWorkshopOrder = async () => {
    if (!newWorkshopOrder.customer || !newWorkshopOrder.category) {
      showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
      return;
    }

    if (editingWorkshopOrder) {
      try {
        await updateDoc(doc(db, 'workshopOrders', editingWorkshopOrder.id), newWorkshopOrder as any);
        setEditingWorkshopOrder(null);
        showNotification('Đã cập nhật đơn hàng xưởng!');
      } catch (errorItem) {
        handleFirestoreError(errorItem, OperationType.UPDATE, 'workshopOrders');
      }
    } else {
      const id = Math.random().toString(36).substr(2, 9);
      const order: WorkshopOrder = {
        ...newWorkshopOrder as WorkshopOrder,
        id,
      };
      try {
        await setDoc(doc(db, 'workshopOrders', id), order);
        showNotification('Đã thêm đơn hàng xưởng mới!');
      } catch (errorItem) {
        handleFirestoreError(errorItem, OperationType.WRITE, 'workshopOrders');
      }
    }

    setIsAddingWorkshopOrder(false);
    setNewWorkshopOrder({
      customer: '',
      category: '',
      quantity: 1,
      area: 0,
      receivedDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      isPacked: false,
      hasDecal: false,
      status: 'Chưa sản xuất',
      note: ''
    });
  };

  const getWorkshopStatusColor = (status: WorkshopStatus) => {
    switch (status) {
      case 'Chưa sản xuất': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Chưa có đá': return 'bg-red-100 text-red-600 border-red-200';
      case 'Đang cắt': return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
      case 'Xong cắt': return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
      case 'Dán hoa văn': return 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'; 
      case 'Xong dán': return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
      case 'Đánh bóng': return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
      case 'Xong đánh bóng': return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
      case 'Layout': return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
      case 'Đóng kiện': return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
      case 'Hoàn thiện - Chờ giao': return 'bg-green-500 text-white border-green-600';
      case 'Đã giao hàng': return 'bg-green-700 text-white border-green-800';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const workshopStatuses: WorkshopStatus[] = [
    'Chưa sản xuất', 'Chưa có đá', 'Đang cắt', 'Xong cắt', 'Dán hoa văn', 'Xong dán',
    'Đánh bóng', 'Xong đánh bóng', 'Layout', 'Đóng kiện', 'Hoàn thiện - Chờ giao', 'Đã giao hàng'
  ];

  // Derive monthly data revenue and piece-rate from orders
  const processedMonthlyData = useMemo(() => {
    // Ensure we always have 12 months for the selected year
    const baseData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const firestoreDoc = monthlyData.find(d => d.month === month && d.year === selectedYear);
      return firestoreDoc || {
        month,
        year: selectedYear,
        revenue: 0,
        netSalary: 0,
        pieceRateSalary: 0,
        machineCost1: 0,
        machineCost2: 0,
        machineCost3: 0,
        electricity: 0,
        rent: 0,
        materials: 0,
        productionMaterials: 0,
      };
    });

    return baseData.map(d => {
      const monthOrders = orders.filter(o => {
        const date = parseOrderDate(o.date);
        return (date.getMonth() + 1) === d.month && date.getFullYear() === d.year && ['Đã chốt đơn', 'Đã giao hàng'].includes(o.status);
      });
      
      const monthRevenue = monthOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
      
      // Calculate material costs by location for this month
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return (tDate.getMonth() + 1) === d.month && tDate.getFullYear() === d.year && t.type === 'EXPORT';
      });

      const getCostByLocations = (locs: string[]) => {
        return monthTransactions
          .filter(t => locs.includes(t.location || ''))
          .reduce((acc, t) => {
            const material = materials.find(m => m.id === t.materialId);
            return acc + (t.quantity * (material?.price || 0));
          }, 0);
      };

      const machineCost1 = getCostByLocations(['Máy cắt 1']);
      const machineCost2 = getCostByLocations(['Máy cắt 2']);
      const machineCost3 = getCostByLocations(['Máy cắt 3']);
      const productionMaterials = getCostByLocations(['Máy cắt cầu', 'Khu vực đánh bóng', 'Khu vực hoa văn']);
      
      // Calculate stone material cost from stone transactions (IMPORT)
      const stoneImportCost = stoneTransactions
        .filter(t => {
          const tDate = new Date(t.date);
          return (tDate.getMonth() + 1) === d.month && tDate.getFullYear() === d.year && t.type === 'IMPORT';
        })
        .reduce((acc, t) => {
          const stone = stones.find(s => s.id === t.stoneId);
          const price = t.pricePerM2 || stone?.pricePerM2 || 0;
          return acc + (t.m2 * price);
        }, 0);

      // Calculate total piece rate salary from these orders based on department percentages
      const calculatedPieceRate = monthOrders.reduce((acc, order) => {
        const orderPieceRate = departments.reduce((dAcc, dept) => dAcc + (order.totalAmount * dept.percentage) / 100, 0);
        return acc + orderPieceRate;
      }, 0);

      // For non-editable fields, always use calculated values to ensure synchronization
      // For editable fields with fallbacks (materials), use manual value if > 0
      const pieceRateSalary = calculatedPieceRate;
      const materialsCost = d.materials > 0 ? d.materials : stoneImportCost;

      const totalCost = d.netSalary + 
                        pieceRateSalary + 
                        machineCost1 + machineCost2 + machineCost3 + 
                        d.electricity + d.rent + materialsCost + productionMaterials;

      return { 
        ...d, 
        revenue: monthRevenue, 
        pieceRateSalary,
        materials: materialsCost,
        machineCost1: machineCost1,
        machineCost2: machineCost2,
        machineCost3: machineCost3,
        productionMaterials: productionMaterials,
        totalCost
      };
    });
  }, [monthlyData, orders, departments, selectedYear, stoneTransactions, stones, transactions, materials]);

  // Calculations
  const stats = useMemo(() => {
    const filteredMonthlyData = processedMonthlyData.filter(d => {
      if (viewType === 'month') {
        return d.month === selectedMonth && d.year === selectedYear;
      } else if (viewType === 'quarter') {
        const quarter = Math.floor((d.month - 1) / 3) + 1;
        return quarter === selectedQuarter && d.year === selectedYear;
      } else {
        return d.year === selectedYear;
      }
    });

    const totalRevenue = processedMonthlyData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalCosts = processedMonthlyData.reduce((acc, curr) => acc + curr.totalCost, 0);
    const avgProfitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

    const periodRevenue = filteredMonthlyData.reduce((acc, curr) => acc + curr.revenue, 0);
    const periodCosts = filteredMonthlyData.reduce((acc, curr) => acc + curr.totalCost, 0);
    
    return {
      totalRevenue,
      totalCosts,
      profit: totalRevenue - totalCosts,
      avgProfitMargin,
      periodRevenue,
      periodCosts,
      periodProfit: periodRevenue - periodCosts
    };
  }, [processedMonthlyData, viewType, selectedMonth, selectedQuarter, selectedYear]);

  const TimeFilter = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm w-full sm:w-auto">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Xem theo</span>
        <div className="flex bg-slate-100 p-1 rounded-lg flex-1 sm:flex-none">
          <button 
            onClick={() => setViewType('month')}
            className={cn(
              "flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all",
              viewType === 'month' ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Tháng
          </button>
          <button 
            onClick={() => setViewType('quarter')}
            className={cn(
              "flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all",
              viewType === 'quarter' ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Quý
          </button>
          <button 
            onClick={() => setViewType('year')}
            className={cn(
              "flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all",
              viewType === 'year' ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Năm
          </button>
        </div>
      </div>
      
      <div className="relative w-full sm:w-auto">
        <select 
          value={viewType === 'month' ? `${selectedMonth}-${selectedYear}` : viewType === 'quarter' ? `${selectedQuarter}-${selectedYear}` : `${selectedYear}`}
          onChange={(e) => {
            const val = e.target.value;
            if (viewType === 'month') {
              const [m, y] = val.split('-').map(Number);
              setSelectedMonth(m);
              setSelectedYear(y);
            } else if (viewType === 'quarter') {
              const [q, y] = val.split('-').map(Number);
              setSelectedQuarter(q);
              setSelectedYear(y);
            } else {
              setSelectedYear(Number(val));
            }
          }}
          className="w-full sm:w-auto appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer"
        >
          {viewType === 'month' && Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={`${i + 1}-${selectedYear}`}>Tháng {String(i + 1).padStart(2, '0')}-{selectedYear}</option>
          ))}
          {viewType === 'quarter' && [1, 2, 3, 4].map(q => (
            <option key={q} value={`${q}-${selectedYear}`}>Quý {q}-{selectedYear}</option>
          ))}
          {viewType === 'year' && [2025, 2026].map(y => (
            <option key={y} value={y}>Năm {y}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );

  const renderDashboard = () => {
    // Calculate Stone Import for the period
    const periodStoneImport = stoneTransactions
      .filter(t => {
        const tDate = new Date(t.date);
        const tMonth = tDate.getMonth() + 1;
        const tYear = tDate.getFullYear();
        const tQuarter = Math.floor((tMonth - 1) / 3) + 1;
        if (t.type !== 'IMPORT') return false;
        if (viewType === 'month') return tMonth === selectedMonth && tYear === selectedYear;
        if (viewType === 'quarter') return tQuarter === selectedQuarter && tYear === selectedYear;
        return tYear === selectedYear;
      })
      .reduce((acc, t) => {
        const stone = stones.find(s => s.id === t.stoneId);
        const price = t.pricePerM2 || stone?.pricePerM2 || 0;
        return acc + (t.m2 * price);
      }, 0);

    // Calculate Material Export (Usage) for the period
    const periodMaterialUsage = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        const tMonth = tDate.getMonth() + 1;
        const tYear = tDate.getFullYear();
        const tQuarter = Math.floor((tMonth - 1) / 3) + 1;
        if (t.type !== 'EXPORT') return false;
        if (viewType === 'month') return tMonth === selectedMonth && tYear === selectedYear;
        if (viewType === 'quarter') return tQuarter === selectedQuarter && tYear === selectedYear;
        return tYear === selectedYear;
      })
      .reduce((acc, t) => {
        const material = materials.find(m => m.id === t.materialId);
        const price = material?.price || 0;
        return acc + (t.quantity * price);
      }, 0);

    // Workshop Stats
    const totalWorkshopOrders = workshopOrders.length;
    const completedWorkshopOrders = workshopOrders.filter(o => o.status === 'Đã giao hàng' || o.status === 'Hoàn thiện - Chờ giao').length;
    const workshopProgress = totalWorkshopOrders > 0 ? (completedWorkshopOrders / totalWorkshopOrders) * 100 : 0;

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
              Tổng quan hệ thống - {viewType === 'month' ? `Tháng ${selectedMonth}/${selectedYear}` : viewType === 'quarter' ? `Quý ${selectedQuarter}/${selectedYear}` : `Năm ${selectedYear}`}
            </h3>
            <p className="text-sm text-slate-500">Dữ liệu tổng hợp từ tất cả các bộ phận quản lý</p>
          </div>
          <TimeFilter />
        </div>

        {/* Primary Financial Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-brand-blue/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-brand-blue" />
              </div>
              <span className="text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-full uppercase">Doanh thu</span>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tổng Doanh Thu</h3>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.periodRevenue)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-rose-600" />
              </div>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full uppercase">Chi phí</span>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tổng Chi Phí</h3>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.periodCosts)}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Lợi nhuận</span>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Lợi Nhuận Thuần</h3>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(stats.periodProfit)}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-brand-blue/10 rounded-lg">
                <PieChart className="w-6 h-6 text-brand-blue" />
              </div>
              <span className="text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-full uppercase">Hiệu quả</span>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tỷ Lệ Lợi Nhuận</h3>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats.periodRevenue > 0 ? ((stats.periodProfit / stats.periodRevenue) * 100).toFixed(2) : '0.00'}%
            </p>
          </div>
        </div>

        {/* Secondary Management Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-brand-orange p-6 rounded-xl shadow-lg text-white relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <TableIcon className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">Quản lý đá</p>
              <h4 className="text-sm font-medium text-white/90 mb-1">Tiền nhập đá trong kỳ</h4>
              <p className="text-2xl font-black text-white mb-4">{formatCurrency(periodStoneImport)}</p>
              <button onClick={() => setActiveTab('stones')} className="text-xs font-bold text-white hover:text-white/80 flex items-center gap-1 transition-colors">
                CHI TIẾT KHO ĐÁ <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Vật tư & Phụ liệu</p>
                <div className="p-1.5 bg-brand-orange/10 rounded-lg text-brand-orange">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <h4 className="text-sm font-medium text-slate-600 mb-1">Chi phí vật tư đã dùng</h4>
              <p className="text-2xl font-black text-slate-900 mb-4">{formatCurrency(periodMaterialUsage)}</p>
            </div>
            <button onClick={() => setActiveTab('materials')} className="text-xs font-bold text-brand-blue hover:text-brand-blue/80 flex items-center gap-1 transition-colors">
              QUẢN LÝ VẬT TƯ <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Tiến độ xưởng</p>
                <div className="p-1.5 bg-brand-blue/10 rounded-lg text-brand-blue">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-1">Đơn hàng hoàn thành</h4>
                  <p className="text-2xl font-black text-slate-900">{completedWorkshopOrders}/{totalWorkshopOrders}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-brand-blue">{workshopProgress.toFixed(0)}%</p>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                <div 
                  className="bg-brand-blue h-full transition-all duration-1000" 
                  style={{ width: `${workshopProgress}%` }}
                />
              </div>
            </div>
            <button onClick={() => setActiveTab('workshop')} className="text-xs font-bold text-brand-blue hover:text-brand-blue/80 flex items-center gap-1 transition-colors">
              XEM TIẾN ĐỘ XƯỞNG <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Biểu đồ Doanh thu & Chi phí</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-brand-blue rounded-sm" />
                  <span className="text-slate-500 font-medium">Doanh thu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-sm" />
                  <span className="text-slate-500 font-medium">Chi phí</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                  <BarChart data={processedMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${(value/1000000).toFixed(0)}M`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="revenue" name="Doanh thu" fill="#114b9f" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalCost" name="Tổng chi phí" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Đơn hàng mới nhất</h3>
              <button 
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-brand-blue hover:bg-brand-blue/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                TẤT CẢ ĐƠN HÀNG
              </button>
            </div>
            <div className="space-y-3">
              {orders.slice(-5).reverse().map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-all border border-slate-50 hover:border-slate-200 group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs",
                      order.status === 'Đã chốt đơn' ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-orange/10 text-brand-orange"
                    )}>
                      {order.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{order.customer}</p>
                      <p className="text-xs text-slate-500 font-medium">{order.itemName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-slate-900">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyReport = () => {
    const rowsList = [
      { label: `Doanh thu ${selectedYear}`, key: 'revenue', color: 'text-slate-700 text-base', showPercentage: false, editable: false },
      { label: 'Lương Net', key: 'netSalary', color: 'text-slate-700 text-base', showPercentage: true, editable: true },
      { label: 'Lương Khoán', key: 'pieceRateSalary', color: 'text-red-600 text-base', showPercentage: true, editable: false },
      { label: 'CP Máy 1', key: 'machineCost1', color: 'text-slate-700 text-base', showPercentage: false, editable: false },
      { label: 'CP Máy 2', key: 'machineCost2', color: 'text-slate-700 text-base', showPercentage: false, editable: false },
      { label: 'CP Máy 3', key: 'machineCost3', color: 'text-slate-700 text-base', showPercentage: false, editable: false },
      { label: 'Điện', key: 'electricity', color: 'text-slate-700 text-base', showPercentage: false, editable: true },
      { label: 'Mặt bằng', key: 'rent', color: 'text-slate-700 text-base', showPercentage: false, editable: true },
      { label: 'Vật tư đá', key: 'materials', color: 'text-slate-700 text-base', showPercentage: false, editable: true },
      { label: 'Vật tư sản xuất', key: 'productionMaterials', color: 'text-slate-700 text-base', showPercentage: false, editable: false },
    ];

    const handleStartEdit = () => {
      setTempMonthlyData([...processedMonthlyData]);
      setIsEditingMonthly(true);
    };

    const handleSaveMonthly = async () => {
      try {
        const savePromises = tempMonthlyData.map(dataItem => {
          const id = `${dataItem.month}_${dataItem.year}`;
          return setDoc(doc(db, 'monthlyData', id), dataItem);
        });
        await Promise.all(savePromises);
        setIsEditingMonthly(false);
        showNotification('Đã lưu thay đổi báo cáo tháng!');
      } catch (errorItem) {
        handleFirestoreError(errorItem, OperationType.WRITE, 'monthlyData');
      }
    };

    const exportToExcel = () => {
      try {
        const reportRows = processedMonthlyData.map(d => ({
          'Tháng': d.month,
          'Năm': d.year,
          'Doanh thu': d.revenue,
          'Lương Net': d.netSalary,
          'Lương Khoán': d.pieceRateSalary,
          'CP Máy 1': d.machineCost1,
          'CP Máy 2': d.machineCost2,
          'CP Máy 3': d.machineCost3,
          'Điện': d.electricity,
          'Mặt bằng': d.rent,
          'Vật tư đá': d.materials,
          'Vật tư SX': d.productionMaterials,
          'Tổng CP': d.netSalary + d.pieceRateSalary + d.machineCost1 + d.machineCost2 + d.machineCost3 + d.electricity + d.rent + d.materials + d.productionMaterials
        }));

        const ordersRows = orders.map(o => ({
          'Khách hàng': o.customer,
          'Tên hàng': o.itemName,
          'NVKD': o.salesPerson,
          'Kỹ thuật': o.technicalPerson,
          'Khối lượng M2': o.quantityM2,
          'Khối lượng MD': o.quantityMD,
          'Thành tiền': o.totalAmount,
          'Trạng thái': o.status,
          'Ngày': o.date
        }));

        const wb = XLSX.utils.book_new();
        const wsReport = XLSX.utils.json_to_sheet(reportRows);
        const wsOrders = XLSX.utils.json_to_sheet(ordersRows);

        XLSX.utils.book_append_sheet(wb, wsReport, "Báo cáo tháng");
        XLSX.utils.book_append_sheet(wb, wsOrders, "Đơn hàng");

        XLSX.writeFile(wb, `StoneManager_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        showNotification('Đã xuất file Excel thành công!');
      } catch (errorItem) {
        console.error('Export error:', errorItem);
        showNotification('Lỗi khi xuất file Excel!', 'error');
      }
    };

    const handleCancelMonthly = () => {
      setIsEditingMonthly(false);
    };

    const updateTempData = (month: number, key: keyof MonthlyData, value: string) => {
      const numVal = parseFloat(value) || 0;
      setTempMonthlyData(prev => prev.map(d => d.month === month ? { ...d, [key]: numVal } : d));
    };

    const displayData = isEditingMonthly ? tempMonthlyData : processedMonthlyData;
    const displayMoney = (value: number) => formatNumber(Math.round(value || 0));

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Báo cáo Tổng hợp {selectedYear}</h3>
          <div className="flex gap-2">
            {!isEditingMonthly ? (
              <>
                <button 
                  onClick={handleStartEdit}
                  className="px-4 py-2 text-sm font-bold text-brand-blue hover:bg-brand-blue/10 border border-brand-blue/20 rounded-xl transition-colors"
                >
                  Chỉnh sửa số liệu
                </button>
                <button 
                  onClick={exportToExcel}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#f7941d] hover:bg-[#e68613] rounded-xl transition-colors shadow-lg shadow-orange-200 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Xuất Excel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleCancelMonthly}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSaveMonthly}
                  className="px-4 py-2 text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue/90 rounded-xl transition-colors shadow-lg shadow-brand-blue/20"
                >
                  Lưu thay đổi
                </button>
              </>
            )}
          </div>
        </div>
        <div className="responsive-table-container">
          <table className="w-full text-base text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-brand-blue/5 text-brand-blue border-b border-brand-blue/10">
                <th className="p-4 font-bold sticky left-0 bg-[#f8fafc] z-10 border-r border-slate-100 min-w-[180px]">Chỉ tiêu</th>
                {displayData.map(d => (
                  <th key={d.month} className="p-4 font-bold text-center min-w-[120px] border-r border-slate-100">Tháng {d.month}</th>
                ))}
                <th className="p-4 font-bold text-center bg-brand-blue/10 min-w-[140px]">Tổng cộng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rowsList.map((row) => (
                <React.Fragment key={row.key}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-100">{row.label}</td>
                    {displayData.map(d => (
                      <td key={d.month} className={cn("p-4 text-center", row.color)}>
                      {isEditingMonthly && row.editable ? (
                        <input 
                          type="number"
                          value={d[row.key as keyof MonthlyData]}
                          onChange={(e) => updateTempData(d.month, row.key as keyof MonthlyData, e.target.value)}
                          className="w-full bg-brand-blue/5 border border-brand-blue/20 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                        />
                      ) : (
                        displayMoney(d[row.key as keyof MonthlyData] as number)
                      )}
                    </td>
                  ))}
                  <td className={cn("p-4 text-center bg-slate-50", row.color)}>
                    {displayMoney(displayData.reduce((a, b) => a + (b[row.key as keyof MonthlyData] as number), 0))}
                  </td>
                  </tr>
                  {row.showPercentage && (
                    <tr className="bg-slate-50/30 text-base">
                      <td className="p-2 pl-4 font-medium text-red-500 italic sticky left-0 bg-slate-50/30 z-10 border-r border-slate-100">Tỉ lệ %</td>
                      {displayData.map(d => {
                        const val = d[row.key as keyof MonthlyData] as number;
                        const ratio = d.revenue > 0 ? (val / d.revenue) * 100 : 0;
                        return <td key={d.month} className="p-2 text-center text-red-500 text-base">{ratio.toFixed(2)}%</td>
                      })}
                      <td className="p-2 text-center text-red-500 bg-slate-100/50 text-base">
                        {(() => {
                          const totalVal = displayData.reduce((a, b) => a + (b[row.key as keyof MonthlyData] as number), 0);
                          const totalRev = displayData.reduce((a, b) => a + b.revenue, 0);
                          const result = totalRev > 0 ? (totalVal / totalRev * 100).toFixed(2) : '0.00';
                          return `${result}%`;
                        })()}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              <tr className="bg-slate-100 font-bold">
                <td className="p-4 text-slate-900 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">Tổng CP</td>
                {displayData.map(d => {
                  const total = d.netSalary + d.pieceRateSalary + d.machineCost1 + d.machineCost2 + d.machineCost3 + d.electricity + d.rent + d.materials + d.productionMaterials;
                  return <td key={d.month} className="p-4 text-center text-slate-900 text-base font-bold">{displayMoney(total)}</td>
                })}
                <td className="p-4 text-center text-slate-900 text-base font-bold">
                  {formatNumber(displayData.reduce((acc, d) => 
                    acc + d.netSalary + d.pieceRateSalary + d.machineCost1 + d.machineCost2 + d.machineCost3 + d.electricity + d.rent + d.materials + d.productionMaterials, 0
                  ))}
                </td>
              </tr>
              <tr className="bg-slate-200 font-bold">
                <td className="p-4 text-red-600 sticky left-0 bg-slate-200 z-10 border-r border-slate-300">Tỉ lệ %</td>
                {displayData.map(d => {
                  const total = d.netSalary + d.pieceRateSalary + d.machineCost1 + d.machineCost2 + d.machineCost3 + d.electricity + d.rent + d.materials + d.productionMaterials;
                  const ratio = d.revenue > 0 ? (total / d.revenue) * 100 : 0;
                  return <td key={d.month} className="p-4 text-center text-red-700 text-base font-bold">{ratio.toFixed(2)}%</td>
                })}
                <td className="p-4 text-center text-red-900 text-base font-bold">
                  {(() => {
                    const totalCosts = displayData.reduce((acc, d) => 
                      acc + d.netSalary + d.pieceRateSalary + d.machineCost1 + d.machineCost2 + d.machineCost3 + d.electricity + d.rent + d.materials + d.productionMaterials, 0
                    );
                    const totalRev = displayData.reduce((a, b) => a + b.revenue, 0);
                    return totalRev > 0 ? (totalCosts / totalRev * 100).toFixed(2) : '0.00';
                  })()}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const resetOrderForm = () => {
    setNewOrder({
      customer: '',
      itemName: '',
      salesPerson: 'KIỀU MƠ',
      technicalPerson: 'KT NGUYÊN',
      quantityM2: 0,
      quantityMD: 0,
      totalAmount: 0,
      status: 'Đang chờ khách',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const closeOrderModal = () => {
    setIsAddingOrder(false);
    setEditingOrder(null);
    resetOrderForm();
  };

  const handleEditOrder = (order: Order, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingOrder(order);
    setNewOrder({ ...order, date: normalizeOrderDate(order.date) });
    setIsAddingOrder(true);
  };

  const handleSaveOrder = async () => {
    if (!newOrder.customer) {
      showNotification('Vui lòng nhập tên khách hàng!', 'error');
      return;
    }
    if (!newOrder.itemName) {
      showNotification('Vui lòng nhập tên hàng!', 'error');
      return;
    }

    const normalizedOrderDate = normalizeOrderDate(newOrder.date);
    const orderDate = parseOrderDate(normalizedOrderDate);
    const orderMonth = orderDate.getMonth() + 1;
    const orderYear = orderDate.getFullYear();

    const orderPayload: Order = {
      ...(newOrder as Order),
      id: editingOrder?.id || Math.random().toString(36).substr(2, 9),
      date: normalizedOrderDate,
      quantityM2: Number(newOrder.quantityM2) || 0,
      quantityMD: Number(newOrder.quantityMD) || 0,
      totalAmount: Number(newOrder.totalAmount) || 0,
    };

    try {
      await setDoc(doc(db, 'orders', orderPayload.id), orderPayload);
      closeOrderModal();

      if (orderMonth !== selectedMonth || orderYear !== selectedYear) {
        setSelectedMonth(orderMonth);
        setSelectedYear(orderYear);
      }

      showNotification(editingOrder ? 'Đã cập nhật đơn hàng thành công!' : 'Đã thêm đơn hàng mới thành công!');
    } catch (errorItem) {
      handleFirestoreError(errorItem, OperationType.WRITE, 'orders');
    }
  };

  const renderOrderBreakdown = (order: Order) => {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Chi tiết tính giá khoán</h3>
              <p className="text-sm text-slate-500">Đơn hàng: {order.customer} - {order.itemName}</p>
            </div>
            <button 
              onClick={() => setSelectedOrder(null)}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <Plus className="w-6 h-6 rotate-45 text-slate-500" />
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-brand-blue/10 rounded-xl">
                <p className="text-xs font-medium text-brand-blue uppercase">Tổng giá trị</p>
                <p className="text-xl font-bold text-brand-blue">{formatCurrency(order.totalAmount)}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-xs font-medium text-emerald-600 uppercase">Khối lượng</p>
                <p className="text-xl font-bold text-emerald-900">
                  {order.quantityM2 > 0 ? `${order.quantityM2} m2` : `${order.quantityMD} md`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Phân bổ chi phí khoán</h4>
              <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-brand-blue/5 text-brand-blue border-b border-brand-blue/10">
                      <th className="p-3 text-left font-bold border-r border-brand-blue/10">Bộ phận</th>
                      <th className="p-3 text-center font-bold border-r border-brand-blue/10">Tỷ lệ</th>
                      <th className="p-3 text-right font-bold">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {departments.map(dept => {
                      const amount = (order.totalAmount * dept.percentage) / 100;
                      return (
                        <tr key={dept.name}>
                          <td className="p-3 text-slate-700 font-medium">{dept.name}</td>
                          <td className="p-3 text-center text-slate-700 text-base">{dept.percentage}%</td>
                          <td className="p-3 text-right text-slate-900 text-base">{formatCurrency(amount)}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100">
                      <td className="p-3 text-slate-900">Tổng cộng khoán</td>
                      <td className="p-3 text-center text-slate-900 text-base">
                        {departments.reduce((acc, curr) => acc + curr.percentage, 0).toFixed(2)}%
                      </td>
                      <td className="p-3 text-right text-brand-blue text-base">
                        {formatCurrency(departments.reduce((acc, curr) => acc + (order.totalAmount * curr.percentage) / 100, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAddOrderModal = () => (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">{editingOrder ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới'}</h3>
          <button onClick={closeOrderModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <Plus className="w-6 h-6 rotate-45 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Khách hàng</label>
            <input 
              type="text" 
              value={newOrder.customer}
              onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
              placeholder="Tên khách hàng"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Tên hàng</label>
            <input 
              type="text" 
              value={newOrder.itemName}
              onChange={(e) => setNewOrder({...newOrder, itemName: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
              placeholder="Tên sản phẩm/dịch vụ"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">NVKD</label>
              <input 
                type="text" 
                value={newOrder.salesPerson}
                onChange={(e) => setNewOrder({...newOrder, salesPerson: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
                placeholder="Nhân viên kinh doanh"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Kỹ thuật</label>
              <input 
                type="text" 
                value={newOrder.technicalPerson}
                onChange={(e) => setNewOrder({...newOrder, technicalPerson: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
                placeholder="Nhân viên kỹ thuật"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Khối lượng M2</label>
              <input 
                type="number" 
                value={newOrder.quantityM2}
                onChange={(e) => setNewOrder({...newOrder, quantityM2: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Khối lượng MD</label>
              <input 
                type="number" 
                value={newOrder.quantityMD}
                onChange={(e) => setNewOrder({...newOrder, quantityMD: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Thành tiền (VND)</label>
            <input 
              type="number" 
              value={newOrder.totalAmount}
              onChange={(e) => setNewOrder({...newOrder, totalAmount: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Ngày</label>
              <input 
                type="date" 
                value={newOrder.date}
                onChange={(e) => setNewOrder({...newOrder, date: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Trạng thái</label>
              <select 
                value={newOrder.status}
                onChange={(e) => setNewOrder({...newOrder, status: e.target.value as any})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
              >
                <option value="Đang chờ khách">Đang chờ khách</option>
                <option value="Đang báo giá">Đang báo giá</option>
                <option value="Không chốt">Không chốt</option>
                <option value="Chưa báo giá">Chưa báo giá</option>
                <option value="Đã chốt đơn">Đã chốt đơn</option>
                <option value="Đã giao hàng">Đã giao hàng</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={closeOrderModal} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Hủy</button>
          <button onClick={handleAddOrder} className="px-6 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-brand-blue/90 transition-colors shadow-lg shadow-brand-blue/20">{editingOrder ? 'Lưu thay đổi' : 'Thêm đơn hàng'}</button>
        </div>
      </div>
    </div>
  );

  const renderDeleteConfirmationModal = () => {
    if (!orderToDelete) return null;
    
    const order = orders.find(o => o.id === orderToDelete);
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa đơn hàng</h3>
            <p className="text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa đơn hàng của khách hàng <span className="font-bold text-slate-800">{order.customer}</span>? 
              Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.
            </p>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button 
              onClick={() => setOrderToDelete(null)} 
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={confirmDeleteOrder} 
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-200 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
            </button>
          </div>
        </div>
      </div>
    );
  };

    const exportOrdersToExcel = () => {
      try {
        const ordersRows = filteredOrders.map((o, idx) => {
          const row: any = {
            'STT': idx + 1,
            'Khách hàng': o.customer,
            'Tên hàng': o.itemName,
            'NVKD': o.salesPerson,
            'Kỹ thuật': o.technicalPerson,
            'Khối lượng M2': o.quantityM2,
            'Khối lượng MD': o.quantityMD,
            'Thành tiền': o.totalAmount,
            'Trạng thái': o.status,
            'Ngày': o.date
          };
          
          // Add department breakdown
          departments.forEach(dept => {
            row[dept.name.toUpperCase()] = (o.totalAmount * dept.percentage) / 100;
          });
          
          return row;
        });

        const wb = XLSX.utils.book_new();
        const wsOrders = XLSX.utils.json_to_sheet(ordersRows);
        XLSX.utils.book_append_sheet(wb, wsOrders, "Danh sách đơn hàng");
        XLSX.writeFile(wb, `TGP_DonHang_${getPeriodLabel()}_${new Date().toISOString().split('T')[0]}.xlsx`);
        showNotification('Đã xuất file Excel đơn hàng thành công!');
      } catch (errorItem) {
        console.error('Export error:', errorItem);
        showNotification('Lỗi khi xuất file Excel!', 'error');
      }
    };

    const exportMaterialsToExcel = () => {
      try {
        const filteredMaterials = materials
          .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.toLowerCase().includes(searchTerm.toLowerCase()))
          .filter(m => !showLowStockOnly || (m.stock || 0) < 3);

        const materialsRows = filteredMaterials.map((m, idx) => ({
          'STT': idx + 1,
          'Mã hàng': m.code,
          'Tên hàng': m.name,
          'ĐVT': m.unit,
          'Số lượng tồn': m.stock,
          'Đơn giá': m.price,
          'Thành tiền tồn': m.stock * m.price,
          'Phân loại': m.category
        }));

        const wb = XLSX.utils.book_new();
        const wsMaterials = XLSX.utils.json_to_sheet(materialsRows);
        XLSX.utils.book_append_sheet(wb, wsMaterials, "Danh sách vật tư");
        const fileName = showLowStockOnly 
          ? `TGP_VatTu_TonThap_${new Date().toISOString().split('T')[0]}.xlsx`
          : `TGP_VatTu_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        showNotification(showLowStockOnly ? 'Đã xuất danh sách vật tư tồn thấp!' : 'Đã xuất file Excel vật tư thành công!');
      } catch (errorItem) {
        console.error('Export error:', errorItem);
        showNotification('Lỗi khi xuất file Excel!', 'error');
      }
    };

  const renderOrders = () => (
    <div className="space-y-4">
      {selectedOrder && renderOrderBreakdown(selectedOrder)}
      {isAddingOrder && renderAddOrderModal()}
      {orderToDelete && renderDeleteConfirmationModal()}
      
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center gap-4">
          <TimeFilter />
          <div className="h-8 w-px bg-slate-100 mx-2 hidden lg:block" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">NVKD</label>
              <select 
                value={selectedSalesPerson}
                onChange={(e) => setSelectedSalesPerson(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              >
                <option value="all">Tất cả NVKD</option>
                {salesStaff.map(staff => (
                  <option key={staff} value={staff}>{staff}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Kỹ thuật</label>
              <select 
                value={selectedTechnicalPerson}
                onChange={(e) => setSelectedTechnicalPerson(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              >
                <option value="all">Tất cả Kỹ thuật</option>
                {technicalStaff.map(staff => (
                  <option key={staff} value={staff}>{staff}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Trạng thái</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đang chờ khách">Đang chờ khách</option>
                <option value="Đang báo giá">Đang báo giá</option>
                <option value="Không chốt">Không chốt</option>
                <option value="Chưa báo giá">Chưa báo giá</option>
                <option value="Đã chốt đơn">Đã chốt đơn</option>
                <option value="Đã giao hàng">Đã giao hàng</option>
              </select>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-100 mx-2 hidden lg:block" />
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm khách hàng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Danh sách đơn hàng</h3>
            <button 
              onClick={exportOrdersToExcel}
              className="px-3 py-1.5 text-[10px] font-bold text-white bg-[#f7941d] hover:bg-[#e68613] rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <FileText className="w-3 h-3" /> XUẤT EXCEL
            </button>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-red-600 uppercase">
              {selectedSalesPerson !== 'all' ? `DOANH THU ${selectedSalesPerson}` : 
               selectedTechnicalPerson !== 'all' ? `DOANH THU ${selectedTechnicalPerson}` : 
               `DOANH THU T${selectedMonth}/${selectedYear}`}
            </span>
            <span className="text-lg font-black text-red-600">{formatNumber(monthTotalRevenue)} đ</span>
          </div>
        </div>
        <div className="responsive-table-container">
          <table className="w-full text-base text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-brand-blue/5 text-brand-blue border-b border-brand-blue/10">
                <th rowSpan={2} className="p-2 font-bold border-r border-brand-blue/10 text-center">STT</th>
                <th rowSpan={2} className="p-2 font-bold border-r border-brand-blue/10 min-w-[150px]">KHÁCH HÀNG</th>
                <th rowSpan={2} className="p-2 font-bold border-r border-brand-blue/10 min-w-[150px]">TÊN HÀNG</th>
                <th rowSpan={2} className="p-2 font-bold border-r border-brand-blue/10 text-center">NVKD</th>
                <th rowSpan={2} className="p-2 font-bold border-r border-brand-blue/10 text-center">KỸ THUẬT</th>
                <th rowSpan={2} className="p-2 font-bold border-r border-brand-blue/10 text-center">KHỐI LƯỢNG</th>
                <th rowSpan={2} className="p-2 font-bold border-r border-brand-blue/10 text-right">THÀNH TIỀN</th>
                <th colSpan={departments.length} className="p-2 font-bold border-r border-brand-blue/10 text-center uppercase tracking-wider bg-brand-blue/10">TÍNH GIÁ KHOÁN</th>
                <th rowSpan={2} className="p-2 font-bold text-center">Trạng thái</th>
              </tr>
              <tr className="bg-brand-blue/5 text-brand-blue border-b border-brand-blue/10">
                {departments.map(dept => (
                  <th key={dept.name} className="p-1 font-bold border-r border-brand-blue/10 text-center uppercase text-xs">
                    {dept.name} {dept.percentage > 0 && !['Kế toán', 'Bảo trì'].includes(dept.name) ? `${dept.percentage}%` : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                <>
                  {filteredOrders.map((order, idx) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="p-2 text-slate-500 text-center border-r border-slate-100">{idx + 1}</td>
                      <td className="p-2 font-medium text-slate-900 group-hover:text-brand-blue transition-colors border-r border-slate-100">{order.customer}</td>
                      <td className="p-2 text-slate-600 border-r border-slate-100">{order.itemName}</td>
                      <td className="p-2 text-slate-600 text-center border-r border-slate-100">{order.salesPerson}</td>
                      <td className="p-2 text-slate-600 text-center border-r border-slate-100">{order.technicalPerson}</td>
                      <td className="p-2 text-slate-600 text-center border-r border-slate-100 text-base">
                        {order.quantityM2 > 0 ? `${order.quantityM2} m2` : `${order.quantityMD} md`}
                      </td>
                      <td className="p-2 text-slate-900 text-right border-r border-slate-100 text-base">{formatNumber(order.totalAmount)}</td>
                      
                      {departments.map(dept => {
                        const isConfirmed = ['Đã chốt đơn', 'Đã giao hàng'].includes(order.status);
                        const amount = isConfirmed ? (order.totalAmount * dept.percentage) / 100 : 0;
                        return (
                          <td key={dept.name} className={cn(
                            "p-2 text-right border-r border-slate-100 text-base",
                            isConfirmed ? "text-slate-700" : "text-slate-300 italic"
                          )}>
                            {amount > 0 ? formatNumber(Math.round(amount)) : '-'}
                          </td>
                        );
                      })}

                      <td className="p-2 text-center">
                        <div className="flex items-center gap-1">
                          <select 
                            value={order.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                            className={cn(
                              "flex-1 py-1 rounded text-[9px] font-bold uppercase transition-all border-none focus:ring-0 cursor-pointer",
                              order.status === 'Đã chốt đơn' ? "bg-brand-blue text-white" : 
                              order.status === 'Đã giao hàng' ? "bg-green-600 text-white" :
                              order.status === 'Không chốt' ? "bg-red-100 text-red-600" :
                              order.status === 'Đang báo giá' ? "bg-brand-blue/10 text-brand-blue" :
                              order.status === 'Đang chờ khách' ? "bg-brand-orange/10 text-brand-orange" :
                              "bg-slate-100 text-slate-400"
                            )}
                          >
                            {['Đang chờ khách', 'Đang báo giá', 'Không chốt', 'Chưa báo giá', 'Đã chốt đơn', 'Đã giao hàng'].map(statusItem => (
                              <option key={statusItem} value={statusItem} className="bg-white text-slate-900">{statusItem}</option>
                            ))}
                          </select>
                          <button 
                            onClick={(e) => handleEditOrder(order, e)}
                            className="p-1 text-slate-300 hover:text-brand-blue transition-colors opacity-0 group-hover:opacity-100"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteOrder(order.id, e)}
                            className="p-1 text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa"
                          >
                            <Plus className="w-3 h-3 rotate-45" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-slate-50 border-t-2 border-slate-200 text-base">
                    <td colSpan={6} className="p-2 text-right text-slate-900 uppercase">Tổng cộng:</td>
                    <td className="p-2 text-right border-r border-slate-100 text-brand-blue text-base">
                      {formatNumber(filteredOrders.reduce((acc, curr) => acc + curr.totalAmount, 0))}
                    </td>
                    {departments.map(dept => {
                      const totalDeptAmount = filteredOrders
                        .filter(o => ['Đã chốt đơn', 'Đã giao hàng'].includes(o.status))
                        .reduce((acc, order) => {
                          return acc + (order.totalAmount * dept.percentage) / 100;
                        }, 0);
                      return (
                        <td key={dept.name} className="p-2 text-right border-r border-slate-100 text-red-600 text-base">
                          {totalDeptAmount > 0 ? formatNumber(Math.round(totalDeptAmount)) : '-'}
                        </td>
                      );
                    })}
                    <td className="p-2 text-right text-red-700 bg-red-50 text-base">
                      {formatNumber(Math.round(filteredOrders
                        .filter(o => ['Đã chốt đơn', 'Đã giao hàng'].includes(o.status))
                        .reduce((acc, order) => {
                          return acc + departments.reduce((dAcc, dept) => dAcc + (order.totalAmount * dept.percentage) / 100, 0);
                        }, 0)))}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={7 + departments.length + 1} className="p-12 text-center text-slate-400 italic">
                    Không tìm thấy đơn hàng nào trong tháng {selectedMonth}/{selectedYear}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={() => {
            setEditingOrder(null);
            resetOrderForm();
            setIsAddingOrder(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors shadow-sm shadow-brand-blue/20"
        >
          <Plus className="w-4 h-4" /> Thêm đơn hàng mới
        </button>
      </div>
    </div>
  );

  const renderWorkshopProgress = () => (
    <div className={cn(
      "space-y-4",
      isWorkshopMaximized && "fixed inset-0 bg-slate-50 z-[80] overflow-y-auto space-y-0 p-0"
    )}>
      {isAddingWorkshopOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingWorkshopOrder ? 'Sửa đơn hàng xưởng' : 'Thêm đơn hàng xưởng mới'}
              </h3>
              <button onClick={() => { setIsAddingWorkshopOrder(false); setEditingWorkshopOrder(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Khách hàng</label>
                  <input 
                    type="text" 
                    value={newWorkshopOrder.customer}
                    onChange={(e) => setNewWorkshopOrder({...newWorkshopOrder, customer: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
                    placeholder="Tên khách hàng"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Hạng mục</label>
                  <input 
                    type="text" 
                    value={newWorkshopOrder.category}
                    onChange={(e) => setNewWorkshopOrder({...newWorkshopOrder, category: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
                    placeholder="Chi tiết hạng mục"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Số lượng</label>
                  <input 
                    type="number" 
                    value={newWorkshopOrder.quantity}
                    onChange={(e) => setNewWorkshopOrder({...newWorkshopOrder, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Diện tích (m²)</label>
                  <input 
                    type="number" 
                    value={newWorkshopOrder.area}
                    onChange={(e) => setNewWorkshopOrder({...newWorkshopOrder, area: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Ngày nhận</label>
                  <input 
                    type="date" 
                    value={newWorkshopOrder.receivedDate}
                    onChange={(e) => setNewWorkshopOrder({...newWorkshopOrder, receivedDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Ngày giao</label>
                  <input 
                    type="date" 
                    value={newWorkshopOrder.deliveryDate}
                    onChange={(e) => setNewWorkshopOrder({...newWorkshopOrder, deliveryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <input 
                    type="checkbox" 
                    id="isPacked"
                    checked={newWorkshopOrder.isPacked}
                    onChange={(e) => setNewWorkshopOrder({...newWorkshopOrder, isPacked: e.target.checked})}
                    className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="isPacked" className="text-sm font-medium text-slate-700">Đóng kiện</label>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <input 
                    type="checkbox" 
                    id="hasDecal"
                    checked={newWorkshopOrder.hasDecal}
                    onChange={(e) => setNewWorkshopOrder({...newWorkshopOrder, hasDecal: e.target.checked})}
                    className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="hasDecal" className="text-sm font-medium text-slate-700">Decal</label>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Trạng thái</label>
                  <select 
                    value={newWorkshopOrder.status}
                    onChange={(e) => setNewWorkshopOrder({...newWorkshopOrder, status: e.target.value as WorkshopStatus})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  >
                    {workshopStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Ảnh sản phẩm</label>
                <div className="flex items-center gap-4">
                  {newWorkshopOrder.imageUrl && (
                    <div className="relative group/preview">
                      <img 
                        src={newWorkshopOrder.imageUrl} 
                        className="w-20 h-20 object-cover rounded-lg border border-slate-200" 
                        alt="Preview" 
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={() => setNewWorkshopOrder({...newWorkshopOrder, imageUrl: ''})}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover/preview:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const fileItem = e.target.files?.[0];
                        if (fileItem) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewWorkshopOrder({...newWorkshopOrder, imageUrl: reader.result as string});
                          };
                          reader.readAsDataURL(fileItem);
                        }
                      }}
                      className="hidden"
                      id="workshop-image-upload"
                    />
                    <label 
                      htmlFor="workshop-image-upload"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 cursor-pointer border border-slate-200 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" /> Tải ảnh lên từ máy tính
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1 italic">Hoặc dán link ảnh bên dưới</p>
                  </div>
                </div>
                <input 
                  type="text" 
                  value={newWorkshopOrder.imageUrl}
                  onChange={(e) => setNewWorkshopOrder({...newWorkshopOrder, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none mt-2"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Ghi chú thêm</label>
                <textarea 
                  value={newWorkshopOrder.note}
                  onChange={(e) => setNewWorkshopOrder({...newWorkshopOrder, note: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none min-h-[80px]"
                  placeholder="Ghi chú chi tiết..."
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => { setIsAddingWorkshopOrder(false); setEditingWorkshopOrder(null); }} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Hủy</button>
              <button onClick={handleAddWorkshopOrder} className="px-6 py-2 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20">
                {editingWorkshopOrder ? 'Cập nhật' : 'Thêm đơn hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {workshopOrderToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa đơn hàng xưởng</h3>
              <p className="text-slate-500 leading-relaxed">
                Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setWorkshopOrderToDelete(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Hủy</button>
              <button onClick={confirmDeleteWorkshopOrder} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}

      <div className={cn(
        "flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white px-6 shadow-sm border border-slate-100 gap-4",
        isWorkshopMaximized ? "h-16 rounded-none border-x-0 border-t-0 border-b relative z-30 flex-shrink-0" : "p-4 rounded-xl"
      )}>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-blue" /> HIỂN THỊ ĐƠN HÀNG XƯỞNG
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsWorkshopMaximized(!isWorkshopMaximized)}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold transition-all",
              isWorkshopMaximized ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
            title={isWorkshopMaximized ? "Thu nhỏ" : "Phóng to"}
          >
            {isWorkshopMaximized ? <X className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            {isWorkshopMaximized ? "Thu nhỏ" : "Phóng to"}
          </button>
          {!isWorkshopMaximized && (
            <button 
              onClick={() => {
                setNewWorkshopOrder({
                  customer: '',
                  category: '',
                  quantity: 1,
                  area: 0,
                  receivedDate: new Date().toISOString().split('T')[0],
                  deliveryDate: '',
                  isPacked: false,
                  hasDecal: false,
                  status: 'Chưa sản xuất',
                  note: ''
                });
                setIsAddingWorkshopOrder(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
            >
              <Plus className="w-4 h-4" /> Thêm đơn hàng xưởng
            </button>
          )}
        </div>
      </div>

      {(workshopAlerts.overdue.length > 0 || workshopAlerts.today.length > 0 || workshopAlerts.upcoming.length > 0) && (
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8",
          isWorkshopMaximized ? "px-4 sm:px-6 py-4" : "px-0"
        )}>
          {/* Overdue Deliveries */}
          {workshopAlerts.overdue.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group shadow-2xl shadow-slate-900/20">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-20 h-20 text-red-500" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-900/40 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Đã quá hạn giao</h3>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{workshopAlerts.overdue.length} ĐƠN HÀNG NGUY CẤP</p>
                </div>
              </div>
              
              <div className="space-y-3 relative z-10">
                {workshopAlerts.overdue.map(orderItem => {
                  const dItem = new Date(orderItem.deliveryDate);
                  const dateStr = `${dItem.getDate()}/${dItem.getMonth() + 1}`;
                  return (
                    <div key={`overdue-${orderItem.id}`} className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-xl border border-slate-700 shadow-sm flex justify-between items-center group/item hover:bg-slate-800 transition-all">
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{orderItem.customer}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{orderItem.category} - Trễ từ {dateStr}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-black uppercase">Quá hạn</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Today's Deliveries */}
          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-20 h-20 text-rose-600" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-rose-900 uppercase tracking-tight">Hôm nay giao hàng</h3>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">{workshopAlerts.today.length} ĐƠN HÀNG</p>
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
              {workshopAlerts.today.length > 0 ? (
                workshopAlerts.today.map(orderItem => (
                  <div key={`today-${orderItem.id}`} className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-rose-100 shadow-sm flex justify-between items-center group/item hover:bg-white transition-all">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{orderItem.customer}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{orderItem.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-[10px] font-black uppercase">Giao ngay</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-rose-400 italic">Không có đơn hàng nào giao hôm nay.</p>
              )}
            </div>
          </div>

          {/* Upcoming Deliveries */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Calendar className="w-20 h-20 text-amber-600" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight">Sắp tới ngày giao</h3>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">{workshopAlerts.upcoming.length} ĐƠN HÀNG (2 NGÀY TỚI)</p>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              {workshopAlerts.upcoming.length > 0 ? (
                workshopAlerts.upcoming.map(orderItem => {
                  const dItem = new Date(orderItem.deliveryDate);
                  const dateStr = `${dItem.getDate()}/${dItem.getMonth() + 1}`;
                  return (
                    <div key={`upcoming-${orderItem.id}`} className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-amber-100 shadow-sm flex justify-between items-center group/item hover:bg-white transition-all">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{orderItem.customer}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{orderItem.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-black uppercase">{dateStr}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-amber-400 italic">Không có đơn hàng nào sắp giao.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={cn(
        "bg-white shadow-sm border border-slate-100",
        isWorkshopMaximized ? "rounded-none border-0" : "rounded-xl overflow-hidden"
      )}>
        <div className="responsive-table-container">
          <table className="w-full text-base text-left border-collapse min-w-[1200px]">
            <thead className={cn(
              isWorkshopMaximized && "sticky top-0 z-20 shadow-md bg-white"
            )}>
              <tr className="bg-[#f8fafc] text-brand-blue border-b border-brand-blue/10">
                <th className="p-3 font-bold border-r border-brand-blue/10 text-center w-12">STT</th>
                <th className="p-3 font-bold border-r border-brand-blue/10 min-w-[150px]">KH</th>
                <th className="p-3 font-bold border-r border-brand-blue/10 min-w-[250px]">Hạng mục</th>
                <th className="p-3 font-bold border-r border-brand-blue/10 text-center">Số lượng</th>
                <th className="p-3 font-bold border-r border-brand-blue/10 text-center">Diện tích (m²)</th>
                <th className="p-3 font-bold border-r border-brand-blue/10 text-center">Ngày nhận</th>
                <th className="p-3 font-bold border-r border-brand-blue/10 text-center">Ngày giao</th>
                <th className="p-3 font-bold border-r border-brand-blue/10 text-center">Đóng kiện</th>
                <th className="p-3 font-bold border-r border-brand-blue/10 text-center">Decal</th>
                <th className="p-3 font-bold border-r border-brand-blue/10 text-center min-w-[200px]">Trạng thái</th>
                <th className="p-3 font-bold text-center">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {workshopOrders.map((orderItem, idx) => (
                <tr key={orderItem.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-3 text-center border-r border-slate-100 font-medium text-slate-500">
                    <div className="flex flex-col items-center gap-1">
                      <span>{idx + 1}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingWorkshopOrder(orderItem);
                            setNewWorkshopOrder(orderItem);
                            setIsAddingWorkshopOrder(true);
                          }}
                          className="p-1 text-brand-blue hover:bg-brand-blue/10 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteWorkshopOrder(orderItem.id, e)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-bold text-slate-900 border-r border-slate-100">{orderItem.customer}</td>
                  <td className="p-3 text-slate-700 border-r border-slate-100 font-medium leading-relaxed">{orderItem.category}</td>
                  <td className="p-3 text-center border-r border-slate-100">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-900 border border-slate-200 text-base">{orderItem.quantity}</span>
                  </td>
                  <td className="p-3 text-center border-r border-slate-100">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-900 border border-slate-200 text-base">{orderItem.area}</span>
                  </td>
                  <td className="p-3 text-center border-r border-slate-100 text-slate-600 font-medium">
                    {orderItem.receivedDate ? new Date(orderItem.receivedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '-'}
                  </td>
                  <td className="p-3 text-center border-r border-slate-100 text-slate-600 font-medium">
                    {orderItem.deliveryDate ? new Date(orderItem.deliveryDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '-'}
                  </td>
                  <td className="p-3 text-center border-r border-slate-100">
                    <div className="flex justify-center">
                      {orderItem.isPacked ? (
                        <div className="w-6 h-6 bg-brand-blue rounded flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-slate-200 rounded" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center border-r border-slate-100">
                    <div className="flex justify-center">
                      {orderItem.hasDecal ? (
                        <div className="w-6 h-6 bg-brand-blue rounded flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-slate-200 rounded" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center border-r border-slate-100">
                    <select 
                      value={orderItem.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value as WorkshopStatus;
                      try {
                        await updateDoc(doc(db, 'workshopOrders', orderItem.id), { status: newStatus });
                        showNotification(`Đã cập nhật trạng thái: ${newStatus}`);
                      } catch (errorItem) {
                        handleFirestoreError(errorItem, OperationType.UPDATE, 'workshopOrders');
                      }
                    }}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-sm font-bold border focus:outline-none transition-all cursor-pointer text-center appearance-none",
                        getWorkshopStatusColor(orderItem.status)
                      )}
                    >
                      {workshopStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-4">
                      {orderItem.imageUrl ? (
                        <div className="relative group/img flex-shrink-0">
                          <img 
                            src={orderItem.imageUrl} 
                            alt="Ghi chú" 
                            className="h-24 w-auto min-w-[200px] max-w-[450px] object-contain rounded-lg border border-slate-200 shadow-sm bg-slate-50 cursor-zoom-in"
                            referrerPolicy="no-referrer"
                            onClick={() => setZoomedImage(orderItem.imageUrl)}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                            <Maximize className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-24 w-48 flex-shrink-0 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 italic text-[10px]">
                          Không có ảnh
                        </div>
                      )}
                      {orderItem.note && <p className="text-xs text-slate-500 italic leading-relaxed max-w-[250px] line-clamp-4">{orderItem.note}</p>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Lightbox Modal [Tính năng phóng to] */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setZoomedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={zoomedImage} 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in duration-300" 
            alt="Zoomed" 
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
  const renderMaterialDeleteModal = () => {
    if (!materialToDelete) return null;
    const materialItem = materials.find(m => m.id === materialToDelete);
    if (!materialItem) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa vật tư</h3>
            <p className="text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa vật tư <span className="font-bold text-slate-800">{materialItem.name}</span>? 
              Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.
            </p>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={() => setMaterialToDelete(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Hủy bỏ</button>
            <button onClick={confirmDeleteMaterial} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-200 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTransactionDeleteModal = () => {
    if (!transactionToDelete) return null;
    const tItem = transactions.find(item => item.id === transactionToDelete);
    if (!tItem) return null;
    const materialItem = materials.find(m => m.id === tItem.materialId);

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa lịch sử</h3>
            <p className="text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa lịch sử <span className="font-bold text-slate-800">{tItem.type === 'IMPORT' ? 'Nhập' : 'Xuất'}</span> vật tư <span className="font-bold text-slate-800">{materialItem?.name}</span>? 
              Số lượng tồn sẽ được hoàn lại tương ứng.
            </p>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={() => setTransactionToDelete(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Hủy bỏ</button>
            <button onClick={confirmDeleteTransaction} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-200 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMaterials = () => {
    const categoriesList = ['VẬT TƯ MÁY', 'VẬT TƯ DÁN'] as const;

    // Filter transactions by selected month/year, location and type
    const filteredTransactionsList = transactions.filter(t => {
      const tDate = new Date(t.date);
      const tMonth = tDate.getMonth() + 1;
      const tYear = tDate.getFullYear();
      const tQuarter = Math.floor((tMonth - 1) / 3) + 1;

      let matchesTime = false;
      if (viewType === 'month') {
        matchesTime = tMonth === selectedMonth && tYear === selectedYear;
      } else if (viewType === 'quarter') {
        matchesTime = tQuarter === selectedQuarter && tYear === selectedYear;
      } else {
        matchesTime = tYear === selectedYear;
      }

      const matchesLocation = selectedLocation === 'all' || t.location === selectedLocation;
      const matchesType = selectedTransactionType === 'all' || t.type === selectedTransactionType;
      return matchesTime && matchesLocation && matchesType;
    });

    const locationsList = ['Máy cắt 1', 'Máy cắt 2', 'Máy cắt 3', 'Máy cắt cầu', 'Khu vực đánh bóng', 'Khu vực hoa văn'];

    // Calculate monthly totals
    const monthlyStatsData = filteredTransactionsList.reduce((acc, t) => {
      const materialItem = materials.find(m => m.id === t.materialId);
      const priceVal = materialItem?.price || 0;
      const valueVal = t.quantity * priceVal;
      
      if (t.type === 'IMPORT') {
        acc.importValue += valueVal;
      } else {
        acc.exportValue += valueVal;
      }
      return acc;
    }, { importValue: 0, exportValue: 0 });

    const totalStockValueAmount = materials.reduce((acc, m) => acc + (m.stock * m.price), 0);
    
    return (
      <div className="space-y-6">
        {/* Time Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-blue/10 rounded-lg">
              <Package className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Quản lý kho vật tư</h3>
              <p className="text-xs text-slate-500 font-medium">Theo dõi nhập xuất vật tư & phụ liệu</p>
            </div>
          </div>
          <TimeFilter />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Tổng giá trị nhập ({getPeriodLabel()})</p>
              <p className="text-xl font-black text-slate-900">{formatCurrency(monthlyStatsData.importValue)}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                {selectedLocation === 'all' ? `Tổng chi phí sử dụng (${getPeriodLabel()})` : `Chi phí: ${selectedLocation} (${getPeriodLabel()})`}
              </p>
              <p className="text-xl font-black text-brand-orange">{formatCurrency(monthlyStatsData.exportValue)}</p>
            </div>
          </div>

          <div className="bg-[#f7941d] p-6 rounded-2xl shadow-lg shadow-orange-200 flex items-center gap-4 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-white/90 font-medium uppercase tracking-wider mb-1">Tổng giá trị tồn kho hiện tại</p>
              <p className="text-xl font-black text-white">{formatCurrency(totalStockValueAmount)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center flex-1">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm vật tư..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="text-sm font-medium text-slate-600 bg-transparent focus:outline-none cursor-pointer flex-1 sm:flex-none"
              >
                <option value="all">Tất cả khu vực</option>
                {locationsList.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={selectedTransactionType}
                onChange={(e) => setSelectedTransactionType(e.target.value as any)}
                className="text-sm font-medium text-slate-600 bg-transparent focus:outline-none cursor-pointer flex-1 sm:flex-none"
              >
                <option value="all">Tất cả loại</option>
                <option value="IMPORT">Nhập kho</option>
                <option value="EXPORT">Xuất kho</option>
              </select>
            </div>

            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all border",
                showLowStockOnly 
                  ? "bg-red-50 text-red-600 border-red-200" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              <AlertTriangle className={cn("w-4 h-4", showLowStockOnly ? "text-red-600" : "text-slate-400")} />
              {showLowStockOnly ? 'Đang lọc tồn thấp' : 'Lọc tồn thấp (<3)'}
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all border",
                showHistory 
                  ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              <History className="w-4 h-4" />
              {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportMaterialsToExcel}
              className="flex items-center justify-center gap-2 bg-[#f7941d] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#e68a1a] transition-all shadow-lg shadow-orange-200"
            >
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
            <button 
              onClick={() => {
                setNewMaterial({ code: '', name: '', unit: '', price: 0, stock: 0, category: 'VẬT TƯ DÁN' });
                setEditingMaterialId(null);
                setIsAddingMaterial(true);
              }}
              className="flex items-center justify-center gap-2 bg-brand-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
            >
              <Plus className="w-5 h-5" /> Thêm vật tư
            </button>
          </div>
        </div>

        {/* Transaction History */}
        {showHistory && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-brand-blue" /> 
                Lịch sử {selectedLocation === 'all' ? 'toàn bộ' : selectedLocation} ({getPeriodLabel()})
              </h3>
              <div className="text-xs text-slate-500 font-medium">
                Hiển thị {filteredTransactionsList.length} giao dịch
              </div>
            </div>
            <div className="responsive-table-container">
              <table className="w-full text-base text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3 font-bold">Ngày</th>
                    <th className="p-3 font-bold">Loại</th>
                    <th className="p-3 font-bold">Vật tư</th>
                    <th className="p-3 font-bold text-center">Số lượng</th>
                    <th className="p-3 font-bold text-right">Thành tiền</th>
                    <th className="p-3 font-bold">Nơi sử dụng</th>
                    <th className="p-3 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactionsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">Chưa có giao dịch nào trong tháng này</td>
                    </tr>
                  ) : (
                    filteredTransactionsList.slice().reverse().map(tItem => {
                      const materialItem = materials.find(m => m.id === tItem.materialId);
                      const priceVal = materialItem?.price || 0;
                      const totalVal = tItem.quantity * priceVal;
                      return (
                        <tr key={tItem.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-slate-600">{tItem.date}</td>
                          <td className="p-3">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                              tItem.type === 'IMPORT' ? "bg-green-100 text-green-700" : "bg-brand-orange/10 text-brand-orange"
                            )}>
                              {tItem.type === 'IMPORT' ? 'Nhập' : 'Xuất'}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-900">{materialItem?.name || 'N/A'}</td>
                          <td className="p-3 text-center font-bold text-base">
                            <span className={cn(tItem.type === 'IMPORT' ? "text-green-600" : "text-brand-orange")}>
                              {tItem.type === 'IMPORT' ? '+' : '-'}{tItem.quantity}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900 text-base">
                            {formatNumber(totalVal)}
                          </td>
                          <td className="p-3 text-slate-500 italic">{tItem.location || (tItem.type === 'IMPORT' ? 'Kho' : '')}</td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => setTransactionToDelete(tItem.id)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="responsive-table-container">
            <table className="w-full text-base text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-brand-blue/5 text-brand-blue border-b border-brand-blue/10">
                  <th className="p-3 font-bold border-r border-brand-blue/10 text-center w-12">STT</th>
                  <th className="p-3 font-bold border-r border-brand-blue/10 min-w-[120px]">Mã hàng</th>
                  <th className="p-3 font-bold border-r border-brand-blue/10 min-w-[300px]">Tên hàng</th>
                  <th className="p-3 font-bold border-r border-brand-blue/10 text-center w-24">ĐVT</th>
                  <th className="p-3 font-bold border-r border-brand-blue/10 text-center w-24">Số lượng tồn</th>
                  <th className="p-3 font-bold border-r border-brand-blue/10 text-right w-32">Đơn giá</th>
                  <th className="p-3 font-bold border-r border-brand-blue/10 text-right w-32">Thành tiền tồn</th>
                  <th className="p-3 font-bold text-center w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoriesList.map(cat => (
                  <React.Fragment key={cat}>
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="p-3 font-bold text-red-600 uppercase tracking-wider border-b border-slate-200">
                        {cat === 'VẬT TƯ MÁY' ? 'I. VẬT TƯ MÁY' : 'II. VẬT TƯ DÁN'}
                      </td>
                    </tr>
                    {materials
                      .filter(m => m.category === cat)
                      .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.toLowerCase().includes(searchTerm.toLowerCase()))
                      .filter(m => !showLowStockOnly || (m.stock || 0) < 3)
                      .map((mItem, idx) => (
                        <tr key={mItem.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="p-3 text-center border-r border-slate-100 text-slate-500 font-medium">
                            <div className="flex flex-col items-center gap-1">
                              <span>{idx + 1}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                    setEditingMaterialId(mItem.id);
                                    setNewMaterial(mItem);
                                    setIsAddingMaterial(true);
                                  }}
                                  className="p-1 text-brand-blue hover:bg-brand-blue/10 rounded"
                                  title="Sửa"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => setMaterialToDelete(mItem.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-bold text-slate-900 border-r border-slate-100">{mItem.code}</td>
                          <td className="p-3 text-slate-700 border-r border-slate-100">
                            <div className="flex items-center gap-2">
                              {mItem.name}
                              {(mItem.stock || 0) < 3 && (
                                <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" title="Tồn kho thấp!" />
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center border-r border-slate-100 text-slate-600">{mItem.unit}</td>
                  <td className="p-3 text-center border-r border-slate-100 text-brand-blue bg-brand-blue/5 text-base">
                    {mItem.stock || 0}
                  </td>
                  <td className="p-3 text-right border-r border-slate-100 text-slate-900 text-base">
                    {mItem.price > 0 ? formatNumber(mItem.price) : ''}
                  </td>
                  <td className="p-3 text-right border-r border-slate-100 text-brand-blue text-base">
                    {formatNumber(mItem.stock * mItem.price)}
                  </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => {
                                  setNewTransaction({ materialId: mItem.id, type: 'IMPORT', quantity: 0, date: new Date().toISOString().split('T')[0], location: '' });
                                  setIsAddingTransaction(true);
                                }}
                                className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Nhập kho"
                              >
                                <ArrowDownCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setNewTransaction({ materialId: mItem.id, type: 'EXPORT', quantity: 0, date: new Date().toISOString().split('T')[0], location: '' });
                                  setIsAddingTransaction(true);
                                }}
                                className="p-1.5 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 rounded-lg transition-colors"
                                title="Xuất kho"
                              >
                                <ArrowUpCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Material Modal */}
        {isAddingMaterial && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
              <div className="bg-brand-blue/10 p-6 border-b border-brand-blue/10 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-blue">
                  {editingMaterialId ? 'Chỉnh sửa vật tư' : 'Thêm vật tư mới'}
                </h3>
                <button onClick={() => setIsAddingMaterial(false)} className="text-brand-blue/50 hover:text-brand-blue transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Mã hàng</label>
                    <input 
                      type="text" 
                      value={newMaterial.code}
                      onChange={(e) => setNewMaterial({ ...newMaterial, code: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">ĐVT</label>
                    <input 
                      type="text" 
                      value={newMaterial.unit}
                      onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tên hàng</label>
                  <input 
                    type="text" 
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Đơn giá</label>
                    <input 
                      type="number" 
                      value={newMaterial.price}
                      onChange={(e) => setNewMaterial({ ...newMaterial, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Số lượng tồn</label>
                    <input 
                      type="number" 
                      value={newMaterial.stock}
                      onChange={(e) => setNewMaterial({ ...newMaterial, stock: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Phân loại</label>
                  <select 
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  >
                    <option value="VẬT TƯ DÁN">VẬT TƯ DÁN</option>
                    <option value="VẬT TƯ MÁY">VẬT TƯ MÁY</option>
                  </select>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setIsAddingMaterial(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-white transition-colors"
                >
                  Hủy
                </button>
                <button 
                onClick={async () => {
                  if (!newMaterial.code || !newMaterial.name) {
                    showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
                    return;
                  }
                  try {
                    if (editingMaterialId) {
                      await updateDoc(doc(db, 'materials', editingMaterialId), newMaterial as any);
                      showNotification('Đã cập nhật vật tư!');
                    } else {
                      const idVal = Date.now().toString();
                      const materialToAdd: Material = {
                        id: idVal,
                        code: newMaterial.code || '',
                        name: newMaterial.name || '',
                        unit: newMaterial.unit || '',
                        price: newMaterial.price || 0,
                        stock: newMaterial.stock || 0,
                        category: newMaterial.category as any
                      };
                      await setDoc(doc(db, 'materials', idVal), materialToAdd);
                      showNotification('Đã thêm vật tư mới!');
                    }
                    setIsAddingMaterial(false);
                  } catch (errorItem) {
                    handleFirestoreError(errorItem, OperationType.WRITE, 'materials');
                  }
                }}
                  className="flex-1 px-4 py-2 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition-colors shadow-lg shadow-brand-blue/20"
                >
                  {editingMaterialId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Transaction Modal */}
        {isAddingTransaction && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
              <div className={cn(
                "p-6 border-b flex justify-between items-center",
                newTransaction.type === 'IMPORT' ? "bg-green-50 border-green-100" : "bg-brand-orange/10 border-brand-orange/20"
              )}>
                <h3 className={cn(
                  "text-xl font-bold flex items-center gap-2",
                  newTransaction.type === 'IMPORT' ? "text-green-900" : "text-brand-orange"
                )}>
                  {newTransaction.type === 'IMPORT' ? <ArrowDownCircle className="w-6 h-6" /> : <ArrowUpCircle className="w-6 h-6" />}
                  {newTransaction.type === 'IMPORT' ? 'Nhập kho vật tư' : 'Xuất kho vật tư'}
                </h3>
                <button onClick={() => setIsAddingTransaction(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Vật tư</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900">
                    {materials.find(m => m.id === newTransaction.materialId)?.name}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Ngày thực hiện</label>
                    <input 
                      type="date" 
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Số lượng</label>
                    <input 
                      type="number" 
                      value={newTransaction.quantity}
                      onChange={(e) => setNewTransaction({ ...newTransaction, quantity: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>
                {newTransaction.type === 'EXPORT' && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nơi sử dụng</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Máy cắt 1', 'Máy cắt 2', 'Máy cắt 3', 'Máy cắt cầu', 'Khu vực đánh bóng', 'Khu vực hoa văn'].map(loc => (
                        <button
                          key={loc}
                          onClick={() => setNewTransaction({ ...newTransaction, location: loc })}
                          className={cn(
                            "px-3 py-2 text-xs font-medium rounded-lg border transition-all",
                            newTransaction.location === loc 
                              ? "bg-brand-orange text-white border-brand-orange shadow-sm" 
                              : "bg-white text-slate-600 border-slate-200 hover:border-brand-orange/30"
                          )}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setIsAddingTransaction(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-white transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={async () => {
                    if (!newTransaction.quantity || newTransaction.quantity <= 0) {
                      showNotification('Vui lòng nhập số lượng hợp lệ!', 'error');
                      return;
                    }

                    if (newTransaction.type === 'EXPORT' && !newTransaction.location) {
                      showNotification('Vui lòng chọn nơi sử dụng!', 'error');
                      return;
                    }
                    
                    try {
                      const idVal = Date.now().toString();
                      const transactionToAdd: MaterialTransaction = {
                        id: idVal,
                        materialId: newTransaction.materialId!,
                        type: newTransaction.type!,
                        quantity: newTransaction.quantity,
                        date: newTransaction.date!,
                        location: newTransaction.location || ''
                      };

                      // Update stock
                      const materialItem = materials.find(m => m.id === newTransaction.materialId);
                      if (materialItem) {
                        const newStock = newTransaction.type === 'IMPORT' 
                          ? (materialItem.stock || 0) + newTransaction.quantity!
                          : (materialItem.stock || 0) - newTransaction.quantity!;
                        
                        await updateDoc(doc(db, 'materials', newTransaction.materialId!), { stock: newStock });
                      }

                      await setDoc(doc(db, 'transactions', idVal), transactionToAdd);
                      showNotification(`Đã ${newTransaction.type === 'IMPORT' ? 'nhập' : 'xuất'} kho thành công!`);
                      setIsAddingTransaction(false);
                    } catch (errorItem) {
                      handleFirestoreError(errorItem, OperationType.WRITE, 'transactions');
                    }
                  }}
                  className={cn(
                    "flex-1 px-4 py-2 text-white rounded-xl font-bold transition-colors shadow-lg",
                    newTransaction.type === 'IMPORT' 
                      ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" 
                      : "bg-brand-orange hover:bg-brand-orange/90 shadow-brand-orange/20"
                  )}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {materialToDelete && renderMaterialDeleteModal()}
        {transactionToDelete && renderTransactionDeleteModal()}
      </div>
    );
  };

  const renderResetConfirmationModal = () => {
    if (!isResettingData) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Cảnh báo đặt lại dữ liệu</h3>
            <p className="text-slate-500 leading-relaxed">
              Hành động này sẽ <span className="font-bold text-red-600">xóa toàn bộ</span> dữ liệu đơn hàng, báo cáo và cấu hình của bạn. 
              Dữ liệu sẽ được đặt lại về trạng thái ban đầu. Bạn có chắc chắn?
            </p>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={() => setIsResettingData(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Hủy bỏ</button>
            <button 
              onClick={async () => {
                try {
                  showNotification('Vui lòng xóa dữ liệu thủ công trên Firebase Console nếu muốn xóa vĩnh viễn.', 'error');
                  setIsResettingData(false);
                } catch (errorItem) {
                  console.error(errorItem);
                }
              }} 
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-200 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Xác nhận đặt lại
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStones = () => {
    // Calculate total import cost for the selected period
    const filteredImportTotal = stoneTransactions
      .filter(t => {
        const tDate = new Date(t.date);
        const tMonth = tDate.getMonth() + 1;
        const tYear = tDate.getFullYear();
        const tQuarter = Math.floor((tMonth - 1) / 3) + 1;

        if (t.type !== 'IMPORT') return false;

        if (viewType === 'month') {
          return tMonth === selectedMonth && tYear === selectedYear;
        } else if (viewType === 'quarter') {
          return tQuarter === selectedQuarter && tYear === selectedYear;
        } else {
          return tYear === selectedYear;
        }
      })
      .reduce((acc, t) => {
        const stoneItem = stones.find(s => s.id === t.stoneId);
        const priceVal = t.pricePerM2 || stoneItem?.pricePerM2 || 0;
        return acc + (t.m2 * priceVal);
      }, 0);

    const totalStoneStockValueAmount = stones.reduce((acc, s) => acc + (s.stockM2 * s.pricePerM2), 0);

    return (
      <div className="space-y-6">
        {/* Filter & Stats Row */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch lg:items-start">
          {/* View Type & Period Filter Card */}
          <div className="bg-white p-3 sm:p-2 sm:px-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 w-full lg:w-fit">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <span className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap uppercase tracking-wider">Xem theo</span>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 flex-1 sm:flex-none">
                {[
                  { id: 'month', label: 'Tháng' },
                  { id: 'quarter', label: 'Quý' },
                  { id: 'year', label: 'Năm' }
                ].map(typeItem => (
                  <button
                    key={typeItem.id}
                    onClick={() => setViewType(typeItem.id as any)}
                    className={cn(
                      "flex-1 sm:flex-none px-3 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all",
                      viewType === typeItem.id 
                        ? "bg-white text-brand-blue shadow-sm border border-slate-100" 
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {typeItem.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-auto">
              <select 
                value={viewType === 'month' ? `${selectedMonth}-${selectedYear}` : viewType === 'quarter' ? `${selectedQuarter}-${selectedYear}` : `${selectedYear}`}
                onChange={(e) => {
                  const valVal = e.target.value;
                  if (viewType === 'month') {
                    const [mVal, yVal] = valVal.split('-').map(Number);
                    setSelectedMonth(mVal);
                    setSelectedYear(yVal);
                  } else if (viewType === 'quarter') {
                    const [qVal, yVal] = valVal.split('-').map(Number);
                    setSelectedQuarter(qVal);
                    setSelectedYear(yVal);
                  } else {
                    setSelectedYear(Number(valVal));
                  }
                }}
                className="w-full sm:w-auto appearance-none bg-white border border-slate-200 rounded-xl px-5 py-2.5 pr-12 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer min-w-full sm:min-w-[200px]"
              >
                {viewType === 'month' && Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={`${i + 1}-${selectedYear}`}>Tháng {i + 1}-{selectedYear}</option>
                ))}
                {viewType === 'quarter' && [1, 2, 3, 4].map(qItem => (
                  <option key={qItem} value={`${qItem}-${selectedYear}`}>Quý {qItem}-{selectedYear}</option>
                ))}
                {viewType === 'year' && [2024, 2025, 2026, 2027].map(yearVal => (
                  <option key={yearVal} value={yearVal}>Năm {yearVal}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="bg-white p-4 px-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
                <ArrowDownCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tiền nhập đá ({getPeriodLabel()})</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(filteredImportTotal)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm đá..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={selectedTransactionType}
                onChange={(e) => setSelectedTransactionType(e.target.value as any)}
                className="text-sm font-bold text-slate-600 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả loại</option>
                <option value="IMPORT">Nhập kho</option>
                <option value="EXPORT">Xuất kho</option>
              </select>
            </div>
            <button 
              onClick={() => setShowStoneHistory(!showStoneHistory)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border",
                showStoneHistory 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              <History className="w-4 h-4" />
              {showStoneHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
            </button>
            <button 
              onClick={() => {
                setEditingStoneId(null);
                setNewStone({
                  name: '',
                  type: 'Marble',
                  origin: '',
                  thickness: 18,
                  stockM2: 0,
                  stockSlabs: 0,
                  pricePerM2: 0
                });
                setIsAddingStone(true);
              }}
              className="flex items-center gap-2 px-6 py-2 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
            >
              <Plus className="w-4 h-4" /> Thêm đá mới
            </button>
          </div>
        </div>

        {/* History Section */}
        {showStoneHistory && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-brand-blue" />
                Lịch sử xuất nhập đá
              </h3>
            </div>
            <div className="responsive-table-container">
              <table className="w-full text-base text-left min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <th className="p-4 font-bold">Ngày</th>
                    <th className="p-4 font-bold">Loại đá</th>
                    <th className="p-4 font-bold">Giao dịch</th>
                    <th className="p-4 font-bold text-center">Số tấm</th>
                    <th className="p-4 font-bold text-center">Diện tích (m²)</th>
                    <th className="p-4 font-bold text-right">Đơn giá</th>
                    <th className="p-4 font-bold text-right">Thành tiền</th>
                    <th className="p-4 font-bold">Khách hàng/NCC</th>
                    <th className="p-4 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stoneTransactions
                    .filter(tItem => {
                      const tDate = new Date(tItem.date);
                      const tMonth = tDate.getMonth() + 1;
                      const tYear = tDate.getFullYear();
                      const tQuarter = Math.floor((tMonth - 1) / 3) + 1;

                      const matchesType = selectedTransactionType === 'all' || tItem.type === selectedTransactionType;
                      if (!matchesType) return false;

                      if (viewType === 'month') {
                        return tMonth === selectedMonth && tYear === selectedYear;
                      } else if (viewType === 'quarter') {
                        return tQuarter === selectedQuarter && tYear === selectedYear;
                      } else {
                        return tYear === selectedYear;
                      }
                    }).length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 italic">Chưa có lịch sử giao dịch nào trong thời gian này.</td>
                    </tr>
                  ) : (
                    stoneTransactions
                      .filter(tItem => {
                        const tDate = new Date(tItem.date);
                        const tMonth = tDate.getMonth() + 1;
                        const tYear = tDate.getFullYear();
                        const tQuarter = Math.floor((tMonth - 1) / 3) + 1;

                        const matchesType = selectedTransactionType === 'all' || tItem.type === selectedTransactionType;
                        if (!matchesType) return false;

                        if (viewType === 'month') {
                          return tMonth === selectedMonth && tYear === selectedYear;
                        } else if (viewType === 'quarter') {
                          return tQuarter === selectedQuarter && tYear === selectedYear;
                        } else {
                          return tYear === selectedYear;
                        }
                      })
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(tItem => {
                        const stoneItem = stones.find(s => s.id === tItem.stoneId);
                        const priceVal = tItem.pricePerM2 || stoneItem?.pricePerM2 || 0;
                        const totalVal = tItem.m2 * priceVal;
                        return (
                          <tr key={tItem.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-slate-600">{new Date(tItem.date).toLocaleDateString('vi-VN')}</td>
                            <td className="p-4 font-bold text-slate-900">{stoneItem?.name}</td>
                            <td className="p-4">
                              <span className={cn(
                                "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                                tItem.type === 'IMPORT' ? "bg-green-100 text-green-700" : "bg-brand-orange/10 text-brand-orange"
                              )}>
                                {tItem.type === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}
                              </span>
                            </td>
                            <td className="p-4 text-center text-slate-900 text-base">{tItem.slabs}</td>
                            <td className="p-4 text-center text-slate-900 text-base">{formatNumber(tItem.m2)}</td>
                            <td className="p-4 text-right text-slate-900 text-base">{formatCurrency(priceVal)}</td>
                            <td className="p-4 text-right text-slate-900 text-base">{formatCurrency(totalVal)}</td>
                            <td className="p-4 text-slate-600">{tItem.customerOrSupplier}</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => setStoneTransactionToDelete(tItem.id)}
                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stones List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {stones
            .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.origin.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(stoneItem => (
              <div key={stoneItem.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
                <div className="p-5 border-b border-slate-50 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded uppercase tracking-wider">{stoneItem.type}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">{stoneItem.origin}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">{stoneItem.name}</h4>
                    <p className="text-xs text-slate-500">Độ dày: {stoneItem.thickness}mm</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingStoneId(stoneItem.id);
                        setNewStone(stoneItem);
                        setIsAddingStone(true);
                      }}
                      className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setStoneToDelete(stoneItem.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-5 bg-slate-50/50 grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tồn kho hiện tại</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">{formatNumber(stoneItem.stockM2)}</span>
                      <span className="text-sm text-slate-500 font-bold uppercase">m²</span>
                      <span className="mx-2 text-slate-300">|</span>
                      <span className="text-xl font-bold text-slate-700">{stoneItem.stockSlabs}</span>
                      <span className="text-sm text-slate-500 font-bold uppercase">tấm</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white border-t border-slate-50 flex gap-2">
                  <button 
                    onClick={() => {
                      setNewStoneTransaction({
                        stoneId: stoneItem.id,
                        type: 'IMPORT',
                        slabs: 0,
                        m2: 0,
                        pricePerM2: stoneItem.pricePerM2,
                        date: new Date().toISOString().split('T')[0],
                        customerOrSupplier: '',
                        note: ''
                      });
                      setIsAddingStoneTransaction(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors"
                  >
                    <ArrowDownCircle className="w-4 h-4" /> Nhập kho
                  </button>
                  <button 
                    onClick={() => {
                      setNewStoneTransaction({
                        stoneId: stoneItem.id,
                        type: 'EXPORT',
                        slabs: 0,
                        m2: 0,
                        pricePerM2: stoneItem.pricePerM2,
                        date: new Date().toISOString().split('T')[0],
                        customerOrSupplier: '',
                        note: ''
                      });
                      setIsAddingStoneTransaction(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 rounded-xl text-xs font-bold transition-colors"
                  >
                    <ArrowUpCircle className="w-4 h-4" /> Xuất kho
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Add/Edit Stone Modal */}
        {isAddingStone && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-brand-blue" />
                  {editingStoneId ? 'Cập nhật thông tin đá' : 'Thêm loại đá mới'}
                </h3>
                <button onClick={() => setIsAddingStone(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tên loại đá</label>
                  <input 
                    type="text" 
                    value={newStone.name}
                    onChange={(e) => setNewStone({ ...newStone, name: e.target.value })}
                    placeholder="VD: Trắng Volakas"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Loại đá</label>
                    <select 
                      value={newStone.type}
                      onChange={(e) => setNewStone({ ...newStone, type: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    >
                      <option value="Marble">Marble</option>
                      <option value="Granite">Granite</option>
                      <option value="Nung kết">Nung kết</option>
                      <option value="Nhân tạo">Nhân tạo</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Xuất xứ</label>
                    <input 
                      type="text" 
                      value={newStone.origin}
                      onChange={(e) => setNewStone({ ...newStone, origin: e.target.value })}
                      placeholder="VD: Hy Lạp"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Độ dày (mm)</label>
                    <input 
                      type="number" 
                      value={newStone.thickness}
                      onChange={(e) => setNewStone({ ...newStone, thickness: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Đơn giá (VNĐ/m²)</label>
                    <input 
                      type="number" 
                      value={newStone.pricePerM2}
                      onChange={(e) => setNewStone({ ...newStone, pricePerM2: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setIsAddingStone(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-white transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={async () => {
                    if (!newStone.name) {
                      showNotification('Vui lòng nhập tên loại đá!', 'error');
                      return;
                    }
                    try {
                      if (editingStoneId) {
                        await updateDoc(doc(db, 'stones', editingStoneId), newStone as any);
                        showNotification('Đã cập nhật thông tin đá!');
                      } else {
                        const idVal = Date.now().toString();
                        const stoneToAdd: Stone = {
                          ...newStone as Stone,
                          id: idVal,
                          stockM2: 0,
                          stockSlabs: 0
                        };
                        await setDoc(doc(db, 'stones', idVal), stoneToAdd);
                        showNotification('Đã thêm loại đá mới!');
                      }
                      setIsAddingStone(false);
                    } catch (errorItem) {
                      handleFirestoreError(errorItem, OperationType.WRITE, 'stones');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition-colors shadow-lg shadow-brand-blue/20"
                >
                  {editingStoneId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stone Transaction Modal */}
        {isAddingStoneTransaction && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
              <div className={cn(
                "p-6 border-b flex justify-between items-center",
                newStoneTransaction.type === 'IMPORT' ? "bg-green-50 border-green-100" : "bg-brand-orange/10 border-brand-orange/20"
              )}>
                <h3 className={cn(
                  "text-xl font-bold flex items-center gap-2",
                  newStoneTransaction.type === 'IMPORT' ? "text-green-900" : "text-brand-orange"
                )}>
                  {newStoneTransaction.type === 'IMPORT' ? <ArrowDownCircle className="w-6 h-6" /> : <ArrowUpCircle className="w-6 h-6" />}
                  {newStoneTransaction.type === 'IMPORT' ? 'Nhập kho đá' : 'Xuất kho đá'}
                </h3>
                <button onClick={() => setIsAddingStoneTransaction(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Loại đá</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900">
                    {stones.find(s => s.id === newStoneTransaction.stoneId)?.name}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Ngày thực hiện</label>
                    <input 
                      type="date" 
                      value={newStoneTransaction.date}
                      onChange={(e) => setNewStoneTransaction({ ...newStoneTransaction, date: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Số tấm</label>
                    <input 
                      type="number" 
                      value={newStoneTransaction.slabs}
                      onChange={(e) => setNewStoneTransaction({ ...newStoneTransaction, slabs: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Diện tích (m²)</label>
                    <input 
                      type="number" 
                      value={newStoneTransaction.m2}
                      onChange={(e) => {
                        const m2Val = parseFloat(e.target.value);
                        setNewStoneTransaction({ 
                          ...newStoneTransaction, 
                          m2: m2Val,
                        });
                      }}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Tổng tiền (VNĐ)</label>
                    <input 
                      type="number" 
                      value={(newStoneTransaction.m2 || 0) * (newStoneTransaction.pricePerM2 || 0)}
                      onChange={(e) => {
                        const totalVal = parseFloat(e.target.value);
                        const m2Val = newStoneTransaction.m2 || 1;
                        setNewStoneTransaction({ 
                          ...newStoneTransaction, 
                          pricePerM2: totalVal / m2Val
                        });
                      }}
                      placeholder="Nhập tổng tiền nếu là hàng thanh lý"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                    <p className="text-[10px] text-slate-400 italic">Có thể nhập tổng tiền cho hàng thanh lý</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Đơn giá tính toán (VNĐ/m²)</label>
                  <input 
                    type="number" 
                    value={newStoneTransaction.pricePerM2}
                    onChange={(e) => setNewStoneTransaction({ ...newStoneTransaction, pricePerM2: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{newStoneTransaction.type === 'IMPORT' ? 'Nhà cung cấp' : 'Khách hàng'}</label>
                  <input 
                    type="text" 
                    value={newStoneTransaction.customerOrSupplier}
                    onChange={(e) => setNewStoneTransaction({ ...newStoneTransaction, customerOrSupplier: e.target.value })}
                    placeholder="..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Ghi chú</label>
                  <textarea 
                    value={newStoneTransaction.note}
                    onChange={(e) => setNewStoneTransaction({ ...newStoneTransaction, note: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 min-h-[80px]"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setIsAddingStoneTransaction(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-white transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={async () => {
                    if (!newStoneTransaction.m2 || newStoneTransaction.m2 <= 0) {
                      showNotification('Vui lòng nhập diện tích hợp lệ!', 'error');
                      return;
                    }
                    
                    try {
                      const idVal = Date.now().toString();
                      const transactionToAdd: StoneTransaction = {
                        ...newStoneTransaction as StoneTransaction,
                        id: idVal
                      };

                      // Update stock
                      const stoneItem = stones.find(s => s.id === newStoneTransaction.stoneId);
                      if (stoneItem) {
                        const newStockM2 = newStoneTransaction.type === 'IMPORT' 
                          ? (stoneItem.stockM2 || 0) + newStoneTransaction.m2!
                          : (stoneItem.stockM2 || 0) - newStoneTransaction.m2!;
                        const newStockSlabs = newStoneTransaction.type === 'IMPORT' 
                          ? (stoneItem.stockSlabs || 0) + newStoneTransaction.slabs!
                          : (stoneItem.stockSlabs || 0) - newStoneTransaction.slabs!;
                        
                        await updateDoc(doc(db, 'stones', newStoneTransaction.stoneId!), {
                          stockM2: newStockM2,
                          stockSlabs: newStockSlabs
                        });
                      }

                      await setDoc(doc(db, 'stoneTransactions', idVal), transactionToAdd);
                      showNotification(`Đã ${newStoneTransaction.type === 'IMPORT' ? 'nhập' : 'xuất'} kho đá thành công!`);
                      setIsAddingStoneTransaction(false);
                    } catch (errorItem) {
                      handleFirestoreError(errorItem, OperationType.WRITE, 'stoneTransactions');
                    }
                  }}
                  className={cn(
                    "flex-1 px-4 py-2 text-white rounded-xl font-bold transition-colors shadow-lg",
                    newStoneTransaction.type === 'IMPORT' 
                      ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" 
                      : "bg-brand-orange hover:bg-brand-orange/90 shadow-brand-orange/20"
                  )}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {stoneToDelete && renderStoneDeleteModal()}
        {stoneTransactionToDelete && renderStoneTransactionDeleteModal()}
      </div>
    );
  };

  const renderStoneDeleteModal = () => {
    if (!stoneToDelete) return null;
    const stoneItem = stones.find(s => s.id === stoneToDelete);
    if (!stoneItem) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa đá</h3>
            <p className="text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa đá <span className="font-bold text-slate-800">{stoneItem.name}</span>? 
              Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.
            </p>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={() => setStoneToDelete(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Hủy bỏ</button>
            <button onClick={confirmDeleteStone} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-200 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStoneTransactionDeleteModal = () => {
    if (!stoneTransactionToDelete) return null;
    const tItem = stoneTransactions.find(item => item.id === stoneTransactionToDelete);
    if (!tItem) return null;
    const stoneItem = stones.find(s => s.id === tItem.stoneId);

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa lịch sử đá</h3>
            <p className="text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa lịch sử <span className="font-bold text-slate-800">{tItem.type === 'IMPORT' ? 'Nhập' : 'Xuất'}</span> đá <span className="font-bold text-slate-800">{stoneItem?.name}</span>? 
              Số lượng tồn sẽ được hoàn lại tương ứng.
            </p>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={() => setStoneTransactionToDelete(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Hủy bỏ</button>
            <button onClick={confirmDeleteStoneTransaction} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-200 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Cấu hình Tỷ lệ Khoán %</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept, idx) => (
            <div key={dept.name} className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{dept.name}</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={dept.percentage}
                  onChange={(e) => {
                    const newDepts = [...departments];
                    newDepts[idx].percentage = parseFloat(e.target.value);
                    setDepartments(newDepts);
                  }}
                  className="flex-1 px-3 py-2 bg-brand-blue/5 border border-brand-blue/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
                <span className="text-slate-500 font-medium">%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
          <button 
            onClick={() => setIsResettingData(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100 rounded-lg transition-colors"
          >
            Đặt lại dữ liệu gốc
          </button>
          <button 
            onClick={async () => {
              try {
                const savePromises = departments.map(deptItem => {
                  return setDoc(doc(db, 'departments', deptItem.name), deptItem);
                });
                await Promise.all(savePromises);
                showNotification('Đã lưu cấu hình!');
              } catch (errorItem) {
                handleFirestoreError(errorItem, OperationType.WRITE, 'departments');
              }
            }}
            className="px-6 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-brand-blue/90 transition-colors"
          >
            Lưu thay đổi
          </button>
        </div>
        {isResettingData && renderResetConfirmationModal()}
      </div>
    </div>
  );

  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return renderLogin();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Notification Toast */}
      {notification && (
        <div className={cn(
          "fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300",
          notification.type === 'success' ? "bg-slate-900 text-white" : "bg-red-600 text-white"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            notification.type === 'success' ? "bg-green-400" : "bg-white"
          )} />
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-[#0f172a] text-slate-400 flex flex-col z-[70] transition-transform duration-300 lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        isWorkshopMaximized && activeTab === 'workshop' && "lg:hidden"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-white">
              <div className="w-9 h-9 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">Tran Gia Phat</span>
            </div>
            <button 
              className="lg:hidden text-slate-500 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
              { id: 'monthly', label: 'Báo cáo tháng', icon: BarChart3 },
              { id: 'orders', label: 'Đơn hàng', icon: ClipboardList },
              { id: 'workshop', label: 'Tiến độ xưởng', icon: Clock },
              { id: 'materials', label: 'Quản lý kho', icon: Layers },
              { id: 'stones', label: 'Quản lý đá', icon: TableIcon },
              { id: 'settings', label: 'Cấu hình', icon: Settings },
            ].filter(item => canAccess(item.id)).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMobileMenuOpen(false);
                  setIsWorkshopMaximized(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                  activeTab === item.id 
                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" 
                    : "hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  activeTab === item.id ? "text-white" : "text-slate-500"
                )} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-2xl border border-slate-800/50">
            <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue font-bold border border-brand-blue/20 shrink-0">
              TGP
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate uppercase">APP TGP</p>
              <p className="text-[10px] text-slate-500 font-medium truncate uppercase">by cuongc5k</p>
            </div>
          </div>

          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {!isWorkshopMaximized || activeTab !== 'workshop' ? (
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px] sm:max-w-none">
                {activeTab === 'dashboard' ? 'Tổng quan' : 
                 activeTab === 'monthly' ? 'Báo cáo tháng' : 
                 activeTab === 'orders' ? 'Quản lý đơn hàng' : 
                 activeTab === 'workshop' ? 'Tiến độ xưởng' :
                 activeTab === 'materials' ? 'Quản lý kho' : 
                 activeTab === 'stones' ? 'Quản lý đá' : 'Cấu hình hệ thống'}
              </h2>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="text-right hidden md:block">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Hôm nay</p>
                <p className="text-xs font-bold text-slate-900">{new Date().toLocaleDateString('vi-VN')}</p>
              </div>
              
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{userProfile?.displayName || 'User'}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{userProfile?.role || 'Guest'}</p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue font-bold border border-brand-blue/20 shadow-sm">
                  {userProfile?.displayName?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </header>
        ) : null}

        <div className={cn(
          "flex-1 overflow-y-auto scroll-smooth",
          isWorkshopMaximized && activeTab === 'workshop' ? "p-0" : "p-4 sm:p-6 lg:p-8"
        )} id="main-content">
          <div className="max-w-screen-2xl mx-auto space-y-6">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'monthly' && renderMonthlyReport()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'workshop' && renderWorkshopProgress()}
            {activeTab === 'materials' && renderMaterials()}
            {activeTab === 'stones' && renderStones()}
            {activeTab === 'settings' && renderSettings()}
          </div>
          
          {/* Back to top button for mobile */}
          <button 
            onClick={() => document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-6 p-3 bg-brand-blue text-white rounded-full shadow-lg lg:hidden z-40 active:scale-90 transition-transform"
          >
            <ChevronRight className="w-6 h-6 -rotate-90" />
          </button>
        </div>
      </main>
    </div>
  );
}
