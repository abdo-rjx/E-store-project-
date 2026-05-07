import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthResponse } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  get token(): string | null {
    return this.currentUser?.token || null;
  }

  get userId(): number | null {
    return this.currentUser?.userId || null;
  }

  login(response: AuthResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(response));
    this.currentUserSubject.next(response);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
