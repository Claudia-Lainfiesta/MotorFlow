import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { IconComponent } from '../shared/icon.component';

const STEPS = [
  { key: 'nueva', label: 'Orden nueva', icon: 'package', match: ['NUEVA'] },
  { key: 'surtiendo', label: 'Surtiéndose', icon: 'clock', match: ['SURTI'] },
  { key: 'empacando', label: 'Empacándose', icon: 'boxes', match: ['EMPAC'] },
  { key: 'ruta', label: 'En ruta', icon: 'truck', match: ['RUTA'] },
  { key: 'entregada', label: 'Entregada', icon: 'check', match: ['ENTREG'] },
];

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <section class="mx-auto max-w-5xl px-6 py-12">
      <h1 class="text-3xl font-extrabold">Mis pedidos</h1>

      @if(!orders().length){
        <div class="mt-10 flex flex-col items-center rounded-lg border bg-white py-16 text-center">
          <span class="flex h-24 w-24 items-center justify-center rounded-full bg-motorflow-pale">
            <app-icon name="package" [size]="40" strokeColor="#1677d2"/>
          </span>
          <h2 class="mt-6 text-xl font-extrabold">Todavía no tienes pedidos</h2>
          <a routerLink="/" fragment="catalogo" class="mt-6 rounded-md bg-primary px-6 py-3 font-bold text-white">Explorar productos</a>
        </div>
      }

      @for(o of orders(); track o.ordendecompra){
        <article class="mt-5 rounded-lg border bg-white p-5">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 class="flex items-center gap-2 font-bold"><app-icon name="package" [size]="18" strokeColor="#1677d2"/> Orden #{{o.ordendecompra}}</h2>
              <p class="text-sm text-slate-500">{{o.fecha | date:'medium'}} · Enviado por {{o.courier}}</p>
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
              <button (click)="track(o.ordendecompra)" class="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-bold text-primary">
                <app-icon name="truck" [size]="16"/> Consultar estatus de envío
              </button>
            } @else if(tracking[o.ordendecompra] === 'loading') {
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
          </div>
        </article>
      }
    </section>
  `
})
export class OrdersComponent implements OnInit {
  api = inject(ApiService);
  orders = signal<any[]>([]);
  tracking: Record<number, string> = {};
  steps = STEPS;

  ngOnInit() { this.api.orders().subscribe(r => this.orders.set(r.data)); }

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
