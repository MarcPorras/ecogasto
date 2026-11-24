import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PromedioZona } from '../../model/promedio-zona';
import { Recurso } from '../../model/recurso';
import { Zona } from '../../model/zona';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { HogarService } from '../../services/hogar-service';
import { RecursoService } from '../../services/recurso-service';
import { ReporteService } from '../../services/reporte-service';
import { ZonaService } from '../../services/zona-service';
import { aniosDisponibles, icono, MESES } from '../../util/consumo-util';
import { GraficoComponent, SerieGrafico } from '../grafico-component/grafico-component';

const COLORES: Record<string, string> = { Agua: '#03a9f4', Luz: '#ffc107', Gas: '#ff7043', Transporte: '#7e57c2' };

@Component({
  imports: [DecimalPipe, RouterLink, GraficoComponent],
  selector: 'app-estadisticas-component',
  styleUrl: './estadisticas-component.css',
  templateUrl: './estadisticas-component.html',
})
export class EstadisticasComponent implements OnInit {
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private hogarService: HogarService = inject(HogarService);
  private recursoService: RecursoService = inject(RecursoService);
  private reporteService: ReporteService = inject(ReporteService);
  private zonaService: ZonaService = inject(ZonaService);

  zonas = signal<Zona[]>([]);
  recursos = signal<Recurso[]>([]);
  datos = signal<PromedioZona[]>([]);
  idZona = signal<number | null>(null);
  anio = signal(new Date().getFullYear());
  cargando = signal(true);
  anios = aniosDisponibles();
  etiquetas = MESES;
  icono = icono;

  zonaNombre = computed(() => this.zonas().find((z) => z.idZona === this.idZona())?.nombre ?? '');

  resumen = computed(() =>
    this.recursos()
      .map((recurso) => {
        const valores = this.datos().filter((d) => d.recurso === recurso.nombre).map((d) => d.promedio);
        const promedio = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
        return { recurso, promedio, meses: valores.length };
      })
      .filter((fila) => fila.meses > 0),
  );

  graficos = computed(() =>
    this.resumen().map((fila) => {
      const porMes = new Map(this.datos().filter((d) => d.recurso === fila.recurso.nombre).map((d) => [d.mes, d.promedio]));
      const serie: SerieGrafico = {
        nombre: fila.recurso.nombre + ' (' + fila.recurso.unidad + ')',
        color: COLORES[fila.recurso.nombre] ?? '#2e7d32',
        relleno: true,
        datos: MESES.map((_, i) => porMes.get(i + 1) ?? null),
      };
      return { recurso: fila.recurso, series: [serie] };
    }),
  );

  ngOnInit(): void {
    forkJoin({ zonas: this.zonaService.list(), recursos: this.recursoService.list(), hogar: this.hogarService.asegurar(this.auth.idUsuario()) }).subscribe({
      next: ({ zonas, recursos, hogar }) => {
        this.zonas.set(zonas);
        this.recursos.set(recursos);
        this.idZona.set(zonas.some((z) => z.idZona === hogar.idZona) ? hogar.idZona : (zonas[0]?.idZona ?? null));
        this.cargando.set(false);
        this.cargarDatos();
      },
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err);
      },
    });
  }

  cambiarZona(valor: string): void {
    this.idZona.set(Number(valor));
    this.cargarDatos();
  }

  cambiarAnio(valor: string): void {
    this.anio.set(Number(valor));
    this.cargarDatos();
  }

  private cargarDatos(): void {
    const id = this.idZona();
    if (id === null) return;
    this.reporteService.promedioZona(id, this.anio()).subscribe({
      next: (lista) => this.datos.set(lista),
      error: (err) => {
        this.datos.set([]);
        this.aviso.fallo(err, 'No se pudieron cargar las estadísticas');
      },
    });
  }
}
