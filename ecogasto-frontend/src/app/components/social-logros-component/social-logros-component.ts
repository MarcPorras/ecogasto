import { Component, inject, OnInit, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Insignia } from '../../model/insignia';
import { ResumenLogros } from '../../model/resumen-logros';
import { RetoUsuario } from '../../model/reto-usuario';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { RetoService } from '../../services/reto-service';
import { ReporteService } from '../../services/reporte-service';

@Component({
  imports: [DatePipe],
  selector: 'app-social-logros-component',
  styleUrl: './social-logros-component.css',
  templateUrl: './social-logros-component.html',
})
export class SocialLogrosComponent implements OnInit {
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private retoService: RetoService = inject(RetoService);
  private reporteService: ReporteService = inject(ReporteService);

  verRetos = output<void>();

  cargando = signal(true);
  resumen = signal<ResumenLogros | null>(null);
  insignias = signal<Insignia[]>([]);
  completados = signal<RetoUsuario[]>([]);

  ngOnInit(): void {
    const idUsuario = this.auth.idUsuario();
    forkJoin({
      resumen: this.reporteService.resumenLogros(idUsuario),
      insignias: this.retoService.misInsignias(idUsuario),
      retos: this.retoService.misRetos(idUsuario),
    }).subscribe({
      next: ({ resumen, insignias, retos }) => {
        this.resumen.set(resumen);
        this.insignias.set(insignias);
        this.completados.set(retos.filter((r) => r.estado === 'COMPLETADO'));
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err, 'No se pudieron cargar tus logros');
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
