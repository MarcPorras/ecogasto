import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LoginService } from '../../services/login-service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButton, MatIcon],
  selector: 'app-admin-component',
  styleUrl: './admin-component.css',
  templateUrl: './admin-component.html',
})
export class AdminComponent {
  private auth: LoginService = inject(LoginService);
  private router: Router = inject(Router);

  usuario = this.auth.sesion()?.username ?? '';

  secciones = [
    { ruta: 'resumen', etiqueta: 'Resumen', icono: 'dashboard' },
    { ruta: 'usuarios', etiqueta: 'Usuarios', icono: 'group' },
    { ruta: 'consumos', etiqueta: 'Consumos', icono: 'bolt' },
    { ruta: 'tarifas', etiqueta: 'Tarifas', icono: 'payments' },
    { ruta: 'zonas', etiqueta: 'Zonas', icono: 'map' },
    { ruta: 'tips', etiqueta: 'Eco tips', icono: 'lightbulb' },
    { ruta: 'retos', etiqueta: 'Retos', icono: 'emoji_events' },
    { ruta: 'auditoria', etiqueta: 'Auditoría', icono: 'history' },
  ];

  salir(): void {
    this.auth.limpiarSesion();
    this.router.navigate(['/admin-login']);
  } 
}
