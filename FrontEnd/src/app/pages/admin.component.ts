import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Category } from '../models/api';

type Tab = 'productos' | 'categorias' | 'subcategorias' | 'clientes' | 'pedidos';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mx-auto max-w-6xl px-6 py-12">
      <p class="font-bold text-primary">ADMINISTRACIÓN</p>
      <h1 class="text-3xl font-extrabold">Panel de MotorFlow</h1>

      <div class="mt-6 flex flex-wrap gap-3">
        @for(t of tabs; track t){
          <button (click)="setTab(t)"
                  [class.bg-primary]="tab()===t" [class.text-white]="tab()===t"
                  class="rounded-xl bg-motorflow-pale px-4 py-2 font-bold text-primary">
            {{labels[t]}}
          </button>
        }
      </div>

      <!-- PRODUCTOS -->
      @if(tab()==='productos'){
        <div class="mt-6 rounded-2xl border bg-white p-5">
          <h2 class="font-bold">{{editingProductId()? 'Editar producto' : 'Nuevo producto'}}</h2>
          <div class="mt-3 grid gap-2 sm:grid-cols-3">
            <input [(ngModel)]="product.nombreproducto" placeholder="Nombre" class="rounded border p-2">
            <input [(ngModel)]="product.marca" placeholder="Marca" class="rounded border p-2">
            <select [(ngModel)]="product.id_categoria" class="rounded border p-2">
              <option [ngValue]="null">Categoría...</option>
              @for(c of categories(); track c.id_categoria){<option [ngValue]="c.id_categoria">{{c.nombre_categoria}}</option>}
            </select>
            <select [(ngModel)]="product.id_subcategoria" class="rounded border p-2">
              <option [ngValue]="null">Subcategoría (opcional)</option>
              @for(s of subcategoriasOf(product.id_categoria); track s.id_subcategoria){<option [ngValue]="s.id_subcategoria">{{s.nombre_subcategoria}}</option>}
            </select>
            <input [(ngModel)]="product.precioproducto" type="number" placeholder="Precio" class="rounded border p-2">
            <input [(ngModel)]="product.stock" type="number" placeholder="Stock" class="rounded border p-2">
            <input [(ngModel)]="product.imagen_principal" placeholder="URL de imagen" class="rounded border p-2 sm:col-span-3">
            <textarea [(ngModel)]="product.descripcion" placeholder="Descripción" class="rounded border p-2 sm:col-span-3"></textarea>
          </div>
          <div class="mt-4 flex gap-3">
            <button (click)="saveProduct()" class="rounded bg-primary px-4 py-2 font-bold text-white">
              {{editingProductId()? 'Guardar cambios' : 'Crear producto'}}
            </button>
            @if(editingProductId()){<button (click)="cancelEditProduct()" class="rounded bg-motorflow-pale px-4 py-2 font-bold text-primary">Cancelar</button>}
          </div>
        </div>

        <div class="mt-6 overflow-auto rounded-2xl border bg-white">
          <table class="w-full text-left">
            <thead><tr class="border-b bg-motorflow-pale/40 text-sm"><th class="p-3">Producto</th><th class="p-3">Precio</th><th class="p-3">Stock</th><th class="p-3">Acciones</th></tr></thead>
            <tbody>
              @for(p of products(); track p.idproducto){
                <tr class="border-b">
                  <td class="p-3">{{p.nombreproducto}}</td>
                  <td class="p-3">Q{{p.precioproducto}}</td>
                  <td class="p-3">{{p.stock}}</td>
                  <td class="p-3"><div class="flex gap-3 text-sm font-bold">
                    <button (click)="editProduct(p)" class="text-primary">Editar</button>
                    <button (click)="deleteProduct(p.idproducto)" class="text-red-600">Eliminar</button>
                  </div></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- CATEGORIAS -->
      @if(tab()==='categorias'){
        <div class="mt-6 rounded-2xl border bg-white p-5">
          <h2 class="font-bold">Nueva categoría</h2>
          <div class="mt-3 flex gap-3">
            <input [(ngModel)]="newCategoryName" placeholder="Nombre de categoría" class="flex-1 rounded border p-2">
            <button (click)="createCategory()" class="rounded bg-primary px-4 py-2 font-bold text-white">Crear</button>
          </div>
        </div>
        <div class="mt-6 grid gap-3">
          @for(c of categories(); track c.id_categoria){
            <div class="flex items-center justify-between rounded-2xl border bg-white p-4">
              <span class="font-semibold">{{c.nombre_categoria}}</span>
              <button (click)="deleteCategory(c.id_categoria)" class="text-sm font-bold text-red-600">Eliminar</button>
            </div>
          }
        </div>
      }

      <!-- SUBCATEGORIAS -->
      @if(tab()==='subcategorias'){
        <div class="mt-6 rounded-2xl border bg-white p-5">
          <h2 class="font-bold">Nueva subcategoría</h2>
          <div class="mt-3 grid gap-3 sm:grid-cols-3">
            <select [(ngModel)]="newSubcategory.id_categoria" class="rounded border p-2">
              <option [ngValue]="null">Categoría...</option>
              @for(c of categories(); track c.id_categoria){<option [ngValue]="c.id_categoria">{{c.nombre_categoria}}</option>}
            </select>
            <input [(ngModel)]="newSubcategory.nombre_subcategoria" placeholder="Nombre de subcategoría" class="rounded border p-2 sm:col-span-2">
          </div>
          <button (click)="createSubcategory()" class="mt-4 rounded bg-primary px-4 py-2 font-bold text-white">Crear</button>
        </div>
        <div class="mt-6 grid gap-4">
          @for(c of categories(); track c.id_categoria){
            <div class="rounded-2xl border bg-white p-4">
              <p class="font-bold text-primary">{{c.nombre_categoria}}</p>
              @if(!c.subcategorias.length){<p class="mt-2 text-sm text-slate-500">Sin subcategorías todavía.</p>}
              @for(s of c.subcategorias; track s.id_subcategoria){
                <div class="mt-2 flex items-center justify-between border-t pt-2">
                  <span>{{s.nombre_subcategoria}}</span>
                  <button (click)="deleteSubcategory(s.id_subcategoria)" class="text-sm font-bold text-red-600">Eliminar</button>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- CLIENTES -->
      @if(tab()==='clientes'){
        <div class="mt-6 overflow-auto rounded-2xl border bg-white">
          <table class="w-full text-left">
            <thead><tr class="border-b bg-motorflow-pale/40 text-sm"><th class="p-3">Usuario</th><th class="p-3">Correo</th></tr></thead>
            <tbody>@for(x of clientes(); track x.cusername){<tr class="border-b"><td class="p-3">{{x.cusername}}</td><td class="p-3">{{x.email}}</td></tr>}</tbody>
          </table>
        </div>
      }

      <!-- PEDIDOS -->
      @if(tab()==='pedidos'){
        <div class="mt-6 grid gap-3">
          @for(o of pedidos(); track o.ordendecompra){
            <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4">
              <div><span class="font-bold">Orden #{{o.ordendecompra}}</span> · Q{{o.total}} · {{o.fecha}}</div>
              <div class="flex items-center gap-2">
                <select [(ngModel)]="o.estado_envio" class="rounded border p-2 text-sm">
                  <option [ngValue]="1">1 · Orden nueva</option>
                  <option [ngValue]="2">2 · Surtiéndose</option>
                  <option [ngValue]="3">3 · Empacándose</option>
                  <option [ngValue]="4">4 · En ruta</option>
                  <option [ngValue]="5">5 · Entregada</option>
                </select>
                <button (click)="updateOrderStatus(o)" class="rounded bg-primary px-3 py-2 text-sm font-bold text-white">Guardar</button>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `
})
export class AdminComponent implements OnInit {
  api = inject(ApiService);

  tabs: Tab[] = ['productos', 'categorias', 'subcategorias', 'clientes', 'pedidos'];
  labels: Record<Tab, string> = { productos: 'Productos', categorias: 'Categorías', subcategorias: 'Subcategorías', clientes: 'Clientes', pedidos: 'Pedidos' };
  tab = signal<Tab>('productos');

  products = signal<any[]>([]);
  categories = signal<Category[]>([]);
  clientes = signal<any[]>([]);
  pedidos = signal<any[]>([]);

  editingProductId = signal<number | null>(null);
  product: any = this.blankProduct();
  newCategoryName = '';
  newSubcategory: any = { id_categoria: null, nombre_subcategoria: '' };

  ngOnInit() {
    this.api.categories().subscribe(r => this.categories.set(r.data));
    this.loadTabData('productos');
  }

  setTab(t: Tab) { this.tab.set(t); this.loadTabData(t); }

  loadTabData(t: Tab) {
    if (t === 'productos') this.api.products().subscribe(r => this.products.set(r.data));
    if (t === 'clientes') this.api.admin('clientes').subscribe(r => this.clientes.set(r.data));
    if (t === 'pedidos') this.api.orders().subscribe(r => this.pedidos.set(r.data));
  }

  subcategoriasOf(idCategoria: number | null) {
    return this.categories().find(c => c.id_categoria === idCategoria)?.subcategorias || [];
  }

  blankProduct() {
    return { nombreproducto: '', marca: '', id_categoria: null, id_subcategoria: null, precioproducto: 0, stock: 0, imagen_principal: 'https://picsum.photos/seed/motorflow-new/900/900', descripcion: '' };
  }

  editProduct(p: any) { this.editingProductId.set(p.idproducto); this.product = { ...p }; }
  cancelEditProduct() { this.editingProductId.set(null); this.product = this.blankProduct(); }

  saveProduct() {
    const id = this.editingProductId();
    const req = id ? this.api.adminUpdate('productos', id, this.product) : this.api.admin('productos', this.product);
    req.subscribe(() => { this.cancelEditProduct(); this.loadTabData('productos'); });
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
    this.api.adminDelete('categorias', id).subscribe(() => this.api.categories().subscribe(r => this.categories.set(r.data)));
  }

  createSubcategory() {
    if (!this.newSubcategory.id_categoria || !this.newSubcategory.nombre_subcategoria.trim()) return;
    this.api.admin('subcategorias', this.newSubcategory).subscribe(() => {
      this.newSubcategory = { id_categoria: null, nombre_subcategoria: '' };
      this.api.categories().subscribe(r => this.categories.set(r.data));
    });
  }

  deleteSubcategory(id: number) {
    this.api.adminDelete('subcategorias', id).subscribe(() => this.api.categories().subscribe(r => this.categories.set(r.data)));
  }

  updateOrderStatus(o: any) { this.api.adminOrderStatus(o.ordendecompra, o.estado_envio).subscribe(() => this.loadTabData('pedidos')); }
}
