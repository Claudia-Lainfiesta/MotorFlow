import { Injectable, signal, computed, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
interface User {
  cusername: string;
  email: string;
  isAdmin: boolean;
}
@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private key = "motorflow_session";
  user = signal<User | null>(this.read());
  authenticated = computed(() => !!this.user());
  isAdmin = computed(() => !!this.user()?.isAdmin);
  private read() {
    try {
      return JSON.parse(localStorage.getItem(this.key) || "null")?.user || null;
    } catch {
      return null;
    }
  }
  token() {
    try {
      return (
        JSON.parse(localStorage.getItem(this.key) || "null")?.token || null
      );
    } catch {
      return null;
    }
  }
  async login(cusername: string, password: string) {
    const r = await firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/auth/login`, {
        cusername,
        password,
      }),
    );
    this.save(r);
    return r;
  }
  async register(cusername: string, email: string, password: string) {
    const r = await firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/auth/registro`, {
        cusername,
        email,
        password,
      }),
    );
    this.save(r);
    return r;
  }
  private save(r: any) {
    localStorage.setItem(
      this.key,
      JSON.stringify({ token: r.token, user: r.data }),
    );
    this.user.set(r.data);
  }
  logout() {
    localStorage.removeItem(this.key);
    this.user.set(null);
  }
}
