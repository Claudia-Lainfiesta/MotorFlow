import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { IconComponent } from '../shared/icon.component';
import { Category } from '../models/api';

type Tab = 'productos' | 'categorias' | 'subcategorias' | 'clientes';

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
        <div class="mt-6 rounded-lg border bg-white p-5">
          <h2 class="font-bold">{{editingProductId() ? 'Editar producto' : 'Nuevo producto'}}</h2>
          <div class="mt-3 grid gap-2 sm:grid-cols-3">
            <input [(ngModel)]="product.nombreproducto" placeholder="Nombre" class="rounded-md border p-2">
            <input [(ngModel)]="product.marca" placeholder="Marca" class="rounded-md border p-2">
            <select [(ngModel)]="product.id_categoria" class="rounded-md border p-2">
              <option [ngValue]="null">Categoría...</option>
              @for(c of categories(); track c.id_categoria){<option [ngValue]="c.id_categoria">{{c.nombre_categoria}}</option>}
            </select>
            <select [(ngModel)]="product.id_subcategoria" class="rounded-md border p-2">
              <option [ngValue]="null">Subcategoría (opcional)</option>
              @for(s of subcategoriasOf(product.id_categoria); track s.id_subcategoria){<option [ngValue]="s.id_subcategoria">{{s.nombre_subcategoria}}</option>}
            </select>
            <input [(ngModel)]="product.precioproducto" type="number" placeholder="Precio" class="rounded-md border p-2">
            <input [(ngModel)]="product.stock" type="number" placeholder="Stock" class="rounded-md border p-2">
            <textarea [(ngModel)]="product.descripcion" placeholder="Descripción" rows="3" class="rounded-md border p-2 sm:col-span-3"></textarea>
            <textarea [(ngModel)]="product.especificaciones" placeholder="Especificaciones (texto libre — una por línea, ej. &quot;- Temperatura de operación: -50°C a 150°C&quot;)" rows="5" class="rounded-md border p-2 sm:col-span-3"></textarea>
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

        <div class="mt-6 overflow-auto rounded-lg border bg-white">
          <table class="w-full text-left">
            <thead><tr class="border-b bg-motorflow-pale/40 text-sm"><th class="p-3">Producto</th><th class="p-3">Precio</th><th class="p-3">Stock</th><th class="p-3">Acciones</th></tr></thead>
            <tbody>
              @for(p of products(); track p.idproducto){
                <tr class="border-b">
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

    </section>
  `
})
export class AdminComponent implements OnInit {
  api = inject(ApiService);
  toast = inject(ToastService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  tabs: Tab[] = ['productos', 'categorias', 'subcategorias', 'clientes'];
  labels: Record<Tab, string> = { productos: 'Productos', categorias: 'Categorías', subcategorias: 'Subcategorías', clientes: 'Clientes' };
  tab = signal<Tab>('productos');

  products = signal<any[]>([]);
  categories = signal<Category[]>([]);
  clientes = signal<any[]>([]);
  uploading = false;

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

}
