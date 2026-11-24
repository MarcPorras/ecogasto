import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { Consumo } from '../../model/consumo';
import { Recurso } from '../../model/recurso';
import { SerieConsumo } from '../../model/serie-consumo';
import { Tarifa } from '../../model/tarifa';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { ConsumoService } from '../../services/consumo-service';
import { HogarService } from '../../services/hogar-service';
import { NotificacionService } from '../../services/notificacion-service';
import { RecursoService } from '../../services/recurso-service';
import { TarifaService } from '../../services/tarifa-service';
import { ZonaService } from '../../services/zona-service';
import { aniosDisponibles, claveMes, costoEstimado, etiquetaMes, etiquetaNivel, icono, MESES, nivelDe, NivelConsumo } from '../../util/consumo-util';
import { GraficoComponent, SerieGrafico } from '../grafico-component/grafico-component';
import { ConsumoLecturaComponent } from '../consumo-lectura-component/consumo-lectura-component';
import { ConsumoHistorialComponent } from '../consumo-historial-component/consumo-historial-component';

@Component({
  imports: [DecimalPipe, GraficoComponent, ConsumoLecturaComponent, ConsumoHistorialComponent],
  selector: 'app-consumo-component',
  styleUrl: './consumo-component.css',
  templateUrl: './consumo-component.html',
})
export class ConsumoComponent implements OnInit {
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private router: Router = inject(Router);
  private consumoService: ConsumoService = inject(ConsumoService);
  private recursoService: RecursoService = inject(RecursoService);
  private tarifaService: TarifaService = inject(TarifaService);
  private zonaService: ZonaService = inject(ZonaService);
  private notificacionService: NotificacionService = inject(NotificacionService);
  hogarService: HogarService = inject(HogarService);

  recursos = signal<Recurso[]>([]);
  tarifas = signal<Tarifa[]>([]);
  consumos = signal<Consumo[]>([]);
  zonaActiva = signal(true);
  serie = signal<SerieConsumo[]>([]);
  cargando = signal(true);
  seleccionado = signal<number | null>(null);
  anioGrafico = signal(new Date().getFullYear());
  edicion = signal<Consumo | null>(null);
  noLeidas = this.notificacionService.noLeidas;

  icono = icono;
  etiquetaNivel = etiquetaNivel;
  anios = aniosDisponibles();

  hogar = this.hogarService.hogar;
  username = computed(() => this.auth.sesion()?.username ?? '');

  recursosHogar = computed(() => {
    const ids = this.hogar()?.recursos ?? [];
    return this.recursos().filter((r) => ids.includes(r.idRecurso));
  });

  resumenHogar = computed(() => {
    const h = this.hogar();
    if (!h) return '';
    const servicios = this.recursosHogar()
      .map((r) => r.nombre)
      .join(', ');
    return 'Zona ' + h.zona + ' · ' + h.numPersonas + (h.numPersonas === 1 ? ' persona' : ' personas') + ' · ' + (h.esPadre ? 'Padre de familia' : 'Joven independiente') + ' · Servicios: ' + (servicios || 'ninguno');
  });

  tarjetas = computed(() =>
    this.recursos().map((recurso) => {
      const tiene = (this.hogar()?.recursos ?? []).includes(recurso.idRecurso);
      const ultima = this.consumos().find((c) => c.idRecurso === recurso.idRecurso);
      const tarifa = this.tarifaDe(recurso.idRecurso);
      const nivel: NivelConsumo = ultima ? nivelDe(ultima.valor, tarifa) : 'neutro';
      return { recurso, tiene, ultima, nivel, periodo: ultima ? etiquetaMes(ultima.anio, ultima.mes) : '' };
    }),
  );

  ultimoPeriodo = computed(() => {
    const lista = this.consumos();
    if (lista.length === 0) return null;
    const clave = lista.map((c) => claveMes(c.anio, c.mes)).sort().reverse()[0];
    return { clave, anio: Number(clave.slice(0, 4)), mes: Number(clave.slice(5)) };
  });

  kpis = computed(() => {
    const ultimo = this.ultimoPeriodo();
    if (!ultimo) {
      return { periodo: '—', gasto: null as number | null, altos: [] as string[] };
    }
    const delMes = this.consumos().filter((c) => claveMes(c.anio, c.mes) === ultimo.clave);
    const gasto = delMes.reduce((suma, c) => suma + (c.costoEstimado ?? 0), 0);
    const altos = delMes.filter((c) => nivelDe(c.valor, this.tarifaDe(c.idRecurso)) === 'alto').map((c) => c.recurso ?? '');
    return { periodo: etiquetaMes(ultimo.anio, ultimo.mes), gasto, altos };
  });

  recursoSeleccionado = computed(() => this.recursos().find((r) => r.idRecurso === this.seleccionado()) ?? null);

  tarifaSeleccionada = computed(() => {
    const id = this.seleccionado();
    return id === null ? undefined : this.tarifaDe(id);
  });

