import { TwoFactorType } from "../../generated/prisma/enums";
import { RoleType, SubscriptionStatus } from "@/lib/constants/roles";

// ============================================
// AUTH TYPES
// ============================================

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isTwoFactor: boolean;
  twoFactorType?: TwoFactorType;
  mustChangePassword?: boolean;
  role: IRole;
  company?: ICompany;
  store?: IStore;
}

export interface IRole {
  id: string;
  name: string;
  type: RoleType;
  permissions: IPermission[];
}

export interface IPermission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

export interface ICompany {
  id: string;
  slug: string;
  companyName: string;
  businessType: string;
  country: string;
  logo?: string;
  subscriptionStatus: SubscriptionStatus;
  maxUsers: number;
  maxStores: number;
}

export interface IStore {
  id: string;
  name: string;
  slug: string;
  address?: string;
}

// ============================================
// AUTH STATE
// ============================================

export interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface IAuthActions {
  login: (email: string, password: string) => Promise<{
    requires2FA?: boolean;
    twoFactorType?: TwoFactorType;
    mustChangePassword?: boolean;
    mustSetup2FA?: boolean;
    redirectTo?: string;
  } | undefined>;
  logout: () => void;
  verify2FA: (code: string) => Promise<{ redirectTo?: string } | undefined>;
  setup2FA: (type: TwoFactorType, email?: string) => Promise<{ secret?: string; qrCode?: string; message?: string }>;
  enable2FA: (code: string, email?: string) => Promise<{ redirectTo?: string } | undefined>;
  disable2FA: (code: string) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, email?: string) => Promise<{
    mustSetup2FA?: boolean;
    email?: string;
    redirectTo?: string;
  } | undefined>;
  setUser: (user: IUser) => void;
  clearError: () => void;
}

// ============================================
// COMPANY STATE
// ============================================

export interface ICompanyState {
  currentCompany: ICompany | null;
  companies: ICompany[];
  isLoading: boolean;
  error: string | null;
}

export interface ICompanyActions {
  setCurrentCompany: (company: ICompany) => void;
  fetchCompanies: () => Promise<void>;
  createCompany: (data: Partial<ICompany>) => Promise<ICompany>;
  updateCompany: (id: string, data: Partial<ICompany>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  clearError: () => void;
}

// ============================================
// PERMISSION STATE
// ============================================

export interface IPermissionState {
  permissions: IPermission[];
  userPermissions: Set<string>;
  isLoading: boolean;
}

export interface IPermissionActions {
  loadPermissions: (userId: string) => Promise<void>;
  can: (resource: string, action: string) => boolean;
  hasRole: (roleType: RoleType) => boolean;
  isMultiTenantAdmin: () => boolean;
}

// ============================================
// UI STATE
// ============================================

export interface IUIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  notifications: INotification[];
}

export interface IUIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  addNotification: (notification: Omit<INotification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export interface INotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  title?: string;
  duration?: number;
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface IProduct {
  id: string;
  sku: string;
  name: string;
  description?: string;
  image?: string;
  purchasePrice: number;
  sellingPrice: number;
  taxRate: number;
  category?: ICategory;
  stocks: IStock[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export interface IStock {
  id: string;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  productId: string;
  storeId: string;
  store: IStore;
}

// ============================================
// SALE TYPES
// ============================================

export interface ISale {
  id: string;
  saleNumber: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentReference?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: ISaleItem[];
  store: IStore;
  user: IUser;
  createdAt: Date;
}

export interface ISaleItem {
  id: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  product: IProduct;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// WEBSOCKET TYPES
// ============================================

export interface IWebSocketMessage {
  type: "STOCK_UPDATE" | "SALE_COMPLETED" | "USER_JOINED" | "USER_LEFT";
  payload: any;
  timestamp: Date;
  companyId?: string;
  storeId?: string;
}

export interface IStockUpdateMessage {
  productId: string;
  storeId: string;
  oldQuantity: number;
  newQuantity: number;
  reason: string;
}
