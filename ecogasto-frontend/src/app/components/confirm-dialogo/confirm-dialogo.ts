import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

export interface DatosConfirmacion {
  titulo?: string;
  mensaje?: string;
  textoSi?: string;
}

@Component({
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatDialogClose],
  selector: 'app-confirm-dialogo',
  templateUrl: './confirm-dialogo.html',
})
export class ConfirmDialogo {
  datos: DatosConfirmacion | null = inject<DatosConfirmacion | null>(MAT_DIALOG_DATA, { optional: true });
}
