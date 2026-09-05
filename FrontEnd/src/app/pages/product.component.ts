import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Product } from '../models/api';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    @if(product()){
      <section class="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          <img [src]="activeImage()" class="w-full rounded-[2rem] object-cover shadow-lg" [alt]="product()!.nombreproducto">
          @if(gallery().length > 1){
            <div class="mt-4 flex gap-3">
              @for(img of gallery(); track img){
                <button (click)="activeImage.set(img)" class="h-16 w-16 overflow-hidden rounded-xl border-2" [class.border-primary]="activeImage()===img">
                  <img [src]="img" class="h-full w-full object-cover" alt="">
                </button>
              }
            </div>
          }
        </div>
        <div>
          <p class="font-bold text-primary">{{product()!.nombre_categoria}}@if(product()!.nombre_subcategoria){ · {{product()!.nombre_subcategoria}}} · {{product()!.marca}}</p>
          <h1 class="mt-2 text-4xl font-extrabold">{{product()!.nombreproducto}}</h1>
          <p class="mt-5 text-slate-600">{{product()!.descripcion}}</p>
          <p class="mt-6 text-3xl font-extrabold">Q{{product()!.precioproducto}}</p>
          <p class="mt-2 text-sm">Disponibles: {{product()!.stock}}</p>
          <button (click)="add()" [disabled]="!product()!.stock" class="mt-7 rounded-2xl bg-primary px-7 py-4 font-bold text-white">Agregar al carrito</button>

          @if(product()!.especificaciones?.length){
            <h2 class="mt-10 text-xl font-bold">Especificaciones</h2>
            <dl class="mt-3 divide-y rounded-2xl border p-4">
              @for(s of product()!.especificaciones || []; track s.etiqueta){
                <div class="flex justify-between gap-4 py-3">
                  <dt class="font-semibold">{{s.etiqueta}}</dt>
                  <dd class="text-right text-slate-500">{{s.valor}}</dd>
                </div>
              }
            </dl>
          }
        </div>
      </section>
    }
  `
})
export class ProductComponent implements OnInit {
  api = inject(ApiService);
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  product = signal<Product | null>(null);
  activeImage = signal<string>('');
  gallery = signal<string[]>([]);

  ngOnInit() {
    this.api.product(this.route.snapshot.paramMap.get('id')!).subscribe(r => {
      this.product.set(r.data);
      const extra = (r.data.imagenes || []).map(i => i.url_imagen);
      const all = [r.data.imagen_principal, ...extra.filter(u => u !== r.data.imagen_principal)];
      this.gallery.set(all);
      this.activeImage.set(r.data.imagen_principal);
    });
  }

  add() {
    if (!this.auth.authenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const p = this.product()!;
    this.api.putCart(p.idproducto, 1).subscribe({
      next: () => this.router.navigate(['/carrito']),
      error: e => alert(e.error?.message || 'No se pudo agregar')
    });
  }
}
