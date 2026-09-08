import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { IconComponent } from '../shared/icon.component';
import { Category } from '../models/api';

type Tab = 'productos' | 'categorias' | 'subcategorias' | 'clientes' | 'pedidos';

const STEPS = [
  { key: 'nueva', label: 'Orden nueva', icon: 'package', match: ['NUEVA'] },
  { key: 'surtiendo', label: 'Surtiéndose', icon: 'clock', match: ['SURTI'] },
  { key: 'empacando', label: 'Empacándose', icon: 'boxes', match: ['EMPAC'] },
  { key: 'ruta', label: 'En ruta', icon: 'truck', match: ['RUTA'] },
  { key: 'entregada', label: 'Entregada', icon: 'check', match: ['ENTREG'] },
];

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <section class="mx-auto max-w-6xl px-6 py-12">
      <p class="font-bold text-primary">ADMINISTRACIÓN</p>
      <h1 class="text-3xl font-extrabold">Panel de MotorFlow</h1>

      <div class="mt-6 flex flex-wrap gap-2">
        @for(t of tabs; track t){
          <button (click)="setTab(t)"
                  [class.bg-primary]="tab()===t" [class.text-white]="tab()===t" [class.border-primary]="tab()===t"
                  class="rounded-md border px-4 py-2 text-sm font-bold">
            {{labels[t]}}
          </button>
        }
      </div>

      <!-- PRODUCTOS -->
      @if(tab()==='productos'){
        <div class="mt-6 rounded-xl border bg-white p-6">
          <h2 class="text-xl font-extrabold text-slate-900">{{editingProductId() ? 'Editar producto' : 'Nuevo producto'}}</h2>
  
          <div class="mt-6 grid gap-5 sm:grid-cols-3">
            <!-- Nombre -->
            <label class="flex flex-col gap-1.5 text-sm font-bold text-slate-800">
              Nombre:
              <input [(ngModel)]="product.nombreproducto" type="text" class="rounded-lg border border-slate-300 p-3 text-base font-normal text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
            </label>

            <!-- Marca -->
            <label class="flex flex-col gap-1.5 text-sm font-bold text-slate-800">
              Marca:
              <input [(ngModel)]="product.marca" type="text" class="rounded-lg border border-slate-300 p-3 text-base font-normal text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
            </label>

            <!-- Categoría -->
            <label class="flex flex-col gap-1.5 text-sm font-bold text-slate-800">
              Categoría:
              <select [(ngModel)]="product.id_categoria" class="rounded-lg border border-slate-300 bg-white p-3 text-base font-normal text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option [ngValue]="null">Seleccionar categoría...</option>
                @for(c of categories(); track c.id_categoria){
                  <option [ngValue]="c.id_categoria">{{c.nombre_categoria}}</option>
                }
              </select>
            </label>

            <!-- Subcategoría -->
            <label class="flex flex-col gap-1.5 text-sm font-bold text-slate-800">
              Subcategoría (opcional):
              <select [(ngModel)]="product.id_subcategoria" class="rounded-lg border border-slate-300 bg-white p-3 text-base font-normal text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option [ngValue]="null">Sin subcategoría</option>
                @for(s of subcategoriasOf(product.id_categoria); track s.id_subcategoria){
                  <option [ngValue]="s.id_subcategoria">{{s.nombre_subcategoria}}</option>
                }
              </select>
            </label>

            <!-- Precio -->
            <label class="flex flex-col gap-1.5 text-sm font-bold text-slate-800">
              Precio (Q):
              <input [(ngModel)]="product.precioproducto" type="number" min="0" step="0.01" class="rounded-lg border border-slate-300 p-3 text-base font-normal text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
            </label>

            <!-- Stock -->
            <label class="flex flex-col gap-1.5 text-sm font-bold text-slate-800">
              Stock disponible:
              <input [(ngModel)]="product.stock" type="number" min="0" class="rounded-lg border border-slate-300 p-3 text-base font-normal text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
            </label>

            <!-- Descripción -->
            <label class="flex flex-col gap-1.5 text-sm font-bold text-slate-800 sm:col-span-3">
              Descripción:
              <textarea [(ngModel)]="product.descripcion" rows="3" class="rounded-lg border border-slate-300 p-3 text-base font-normal text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"></textarea>
            </label>

            <!-- Especificaciones -->
            <label class="flex flex-col gap-1.5 text-sm font-bold text-slate-800 sm:col-span-3">
              Especificaciones:
              <textarea [(ngModel)]="product.especificaciones" rows="3" class="rounded-lg border border-slate-300 p-3 text-base font-normal text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"></textarea>
            </label>
          </div>

          <div class="mt-3 flex items-center gap-4">
            <label class="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm font-bold text-primary hover:bg-motorflow-pale">
              <app-icon name="upload" [size]="18"/> {{uploading ? 'Subiendo...' : 'Subir imagen desde mi equipo'}}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" (change)="onFile($event)" class="hidden" [disabled]="uploading">
            </label>
            @if(product.imagen_principal){
              <img [src]="img(product.imagen_principal)" class="h-16 w-16 rounded-md border object-cover">
            } @else {
              <span class="flex h-16 w-16 items-center justify-center rounded-md border text-slate-300"><app-icon name="image" [size]="24"/></span>
            }
          </div>

          <div class="mt-4 flex gap-3">
            <button (click)="saveProduct()" [disabled]="uploading" class="rounded-md bg-primary px-4 py-2 font-bold text-white">
              {{editingProductId() ? 'Guardar cambios' : 'Crear producto'}}
            </button>
            @if(editingProductId()){<button (click)="cancelEditProduct()" class="rounded-md bg-motorflow-pale px-4 py-2 font-bold text-primary">Cancelar</button>}
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <input [ngModel]="searchName()" (ngModelChange)="searchName.set($event)" placeholder="Buscar por nombre..." class="flex-1 rounded-md border p-2.5 text-sm">
          <input [ngModel]="searchId()" (ngModelChange)="searchId.set($event)" placeholder="Buscar por ID..." inputmode="numeric" class="w-full rounded-md border p-2.5 text-sm sm:w-40">
        </div>

        <div class="mt-4 overflow-auto rounded-lg border bg-white">
          <table class="w-full text-left">
            <thead><tr class="border-b bg-motorflow-pale/40 text-sm"><th class="p-3">ID</th><th class="p-3">Producto</th><th class="p-3">Precio</th><th class="p-3">Stock</th><th class="p-3">Acciones</th></tr></thead>
            <tbody>
              @for(p of filteredProducts(); track p.idproducto){
                <tr class="border-b">
                  <td class="p-3 font-mono text-slate-500">#{{p.idproducto}}</td>
                  <td class="flex items-center gap-3 p-3"><img [src]="img(p.imagen_principal)" class="h-9 w-9 rounded border object-cover">{{p.nombreproducto}}</td>
                  <td class="p-3">Q{{p.precioproducto}}</td>
                  <td class="p-3">{{p.stock}}</td>
                  <td class="p-3">
                    <div class="flex gap-1">
                      <button (click)="editProduct(p)" title="Editar" class="rounded-md p-2 text-primary hover:bg-motorflow-pale"><app-icon name="edit" [size]="17"/></button>
                      <button (click)="deleteProduct(p.idproducto)" title="Eliminar" class="rounded-md p-2 text-red-600 hover:bg-red-50"><app-icon name="trash" [size]="17"/></button>
                    </div>
                  </td>
                </tr>
              }
              @if(!filteredProducts().length){
                <tr><td colspan="5" class="p-6 text-center text-slate-500">No hay productos que coincidan con la búsqueda.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- CATEGORIAS -->
      @if(tab()==='categorias'){
        <div class="mt-6 rounded-lg border bg-white p-5">
          <h2 class="font-bold">Nueva categoría</h2>
          <div class="mt-3 flex gap-3">
            <input [(ngModel)]="newCategoryName" placeholder="Nombre de categoría" class="flex-1 rounded-md border p-2">
            <button (click)="createCategory()" class="rounded-md bg-primary px-4 py-2 font-bold text-white">Crear</button>
          </div>
        </div>
        <div class="mt-6 grid gap-3">
          @for(c of categories(); track c.id_categoria){
            <div class="flex items-center justify-between rounded-lg border bg-white p-4">
              <span class="font-semibold">{{c.nombre_categoria}}</span>
              <button (click)="deleteCategory(c.id_categoria)" title="Eliminar" class="rounded-md p-2 text-red-600 hover:bg-red-50"><app-icon name="trash" [size]="17"/></button>
            </div>
          }
        </div>
      }

      <!-- SUBCATEGORIAS -->
      @if(tab()==='subcategorias'){
        <div class="mt-6 rounded-lg border bg-white p-5">
          <h2 class="font-bold">Nueva subcategoría</h2>
          <div class="mt-3 grid gap-3 sm:grid-cols-3">
            <select [(ngModel)]="newSubcategory.id_categoria" class="rounded-md border p-2">
              <option [ngValue]="null">Categoría...</option>
              @for(c of categories(); track c.id_categoria){<option [ngValue]="c.id_categoria">{{c.nombre_categoria}}</option>}
            </select>
            <input [(ngModel)]="newSubcategory.nombre_subcategoria" placeholder="Nombre de subcategoría" class="rounded-md border p-2 sm:col-span-2">
          </div>
          <button (click)="createSubcategory()" class="mt-4 rounded-md bg-primary px-4 py-2 font-bold text-white">Crear</button>
        </div>
        <div class="mt-6 grid gap-4">
          @for(c of categories(); track c.id_categoria){
            <div class="rounded-lg border bg-white p-4">
              <p class="font-bold text-primary">{{c.nombre_categoria}}</p>
              @if(!c.subcategorias.length){<p class="mt-2 text-sm text-slate-500">Sin subcategorías todavía.</p>}
              @for(s of c.subcategorias; track s.id_subcategoria){
                <div class="mt-2 flex items-center justify-between border-t pt-2">
                  <span>{{s.nombre_subcategoria}}</span>
                  <button (click)="deleteSubcategory(s.id_subcategoria)" title="Eliminar" class="rounded-md p-2 text-red-600 hover:bg-red-50"><app-icon name="trash" [size]="16"/></button>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- CLIENTES -->
      @if(tab()==='clientes'){
        <div class="mt-6 overflow-auto rounded-lg border bg-white">
          <table class="w-full text-left">
            <thead><tr class="border-b bg-motorflow-pale/40 text-sm"><th class="p-3">Usuario</th><th class="p-3">Correo</th><th class="p-3">Pedidos</th></tr></thead>
            <tbody>@for(x of clientes(); track x.cusername){<tr class="border-b"><td class="p-3">{{x.cusername}}</td><td class="p-3">{{x.email}}</td><td class="p-3">{{x.pedidos}}</td></tr>}</tbody>
          </table>
        </div>
      }

      <!-- PEDIDOS GLOBALES -->
      @if(tab()==='pedidos'){
        <div class="mt-6">
          <input [ngModel]="orderSearch()" (ngModelChange)="orderSearch.set($event)" placeholder="Buscar por usuario o # de orden..." class="w-full rounded-md border p-2.5 text-sm sm:w-80">
        </div>

        @if(!filteredOrders().length){
          <p class="mt-6 text-center text-slate-500">No hay pedidos que coincidan.</p>
        }

        @for(o of filteredOrders(); track o.ordendecompra){
          <article class="mt-5 rounded-lg border bg-white p-5">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 class="flex items-center gap-2 font-bold"><app-icon name="package" [size]="18" strokeColor="#1677d2"/> Orden #{{o.ordendecompra}}</h2>
                <p class="text-sm text-slate-500">{{o.cusername}} · {{o.email}} · {{o.fecha | date:'medium'}} · Enviado por {{o.courier}}</p>
              </div>
              <b class="text-lg">Q{{o.total}}</b>
            </div>

            <div class="mt-4 divide-y border-y">
              @for(item of o.items; track item.idproducto){
                <div class="flex items-center justify-between py-2 text-sm">
                  <span>{{item.nombreproducto}} <span class="text-slate-400">× {{item.cantidad}}</span></span>
                  <span class="text-slate-500">Q{{item.precio_unitario}} c/u · <b class="text-slate-700">Q{{item.subtotal}}</b></span>
                </div>
              }
            </div>
            <div class="mt-2 space-y-1 text-right text-sm">
              <p class="text-slate-500">Envío ({{o.courier}}): <b class="text-slate-700">Q{{o.costo_envio}}</b></p>
              <p class="font-bold">Total: Q{{o.total}}</p>
            </div>

            <div class="mt-5 border-t pt-5">
              @if(!tracking[o.ordendecompra]){
                <button (click)="track(o.ordendecompra)" class="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-bold text-primary hover:bg-slate-50">
                  <app-icon name="truck" [size]="16"/> Consultar estatus de envío
                </button>
              } @else {
                <div class="flex flex-col gap-4">
                  @if(tracking[o.ordendecompra] === 'loading') {
                    <p class="text-sm text-slate-500">Consultando con el courier...</p>
                  } @else if(stepIndex(tracking[o.ordendecompra]!) === -1) {
                    <p class="text-sm font-semibold text-slate-600">{{tracking[o.ordendecompra]}}</p>
                  } @else {
                    <div class="flex items-start justify-between">
                      @for(s of steps; track s.key; let i = $index) {
                        <div class="flex flex-1 flex-col items-center text-center">
                          <div class="flex w-full items-center">
                            @if(i > 0){<span class="h-px flex-1" [class.bg-primary]="i <= stepIndex(tracking[o.ordendecompra]!)" [class.bg-slate-200]="i > stepIndex(tracking[o.ordendecompra]!)"></span>}
                            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2"
                                  [class.border-primary]="i <= stepIndex(tracking[o.ordendecompra]!)" [class.bg-motorflow-pale]="i <= stepIndex(tracking[o.ordendecompra]!)"
                                  [class.text-primary]="i <= stepIndex(tracking[o.ordendecompra]!)" [class.border-slate-200]="i > stepIndex(tracking[o.ordendecompra]!)" [class.text-slate-300]="i > stepIndex(tracking[o.ordendecompra]!)">
                              <app-icon [name]="s.icon" [size]="18"/>
                            </span>
                            @if(i < steps.length - 1){<span class="h-px flex-1" [class.bg-primary]="i < stepIndex(tracking[o.ordendecompra]!)" [class.bg-slate-200]="i >= stepIndex(tracking[o.ordendecompra]!)"></span>}
                          </div>
                          <span class="mt-2 text-xs font-semibold" [class.text-primary]="i <= stepIndex(tracking[o.ordendecompra]!)" [class.text-slate-400]="i > stepIndex(tracking[o.ordendecompra]!)">{{s.label}}</span>
                        </div>
                      }
                    </div>
                  }

                  @if(tracking[o.ordendecompra] !== 'loading') {
                    <button (click)="track(o.ordendecompra)" class="self-start flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-bold text-primary hover:bg-slate-50">
                      <app-icon name="truck" [size]="16"/> Consultar de nuevo
                    </button>
                  }
                </div>
              }
            </div>
          </article>
        }
      }

    </section>
  `
})
export class AdminComponent implements OnInit {
  api = inject(ApiService);
  toast = inject(ToastService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  tabs: Tab[] = ['productos', 'categorias', 'subcategorias', 'clientes', 'pedidos'];
  labels: Record<Tab, string> = { productos: 'Productos', categorias: 'Categorías', subcategorias: 'Subcategorías', clientes: 'Clientes', pedidos: 'Pedidos Globales' };
  tab = signal<Tab>('productos');

  products = signal<any[]>([]);
  categories = signal<Category[]>([]);
  clientes = signal<any[]>([]);
  uploading = false;

  searchName = signal('');
  searchId = signal('');
  filteredProducts = computed(() => {
    const name = this.searchName().trim().toLowerCase();
    const id = this.searchId().trim();
    return this.products().filter(p =>
      (!name || p.nombreproducto.toLowerCase().includes(name)) &&
      (!id || String(p.idproducto).includes(id))
    );
  });

  allOrders = signal<any[]>([]);
  orderSearch = signal('');
  tracking: Record<number, string> = {};
  steps = STEPS;
  filteredOrders = computed(() => {
    const q = this.orderSearch().trim().toLowerCase();
    if (!q) return this.allOrders();
    return this.allOrders().filter(o =>
      o.cusername.toLowerCase().includes(q) || String(o.ordendecompra).includes(q)
    );
  });

  editingProductId = signal<number | null>(null);
  product: any = this.blankProduct();
  newCategoryName = '';
  newSubcategory: any = { id_categoria: null, nombre_subcategoria: '' };

  ngOnInit() {
    const initial = this.route.snapshot.url[1]?.path as Tab | undefined;
    if (initial && this.tabs.includes(initial)) this.tab.set(initial);
    this.api.categories().subscribe(r => this.categories.set(r.data));
    this.loadTabData(this.tab());
  }

  img(path: string) { return this.api.fileUrl(path); }

  setTab(t: Tab) { this.tab.set(t); this.router.navigate(['/admin', t]); this.loadTabData(t); }

  loadTabData(t: Tab) {
    if (t === 'productos') this.api.products().subscribe(r => this.products.set(r.data));
    if (t === 'clientes') this.api.admin('clientes').subscribe(r => this.clientes.set(r.data));
    if (t === 'pedidos') this.api.orders().subscribe(r => this.allOrders.set(r.data));
  }

  subcategoriasOf(idCategoria: number | null) {
    return this.categories().find(c => c.id_categoria === idCategoria)?.subcategorias || [];
  }

  blankProduct() {
    return { nombreproducto: '', marca: '', id_categoria: null, id_subcategoria: null, precioproducto: 0, stock: 0, imagen_principal: '', descripcion: '', especificaciones: '' };
  }

  onFile(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    this.api.uploadImage(file).subscribe({
      next: r => { this.product.imagen_principal = r.data.url; this.uploading = false; },
      error: e => { this.uploading = false; this.toast.show(e.error?.message || 'No se pudo subir la imagen'); }
    });
  }

  editProduct(p: any) { this.editingProductId.set(p.idproducto); this.product = { ...p }; }
  cancelEditProduct() { this.editingProductId.set(null); this.product = this.blankProduct(); }

  saveProduct() {
    if (!this.product.imagen_principal) return this.toast.show('Sube una imagen para el producto');
    const id = this.editingProductId();
    const req = id ? this.api.adminUpdate('productos', id, this.product) : this.api.admin('productos', this.product);
    req.subscribe({
      next: () => { this.cancelEditProduct(); this.loadTabData('productos'); },
      error: e => this.toast.show(e.error?.message || 'No se pudo guardar el producto')
    });
  }

  deleteProduct(id: number) { this.api.adminDelete('productos', id).subscribe(() => this.loadTabData('productos')); }

  createCategory() {
    if (!this.newCategoryName.trim()) return;
    this.api.admin('categorias', { nombre_categoria: this.newCategoryName }).subscribe(() => {
      this.newCategoryName = '';
      this.api.categories().subscribe(r => this.categories.set(r.data));
    });
  }

  deleteCategory(id: number) {
    this.api.adminDelete('categorias', id).subscribe({
      next: () => this.api.categories().subscribe(r => this.categories.set(r.data)),
      error: e => this.toast.show(e.error?.message || 'No se pudo eliminar')
    });
  }

  createSubcategory() {
    if (!this.newSubcategory.id_categoria || !this.newSubcategory.nombre_subcategoria.trim()) return;
    this.api.admin('subcategorias', this.newSubcategory).subscribe(() => {
      this.newSubcategory = { id_categoria: null, nombre_subcategoria: '' };
      this.api.categories().subscribe(r => this.categories.set(r.data));
    });
  }

  deleteSubcategory(id: number) {
    this.api.adminDelete('subcategorias', id).subscribe({
      next: () => this.api.categories().subscribe(r => this.categories.set(r.data)),
      error: e => this.toast.show(e.error?.message || 'No se pudo eliminar')
    });
  }

  track(id: number) {
    this.tracking[id] = 'loading';
    this.api.track(id).subscribe({
      next: r => this.tracking[id] = r.data.status || 'Sin información',
      error: () => this.tracking[id] = 'No se pudo consultar el estatus en este momento.'
    });
  }

  stepIndex(status: string): number {
    const upper = (status || '').toUpperCase();
    return STEPS.findIndex(s => s.match.some(m => upper.includes(m)));
  }
}