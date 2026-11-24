import { inject, Service } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Service()
export class AvisoService {
  private snackBar: MatSnackBar = inject(MatSnackBar);

  ok(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3500, panelClass: 'aviso-ok' });
  }

  alerta(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 5000, panelClass: 'aviso-alerta' });
  }

  error(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 5000, panelClass: 'aviso-error' });
  }

  textoError(err: unknown, porDefecto = 'No se pudo completar la operacion'): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'No hay conexion con el servidor. Verifica que el backend este en ejecucion.';
      }
      const cuerpo = err.error;
      if (cuerpo && typeof cuerpo === 'object' && typeof cuerpo.mensaje === 'string') {
        return cuerpo.mensaje;
      }
      if (typeof cuerpo === 'string' && cuerpo.length > 0 && cuerpo.length < 200) {
        return cuerpo;
      }
      if (err.status === 403) {
        return 'No tienes permiso para realizar esta accion';
      }
    }
    return porDefecto;
  }

  fallo(err: unknown, porDefecto?: string): void {
    this.error(this.textoError(err, porDefecto));
  }
}
