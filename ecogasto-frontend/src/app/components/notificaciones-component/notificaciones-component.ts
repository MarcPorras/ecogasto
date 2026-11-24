import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Notificacion } from '../../model/notificacion';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { NotificacionService } from '../../services/notificacion-service';
import { icono } from '../../util/consumo-util';
import { ConfirmDialogo } from '../confirm-dialogo/confirm-dialogo';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-notificaciones-component',
  styleUrl: './notificaciones-component.css',
  templateUrl: './notificaciones-component.html',
})
export class NotificacionesComponent implements OnInit {
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private dialog: MatDialog = inject(MatDialog);
  private notificacionService: NotificacionService = inject(NotificacionService);

  lista = signal<Notificacion[]>([]);
  cargando = signal(true);
  icono = icono;

  noLeidas = computed(() => this.lista().filter((n) => !n.leida).length);

  resumen = computed(() => {
    const total = this.lista().length;
    if (total === 0) return 'No tienes notificaciones.';
    const sin = this.noLeidas();
    return total + (total === 1 ? ' notificación' : ' notificaciones') + ' · ' + sin + (sin === 1 ? ' sin leer' : ' sin leer');
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.notificacionService.list(this.auth.idUsuario()).subscribe({
      next: (lista) => {
        this.lista.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err, 'No se pudieron cargar tus notificaciones');
      },
    });
  }

  esAlerta(notificacion: Notificacion): boolean {
    return notificacion.titulo.toLowerCase().startsWith('alerta');
  }

  marcarLeidas(): void {
    this.notificacionService.marcarLeidas(this.auth.idUsuario()).subscribe({
      next: () => {
        this.aviso.ok('Todas las notificaciones quedaron como leídas');
        this.cargar();
      },
      error: (err) => this.aviso.fallo(err),
    });
  }

  eliminarTodas(): void {
    this.dialog
      .open(ConfirmDialogo, { data: { titulo: 'Eliminar notificaciones', mensaje: '¿Eliminar todas tus notificaciones?' } })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.notificacionService.eliminarTodas(this.auth.idUsuario()).subscribe({
          next: () => {
            this.aviso.ok('Notificaciones eliminadas');
            this.cargar();
          },
          error: (err) => this.aviso.fallo(err),
        });
      });
  }
}
