import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCheckbox } from '@angular/material/checkbox';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { PreferenciaService } from '../../services/preferencia-service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatCheckbox],
  selector: 'app-preferencias-component',
  styleUrl: './preferencias-component.css',
  templateUrl: './preferencias-component.html',
})
export class PreferenciasComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private router: Router = inject(Router);
  private preferenciaService: PreferenciaService = inject(PreferenciaService);

  cargando = signal(true);
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    notifAgua: [true],
    notifLuz: [true],
    notifGas: [true],
    notifTransporte: [true],
    aceptaRetos: [true],
    recordatorioSemanal: [false],
  });

  ngOnInit(): void {
    this.preferenciaService.listId(this.auth.idUsuario()).subscribe({
      next: (preferencia) => {
        this.form.patchValue(preferencia);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err, 'No se pudieron cargar tus preferencias');
      },
    });
  }

  guardar(): void {
    this.guardando.set(true);
    this.preferenciaService.update(this.auth.idUsuario(), this.form.getRawValue()).subscribe({
      next: () => {
        this.guardando.set(false);
        this.aviso.ok('Preferencias guardadas. Se aplicarán a tus siguientes lecturas.');
        this.router.navigate(['/notificaciones']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.aviso.fallo(err, 'No se pudieron guardar tus preferencias');
      },
    });
  }
}
