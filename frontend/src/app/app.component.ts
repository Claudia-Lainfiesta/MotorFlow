import { Component, effect, inject, signal, afterNextRender, Injector } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { ToastService } from './services/toast.service';
import { SearchService } from './services/search.service';
import { IconComponent } from './shared/icon.component';
import { SideNavComponent } from './shared/side-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, IconComponent, SideNavComponent],
  template: `
    <header class="sticky top-0 z-30 border-b-2 bg-white/95 backdrop-blur">
      <nav class="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3.5">
        
        <!-- LADO IZQUIERDO: Menú, Logo y Links -->
        <button (click)="drawerOpen.set(true)" class="rounded-md p-2 hover:bg-slate-100" aria-label="Abrir menú">
          <app-icon name="menu" [size]="22"/>
        </button>
        
        <a href="/" (click)="goHome($event)" class="flex shrink-0 items-center gap-2 text-xl font-extrabold text-primary">
          <img src="assets/favicon.svg" alt="MotorFlow" class="h-7 w-auto object-contain" />
          <span>Motor<span class="text-motorflow-dark">Flow</span></span>
        </a>

        <div class="hidden items-center gap-5 text-sm font-semibold text-slate-600 md:flex">
          <a href="/" (click)="goHome($event)" class="hover:text-primary">Inicio</a>
          <a href="/" (click)="goCatalogo($event)" class="hover:text-primary">Productos</a>
        </div>

        <!-- CENTRO: Buscador expandido en el medio -->
        <div class="relative hidden flex-1 max-w-md mx-4 sm:block ml-20">
          <div class="absolute inset-y-0 left-2.5 flex items-center text-black">
            <app-icon name="search" [size]="15"/>
          </div>
          <button
            (click)="goCatalogoBuscar($event)"
            class="w-full rounded-md border border-slate-400 bg-slate-100 py-2 pl-8 pr-3 text-left text-sm font-semibold text-black">
            {{ 'Buscar' }}
          </button>
        </div>

        <!-- LADO DERECHO: Carrito y Perfil (ml-auto para pegarlo a la derecha) -->
        <div class="ml-auto flex items-center gap-3">
          <a routerLink="/carrito" class="relative rounded-md p-2 hover:bg-slate-100" aria-label="Carrito">
            <app-icon name="cart" [size]="22"/>
            @if(cart.count() > 0){
              <span class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white">{{cart.count()}}</span>
            }
          </a>

          @if(auth.authenticated()){
            <button (click)="drawerOpen.set(true)" class="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-motorflow-pale to-sky-300 font-bold text-black" aria-label="Mi cuenta">
              {{initial()}}
            </button>
          } @else {
            <a routerLink="/login" class="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white">Ingresar</a>
          }
        </div>

      </nav>
    </header>

    <app-side-nav [open]="drawerOpen()" (close)="drawerOpen.set(false)"/>

    <main class="min-h-[70vh]"><router-outlet/></main>

    <footer class="mt-12 bg-sky-600 px-6 pt-12 pb-8 text-sm text-white font-bold">
      <div class="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
        <div>
          <div class="flex items-center gap-2.5">
            <img src="assets/favicon.svg" alt="MotorFlow" class="h-7 w-auto object-contain" />
            <span class="text-xl font-extrabold text-white">MotorFlow</span>
          </div>
          <p class="mt-4 max-w-xs text-sky-100">Lubricantes y repuestos para seguir avanzando. Cuidamos tu motor con productos de calidad y asesoría clara.</p>
        </div>

        <div>
          <p class="mb-4 font-bold text-white">Enlaces Rápidos</p>
          <div class="flex flex-col gap-2.5">
            <a href="/" (click)="goHome($event)" class="hover:text-white transition-colors">Inicio</a>
            <a href="/#catalogo" (click)="goCatalogo($event)" class="hover:text-white transition-colors">Productos</a>
            <a routerLink="/sobre-nosotros" class="hover:text-white transition-colors">Sobre Nosotros</a>
            <a routerLink="/contacto" class="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>

        <div>
          <p class="mb-4 font-bold text-white">Soporte</p>
          <div class="flex flex-col gap-2.5">
            <a routerLink="/faq" class="hover:text-white transition-colors">FAQ</a>
            <a routerLink="/envios" class="hover:text-white transition-colors">Envíos y Devoluciones</a>
            <a routerLink="/terminos" class="hover:text-white transition-colors">Términos de Servicio</a>
            <a routerLink="/privacidad" class="hover:text-white transition-colors">Política de Privacidad</a>
          </div>
        </div>
      </div>

      <div class="mx-auto mt-10 max-w-7xl border-t border-white/20 pt-6">
        <p class="text-sky-100/80">© {{year}} MotorFlow. Todos los derechos reservados.</p>
      </div>
    </footer>

    @if(toast.message()){
      <div class="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-md bg-motorflow-dark px-5 py-3 text-sm font-semibold text-white shadow-xl">
        <div class="flex items-center gap-2">
          <app-icon name="check" [size]="16" strokeColor="#7dd3fc"/> {{toast.message()}}
        </div>
      </div>
    }
  `
})
export class AppComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  toast = inject(ToastService);
  search = inject(SearchService);
  router = inject(Router);
  injector = inject(Injector);
  
  drawerOpen = signal(false);
  year = new Date().getFullYear();

  constructor() {
    effect(() => { this.auth.user(); this.cart.refresh(); });
  }

  initial() { return (this.auth.user()?.cusername || '?').charAt(0).toUpperCase(); }

  /** Navega a "/" y siempre deja el scroll arriba del todo. */
  goHome(event?: Event) {
    event?.preventDefault();
    this.ejecutarNavegacionOAccion(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /** Navega al catálogo y realiza scroll */
  goCatalogo(event?: Event) {
    event?.preventDefault();
    this.drawerOpen.set(false);
    if (this.onHomePath()) {
      this.scrollToCatalogo();
    } else {
      this.router.navigateByUrl('/').then(() => 
        setTimeout(() => this.scrollToCatalogo(), 60)
      );
    }
  }

  /** Navega al catálogo, realiza scroll y enfoca el input de búsqueda */
  goCatalogoBuscar(event?: Event) {
    event?.preventDefault();
    this.drawerOpen.set(false);
    if (this.onHomePath()) {
      this.scrollToCatalogoBuscar();
    } else {
      this.router.navigateByUrl('/').then(() => 
        setTimeout(() => this.scrollToCatalogoBuscar(), 60)
      );
    }
  }

  // Helper centralizado que reemplaza los setTimeout por afterNextRender
  private ejecutarNavegacionOAccion(accion: () => void) {
    this.drawerOpen.set(false);

    if (this.onHomePath()) {
      accion();
    } else {
      this.router.navigateByUrl('/').then(() => {
        afterNextRender(() => accion(), { injector: this.injector });
      });
    }
  }

  private onHomePath(): boolean {
    return this.router.url.split(/[?#]/)[0] === '/';
  }

  private scrollToCatalogo() {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private scrollToCatalogoBuscar() {
    this.scrollToCatalogo();
    const input = document.querySelector('#catalogo input') as HTMLInputElement;
    input?.focus();
  }
}