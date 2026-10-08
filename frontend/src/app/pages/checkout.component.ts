import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { CartItem } from '../models/api';

type CardBrand = 'visa' | 'mastercard' | 'credomatic';
type Formato = 'json' | 'xml';

const CARD_LOGOS: Record<CardBrand, string> = {
  visa: 'https://commons.wikimedia.org/wiki/Special:FilePath/Visa%20Brandmark%202021.svg',
  mastercard: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mastercard-logo.svg',
  credomatic: 'https://commons.wikimedia.org/wiki/Special:FilePath/BAC%20Credomatic%20logo.svg',
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mx-auto max-w-3xl px-6 py-12">
      <p class="font-bold text-primary">CHECKOUT · PASO {{step()}} DE 2</p>
      <h1 class="mt-2 text-3xl font-extrabold">{{step()===1?'Entrega y courier':'Pago con tarjeta'}}</h1>

      @if(step()===1){
        <div class="mt-6 rounded-lg border bg-white p-6">
          <h2 class="font-bold">Dirección</h2>
          <select [(ngModel)]="addressId" (ngModelChange)="quote()" class="mt-3 w-full rounded-md border p-3">
            <option [ngValue]="undefined">Selecciona una dirección</option>
            @for(a of addresses(); track a.id_direccion){<option [ngValue]="a.id_direccion">{{a.dnombre}} · {{a.calle}} ({{a.codigo_destino}})</option>}
          </select>

          <h3 class="mt-6 font-bold">¿No tienes una? Crea una ahora</h3>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <input [(ngModel)]="newAddress.dnombre" placeholder="Nombre (Casa)" class="rounded-md border p-3">
            <input [(ngModel)]="newAddress.telefono" placeholder="Teléfono" class="rounded-md border p-3">
            <input [(ngModel)]="newAddress.calle" placeholder="Dirección" class="rounded-md border p-3">
            <input [(ngModel)]="newAddress.ciudad" placeholder="Ciudad" class="rounded-md border p-3">
            <input [(ngModel)]="newAddress.codigo_destino" placeholder="Código postal" class="rounded-md border p-3">
            <button (click)="saveAddress()" class="rounded-md bg-motorflow-pale p-3 font-bold text-primary">Guardar dirección</button>
          </div>
        </div>

        <div class="mt-6 rounded-lg border bg-white p-6">
          <h2 class="font-bold">Formato de intercambio</h2>
          <p class="mt-1 text-sm text-slate-500">Formato en que MotorFlow se comunica con los couriers y con el emisor de la tarjeta.</p>
          <div class="mt-3 grid grid-cols-2 gap-3">
            @for(f of formatos; track f.value){
              <button type="button" (click)="setFormato(f.value)"
                      [class.border-primary]="formato===f.value" [class.bg-motorflow-pale]="formato===f.value" [class.text-primary]="formato===f.value"
                      class="rounded-md border p-3 text-left">
                <span class="block font-extrabold">{{f.label}}</span>
                <span class="block text-xs font-normal text-slate-500">{{f.hint}}</span>
              </button>
            }
          </div>
        </div>

        @if(quotes().length){
          <div class="mt-6 rounded-lg border bg-white p-6">
            <h2 class="font-bold">Elige courier</h2>
            @for(q of quotes(); track q.id_courier){
              <label class="mt-3 flex cursor-pointer justify-between rounded-md border p-4">
                <span><input type="radio" [(ngModel)]="courier" [value]="q.id_courier" name="courier"> {{q.nombre}}</span>
                <span>{{q.cobertura==='TRUE' ? 'Q'+q.costo : 'Sin cobertura'}}</span>
              </label>
            }
            <button (click)="step.set(2)" [disabled]="!courier" class="mt-6 rounded-md bg-primary px-6 py-3 font-bold text-white disabled:bg-slate-300">Continuar al pago</button>
          </div>
        }
        @if(error){<p class="mt-4 text-sm text-red-600">{{error}}</p>}
      } @else {
        <!-- Resumen del pedido -->
        <div class="mt-6 rounded-lg border bg-white p-6">
          <h2 class="font-bold">Resumen de tu pedido</h2>
          @if(selectedAddress(); as a){
            <div class="mt-3 flex justify-between border-b pb-3 text-sm">
              <span class="text-slate-500">Enviar a</span>
              <span class="text-right font-semibold">{{a.dnombre}} · {{a.calle}}, {{a.ciudad}} (CP {{a.codigo_destino}})</span>
            </div>
          }
          @if(selectedQuote(); as q){
            <div class="mt-3 flex justify-between border-b pb-3 text-sm">
              <span class="text-slate-500">Courier</span>
              <span class="font-semibold">{{q.nombre}} · Q{{q.costo}}</span>
            </div>
          }
          <div class="mt-3 flex justify-between border-b pb-3 text-sm">
            <span class="text-slate-500">Formato de intercambio</span>
            <span class="font-semibold">{{formato.toUpperCase()}}</span>
          </div>
          <div class="mt-3 flex justify-between text-sm">
            <span class="text-slate-500">Subtotal de productos</span>
            <span class="font-semibold">Q{{subtotal().toFixed(2)}}</span>
          </div>
          <div class="mt-3 flex justify-between text-lg font-extrabold">
            <span>Total a pagar</span>
            <span>Q{{grandTotal()}}</span>
          </div>
        </div>

        <div class="mt-6 rounded-lg border bg-white p-6">

          <div class="mt-4">
            <label class="text-sm font-semibold">Número de tarjeta</label>
            <div class="mt-1 flex items-center gap-3">
              <input [ngModel]="payment.tarjeta" (ngModelChange)="onCardNumber($event)" inputmode="numeric" maxlength="16"
                     placeholder="16 dígitos, sin espacios" class="flex-1 rounded-md border p-3">
              <div class="flex h-9 w-16 shrink-0 items-center justify-center rounded border bg-slate-50">
                @if(cardBrand(); as b){
                  <img [src]="cardLogos[b]" class="h-6 w-14 object-contain" alt="">
                } @else {
                  <span class="text-xs text-slate-300">···</span>
                }
              </div>
            </div>
            @if(payment.tarjeta && !cardBrand()){
              <p class="mt-1 text-xs text-red-600">Número de tarjeta no reconocido — debe iniciar con 4 (Visa), 5 (Mastercard) o 2 (Credomatic).</p>
            }
          </div>

          <div class="mt-4 grid gap-3">
            <input [(ngModel)]="payment.nombre" placeholder="Nombre del titular" class="rounded-md border p-3">
            
            <!-- Fila con Mes, Año y CVV en la misma línea -->
            <div class="grid grid-cols-3 gap-3">
              <select [(ngModel)]="expMonth" class="rounded-md border p-3 text-sm">
                <option value="" disabled selected>Mes</option>
                @for(m of months; track m){<option [value]="m">{{m}}</option>}
              </select>

              <select [(ngModel)]="expYear" class="rounded-md border p-3 text-sm">
                <option value="" disabled selected>Año</option>
                @for(y of years; track y){<option [value]="y">{{y}}</option>}
              </select>

              <input [(ngModel)]="payment.num_seguridad" placeholder="CVV" maxlength="4" inputmode="numeric" class="rounded-md border p-3 text-sm">
            </div>
          </div>

          @if(error){<p class="mt-4 text-sm text-red-600">{{error}}</p>}
          <button (click)="pay()" [disabled]="paying || !cardBrand()" class="mt-5 w-full rounded-md bg-primary px-6 py-3 font-bold text-white disabled:bg-slate-300">
            {{paying ? 'Procesando...' : 'Autorizar y crear orden'}}
          </button>
        </div>
      }
    </section>
  `
})
export class CheckoutComponent implements OnInit {
  api = inject(ApiService);
  cartService = inject(CartService);
  router = inject(Router);

  step = signal(1);
  addresses = signal<any[]>([]);
  quotes = signal<any[]>([]);
  cart = signal<CartItem[]>([]);
  addressId?: number;
  courier = '';
  error = '';
  paying = false;
  cardLogos = CARD_LOGOS;

  formato: Formato = 'json';
  formatos: { value: Formato; label: string; hint: string }[] = [
    { value: 'json', label: 'JSON', hint: 'Formato por defecto' },
    { value: 'xml', label: 'XML', hint: 'Mensajes en XML' },
  ];

  newAddress: any = { dnombre: '', calle: '', ciudad: '', codigo_destino: '', telefono: '', es_predeterminada: true };
  payment: any = { tarjeta: '', nombre: '', num_seguridad: '' };

  months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  years = Array.from({ length: 9 }, (_, i) => String(new Date().getFullYear() + i));
  expMonth = '';
  expYear = '';

  ngOnInit() {
    this.api.cart().subscribe(r => this.cart.set(r.data));
    this.api.addresses().subscribe(r => {
      this.addresses.set(r.data);
      this.addressId = r.data.find((a: any) => a.es_predeterminada)?.id_direccion ?? r.data[0]?.id_direccion;
      this.quote();
    });
  }

  selectedAddress() { return this.addresses().find(a => a.id_direccion === this.addressId); }
  selectedQuote() { return this.quotes().find(q => q.id_courier === this.courier); }
  subtotal() { return this.cart().reduce((n, i) => n + i.precioproducto * i.cantidad, 0); }
  grandTotal() { return (this.subtotal() + Number(this.selectedQuote()?.costo || 0)).toFixed(2); }

  onCardNumber(value: string) { this.payment.tarjeta = (value || '').replace(/\D/g, '').slice(0, 16); }

  cardBrand(): CardBrand | null {
    const first = (this.payment.tarjeta || '')[0];
    if (first === '4') return 'visa';
    if (first === '5') return 'mastercard';
    if (first === '2') return 'credomatic';
    return null;
  }

  setFormato(f: Formato) {
    if (this.formato === f) return;
    this.formato = f;
    this.quote(); // las cotizaciones se piden en el formato elegido
  }

  quote() {
    this.error = '';
    const a = this.addresses().find(x => x.id_direccion === this.addressId);
    if (a) this.api.quotes(a.codigo_destino, this.formato).subscribe({ next: r => this.quotes.set(r.data), error: () => this.error = 'No se pudo consultar a los couriers.' });
  }

  saveAddress() {
    this.api.saveAddress(this.newAddress).subscribe({
      next: r => { this.addresses.update(a => [r.data, ...a]); this.addressId = r.data.id_direccion; this.quote(); },
      error: e => this.error = e.error?.message
    });
  }

  pay() {
    this.error = '';
    if (!this.expMonth || !this.expYear) { this.error = 'Selecciona el mes y año de vencimiento.'; return; }
    this.paying = true;
    const fecha_venc = `${this.expYear}${this.expMonth}`;
    this.api.checkout({ id_direccion: this.addressId, id_courier: this.courier, ...this.payment, fecha_venc, formato: this.formato }).subscribe({
      next: r => { this.cartService.refresh(); this.router.navigate(['/pedidos'], { queryParams: { created: r.data.orden } }); },
      error: e => { this.paying = false; this.error = e.error?.message || 'No se pudo procesar el pago'; }
    });
  }
}