import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon.component';

@Component({
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <section class="mx-auto max-w-3xl px-6 py-14">
      <p class="font-bold text-primary">MOTORFLOW</p>
      <h1 class="mt-2 text-4xl font-extrabold">Preguntas frecuentes</h1>
      <p class="mt-4 text-slate-600">Resolvemos las dudas más comunes sobre compras, envíos y compatibilidad de productos.</p>

      <div class="mt-8 divide-y rounded-lg border bg-white">
        @for(item of faqs; track item.q; let i = $index){
          <div>
            <button (click)="toggle(i)" class="flex w-full items-center justify-between p-5 text-left font-bold">
              {{item.q}}
              <app-icon [name]="open()===i ? 'minus' : 'plus'" [size]="18"/>
            </button>
            @if(open()===i){<p class="px-5 pb-5 text-slate-600">{{item.a}}</p>}
          </div>
        }
      </div>
    </section>
  `
})
export class FaqComponent {
  open = signal<number | null>(0);
  toggle(i: number) { this.open.set(this.open() === i ? null : i); }

  faqs = [
    { q: '¿Cuánto tarda en llegar mi pedido?', a: 'El tiempo de entrega depende del courier y destino que elijas en el checkout. Cada courier te muestra su cobertura y costo antes de confirmar la compra, y puedes rastrear el estatus real desde "Mis Pedidos" en cualquier momento.' },
    { q: '¿Cómo sé si un producto es compatible con mi vehículo?', a: 'Cada producto incluye una sección de "Especificaciones" en su página de detalle con la información de compatibilidad, viscosidad y otros datos técnicos proporcionados por el fabricante. Si tienes dudas, contáctanos antes de comprar.' },
    { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjetas Visa, Mastercard y Credomatic. El sistema detecta automáticamente el emisor según el número de tarjeta al momento de pagar.' },
    { q: '¿Puedo devolver un producto?', a: 'Sí, dentro de los primeros 15 días posteriores a la entrega si el producto no ha sido usado y conserva su empaque original. Revisa la sección de Envíos y Devoluciones para más detalles.' },
    { q: '¿Necesito una cuenta para comprar?', a: 'Puedes navegar el catálogo completo sin cuenta. Solo necesitas iniciar sesión al momento de agregar un producto al carrito o finalizar una compra.' },
    { q: '¿Los productos tienen garantía?', a: 'Sí, la mayoría de nuestros productos cuentan con garantía de fabricante. El detalle de cobertura y duración se especifica en la ficha de cada producto.' },
  ];
}
