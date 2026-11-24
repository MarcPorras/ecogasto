import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LoginService } from '../../services/login-service';
import { NotificacionService } from '../../services/notificacion-service';
import { HogarService } from '../../services/hogar-service';

const RUTAS_PUBLICAS = ['/', '/home', '/login'];

@Component({
  imports: [RouterLink, RouterLinkActive, MatMenu, MatMenuItem, MatMenuTrigger, MatIconButton, MatIcon],
  selector: 'app-nav-bar',
  styleUrl: './nav-bar.css',
  templateUrl: './nav-bar.html',
})
export class NavBar {
  auth: LoginService = inject(LoginService);
  notificaciones: NotificacionService = inject(NotificacionService);
  private hogarService: HogarService = inject(HogarService);
  private router: Router = inject(Router);

  private url = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects.split('#')[0].split('?')[0]),
      startWith(this.router.url.split('#')[0].split('?')[0]),
    ),
    { initialValue: '/' },
  );

  modoApp = computed(() => this.auth.logueado() && !this.auth.esAdmin() && !RUTAS_PUBLICAS.includes(this.url()));
  username = computed(() => this.auth.sesion()?.username ?? '');
  destinoCuenta = computed(() => (this.auth.esAdmin() ? '/admin' : this.auth.tieneHogar() ? '/consumo' : '/hogar'));

  constructor() {
    effect(() => {
      const sesion = this.auth.sesion();
      if (sesion && sesion.rol !== 'ADMIN') {
        this.notificaciones.list(sesion.idUsuario).subscribe({ error: () => this.notificaciones.reiniciar() });
      } else {
        this.notificaciones.reiniciar();
      }
    });
  }

  cerrarSesion(): void {
    this.hogarService.limpiar();
    this.notificaciones.reiniciar();
    this.auth.logout();
  }
}
