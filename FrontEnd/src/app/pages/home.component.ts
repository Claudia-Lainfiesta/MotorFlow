import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Category, Product } from '../models/api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="overflow-hidden bg-gradient-to-br from-motorflow-dark via-primary to-sky-400 px-6 py-20 text-white">
      <div class="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
        <div>
          <p class="mb-3 font-semibold uppercase tracking-[.2em] text-sky-100">Aceitera de confianza</p>
          <h1 class="text-4xl font-extrabold leading-tight md:text-6xl">Todo para que tu motor fluya.</h1>
          <p class="mt-5 max-w-lg text-blue-50">Lubricantes, filtros, refrigerantes y repuestos con información clara para tu vehículo.</p>
          <a href="#catalogo" class="mt-7 inline-block rounded-full bg-white px-6 py-3 font-bold text-primary">Ver catálogo</a>
        </div>
        <img class="h-64 w-full rounded-[2rem] object-cover shadow-2xl md:h-80" src="https://picsum.photos/seed/motorflow-hero/1000/650" alt="MotorFlow">
      </div>
    </section>

    <section id="catalogo" class="mx-auto max-w-7xl px-6 py-12">
      <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <p class="font-bold text-primary">CATÁLOGO</p>
          <h2 class="text-3xl font-extrabold">Encuentra el repuesto ideal</h2>
        </div>
        <input [(ngModel)]="q" (ngModelChange)="load()" class="rounded-xl border px-4 py-3" placeholder="Buscar productos...">
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        <button (click)="selectCategory()" [class.bg-primary]="!category" [class.text-white]="!category" class="rounded-full border px-4 py-2 text-sm font-bold">Todos</button>
        @for(c of categories(); track c.id_categoria){
          <button (click)="selectCategory(c.id_categoria)" [class.bg-primary]="category===c.id_categoria" [class.text-white]="category===c.id_categoria" class="rounded-full border px-4 py-2 text-sm font-bold">{{c.nombre_categoria}}</button>
        }
      </div>

      @if(category && subcategoriesOfSelected().length){
        <div class="mb-8 flex flex-wrap gap-2">
          <button (click)="selectSubcategory()" [class.bg-motorflow-dark]="!subcategory" [class.text-white]="!subcategory" class="rounded-full border px-3 py-1.5 text-xs font-bold">Todas las subcategorías</button>
          @for(s of subcategoriesOfSelected(); track s.id_subcategoria){
            <button (click)="selectSubcategory(s.id_subcategoria)" [class.bg-motorflow-dark]="subcategory===s.id_subcategoria" [class.text-white]="subcategory===s.id_subcategoria" class="rounded-full border px-3 py-1.5 text-xs font-bold">{{s.nombre_subcategoria}}</button>
          }
        </div>
      }
      @if(!category){<div class="mb-8"></div>}

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        @for(p of products(); track p.idproducto){
          <a [routerLink]="['/producto', p.idproducto]" class="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <img [src]="p.imagen_principal" class="h-48 w-full object-cover transition group-hover:scale-105" [alt]="p.nombreproducto">
            <div class="p-5">
              <p class="text-xs font-bold text-primary">{{p.nombre_categoria}} · {{p.marca}}</p>
              <h3 class="mt-2 min-h-12 font-bold">{{p.nombreproducto}}</h3>
              <p class="mt-2 text-sm text-slate-500">Stock: {{p.stock}}</p>
              <p class="mt-4 text-xl font-extrabold">Q{{p.precioproducto}}</p>
            </div>
          </a>
        }
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  api = inject(ApiService);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  category?: number;
  subcategory?: number;
  q = '';

  ngOnInit() {
    this.api.categories().subscribe(r => this.categories.set(r.data));
    this.load();
  }

  subcategoriesOfSelected() {
    return this.categories().find(c => c.id_categoria === this.category)?.subcategorias || [];
  }

  selectCategory(id?: number) { this.category = id; this.subcategory = undefined; this.load(); }
  selectSubcategory(id?: number) { this.subcategory = id; this.load(); }

  load() {
    this.api.products({
      ...(this.category ? { categoria: this.category } : {}),
      ...(this.subcategory ? { subcategoria: this.subcategory } : {}),
      ...(this.q ? { q: this.q } : {})
    }).subscribe(r => this.products.set(r.data));
  }
}
