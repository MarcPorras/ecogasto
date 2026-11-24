import { Component } from '@angular/core';
import { MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  imports: [MatDialogContent, MatDialogActions, MatButton, MatDialogClose],
  selector: 'app-alerta-registro-dialogo',
  templateUrl: './alerta-registro-dialogo.html',
  styleUrl: './alerta-registro-dialogo.css',
})
export class AlertaRegistroDialogo {}
