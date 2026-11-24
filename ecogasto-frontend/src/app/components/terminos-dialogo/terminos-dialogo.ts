import { Component } from '@angular/core';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatDialogClose],
  selector: 'app-terminos-dialogo',
  templateUrl: './terminos-dialogo.html',
  styleUrl: './terminos-dialogo.css',
})
export class TerminosDialogo {}
