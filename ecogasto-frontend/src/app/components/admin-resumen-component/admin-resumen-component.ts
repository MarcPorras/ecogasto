import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { Carencia } from '../../model/carencia';
import { Indicadores } from '../../model/indicadores';
import { NivelConsumo } from '../../model/nivel-consumo';
import { PromedioZona } from '../../model/promedio-zona';
import { AdminService } from '../../services/admin-service';
import { AvisoService } from '../../services/aviso-service';
import { aniosDisponibles, MESES } from '../../util/consumo-util';
import { GraficoComponent, SerieGrafico } from '../grafico-component/grafico-component';

const COLORES: Record<string, string> = { Agua: '#1976d2', Luz: '#f9a825', Gas: '#e65100' };

@Component({
  imports: [DecimalPipe, FormsModule, MatFormField, MatLabel, MatSelect, MatOption, GraficoComponent],
  selector: 'app-admin-resumen-component',
  styleUrl: './admin-resumen-component.css',
  templateUrl: './admin-resumen-component.html',
})
export class AdminResumenComponent implements OnInit {
  private adminService: AdminService = inject(AdminService);
  private aviso: AvisoService = inject(AvisoService);

  indicadores = signal<Indicadores | null>(null);
  niveles = signal<NivelConsumo[]>([]);
  carencias = signal<Carencia[]>([]);
  promedios = signal<PromedioZona[]>([]);
  anio = signal(new Date().getFullYear());
  anios = aniosDisponibles();
  meses = MESES;

  etiquetasNivel = computed(() => this.niveles().map((n) => n.recurso));
  seriesNivel = computed<SerieGrafico[]>(() => [
    { nombre: 'Bajo', datos: this.niveles().map((n) => n.bajo), color: '#2e7d32' },
    { nombre: 'Moderado', datos: this.niveles().map((n) => n.moderado), color: '#f9a825' },
    { nombre: 'Alto', datos: this.niveles().map((n) => n.alto), color: '#c62828' },
  ]);

  etiquetasCarencia = computed(() => this.carencias().map((c) => c.zona + ' · ' + c.recurso));
  seriesCarencia = computed<SerieGrafico[]>(() => [{ nombre: '% sin servicio', datos: this.carencias().map((c) => c.porcentaje), color: '#c62828' }]);

  seriesPromedio = computed<SerieGrafico[]>(() => {
    const recursos = [...new Set(this.promedios().map((p) => p.recurso))];
    return recursos.map((recurso) => ({
      nombre: recurso,
      color: COLORES[recurso] ?? '#2e7d32',
      datos: MESES.map((_, i) => {
        const valores = this.promedios().filter((p) => p.recurso === recurso && p.mes === i + 1).map((p) => p.promedio);
        return valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
      }),
    }));
  });

  ngOnInit(): void {
    this.adminService.indicadores().subscribe({ next: (d) => this.indicadores.set(d), error: (err) => this.aviso.fallo(err, 'No se pudieron cargar los indicadores') });
    this.adminService.nivelConsumo().subscribe({ next: (d) => this.niveles.set(d), error: (err) => this.aviso.fallo(err, 'No se pudo cargar el nivel de consumo') });
    this.adminService.carencias().subscribe({ next: (d) => this.carencias.set(d), error: (err) => this.aviso.fallo(err, 'No se pudieron cargar las carencias') });
    this.cargarPromedios();
  }

  cambiarAnio(anio: number): void {
    this.anio.set(anio);
    this.cargarPromedios();
  }

  private cargarPromedios(): void {
    this.adminService.promedioMensual(this.anio()).subscribe({
      next: (d) => this.promedios.set(d),
      error: (err) => this.aviso.fallo(err, 'No se pudo cargar el promedio mensual'),
    });
  }
}
