import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { SearchService } from '../services/search.service';
import { IconComponent } from '../shared/icon.component';
import { Category, Product } from '../models/api';

type Orden = 'relevancia' | 'precio_asc' | 'precio_desc';
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <section class="overflow-hidden bg-gradient-to-br from-motorflow-dark via-primary to-sky-400 px-6 py-16 text-white">
      <div class="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
        <div class="self-center">
          <p class="mb-3 font-semibold uppercase tracking-[.2em] text-sky-100">Aceitera de confianza</p>
          <h1 class="text-4xl font-extrabold leading-tight md:text-5xl">Todo para que tu motor fluya</h1>
          <p class="mt-5 max-w-lg text-blue-50">Lubricantes, filtros, refrigerantes y repuestos con información clara para tu vehículo.</p>
          <a href="/" (click)="scrollToCatalogo($event)" class="mt-7 inline-block rounded-md bg-white px-6 py-3 font-bold text-primary">Ver catálogo</a>
        </div>
        <img class="h-64 w-full rounded-lg object-cover shadow-xl md:h-80" src="assets/LogoFullMotorFlow.png" alt="MotorFlow">
      </div>
    </section>

    <section id="catalogo" class="mx-auto max-w-7xl px-6 py-12 scroll-mt-12 bg-white">
      <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p class="font-bold text-primary">CATÁLOGO</p>
          <h2 class="text-3xl font-extrabold">Encuentra el repuesto ideal</h2>
        </div>

        <div class="flex flex-row items-center gap-2 sm:gap-3">
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-black">
              <app-icon name="search" [size]="16"/>
            </span>
            <input
              #searchInput
              [ngModel]="searchTermLocal()"
              (ngModelChange)="searchTermLocal.set($event)"
              (keyup.enter)="ejecutarBusqueda()"
              placeholder="Buscar productos..."
              class="w-full rounded-full border bg-slate-50 py-2 pl-8 pr-8 text-xs placeholder:font-semibold placeholder:text-slate-400 sm:w-64 sm:pl-9 sm:pr-9 sm:text-sm focus:outline-none focus:border-2 focus:border-primary">
              
            @if (searchTermLocal()) {
              <button
                type="button"
                (click)="limpiarBusqueda()"
                class="absolute inset-y-0 right-3 flex items-center text-black"
                aria-label="Limpiar búsqueda">
                <app-icon name="x" [size]="15"/>
              </button>
            }
          </div>

          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <app-icon name="tag" [size]="15"/>
            </span>
            <select [ngModel]="marca()" (ngModelChange)="selectMarca($event)" class="w-full rounded-full border bg-slate-50 py-2 pl-8 pr-2 text-xs font-semibold sm:w-44 sm:pl-9 sm:pr-4 sm:text-sm focus:outline-none focus:border-2 focus:border-primary">
              <option [ngValue]="null">Marcas</option>
              @for(m of brands(); track m){<option [ngValue]="m">{{m}}</option>}
            </select>
          </div>

          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <app-icon name="arrowUpDown" [size]="15"/>
            </span>
            <select [ngModel]="orden()" (ngModelChange)="orden.set($event)" class="w-full rounded-full border bg-slate-50 py-2 pl-8 pr-2 text-xs font-semibold sm:w-56 sm:pl-9 sm:pr-4 sm:text-sm focus:outline-none focus:border-2 focus:border-primary">
              <option value="relevancia">Más relevantes</option>
              <option value="precio_asc">$ Menor a mayor</option>
              <option value="precio_desc">$ Mayor a menor</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        <button (click)="selectCategory()" [class.bg-primary]="!category" [class.text-white]="!category" [class.border-primary]="!category" class="rounded-md border px-4 py-2 text-sm font-bold">Todos</button>
        @for(c of categories(); track c.id_categoria){
          <button (click)="selectCategory(c.id_categoria)" [class.bg-primary]="category===c.id_categoria" [class.text-white]="category===c.id_categoria" [class.border-primary]="category===c.id_categoria" class="rounded-md border px-4 py-2 text-sm font-bold">{{c.nombre_categoria}}</button>
        }
      </div>

      @if (search.term() || marca() || (orden() && orden() !== 'relevancia')) {
        <div class="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-700">
          <span class="font-semibold text-black">Filtros aplicados:</span>

          @if (search.term()) {
            <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">
              Búsqueda: "<b>{{ search.term() }}</b>"
              <button (click)="limpiarBusqueda()" class="rounded-full p-0.5 hover:bg-slate-200" aria-label="Quitar búsqueda">
                <app-icon name="x" [size]="13"/>
              </button>
            </span>
          }

          @if (marca()) {
            <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">
              Marca: <b>{{ marca() }}</b>
              <button (click)="selectMarca(null)" class="rounded-full p-0.5 hover:bg-slate-200" aria-label="Quitar marca">
                <app-icon name="x" [size]="13"/>
              </button>
            </span>
          }

          @if (orden() && orden() !== 'relevancia') {
            <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">
              Precio: <b>{{ orden() === 'precio_asc' ? '$ Menor a mayor' : '$ Mayor a menor' }}</b>
              <button (click)="orden.set('relevancia')" class="rounded-full p-0.5 hover:bg-slate-200" aria-label="Restablecer orden">
                <app-icon name="x" [size]="13"/>
              </button>
            </span>
          }

          <button
            (click)="limpiarTodosLosFiltros()"
            class="ml-1 text-xs font-bold text-primary underline hover:text-motorflow-dark">
            Limpiar todos
          </button>
        </div>
      }

      @if(category && subcategoriesOfSelected().length){
        <div class="mb-8 flex flex-wrap gap-2">
          <button (click)="selectSubcategory()" [class.bg-motorflow-pale]="!subcategory" [class.text-primary]="!subcategory" class="rounded-md border px-3 py-1.5 text-xs font-bold">Todas las subcategorías</button>
          @for(s of subcategoriesOfSelected(); track s.id_subcategoria){
            <button (click)="selectSubcategory(s.id_subcategoria)" [class.bg-motorflow-pale]="subcategory===s.id_subcategoria" [class.text-primary]="subcategory===s.id_subcategoria" class="rounded-md border px-3 py-1.5 text-xs font-bold">{{s.nombre_subcategoria}}</button>
          }
        </div>
      }

      <div class="grid grid-cols-2 gap-6 lg:grid-cols-4">
        @for(p of sortedProducts(); track p.idproducto){
          <a [routerLink]="['/producto', p.idproducto]" class="group relative overflow-hidden rounded-lg border-transparent bg-transparent transition hover:shadow-xl">
            @if(!p.stock){
              <span class="absolute left-3 top-3 z-10 rounded bg-motorflow-dark px-2 py-1 text-xs font-bold text-white">Agotado</span>
            }
            <div class="flex h-48 w-full items-center justify-center overflow-hidden bg-transparent p-3">
              <img
                [src]="img(p.imagen_principal)"
                class="max-h-full max-w-full object-contain"
                [class.opacity-60]="!p.stock"
                [alt]="p.nombreproducto">
            </div>
            <div class="p-4">
              <p class="text-xs font-bold text-primary">{{p.nombre_categoria}} · {{p.marca}}</p>
              <h3 class="mt-2 min-h-11 text-sm font-bold leading-snug">{{p.nombreproducto}}</h3>
              <p class="mt-3 text-lg font-extrabold">Q{{p.precioproducto}}</p>
            </div>
          </a>
        }
      </div>
      @if(!sortedProducts().length){<p class="mt-10 text-center text-slate-500">No hay productos que coincidan con tu búsqueda.</p>}
    </section>
  `
})
export class HomeComponent implements OnInit {
  api = inject(ApiService);
  search = inject(SearchService);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  category?: number;
  subcategory?: number;
  orden = signal<Orden>('relevancia');
  marca = signal<string | null>(null);
  brands = signal<string[]>([]);

  // Signal local para controlar el texto del input sin disparar búsquedas
  searchTermLocal = signal<string>(this.search.term());

  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  sortedProducts = computed(() => {
    const list = [...this.products()];
    const orden = this.orden();
    if (orden === 'precio_asc') list.sort((a, b) => Number(a.precioproducto) - Number(b.precioproducto));
    if (orden === 'precio_desc') list.sort((a, b) => Number(b.precioproducto) - Number(a.precioproducto));
    return list;
  });


  ngOnInit() {
    this.api.categories().subscribe(r => this.categories.set(r.data));
    this.api.brands().subscribe(r => this.brands.set(r.data));
    this.load();
  }

  /**
   * Se ejecuta al presionar Enter en el input de búsqueda.
   * Guarda el valor en el servicio global y realiza la consulta HTTP.
   */
  ejecutarBusqueda() {
    this.search.term.set(this.searchTermLocal());
    this.load();
  }

  img(path: string) { return this.api.fileUrl(path); }

  subcategoriesOfSelected() {
    return this.categories().find(c => c.id_categoria === this.category)?.subcategorias || [];
  }

  selectCategory(id?: number) { this.category = id; this.subcategory = undefined; this.load(); }
  selectSubcategory(id?: number) { this.subcategory = id; this.load(); }
  selectMarca(m: string | null) { this.marca.set(m); this.load(); }

  scrollToCatalogo(event: Event) {
    event.preventDefault();
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  limpiarBusqueda() {
    this.searchTermLocal.set('');
    this.search.term.set('');
    this.load();
  }

  limpiarTodosLosFiltros() {
    this.limpiarBusqueda();
    this.selectMarca(null);
    this.orden.set('relevancia');
  }

  load() {
    const q = this.search.term();
    this.api.products({
      ...(this.category ? { categoria: this.category } : {}),
      ...(this.subcategory ? { subcategoria: this.subcategory } : {}),
      ...(this.marca() ? { marca: this.marca() } : {}),
      ...(q ? { q } : {})
    }).subscribe(r => this.products.set(r.data));
  }
}