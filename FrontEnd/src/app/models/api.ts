export interface Product {
  idproducto: number;
  nombreproducto: string;
  marca: string;
  descripcion: string;
  imagen_principal: string;
  precioproducto: number;
  stock: number;
  id_categoria: number;
  nombre_categoria: string;
  id_subcategoria?: number;
  nombre_subcategoria?: string;
  imagenes?: { url_imagen: string }[];
  especificaciones?: { etiqueta: string; valor: string }[];
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  token?: string;
}

export interface Subcategory {
  id_subcategoria: number;
  nombre_subcategoria: string;
}

export interface Category {
  id_categoria: number;
  nombre_categoria: string;
  subcategorias: Subcategory[];
}

export interface CartItem {
  idproducto: number;
  cantidad: number;
  nombreproducto: string;
  precioproducto: number;
  stock: number;
  imagen_principal: string;
}

export interface Address {
  id_direccion: number;
  dnombre: string;
  calle: string;
  ciudad: string;
  codigo_destino: string;
  telefono?: string;
  es_predeterminada: boolean;
}
