import { Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { GraficoComponent, SerieGrafico } from '../grafico-component/grafico-component';

const MESES_DEMO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];

const DATOS_DEMO: Record<string, { titulo: string; unidad: string; valores: number[]; promedio: number }> = {
  Luz: { titulo: 'Consumo de luz (kWh/mes)', unidad: 'kWh', valores: [182, 175, 190, 168, 160, 152], promedio: 170 },
  Agua: { titulo: 'Consumo de agua (L/día por persona)', unidad: 'L', valores: [148, 152, 139, 144, 131, 128], promedio: 135 },
  Gas: { titulo: 'Consumo de gas (m³/mes)', unidad: 'm³', valores: [24, 26, 22, 25, 21, 20], promedio: 22 },
};

@Component({
  imports: [MatDialogTitle, MatDialogContent, MatDialogClose, MatIconButton, MatIcon, GraficoComponent],
  selector: 'app-grafico-demo-dialogo',
  templateUrl: './grafico-demo-dialogo.html',
  styleUrl: './grafico-demo-dialogo.css',
})
export class GraficoDemoDialogo {
  private recurso: string = inject<{ recurso: string }>(MAT_DIALOG_DATA).recurso;
  private demo = DATOS_DEMO[this.recurso] ?? DATOS_DEMO['Luz'];

  titulo = this.demo.titulo;
  etiquetas = MESES_DEMO;
  unidad = this.demo.unidad;
  series = computed<SerieGrafico[]>(() => [
    { nombre: 'Hogar de ejemplo', datos: this.demo.valores, color: '#2e7d32', relleno: true },
    { nombre: 'Promedio nacional', datos: MESES_DEMO.map(() => this.demo.promedio), color: '#ff9800', discontinua: true },
  ]);
}
