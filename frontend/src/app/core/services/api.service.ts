import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Product, Category, Cart, Order, Review, Profile, AuthResponse, PageResponse } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(data: { firstName: string; lastName: string; email: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/register`, data);
  }

  login(data: { email: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/login`, data);
  }

  getProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/products`);
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/products/${id}`);
  }

  searchProducts(keyword?: string, categoryId?: number): Observable<ApiResponse<Product[]>> {
    let url = `${this.baseUrl}/products/search?`;
    if (keyword) url += `keyword=${keyword}&`;
    if (categoryId) url += `categoryId=${categoryId}`;
    return this.http.get<ApiResponse<Product[]>>(url);
  }

  getProductsPaginated(page: number, size: number, keyword?: string, categoryId?: number): Observable<ApiResponse<PageResponse<Product>>> {
    let url = `${this.baseUrl}/products/page?page=${page}&size=${size}`;
    if (keyword) url += `&keyword=${keyword}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    return this.http.get<ApiResponse<PageResponse<Product>>>(url);
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/categories`);
  }

  getCart(userId: number): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(`${this.baseUrl}/cart/${userId}`);
  }

  addToCart(userId: number, productId: number, quantity: number): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(
      `${this.baseUrl}/cart/add?userId=${userId}&productId=${productId}&quantity=${quantity}`,
      {}
    );
  }

  updateCartItem(userId: number, itemId: number, quantity: number): Observable<ApiResponse<Cart>> {
    return this.http.put<ApiResponse<Cart>>(
      `${this.baseUrl}/cart/update?userId=${userId}&itemId=${itemId}&quantity=${quantity}`,
      {}
    );
  }

  removeFromCart(userId: number, itemId: number): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`${this.baseUrl}/cart/remove/${itemId}?userId=${userId}`);
  }

  placeOrder(userId: number): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.baseUrl}/orders?userId=${userId}`, {});
  }

  getUserOrders(userId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.baseUrl}/orders/user/${userId}`);
  }

  getOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/orders/${id}`);
  }

  getProfile(): Observable<ApiResponse<Profile>> {
    return this.http.get<ApiResponse<Profile>>(`${this.baseUrl}/profile`);
  }

  updateProfile(data: Profile): Observable<ApiResponse<Profile>> {
    return this.http.put<ApiResponse<Profile>>(`${this.baseUrl}/profile`, data);
  }

  getProductReviews(productId: number): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.baseUrl}/reviews/product/${productId}`);
  }

  createReview(review: { productId: number; userId: number; authorName: string; rating: number; comment: string }): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.baseUrl}/reviews`, review);
  }

  createProduct(product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.baseUrl}/admin/products`, product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.baseUrl}/admin/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/admin/products/${id}`);
  }

  updateStock(productId: number, quantity: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/admin/inventory/${productId}?quantity=${quantity}`, {});
  }
}
