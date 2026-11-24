import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Comparacion } from '../../model/comparacion';
import { Consumo } from '../../model/consumo';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { ConsumoService } from '../../services/consumo-service';
import { HogarService } from '../../services/hogar-service';
import { ReporteService } from '../../services/reporte-service';
import { claveMes, etiquetaMes, icono } from '../../util/consumo-util';
import { GraficoComponent, SerieGrafico } from '../grafico-component/grafico-component';

interface Periodo {
  clave: string;
  anio: number;
  mes: number;
  etiqueta: string;
}

@Component({
  imports: [DecimalPipe, RouterLink, GraficoComponent],
  selector: 'app-comparar-component',
  styleUrl: './comparar-component.css',
  templateUrl: './comparar-component.html',
})
export class CompararComponent implements OnInit {
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private consumoService: ConsumoService = inject(ConsumoService);
  private reporteService: ReporteService = inject(ReporteService);
  hogarService: HogarService = inject(HogarService);

  cargando = signal(true);
  consumos = signal<Consumo[]>([]);
  filas = signal<Comparacion[]>([]);
  periodoClave = signal('');
  icono = icono;

  periodos = computed<Periodo[]>(() => {
    const mapa = new Map<string, Periodo>();
    for (const c of this.consumos()) {
      const clave = claveMes(c.anio, c.mes);
      mapa.set(clave, { clave, anio: c.anio, mes: c.mes, etiqueta: etiquetaMes(c.anio, c.mes) });
    }
    return Array.from(mapa.values()).sort((a, b) => b.clave.localeCompare(a.clave));
  });

  hayHogares = computed(() => this.filas().some((f) => f.cantidadHogares > 0));

  etiquetas = computed(() => this.filas().map((f) => f.recurso));

  series = computed<SerieGrafico[]>(() => [{ nombre: 'Diferencia frente a hogares similares (%)', color: '#2e7d32', datos: this.filas().map((f) => f.diferenciaPct) }]);

  mensaje = computed(() => {
    const filas = this.filas().filter((f) => f.cantidadHogares > 0);
    if (filas.length === 0) return '';
    const mejores = filas.filter((f) => f.diferenciaPct <= 0).map((f) => f.recurso.toLowerCase());
    const peores = filas.filter((f) => f.diferenciaPct > 0).map((f) => f.recurso.toLowerCase());
    if (peores.length === 0) return '¡Muy bien! Consumes menos que los hogares similares en todos tus servicios.';
    if (mejores.length === 0) return 'Consumes más que los hogares similares en todos tus servicios. Revisa tus Eco Tips.';
    return 'Consumes menos en ' + mejores.join(', ') + ' y más en ' + peores.join(', ') + '.';
  });

  ngOnInit(): void {
    this.hogarService.asegurar(this.auth.idUsuario()).subscribe({
      next: (hogar) =>
        this.consumoService.listPorHogar(hogar.idHogar!).subscribe({
          next: (consumos) => {
            this.consumos.set(consumos);
            this.cargando.set(false);
            const primero = this.periodos()[0];
            if (primero) {
              this.cambiarPeriodo(primero.clave);
            }
          },
          error: (err) => {
            this.cargando.set(false);
            this.aviso.fallo(err);
          },
        }),
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err);
      },
    });
  }

  cambiarPeriodo(clave: string): void {
    this.periodoClave.set(clave);
    const periodo = this.periodos().find((p) => p.clave === clave);
    const hogar = this.hogarService.hogar();
    if (!periodo || !hogar) return;
    this.reporteService.hogaresSimilares(hogar.idHogar!, periodo.anio, periodo.mes).subscribe({
      next: (lista) => this.filas.set(lista),
      error: (err) => {
        this.filas.set([]);
        this.aviso.fallo(err, 'No se pudo comparar con hogares similares');
      },
    });
  }
}
