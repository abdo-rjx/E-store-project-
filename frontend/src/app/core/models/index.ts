export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  categoryName: string;
  categoryId: number;
  stock: number;
  videoPath?: string;
  imagePaths?: string[];
  createdAt?: string;
  featured?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  userId: number;
  userEmail: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
}

export interface Review {
  id: string;
  productId: number;
  userId: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Profile {
  id: number;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  userId: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
