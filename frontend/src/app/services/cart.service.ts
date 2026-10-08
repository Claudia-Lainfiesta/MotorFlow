import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  count = signal(0);

  refresh() {
    if (!this.auth.authenticated()) { this.count.set(0); return; }
    this.api.cart().subscribe({
      next: r => this.count.set(r.data.reduce((n, i) => n + i.cantidad, 0)),
      error: () => this.count.set(0)
    });
  }
}
