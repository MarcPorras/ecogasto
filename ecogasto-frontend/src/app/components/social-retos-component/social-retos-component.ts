import { Component, computed, inject, OnInit, output, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Insignia } from '../../model/insignia';
import { Reto } from '../../model/reto';
import { RetoUsuario } from '../../model/reto-usuario';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { RetoService } from '../../services/reto-service';

@Component({
  selector: 'app-social-retos-component',
  styleUrl: './social-retos-component.css',
  templateUrl: './social-retos-component.html',
})
export class SocialRetosComponent implements OnInit {
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private retoService: RetoService = inject(RetoService);

  actualizado = output<void>();

  cargando = signal(true);
  activos = signal<Reto[]>([]);
  misRetos = signal<RetoUsuario[]>([]);
  insignias = signal<Insignia[]>([]);
  ocupado = signal<number | null>(null);

  idsUnidos = computed(() => new Set(this.misRetos().map((r) => r.idReto)));
  enCurso = computed(() => this.misRetos().filter((r) => r.estado === 'EN_CURSO'));
  completados = computed(() => this.misRetos().filter((r) => r.estado === 'COMPLETADO'));

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    const idUsuario = this.auth.idUsuario();
    forkJoin({
      activos: this.retoService.listActivos(),
      mis: this.retoService.misRetos(idUsuario),
      insignias: this.retoService.misInsignias(idUsuario),
    }).subscribe({
      next: ({ activos, mis, insignias }) => {
        this.activos.set(activos);
        this.misRetos.set(mis);
        this.insignias.set(insignias);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err, 'No se pudieron cargar los retos');
      },
    });
  }

  unirse(reto: Reto): void {
    this.ocupado.set(reto.idReto!);
    this.retoService.unirse(this.auth.idUsuario(), reto.idReto!).subscribe({
      next: () => {
        this.ocupado.set(null);
        this.aviso.ok('Te uniste al reto');
        this.cargar();
      },
      error: (err) => {
        this.ocupado.set(null);
        this.aviso.fallo(err, 'No se pudo unir al reto');
      },
    });
  }

  completar(retoUsuario: RetoUsuario): void {
    this.ocupado.set(retoUsuario.idReto);
    this.retoService.completar(retoUsuario.idRetoUsuario!).subscribe({
      next: (resultado) => {
        this.ocupado.set(null);
        const nuevas = resultado.insigniasNuevas?.length ? ' Nuevas insignias: ' + resultado.insigniasNuevas.join(', ') : '';
        this.aviso.ok(resultado.mensaje + ' Puntos totales: ' + resultado.puntosTotales + '.' + nuevas);
        this.cargar();
        this.actualizado.emit();
      },
      error: (err) => {
        this.ocupado.set(null);
        this.aviso.fallo(err, 'No se pudo completar el reto');
      },
    });
  }

  icono(insignia: Insignia): string {
    const nombre = insignia.nombre.toLowerCase();
    if (nombre.includes('novato')) return '🌱';
    if (nombre.includes('guardian') || nombre.includes('guardián')) return '🛡️';
    if (nombre.includes('maestro')) return '🏆';
    return '🏅';
  }
}
