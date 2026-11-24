import { Component, inject, signal, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertaRegistroDialogo } from '../alerta-registro-dialogo/alerta-registro-dialogo';
import { GraficoDemoDialogo } from '../grafico-demo-dialogo/grafico-demo-dialogo';
import { LoginComponent } from '../login-component/login-component';

@Component({
  imports: [LoginComponent],
  selector: 'app-home-component',
  styleUrl: './home-component.css',
  templateUrl: './home-component.html',
})
export class HomeComponent {
  private dialog: MatDialog = inject(MatDialog);
  private login = viewChild(LoginComponent);

  detalleVisible = signal(false);

  mostrarDetalle(evento: Event): void {
    evento.preventDefault();
    this.detalleVisible.set(true);
  }

  irASesion(evento: Event, registro: boolean): void {
    evento.preventDefault();
    this.login()?.cambiarModo(registro);
    document.getElementById('SesionEcoGasto')?.scrollIntoView({ behavior: 'smooth' });
  }

  pedirRegistro(evento: Event): void {
    evento.preventDefault();
    this.dialog
      .open(AlertaRegistroDialogo)
      .afterClosed()
      .subscribe((irARegistro) => {
        if (irARegistro) {
          this.login()?.cambiarModo(true);
          document.getElementById('SesionEcoGasto')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
  }

  verEjemplo(recurso: string): void {
    this.dialog.open(GraficoDemoDialogo, { data: { recurso } });
  }
}