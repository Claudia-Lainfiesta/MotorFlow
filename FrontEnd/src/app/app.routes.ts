import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { ProductComponent } from './pages/product.component';
import { LoginComponent } from './pages/login.component';
import { CartComponent } from './pages/cart.component';
import { CheckoutComponent } from './pages/checkout.component';
import { OrdersComponent } from './pages/orders.component';
import { DireccionesComponent } from './pages/direcciones.component';
import { StaticComponent } from './pages/static.component';
import { AdminComponent } from './pages/admin.component';
import { authGuard, adminGuard } from './guards/guards';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'producto/:id', component: ProductComponent },
  { path: 'carrito', component: CartComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'pedidos', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'direcciones', component: DireccionesComponent, canActivate: [authGuard] },
  { path: 'ofertas', component: HomeComponent },
  { path: 'admin/productos', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin/categorias', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin/clientes', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin/pedidos', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'sobre-nosotros', component: StaticComponent, data: { title: 'Sobre MotorFlow' } },
  { path: 'contacto', component: StaticComponent, data: { title: 'Contacto' } },
  { path: 'faq', component: StaticComponent, data: { title: 'Preguntas frecuentes' } },
  { path: 'envios', component: StaticComponent, data: { title: 'Envíos' } },
  { path: 'terminos', component: StaticComponent, data: { title: 'Términos de servicio' } },
  { path: 'privacidad', component: StaticComponent, data: { title: 'Política de privacidad' } },
  { path: '**', redirectTo: '' }
];
