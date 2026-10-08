import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { IconComponent } from '../shared/icon.component';
import { Address } from '../models/api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <section class="mx-auto max-w-4xl px-6 py-12">
      <p class="font-bold text-primary">MI CUENTA</p>
      <h1 class="mt-2 text-3xl font-extrabold">Mis direcciones</h1>
      <p class="mt-2 text-slate-500">Guarda tus direcciones de envío para elegirlas rápido en el checkout.</p>

      @if(!addresses().length){
        <p class="mt-6 rounded-lg border bg-white p-6 text-slate-500">Todavía no tienes direcciones guardadas.</p>
      }

      @for(a of addresses(); track a.id_direccion){
        <article class="mt-5 rounded-lg border bg-white p-5">
          @if(editingId() === a.id_direccion){
            <div class="grid gap-3 sm:grid-cols-2">
              <input [(ngModel)]="editForm.dnombre" placeholder="Nombre (Casa, Oficina...)" class="rounded-md border p-3">
              <input [(ngModel)]="editForm.telefono" placeholder="Teléfono" class="rounded-md border p-3">
              <input [(ngModel)]="editForm.calle" placeholder="Dirección" class="rounded-md border p-3 sm:col-span-2">
              <input [(ngModel)]="editForm.ciudad" placeholder="Ciudad" class="rounded-md border p-3">
              <input [(ngModel)]="editForm.codigo_destino" placeholder="Código postal" class="rounded-md border p-3">
            </div>
            <div class="mt-4 flex gap-3">
              <button (click)="save(a.id_direccion)" class="rounded-md bg-primary px-5 py-2 font-bold text-white">Guardar cambios</button>
              <button (click)="cancelEdit()" class="rounded-md bg-motorflow-pale px-5 py-2 font-bold text-primary">Cancelar</button>
            </div>
          } @else {
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <app-icon name="mapPin" [size]="20" strokeColor="#1677d2"/>
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="font-bold">{{a.dnombre}}</h2>
                    @if(a.es_predeterminada){<span class="rounded bg-motorflow-pale px-2 py-0.5 text-xs font-bold text-primary">Predeterminada</span>}
                  </div>
                  <p class="mt-1 text-slate-600">{{a.calle}}, {{a.ciudad}}</p>
                  <p class="text-sm text-slate-500">CP {{a.codigo_destino}} @if(a.telefono){· {{a.telefono}}}</p>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-1">
                @if(!a.es_predeterminada){
                  <button (click)="makeDefault(a)" title="Marcar como predeterminada" class="rounded-md p-2 text-slate-500 hover:bg-slate-100">
                    <app-icon name="star" [size]="18"/>
                  </button>
                }
                <button (click)="startEdit(a)" title="Editar" class="rounded-md p-2 text-primary hover:bg-motorflow-pale">
                  <app-icon name="edit" [size]="18"/>
                </button>
                <button (click)="remove(a.id_direccion)" title="Eliminar" class="rounded-md p-2 text-red-600 hover:bg-red-50">
                  <app-icon name="trash" [size]="18"/>
                </button>
              </div>
            </div>
          }
        </article>
      }

      <div class="mt-8 rounded-lg border-2 border-dashed bg-white p-6">
        <h2 class="font-bold">Agregar nueva dirección</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <input [(ngModel)]="newAddress.dnombre" placeholder="Nombre (Casa, Oficina...)" class="rounded-md border p-3">
          <input [(ngModel)]="newAddress.telefono" placeholder="Teléfono" class="rounded-md border p-3">
          <input [(ngModel)]="newAddress.calle" placeholder="Dirección" class="rounded-md border p-3 sm:col-span-2">
          <input [(ngModel)]="newAddress.ciudad" placeholder="Ciudad" class="rounded-md border p-3">
          <input [(ngModel)]="newAddress.codigo_destino" placeholder="Código postal (5 dígitos)" class="rounded-md border p-3">
        </div>
        <label class="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" [(ngModel)]="newAddress.es_predeterminada"> Usar como dirección predeterminada
        </label>
        @if(error){<p class="mt-3 text-sm text-red-600">{{error}}</p>}
        <button (click)="create()" class="mt-4 rounded-md bg-primary px-6 py-3 font-bold text-white">Guardar dirección</button>
      </div>
    </section>
  `
})
export class DireccionesComponent implements OnInit {
  api = inject(ApiService);
  addresses = signal<Address[]>([]);
  editingId = signal<number | null>(null);
  error = '';

  newAddress: any = { dnombre: '', calle: '', ciudad: '', codigo_destino: '', telefono: '', es_predeterminada: false };
  editForm: any = {};

  ngOnInit() { this.load(); }

  load() { this.api.addresses().subscribe(r => this.addresses.set(r.data)); }

  create() {
    this.error = '';
    this.api.saveAddress(this.newAddress).subscribe({
      next: () => { this.newAddress = { dnombre: '', calle: '', ciudad: '', codigo_destino: '', telefono: '', es_predeterminada: false }; this.load(); },
      error: e => this.error = e.error?.message || 'No se pudo guardar la dirección (revisa el código postal).'
    });
  }

  startEdit(a: Address) { this.editingId.set(a.id_direccion); this.editForm = { ...a }; }
  cancelEdit() { this.editingId.set(null); }

  save(id: number) {
    this.api.updateAddress(id, this.editForm).subscribe({
      next: () => { this.editingId.set(null); this.load(); },
      error: e => this.error = e.error?.message || 'No se pudo actualizar la dirección.'
    });
  }

  makeDefault(a: Address) { this.api.updateAddress(a.id_direccion, { ...a, es_predeterminada: true }).subscribe(() => this.load()); }

  remove(id: number) { this.api.deleteAddress(id).subscribe(() => this.load()); }
}
