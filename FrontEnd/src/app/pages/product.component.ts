import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';
import { IconComponent } from '../shared/icon.component';
import { Product } from '../models/api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    @if(product()){
      <section class="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          <div class="relative aspect-square w-full overflow-hidden rounded-xl border border-transparent bg-white flex items-center justify-center p-4">
            <img 
              [src]="img(activeImage())" 
              class="h-full w-full object-contain transition-all duration-300" 
              [alt]="product()!.nombreproducto"
            >
          </div>

          @if(gallery().length > 1){
            <div class="mt-4 flex gap-3 overflow-x-auto pb-2">
              @for(image of gallery(); track image){
                <button 
                  (click)="activeImage.set(image)" 
                  class="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-slate-50 p-1 transition-all" 
                  [class.border-primary]="activeImage() === image"
                  [class.border-slate-200]="activeImage() !== image"
                >
                  <img [src]="img(image)" class="h-full w-full object-contain" alt="">
                </button>
              }
            </div>
          }
        </div>
        <div>
          <p class="font-bold text-primary">{{product()!.nombre_categoria}}@if(product()!.nombre_subcategoria){ · {{product()!.nombre_subcategoria}}} · {{product()!.marca}}</p>
          <h1 class="mt-2 text-3xl font-extrabold">{{product()!.nombreproducto}}</h1>
          <p class="mt-4 leading-7 text-slate-600">{{product()!.descripcion}}</p>
          <p class="mt-6 text-3xl font-extrabold">Q{{product()!.precioproducto}}</p>

          <p class="mt-3 flex items-center gap-2 text-sm font-semibold" [class.text-red-600]="stockLevel()==='low'" [class.text-slate-400]="stockLevel()==='out'" [class.text-emerald-600]="stockLevel()==='ok'">
            <span class="h-2 w-2 rounded-full" [class.bg-red-600]="stockLevel()==='low'" [class.bg-slate-400]="stockLevel()==='out'" [class.bg-emerald-600]="stockLevel()==='ok'"></span>
            {{stockLabel()}}
          </p>

          <div class="mt-6 flex gap-3">
            <div class="flex items-center rounded-md border">
              <button (click)="qty=Math.max(1,qty-1)" class="px-3 py-3"><app-icon name="minus" [size]="16"/></button>
              <span class="w-10 text-center font-bold">{{qty}}</span>
              <button (click)="qty=Math.min(product()!.stock,qty+1)" class="px-3 py-3"><app-icon name="plus" [size]="16"/></button>
            </div>
            <button (click)="add()" [disabled]="!product()!.stock" class="flex-1 rounded-md bg-primary px-7 py-3 font-bold text-white disabled:bg-slate-300">
              {{product()!.stock ? 'Agregar al carrito' : 'Agotado'}}
            </button>
          </div>

          @if(product()!.especificaciones){
            <h2 class="mt-10 text-lg font-bold">Especificaciones</h2>
            <p class="mt-3 whitespace-pre-line rounded-lg border bg-slate-50 p-4 text-sm leading-6 text-slate-600">{{product()!.especificaciones}}</p>
          }

          <a routerLink="/" fragment="catalogo" class="mt-8 inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-bold text-primary hover:bg-motorflow-pale">
            <app-icon name="chevronLeft" [size]="16"/> Explorar productos
          </a>
        </div>
      </section>
    }
  `
})
export class ProductComponent implements OnInit {
  api = inject(ApiService);
  auth = inject(AuthService);
  cartService = inject(CartService);
  toast = inject(ToastService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  Math = Math;

  product = signal<Product | null>(null);
  activeImage = signal<string>('');
  gallery = signal<string[]>([]);
  qty = 1;

  ngOnInit() {
    this.api.product(this.route.snapshot.paramMap.get('id')!).subscribe(r => {
      this.product.set(r.data);
      const extra = (r.data.imagenes || []).map(i => i.url_imagen);
      const all = [r.data.imagen_principal, ...extra.filter(u => u !== r.data.imagen_principal)];
      this.gallery.set(all);
      this.activeImage.set(r.data.imagen_principal);
    });
  }

  img(path: string) { return this.api.fileUrl(path); }

  stockLevel(): 'out' | 'low' | 'ok' {
    const s = this.product()?.stock ?? 0;
    if (s <= 0) return 'out';
    if (s <= 3) return 'low';
    return 'ok';
  }

  stockLabel() {
    const s = this.product()?.stock ?? 0;
    if (s <= 0) return 'Agotado';
    if (s <= 3) return `Muy poco stock (${s} unidad${s === 1 ? '' : 'es'})`;
    return `En stock (${s} disponibles)`;
  }

  add() {
    if (!this.auth.authenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const p = this.product()!;
    this.api.putCart(p.idproducto, this.qty).subscribe({
      next: () => { this.cartService.refresh(); this.toast.show('Producto agregado al carrito'); },
      error: e => this.toast.show(e.error?.message || 'No se pudo agregar')
    });
  }
}
