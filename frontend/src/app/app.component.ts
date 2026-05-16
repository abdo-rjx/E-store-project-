import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { PromoPopupComponent } from './shared/components/promo-popup/promo-popup.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, PromoPopupComponent],
  template: `
    <app-header></app-header>
    <main class="page-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-promo-popup></app-promo-popup>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .page-content {
      flex: 1;
    }
  `]
})
export class AppComponent {}
