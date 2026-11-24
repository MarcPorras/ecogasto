import { Component, computed, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ResumenLogros } from '../../model/resumen-logros';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { ReporteService } from '../../services/reporte-service';

@Component({
  imports: [CurrencyPipe, DecimalPipe],
  selector: 'app-social-resumen-component',
  styleUrl: './social-resumen-component.css',
  templateUrl: './social-resumen-component.html',
})
export class SocialResumenComponent implements OnInit {
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private reporteService: ReporteService = inject(ReporteService);

  tarjeta = viewChild<ElementRef<HTMLElement>>('tarjeta');

  resumen = signal<ResumenLogros | null>(null);
  cargando = signal(true);
  generando = signal(false);

  ahorro = computed(() => {
    const r = this.resumen();
    return r ? r.costoMesAnterior - r.costoUltimoMes : 0;
  });

  textoCompartir = computed(() => {
    const r = this.resumen();
    if (!r) return '';
    return `Mi resumen en EcoGasto: ${r.puntos} puntos, ${r.retosCompletados} retos completados y ${r.insignias} insignias. ¡Súmate a cuidar el planeta!`;
  });

  ngOnInit(): void {
    this.reporteService.resumenLogros(this.auth.idUsuario()).subscribe({
      next: (resumen) => {
        this.resumen.set(resumen);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err, 'No se pudo cargar tu resumen');
      },
    });
  }

  async descargar(): Promise<void> {
    const elemento = this.tarjeta()?.nativeElement;
    if (!elemento) return;
    this.generando.set(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const lienzo = await html2canvas(elemento, { backgroundColor: null, scale: 2 });
      const enlace = document.createElement('a');
      enlace.download = 'ecogasto-resumen.png';
      enlace.href = lienzo.toDataURL('image/png');
      enlace.click();
      this.aviso.ok('Imagen descargada');
    } catch {
      this.aviso.error('No se pudo generar la imagen');
    } finally {
      this.generando.set(false);
    }
  }

  compartirWhatsapp(): void {
    window.open('https://wa.me/?text=' + encodeURIComponent(this.textoCompartir()), '_blank', 'noopener');
  }

  compartirFacebook(): void {
    const url = encodeURIComponent(window.location.origin);
    const texto = encodeURIComponent(this.textoCompartir());
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + url + '&quote=' + texto, '_blank', 'noopener');
  }

  compartirInstagram(): void {
    this.descargar();
    this.aviso.alerta('Sube la imagen descargada a Instagram desde tu celular');
  }
}
