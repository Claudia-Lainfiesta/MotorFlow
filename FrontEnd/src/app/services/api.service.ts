import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ApiResponse, Category, Product, CartItem } from '../models/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private h = inject(HttpClient);
  private u = environment.apiUrl;

  // Catálogo público
  products(params: any = {}) { return this.h.get<ApiResponse<Product[]>>(`${this.u}/productos`, { params }); }
  product(id: string) { return this.h.get<ApiResponse<Product>>(`${this.u}/productos/${id}`); }
  categories() { return this.h.get<ApiResponse<Category[]>>(`${this.u}/categorias`); }

  // Carrito
  cart() { return this.h.get<ApiResponse<CartItem[]>>(`${this.u}/carrito`); }
  putCart(idproducto: number, cantidad: number) { return this.h.put<ApiResponse<void>>(`${this.u}/carrito`, { idproducto, cantidad }); }
  removeCart(id: number) { return this.h.delete<ApiResponse<void>>(`${this.u}/carrito/${id}`); }

  // Direcciones del cliente (CRUD completo)
  addresses() { return this.h.get<ApiResponse<any[]>>(`${this.u}/direcciones`); }
  saveAddress(b: any) { return this.h.post<ApiResponse<any>>(`${this.u}/direcciones`, b); }
  updateAddress(id: number, b: any) { return this.h.put<ApiResponse<any>>(`${this.u}/direcciones/${id}`, b); }
  deleteAddress(id: number) { return this.h.delete<ApiResponse<void>>(`${this.u}/direcciones/${id}`); }

  // Checkout / couriers
  quotes(destino: string) { return this.h.get<ApiResponse<any[]>>(`${this.u}/couriers/cotizaciones`, { params: { destino } }); }
  checkout(b: any) { return this.h.post<ApiResponse<any>>(`${this.u}/checkout`, b); }

  // Pedidos del cliente
  orders() { return this.h.get<ApiResponse<any[]>>(`${this.u}/pedidos`); }
  track(id: number) { return this.h.get<ApiResponse<any>>(`${this.u}/pedidos/${id}/estatus`); }

  // Admin — lectura y creación genérica (se mantiene por compatibilidad)
  admin(path: string, body?: any) {
    return body === undefined
      ? this.h.get<any>(`${this.u}/admin/${path}`)
      : this.h.post<any>(`${this.u}/admin/${path}`, body);
  }

  // Admin — edición y borrado (CRUD completo: productos, categorías, subcategorías)
  adminUpdate(path: string, id: number | string, body: any) { return this.h.put<any>(`${this.u}/admin/${path}/${id}`, body); }
  adminDelete(path: string, id: number | string) { return this.h.delete<any>(`${this.u}/admin/${path}/${id}`); }
  adminOrderStatus(id: number | string, estado_envio: number) { return this.h.patch<any>(`${this.u}/admin/pedidos/${id}/estado`, { estado_envio }); }
}
