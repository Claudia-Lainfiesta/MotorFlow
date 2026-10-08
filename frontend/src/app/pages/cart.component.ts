import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { IconComponent } from '../shared/icon.component';
import { CartItem } from '../models/api';

@Component({
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <section class="mx-auto max-w-4xl px-6 py-12">
      <h1 class="text-3xl font-extrabold">Mi carrito</h1>

      @if(!items().length){
        <div class="mt-10 flex flex-col items-center rounded-lg border bg-white py-16 text-center">
          <span class="flex h-24 w-24 items-center justify-center rounded-full bg-motorflow-pale">
            <app-icon name="cart" [size]="40" strokeColor="#1677d2"/>
          </span>
          <h2 class="mt-6 text-xl font-extrabold">Tu carrito está vacío</h2>
          <p class="mt-2 text-slate-500">Parece que aún no has añadido nada</p>
          <a routerLink="/" fragment="catalogo" class="mt-6 rounded-md bg-primary px-6 py-3 font-bold text-white">Explorar productos</a>
        </div>
      }

      @for(i of items(); track i.idproducto){
        <article class="mt-4 flex items-center gap-4 rounded-lg border bg-white p-4">
          <img [src]="img(i.imagen_principal)" class="h-20 w-20 rounded-md border object-cover">
          <div class="flex-1">
            <h2 class="font-bold">{{i.nombreproducto}}</h2>
            <p class="text-sm text-slate-500">Q{{i.precioproducto}} × {{i.cantidad}} = <b class="text-slate-700">Q{{(i.precioproducto*i.cantidad).toFixed(2)}}</b></p>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center rounded-md border">
              <button (click)="change(i,i.cantidad-1)" class="px-2.5 py-2"><app-icon name="minus" [size]="14"/></button>
              <span class="w-8 text-center text-sm font-bold">{{i.cantidad}}</span>
              <button (click)="change(i,i.cantidad+1)" class="px-2.5 py-2"><app-icon name="plus" [size]="14"/></button>
            </div>
            <button (click)="remove(i.idproducto)" class="rounded-md p-2 text-red-600 hover:bg-red-50" aria-label="Eliminar">
              <app-icon name="trash" [size]="18"/>
            </button>
          </div>
        </article>
      }

      @if(items().length){
        <div class="mt-6 flex justify-between border-t pt-5 text-xl font-bold">
          <span>Total parcial</span><span>Q{{total()}}</span>
        </div>
        <a routerLink="/checkout" class="mt-6 inline-block rounded-md bg-primary px-6 py-3.5 font-bold text-white">Continuar a checkout</a>
      }
    </section>
  `
})
export class CartComponent implements OnInit {
  api = inject(ApiService);
  cartService = inject(CartService);
  items = signal<CartItem[]>([]);

  ngOnInit() { this.load(); }
  img(path: string) { return this.api.fileUrl(path); }
  load() { this.api.cart().subscribe(r => this.items.set(r.data)); }
  total() { return this.items().reduce((n, i) => n + i.precioproducto * i.cantidad, 0).toFixed(2); }

  change(i: CartItem, q: number) {
    if (q < 1) return this.remove(i.idproducto);
    this.api.putCart(i.idproducto, q).subscribe(() => { this.load(); this.cartService.refresh(); });
  }

  remove(id: number) { this.api.removeCart(id).subscribe(() => { this.load(); this.cartService.refresh(); }); }
}
