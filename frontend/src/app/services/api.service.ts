import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ApiResponse, Category, Product, CartItem } from '../models/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private h = inject(HttpClient);
  private u = environment.apiUrl;

  products(params: any = {}) { return this.h.get<ApiResponse<Product[]>>(`${this.u}/productos`, { params }); }
  product(id: string) { return this.h.get<ApiResponse<Product>>(`${this.u}/productos/${id}`); }
  categories() { return this.h.get<ApiResponse<Category[]>>(`${this.u}/categorias`); }
  brands() { return this.h.get<ApiResponse<string[]>>(`${this.u}/marcas`); }

  cart() { return this.h.get<ApiResponse<CartItem[]>>(`${this.u}/carrito`); }
  putCart(idproducto: number, cantidad: number) { return this.h.put<ApiResponse<void>>(`${this.u}/carrito`, { idproducto, cantidad }); }
  removeCart(id: number) { return this.h.delete<ApiResponse<void>>(`${this.u}/carrito/${id}`); }

  addresses() { return this.h.get<ApiResponse<any[]>>(`${this.u}/direcciones`); }
  saveAddress(b: any) { return this.h.post<ApiResponse<any>>(`${this.u}/direcciones`, b); }
  updateAddress(id: number, b: any) { return this.h.put<ApiResponse<any>>(`${this.u}/direcciones/${id}`, b); }
  deleteAddress(id: number) { return this.h.delete<ApiResponse<void>>(`${this.u}/direcciones/${id}`); }

  quotes(destino: string, formato: 'json' | 'xml' = 'json') { return this.h.get<ApiResponse<any[]>>(`${this.u}/couriers/cotizaciones`, { params: { destino, formato } }); }
  checkout(b: any) { return this.h.post<ApiResponse<any>>(`${this.u}/checkout`, b); }

  orders() { return this.h.get<ApiResponse<any[]>>(`${this.u}/pedidos`); }
  track(id: number, formato: 'json' | 'xml' = 'json') { return this.h.get<ApiResponse<any>>(`${this.u}/pedidos/${id}/estatus`, { params: { formato } }); }

  admin(path: string, body?: any) {
    return body === undefined
      ? this.h.get<any>(`${this.u}/admin/${path}`)
      : this.h.post<any>(`${this.u}/admin/${path}`, body);
  }

  adminUpdate(path: string, id: number | string, body: any) { return this.h.put<any>(`${this.u}/admin/${path}/${id}`, body); }
  adminDelete(path: string, id: number | string) { return this.h.delete<any>(`${this.u}/admin/${path}/${id}`); }
  uploadImage(file: File) {
    const fd = new FormData();
    fd.append('imagen', file);
    return this.h.post<ApiResponse<{ url: string }>>(`${this.u}/admin/upload`, fd);
  }
  fileUrl(path: string) { return path?.startsWith('http') ? path : `${this.origin()}${path}`; }
  private origin() { return this.u.replace(/\/api\/?$/, ''); }
}