import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Comparacion } from '../../model/comparacion';
import { Consumo } from '../../model/consumo';
import { Impacto } from '../../model/impacto';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { ConsumoService } from '../../services/consumo-service';
import { HogarService } from '../../services/hogar-service';
import { ReporteService } from '../../services/reporte-service';
import { claveMes, etiquetaMes, icono } from '../../util/consumo-util';

interface Periodo {
  clave: string;
  anio: number;
  mes: number;
  etiqueta: string;
}

@Component({
  imports: [DecimalPipe, RouterLink],
  selector: 'app-impacto-component',
  styleUrl: './impacto-component.css',
  templateUrl: './impacto-component.html',
})
export class ImpactoComponent implements OnInit {
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private hogarService: HogarService = inject(HogarService);
  private consumoService: ConsumoService = inject(ConsumoService);
  private reporteService: ReporteService = inject(ReporteService);

  cargando = signal(true);
  consumos = signal<Consumo[]>([]);
  impactos = signal<Impacto[]>([]);
  comparaciones = signal<Comparacion[] | null>(null);
  periodoClave = signal('');
  icono = icono;

  periodos = computed<Periodo[]>(() => {
    const claves = new Map<string, Periodo>();
    for (const c of this.consumos()) {
      const clave = claveMes(c.anio, c.mes);
      claves.set(clave, { clave, anio: c.anio, mes: c.mes, etiqueta: etiquetaMes(c.anio, c.mes) });
    }
    return Array.from(claves.values()).sort((a, b) => b.clave.localeCompare(a.clave));
  });

  periodo = computed(() => this.periodos().find((p) => p.clave === this.periodoClave()) ?? null);

  totales = computed(() => {
    const lista = this.impactos();
    const periodo = this.periodo();
    const co2 = lista.reduce((suma, i) => suma + (i.co2Kg ?? 0), 0);
    const litros = lista.reduce((suma, i) => suma + (i.litrosMes ?? 0), 0);
    const costo = this.consumos()
      .filter((c) => periodo && c.anio === periodo.anio && c.mes === periodo.mes)
      .reduce((suma, c) => suma + (c.costoEstimado ?? 0), 0);
    return { co2, litros, costo };
  });

  mayorEmisor = computed(() => [...this.impactos()].sort((a, b) => b.co2Kg - a.co2Kg)[0] ?? null);

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
    this.comparaciones.set(null);
    const periodo = this.periodo();
    const hogar = this.hogarService.hogar();
    if (!periodo || !hogar) return;
    this.reporteService.impacto(hogar.idHogar!, periodo.anio, periodo.mes).subscribe({
      next: (lista) => this.impactos.set(lista),
      error: (err) => {
        this.impactos.set([]);
        this.aviso.fallo(err, 'No se pudo calcular el impacto');
      },
    });
  }

  comparar(): void {
    const periodo = this.periodo();
    const hogar = this.hogarService.hogar();
    if (!periodo || !hogar) return;
    this.reporteService.comparacionNacional(hogar.idHogar!, periodo.anio, periodo.mes).subscribe({
      next: (lista) => this.comparaciones.set(lista),
      error: (err) => this.aviso.fallo(err, 'No se pudo comparar con el promedio nacional'),
    });
  }
}
