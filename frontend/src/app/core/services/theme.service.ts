import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>(this.getSavedTheme());
  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  get currentTheme(): Theme {
    return this.themeSubject.value;
  }

  get isDark(): boolean {
    return this.currentTheme === 'dark';
  }

  toggleTheme(): void {
    const next: Theme = this.isDark ? 'light' : 'dark';
    this.applyTheme(next);
    this.themeSubject.next(next);
    localStorage.setItem('estore-theme', next);
  }

  private getSavedTheme(): Theme {
    const saved = localStorage.getItem('estore-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    // Force a re-paint to ensure all CSS variables are applied
    document.body.style.display = 'none';
    document.body.offsetHeight; // trigger reflow
    document.body.style.display = '';
  }
}
