import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import { LoginService } from '../../services/login-service';
import { ReporteService } from '../../services/reporte-service';
import { SocialLogrosComponent } from '../social-logros-component/social-logros-component';
import { SocialComunidadComponent } from '../social-comunidad-component/social-comunidad-component';
import { SocialFotosComponent } from '../social-fotos-component/social-fotos-component';
import { SocialResumenComponent } from '../social-resumen-component/social-resumen-component';
import { SocialRetosComponent } from '../social-retos-component/social-retos-component';
import { SocialRankingComponent } from '../social-ranking-component/social-ranking-component';

@Component({
  imports: [MatTabGroup, MatTab, MatTabContent, SocialLogrosComponent, SocialComunidadComponent, SocialFotosComponent, SocialResumenComponent, SocialRetosComponent, SocialRankingComponent],
  selector: 'app-social-component',
  styleUrl: './social-component.css',
  templateUrl: './social-component.html',
})
export class SocialComponent implements OnInit {
  private auth: LoginService = inject(LoginService);
  private reporteService: ReporteService = inject(ReporteService);

  puntos = signal(0);
  pestana = signal(0);

  ngOnInit(): void {
    this.actualizarPuntos();
  }

  actualizarPuntos(): void {
    this.reporteService.resumenLogros(this.auth.idUsuario()).subscribe({
      next: (resumen) => this.puntos.set(resumen.puntos ?? 0),
      error: () => this.puntos.set(0),
    });
  }

  irARetos(): void {
    this.pestana.set(4);
  }
}
