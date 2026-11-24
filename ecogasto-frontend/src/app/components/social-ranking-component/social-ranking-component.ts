import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { Ranking } from '../../model/ranking';
import { Zona } from '../../model/zona';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { ReporteService } from '../../services/reporte-service';
import { ZonaService } from '../../services/zona-service';

@Component({
  imports: [FormsModule, MatFormField, MatLabel, MatSelect, MatOption],
  selector: 'app-social-ranking-component',
  styleUrl: './social-ranking-component.css',
  templateUrl: './social-ranking-component.html',
})
export class SocialRankingComponent implements OnInit {
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private reporteService: ReporteService = inject(ReporteService);
  private zonaService: ZonaService = inject(ZonaService);

  zonas = signal<Zona[]>([]);
  zona = signal('');
  segmento = signal('');
  lista = signal<Ranking[]>([]);
  cargando = signal(true);
  usuario = this.auth.sesion()?.username ?? '';

  segmentos = ['Padre de familia', 'Joven independiente'];

  top = computed(() => this.lista().slice(0, 10));
  propio = computed(() => this.lista().find((r) => r.username === this.usuario));
  propioFuera = computed(() => {
    const p = this.propio();
    return p && p.posicion > 10 ? p : null;
  });

  ngOnInit(): void {
    this.zonaService.list().subscribe({
      next: (zonas) => this.zonas.set(zonas),
      error: () => this.zonas.set([]),
    });
    this.cargar();
  }

  cambiarZona(valor: string): void {
    this.zona.set(valor);
    this.cargar();
  }

  cambiarSegmento(valor: string): void {
    this.segmento.set(valor);
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.reporteService.ranking(this.zona(), this.segmento()).subscribe({
      next: (lista) => {
        this.lista.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err, 'No se pudo cargar el ranking');
      },
    });
  }

  medalla(posicion: number): string {
    if (posicion === 1) return '🥇';
    if (posicion === 2) return '🥈';
    if (posicion === 3) return '🥉';
    return String(posicion);
  }
}
