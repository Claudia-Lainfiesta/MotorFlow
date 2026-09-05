import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Address } from '../models/api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mx-auto max-w-4xl px-6 py-12">
      <p class="font-bold text-primary">MI CUENTA</p>
      <h1 class="mt-2 text-3xl font-extrabold">Mis direcciones</h1>
      <p class="mt-2 text-slate-500">Guarda tus direcciones de envío para elegirlas rápido en el checkout.</p>

      @if(!addresses().length){
        <p class="mt-6 rounded-2xl border bg-white p-6 text-slate-500">Todavía no tienes direcciones guardadas.</p>
      }

      @for(a of addresses(); track a.id_direccion){
        <article class="mt-5 rounded-2xl border bg-white p-5">
          @if(editingId() === a.id_direccion){
            <div class="grid gap-3 sm:grid-cols-2">
              <input [(ngModel)]="editForm.dnombre" placeholder="Nombre (Casa, Oficina...)" class="rounded-xl border p-3">
              <input [(ngModel)]="editForm.telefono" placeholder="Teléfono" class="rounded-xl border p-3">
              <input [(ngModel)]="editForm.calle" placeholder="Dirección" class="rounded-xl border p-3 sm:col-span-2">
              <input [(ngModel)]="editForm.ciudad" placeholder="Ciudad" class="rounded-xl border p-3">
              <input [(ngModel)]="editForm.codigo_destino" placeholder="Código postal" class="rounded-xl border p-3">
            </div>
            <div class="mt-4 flex gap-3">
              <button (click)="save(a.id_direccion)" class="rounded-xl bg-primary px-5 py-2 font-bold text-white">Guardar cambios</button>
              <button (click)="cancelEdit()" class="rounded-xl bg-motorflow-pale px-5 py-2 font-bold text-primary">Cancelar</button>
            </div>
          } @else {
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="font-bold">{{a.dnombre}}</h2>
                  @if(a.es_predeterminada){<span class="rounded-full bg-motorflow-pale px-3 py-1 text-xs font-bold text-primary">Predeterminada</span>}
                </div>
                <p class="mt-1 text-slate-600">{{a.calle}}, {{a.ciudad}}</p>
                <p class="text-sm text-slate-500">CP {{a.codigo_destino}} @if(a.telefono){· {{a.telefono}}}</p>
              </div>
              <div class="flex shrink-0 gap-3 text-sm font-bold">
                @if(!a.es_predeterminada){
                  <button (click)="makeDefault(a)" class="text-primary">Predeterminar</button>
                }
                <button (click)="startEdit(a)" class="text-primary">Editar</button>
                <button (click)="remove(a.id_direccion)" class="text-red-600">Eliminar</button>
              </div>
            </div>
          }
        </article>
      }

      <div class="mt-8 rounded-2xl border-2 border-dashed bg-white p-6">
        <h2 class="font-bold">Agregar nueva dirección</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <input [(ngModel)]="newAddress.dnombre" placeholder="Nombre (Casa, Oficina...)" class="rounded-xl border p-3">
          <input [(ngModel)]="newAddress.telefono" placeholder="Teléfono" class="rounded-xl border p-3">
          <input [(ngModel)]="newAddress.calle" placeholder="Dirección" class="rounded-xl border p-3 sm:col-span-2">
          <input [(ngModel)]="newAddress.ciudad" placeholder="Ciudad" class="rounded-xl border p-3">
          <input [(ngModel)]="newAddress.codigo_destino" placeholder="Código postal (5 dígitos)" class="rounded-xl border p-3">
        </div>
        <label class="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" [(ngModel)]="newAddress.es_predeterminada"> Usar como dirección predeterminada
        </label>
        @if(error){<p class="mt-3 text-sm text-red-600">{{error}}</p>}
        <button (click)="create()" class="mt-4 rounded-xl bg-primary px-6 py-3 font-bold text-white">Guardar dirección</button>
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