  aniosConDatos = computed(() => {
    const id = this.seleccionado();
    const anios = new Set(this.consumos().filter((c) => c.idRecurso === id).map((c) => c.anio));
    anios.add(new Date().getFullYear());
    return Array.from(anios).sort((a, b) => b - a);
  });

  hayDatosGrafico = computed(() => this.serie().length > 0);

  etiquetasGrafico = MESES;

  seriesGrafico = computed<SerieGrafico[]>(() => {
    const serie = this.serie();
    const porMes = new Map(serie.map((s) => [s.mes, s]));
    const promedio = serie[0]?.promedioNacional ?? this.tarifaSeleccionada()?.promedioNacional ?? null;
    return [
      { nombre: 'Tu consumo', color: '#2e7d32', relleno: true, datos: MESES.map((_, i) => porMes.get(i + 1)?.valor ?? null) },
      { nombre: 'Promedio nacional (' + (this.hogar()?.zona ?? '') + ')', color: '#ff9800', discontinua: true, datos: MESES.map(() => promedio) },
    ];
  });

  tituloGrafico = computed(() => {
    const recurso = this.recursoSeleccionado();
    return recurso ? 'Consumo mensual de ' + recurso.nombre.toLowerCase() + ' (' + this.anioGrafico() + ')' : 'Consumo mensual';
  });

  ngOnInit(): void {
    const hogar$ = this.hogar() ? of(this.hogar()!) : this.hogarService.buscarPorUsuario(this.auth.idUsuario());
    hogar$.subscribe({
      next: (hogar) => this.cargarDatos(hogar.idHogar!, hogar.idZona),
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err, 'No se pudo cargar tu hogar');
      },
    });
  }

  private cargarDatos(idHogar: number, idZona: number): void {
    forkJoin({
      recursos: this.recursoService.list(),
      tarifas: this.tarifaService.list(),
      zonas: this.zonaService.list(),
      consumos: this.consumoService.listPorHogar(idHogar),
    }).subscribe({
      next: ({ recursos, tarifas, zonas, consumos }) => {
        this.recursos.set(recursos);
        this.tarifas.set(tarifas);
        this.consumos.set(consumos);
        this.zonaActiva.set(zonas.some((z) => z.idZona === idZona));
        this.cargando.set(false);
        this.elegirRecursoInicial();
      },
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err, 'No se pudieron cargar tus lecturas');
      },
    });
  }

  private elegirRecursoInicial(): void {
    const propios = this.recursosHogar();
    const conLecturas = propios.find((r) => this.consumos().some((c) => c.idRecurso === r.idRecurso));
    const elegido = conLecturas ?? propios[0];
    if (elegido) {
      this.seleccionar(elegido.idRecurso);
    }
  }

  tarifaDe(idRecurso: number): Tarifa | undefined {
    const idZona = this.hogar()?.idZona;
    return this.tarifas().find((t) => t.idRecurso === idRecurso && t.idZona === idZona);
  }

  seleccionar(idRecurso: number): void {
    if (!(this.hogar()?.recursos ?? []).includes(idRecurso)) return;
    this.seleccionado.set(idRecurso);
    const anios = this.aniosConDatos();
    if (!anios.includes(this.anioGrafico())) {
      this.anioGrafico.set(anios[0]);
    }
    this.cargarSerie();
  }

  cambiarAnio(anio: number): void {
    this.anioGrafico.set(anio);
    this.cargarSerie();
  }

  cambiarRecurso(idRecurso: number): void {
    this.seleccionar(idRecurso);
  }

  private cargarSerie(): void {
    const id = this.seleccionado();
    const hogar = this.hogar();
    if (id === null || !hogar) {
      this.serie.set([]);
      return;
    }
    this.consumoService.serie(hogar.idHogar!, id, this.anioGrafico()).subscribe({
      next: (datos) => this.serie.set(datos),
      error: () => this.serie.set([]),
    });
  }

  registrarDesdeTarjeta(idRecurso: number): void {
    this.edicion.set(null);
    this.seleccionar(idRecurso);
    document.getElementById('bloque-lectura')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  editarHogar(): void {
    this.router.navigate(['/hogar']);
  }

  empezarEdicion(consumo: Consumo): void {
    this.edicion.set(consumo);
    document.getElementById('bloque-lectura')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  terminarEdicion(): void {
    this.edicion.set(null);
  }

  lecturaGuardada(): void {
    this.edicion.set(null);
    this.recargar();
  }

  lecturaEliminada(): void {
    this.edicion.set(null);
    this.recargar();
  }

  private recargar(): void {
    const hogar = this.hogar();
    if (!hogar) return;
    this.consumoService.listPorHogar(hogar.idHogar!).subscribe({
      next: (consumos) => {
        this.consumos.set(consumos);
        this.cargarSerie();
      },
    });
    this.notificacionService.list(this.auth.idUsuario()).subscribe();
  }

  costoDe(consumo: Consumo): number | null {
    return consumo.costoEstimado ?? costoEstimado(consumo.valor, consumo.recurso ?? '', this.hogar()?.numPersonas ?? 1, this.tarifaDe(consumo.idRecurso));
  }
}
