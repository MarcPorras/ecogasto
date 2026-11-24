import { Component, DestroyRef, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

export interface SerieGrafico {
  nombre: string;
  datos: (number | null)[];
  color: string;
  discontinua?: boolean;
  relleno?: boolean;
}

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico-component.html',
  styleUrl: './grafico-component.css',
})
export class GraficoComponent {
  tipo = input<'line' | 'bar'>('line');
  etiquetas = input<string[]>([]);
  series = input<SerieGrafico[]>([]);
  horizontal = input(false);
  tituloY = input('');

  private lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico?: Chart;

  constructor() {
    effect(() => this.dibujar());
    inject(DestroyRef).onDestroy(() => this.grafico?.destroy());
  }

  private dibujar(): void {
    const tipo = this.tipo();
    const etiquetas = this.etiquetas();
    const series = this.series();
    const horizontal = this.horizontal();
    const tituloY = this.tituloY();
    const canvas = this.lienzo().nativeElement;
    this.grafico?.destroy();

    const configuracion: ChartConfiguration = {
      type: tipo,
      data: {
        labels: etiquetas,
        datasets: series.map((serie) => ({
          label: serie.nombre,
          data: serie.datos,
          borderColor: serie.color,
          backgroundColor: tipo === 'bar' ? serie.color : serie.relleno ? serie.color + '33' : serie.color,
          borderDash: serie.discontinua ? [6, 6] : [],
          borderWidth: 2,
          pointRadius: serie.discontinua ? 0 : 4,
          tension: 0.25,
          fill: !!serie.relleno,
          spanGaps: true,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' : 'x',
        plugins: { legend: { position: 'bottom' } },
        scales: {
          [horizontal ? 'x' : 'y']: {
            beginAtZero: true,
            title: { display: tituloY.length > 0, text: tituloY },
          },
        },
      },
    };
    this.grafico = new Chart(canvas, configuracion);
  }
}
