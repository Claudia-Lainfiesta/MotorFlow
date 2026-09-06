import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    @if(open){
      <div class="fixed inset-0 z-40 bg-black/40" (click)="close.emit()"></div>
      <aside class="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b p-5">
          <span class="text-xl font-extrabold text-primary">Motor<span class="text-motorflow-dark">Flow</span></span>
          <button (click)="close.emit()" class="rounded-md p-1.5 hover:bg-slate-100" aria-label="Cerrar menú">
            <app-icon name="x" [size]="20"/>
          </button>
        </div>

        @if(auth.authenticated()){
          <div class="border-b p-5">
            <div class="flex items-center gap-3">
              <span class="flex h-11 w-11 items-center justify-center rounded-full bg-motorflow-pale font-bold text-primary">{{initial()}}</span>
              <div class="min-w-0">
                <p class="truncate font-bold">{{auth.user()?.cusername}}</p>
                <p class="truncate text-sm text-slate-500">{{auth.user()?.email}}</p>
              </div>
            </div>
            <button (click)="logout()" class="mt-3 flex items-center gap-2 text-sm font-bold text-red-600">
              <app-icon name="logout" [size]="16"/> Cerrar sesión
            </button>
          </div>
        }

        <nav class="p-3">
          <a href="/" (click)="goHome($event)" class="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-slate-50">
            <app-icon name="home" [size]="18"/> Inicio
          </a>
          <a href="/#catalogo" (click)="goCatalogo($event)" class="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-slate-50">
            <app-icon name="boxes" [size]="18"/> Productos
          </a>
          @if(auth.authenticated()){
            <a (click)="close.emit()" routerLink="/pedidos" routerLinkActive="bg-motorflow-pale text-primary" class="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-slate-50">
              <app-icon name="package" [size]="18"/> Mis Pedidos
            </a>
            <a (click)="close.emit()" routerLink="/direcciones" routerLinkActive="bg-motorflow-pale text-primary" class="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-slate-50">
              <app-icon name="mapPin" [size]="18"/> Mis Direcciones
            </a>
          }

          <p class="mt-5 px-3 text-xs font-bold tracking-wider text-slate-400">INFORMACIÓN</p>
          <a (click)="close.emit()" routerLink="/sobre-nosotros" routerLinkActive="bg-motorflow-pale text-primary" class="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-slate-50">
            <app-icon name="info" [size]="18"/> Sobre Nosotros
          </a>
          <a (click)="close.emit()" routerLink="/contacto" routerLinkActive="bg-motorflow-pale text-primary" class="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-slate-50">
            <app-icon name="mail" [size]="18"/> Contacto
          </a>

          <p class="mt-5 px-3 text-xs font-bold tracking-wider text-slate-400">SOPORTE</p>
          <a (click)="close.emit()" routerLink="/faq" routerLinkActive="bg-motorflow-pale text-primary" class="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-slate-50">
            <app-icon name="help" [size]="18"/> FAQ
          </a>
          <a (click)="close.emit()" routerLink="/envios" routerLinkActive="bg-motorflow-pale text-primary" class="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-slate-50">
            <app-icon name="truck" [size]="18"/> Envíos y Devoluciones
          </a>
          <a (click)="close.emit()" routerLink="/terminos" routerLinkActive="bg-motorflow-pale text-primary" class="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-slate-50">
            <app-icon name="file" [size]="18"/> Términos de Servicio
          </a>
          <a (click)="close.emit()" routerLink="/privacidad" routerLinkActive="bg-motorflow-pale text-primary" class="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-slate-50">
            <app-icon name="shield" [size]="18"/> Política de Privacidad
          </a>

          @if(auth.isAdmin()){
            <p class="mt-5 px-3 text-xs font-bold tracking-wider text-slate-400">ADMINISTRADOR</p>
            <a (click)="close.emit()" routerLink="/admin/productos" routerLinkActive="bg-motorflow-pale text-primary" class="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-slate-50">
              <app-icon name="layout" [size]="18"/> Panel principal
            </a>
            <a (click)="close.emit()" routerLink="/admin/clientes" routerLinkActive="bg-motorflow-pale text-primary" class="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-slate-50">
              <app-icon name="users" [size]="18"/> Clientes
            </a>
          }
        </nav>
      </aside>
    }
  `
})
export class SideNavComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  auth = inject(AuthService);
  private router = inject(Router);

  initial() { return (this.auth.user()?.cusername || '?').charAt(0).toUpperCase(); }
  logout() { this.auth.logout(); this.close.emit(); }

  goHome(event: Event) {
    event.preventDefault();
    this.close.emit();
    if (this.onHomePath()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigateByUrl('/').then(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }

  goCatalogo(event: Event) {
    event.preventDefault();
    this.close.emit();
    if (this.onHomePath()) {
      document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.router.navigateByUrl('/').then(() =>
        setTimeout(() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
      );
    }
  }

  private onHomePath() {
    return this.router.url.split(/[?#]/)[0] === '/';
  }
}
