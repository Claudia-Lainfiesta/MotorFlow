import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mx-auto my-12 max-w-md rounded-lg border bg-white p-8 shadow-sm">
      <p class="font-bold text-primary">MOTORFLOW</p>
      <h1 class="mt-2 text-3xl font-extrabold">{{registering ? 'Crear cuenta' : 'Bienvenido'}}</h1>

      <div class="mt-6 flex gap-2 rounded-md bg-slate-100 p-1">
        <button (click)="registering=false" class="flex-1 rounded-md p-2 text-sm font-bold" [class.bg-white]="!registering" [class.shadow]="!registering">Ingresar</button>
        <button (click)="registering=true" class="flex-1 rounded-md p-2 text-sm font-bold" [class.bg-white]="registering" [class.shadow]="registering">Registro</button>
      </div>

      <form (ngSubmit)="submit()" class="mt-6 space-y-4">
        @if(registering){<input [(ngModel)]="email" name="email" class="w-full rounded-md border p-3" placeholder="Correo electrónico">}
        <input [(ngModel)]="cusername" name="user" class="w-full rounded-md border p-3" placeholder="Usuario">
        <input [(ngModel)]="password" type="password" name="password" class="w-full rounded-md border p-3" placeholder="Contraseña">
        @if(error){<p class="text-sm text-red-600">{{error}}</p>}
        <button class="w-full rounded-md bg-primary p-3 font-bold text-white">{{registering ? 'Crear cuenta' : 'Iniciar sesión'}}</button>
      </form>

      @if(registering){<p class="mt-4 text-xs text-slate-500">Mínimo 5 caracteres, una mayúscula, una minúscula y un número.</p>}
    </section>
  `
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  registering = false;
  cusername = '';
  email = '';
  password = '';
  error = '';

  async submit() {
    try {
      this.registering ? await this.auth.register(this.cusername, this.email, this.password) : await this.auth.login(this.cusername, this.password);
      await this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') || '/');
    } catch (e: any) {
      this.error = e.error?.message || 'No fue posible autenticar';
    }
  }
}
