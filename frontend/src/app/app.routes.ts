import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/catalog/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/catalog/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'products' }
];
