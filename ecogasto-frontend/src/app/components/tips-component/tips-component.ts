import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ecotip } from '../../model/ecotip';
import { Recomendacion } from '../../model/recomendacion';
import { Recurso } from '../../model/recurso';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { EcotipService } from '../../services/ecotip-service';
import { RecomendacionService } from '../../services/recomendacion-service';
import { RecursoService } from '../../services/recurso-service';
import { icono } from '../../util/consumo-util';

@Component({
  imports: [RouterLink],
  selector: 'app-tips-component',
  styleUrl: './tips-component.css',
  templateUrl: './tips-component.html',
})
export class TipsComponent implements OnInit {
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private recomendacionService: RecomendacionService = inject(RecomendacionService);
  private ecotipService: EcotipService = inject(EcotipService);
  private recursoService: RecursoService = inject(RecursoService);

  recursos = signal<Recurso[]>([]);
  tip = signal<Recomendacion | null>(null);
  catalogo = signal<Ecotip[]>([]);
  historial = signal<Recomendacion[]>([]);
  cargando = signal(true);
  sinLecturas = signal(false);
  mensaje = signal('');
  valorado = signal(false);
  icono = icono;

  origenIa = computed(() => (this.tip()?.origen ?? '').toUpperCase().includes('IA'));

  ngOnInit(): void {
    this.recursoService.list().subscribe({
      next: (lista) => {
        this.recursos.set(lista);
        this.generar();
      },
      error: () => this.generar(),
    });
  }

  generar(): void {
    this.cargando.set(true);
    this.mensaje.set('');
    this.valorado.set(false);
    this.recomendacionService.personalizada(this.auth.idUsuario()).subscribe({
      next: (tip) => {
        this.tip.set(tip);
        this.sinLecturas.set(false);
        this.cargando.set(false);
        this.historial.update((lista) => [tip, ...lista.filter((t) => t.idRecomendacion !== tip.idRecomendacion)].slice(0, 8));
        this.cargarCatalogo(tip.recurso);
      },
      error: (err) => {
        this.cargando.set(false);
        this.tip.set(null);
        this.sinLecturas.set(true);
        this.mensaje.set(this.aviso.textoError(err, 'Registra al menos una lectura para recibir un tip personalizado.'));
      },
    });
  }

  private cargarCatalogo(nombre: string | undefined): void {
    const recurso = this.recursos().find((r) => r.nombre === nombre);
    if (!recurso) {
      this.catalogo.set([]);
      return;
    }
    this.ecotipService.listPorRecurso(recurso.idRecurso).subscribe({
      next: (lista) => this.catalogo.set(lista),
      error: () => this.catalogo.set([]),
    });
  }

  valorar(util: boolean): void {
    const tip = this.tip();
    if (!tip) return;
    this.recomendacionService.valorar(tip.idRecomendacion, util).subscribe({
      next: (actualizado) => {
        this.tip.set(actualizado);
        this.valorado.set(true);
        this.mensaje.set(util ? '¡Gracias! Seguiremos sugiriéndote consejos como este.' : 'Gracias por avisarnos. Mejoraremos tus próximos tips.');
      },
      error: (err) => this.aviso.fallo(err, 'No se pudo guardar tu valoración'),
    });
  }
}
