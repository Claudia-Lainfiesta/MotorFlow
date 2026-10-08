import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { ProductComponent } from './pages/product.component';
import { LoginComponent } from './pages/login.component';
import { CartComponent } from './pages/cart.component';
import { CheckoutComponent } from './pages/checkout.component';
import { OrdersComponent } from './pages/orders.component';
import { DireccionesComponent } from './pages/direcciones.component';
import { StaticComponent } from './pages/static.component';
import { FaqComponent } from './pages/faq.component';
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
  { path: 'admin/productos', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin/categorias', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin/subcategorias', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin/clientes', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin/pedidos', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'faq', component: FaqComponent },
  {
    path: 'sobre-nosotros', component: StaticComponent, data: {
      title: 'Sobre MotorFlow',
      sections: [
        { body: 'MotorFlow nació de la necesidad de encontrar repuestos y lubricantes confiables sin perder horas comparando precios en distintos talleres. Somos una aceitera guatemalteca enfocada en vehículos ligeros, motocicletas y maquinaria pesada, con un catálogo curado de marcas reconocidas en aceites, filtros, refrigerantes y repuestos.' },
        { heading: 'Nuestra misión', body: 'Poner a un clic de distancia el mantenimiento preventivo de tu vehículo, con información clara de compatibilidad y precios justos, para que nunca postergues un cambio de aceite por no saber qué comprar.' },
        { heading: 'Cobertura', body: 'Trabajamos con distintos couriers a nivel nacional, cada uno con su propia cobertura y tarifa, para que elijas la opción de envío que mejor se ajuste a tu ubicación y presupuesto.' },
      ]
    }
  },
  {
    path: 'contacto', component: StaticComponent, data: {
      title: 'Contacto',
      sections: [
        { body: '¿Tienes dudas sobre un producto, tu pedido o una devolución? Escríbenos y te respondemos a la brevedad.' },
        { heading: 'Correo electrónico', body: 'soporte@motorflow.gt' },
        { heading: 'Teléfono / WhatsApp', body: '+502 4000-1234\nLunes a viernes de 8:00 a 18:00, sábados de 8:00 a 13:00' },
        { heading: 'Oficina central', body: 'Km 12.5 Carretera a El Salvador, Santa Catarina Pinula, Guatemala' },
      ]
    }
  },
  {
    path: 'envios', component: StaticComponent, data: {
      title: 'Envíos y devoluciones',
      sections: [
        { heading: 'Tiempos de entrega', body: 'El tiempo estimado depende del courier y destino elegidos en el checkout. Cada courier calcula su propia cobertura y costo antes de confirmar la compra.' },
        { heading: 'Rastreo de tu pedido', body: 'Desde "Mis Pedidos" puedes consultar en cualquier momento el estatus real de tu envío, reportado directamente por el courier a cargo.' },
        { heading: 'Política de devoluciones', body: 'Aceptamos devoluciones dentro de los 15 días posteriores a la entrega, siempre que el producto no haya sido usado y conserve su empaque original. Contáctanos antes de enviar cualquier devolución.' },
        { heading: 'Productos dañados', body: 'Si tu pedido llega dañado o incompleto, contáctanos dentro de las 48 horas posteriores a la entrega con fotos del producto y el empaque para gestionar el reemplazo.' },
      ]
    }
  },
  {
    path: 'terminos', component: StaticComponent, data: {
      title: 'Términos de servicio',
      sections: [
        { body: 'Al usar MotorFlow aceptas estos términos. Te recomendamos leerlos antes de realizar una compra.' },
        { heading: 'Cuentas de usuario', body: 'Eres responsable de la confidencialidad de tu contraseña y de toda actividad realizada desde tu cuenta.' },
        { heading: 'Precios y disponibilidad', body: 'Los precios pueden cambiar sin previo aviso. La disponibilidad de stock se confirma al momento de agregar el producto al carrito y nuevamente al finalizar la compra.' },
        { heading: 'Pagos', body: 'Los pagos se procesan mediante el emisor de tarjeta correspondiente (Visa, Mastercard o Credomatic). Una compra solo se confirma cuando el emisor autoriza el cargo.' },
        { heading: 'Envíos', body: 'MotorFlow contrata el envío con couriers externos. El estatus y tiempo de entrega dependen directamente del courier seleccionado.' },
      ]
    }
  },
  {
    path: 'privacidad', component: StaticComponent, data: {
      title: 'Política de privacidad',
      sections: [
        { body: 'En MotorFlow protegemos tu información personal y solo la usamos para procesar tus pedidos y mejorar tu experiencia de compra.' },
        { heading: 'Qué información recopilamos', body: 'Usuario, correo electrónico, direcciones de envío y el historial de pedidos asociado a tu cuenta.' },
        { heading: 'Cómo la usamos', body: 'Para procesar tus compras, coordinar el envío con el courier elegido y comunicarnos contigo sobre el estatus de tu pedido.' },
        { heading: 'Con quién la compartimos', body: 'Compartimos únicamente los datos de envío estrictamente necesarios (destinatario, dirección y destino) con el courier que selecciones, y los datos de pago con el emisor de tarjeta correspondiente para autorizar el cargo.' },
        { heading: 'Tus derechos', body: 'Puedes actualizar o eliminar tus direcciones guardadas en cualquier momento desde "Mis Direcciones", o contactarnos para solicitar la eliminación de tu cuenta.' },
      ]
    }
  },
  { path: '**', redirectTo: '' }
];
