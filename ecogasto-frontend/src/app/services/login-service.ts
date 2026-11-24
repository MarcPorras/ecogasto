import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sesion } from '../model/sesion';
import { LoginRequest } from '../model/login-request';
import { Registro } from '../model/registro';
import { Usuario } from '../model/usuario';

const CLAVE_SESION = 'ecogasto.sesion';

@Service()
export class LoginService {
  private httpClient: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  readonly sesion = signal<Sesion | null>(this.leerSesion());
  readonly logueado = computed(() => this.sesion() !== null);
  readonly esAdmin = computed(() => this.sesion()?.rol === 'ADMIN');
  readonly tieneHogar = computed(() => this.sesion()?.tieneHogar === true);

  login(request: LoginRequest): Observable<Sesion> {
    return this.httpClient
      .post<Sesion>(environment.apiUrl + '/auth/login', request)
      .pipe(tap((sesion) => this.guardarSesion(sesion)));
  }

  registrar(registro: Registro): Observable<Usuario> {
    return this.httpClient.post<Usuario>(environment.apiUrl + '/auth/registro', registro);
  }

  marcarHogarCreado(): void {
    const actual = this.sesion();
    if (actual) {
      this.guardarSesion({ ...actual, tieneHogar: true });
    }
  }

  token(): string | null {
    return this.sesion()?.token ?? null;
  }

  idUsuario(): number {
    return this.sesion()?.idUsuario ?? 0;
  }

  limpiarSesion(): void {
    this.sesion.set(null);
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch {
      this.sesion.set(null);
    }
  }

  tokenVencido(): boolean {
    const token = this.token();
    if (!token) return true;
    try {
      const carga = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof carga.exp === 'number' && carga.exp * 1000 <= Date.now();
    } catch {
      return false;
    }
  }

  logout(): void {
    this.limpiarSesion();
    this.router.navigate(['/home']);
  }

  private guardarSesion(sesion: Sesion): void {
    this.sesion.set(sesion);
    try {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch {
      this.sesion.set(sesion);
    }
  }

  private leerSesion(): Sesion | null {
    try {
      const crudo = localStorage.getItem(CLAVE_SESION);
      return crudo ? (JSON.parse(crudo) as Sesion) : null;
    } catch {
      return null;
    }
  }
}
