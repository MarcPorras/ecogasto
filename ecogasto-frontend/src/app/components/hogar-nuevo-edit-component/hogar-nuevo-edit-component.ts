import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { forkJoin, of } from 'rxjs';
import { Hogar } from '../../model/hogar';
import { Recurso } from '../../model/recurso';
import { Zona } from '../../model/zona';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { HogarService } from '../../services/hogar-service';
import { RecursoService } from '../../services/recurso-service';
import { ZonaService } from '../../services/zona-service';
import { icono } from '../../util/consumo-util';

@Component({
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatInput, MatSelect, MatOption, MatCheckbox, MatButton],
  selector: 'app-hogar-nuevo-edit-component',
  styleUrl: './hogar-nuevo-edit-component.css',
  templateUrl: './hogar-nuevo-edit-component.html',
})
export class HogarNuevoEditComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private router: Router = inject(Router);
  private hogarService: HogarService = inject(HogarService);
  private recursoService: RecursoService = inject(RecursoService);
  private zonaService: ZonaService = inject(ZonaService);
  private dialogRef = inject(MatDialogRef<HogarNuevoEditComponent>, { optional: true });

  esDialogo = this.dialogRef !== null;
  recursos = signal<Recurso[]>([]);
  zonas = signal<Zona[]>([]);
  seleccionados = signal<number[]>([]);
  edicion = signal(false);
  cargando = signal(true);
  guardando = signal(false);
  errorServicios = signal(false);
  mensaje = signal('');
  icono = icono;

  form = this.fb.nonNullable.group({
    esPadre: [false],
    numPersonas: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    idZona: [null as number | null, Validators.required],
  });

  private hogarActual: Hogar | null = null;

  ngOnInit(): void {
    const hogar$ = this.auth.tieneHogar() ? this.hogarService.buscarPorUsuario(this.auth.idUsuario()) : of(null);
    forkJoin({ recursos: this.recursoService.list(), zonas: this.zonaService.list(), hogar: hogar$ }).subscribe({
      next: ({ recursos, zonas, hogar }) => {
        this.recursos.set(recursos);
        this.zonas.set(zonas);
        if (hogar) {
          this.hogarActual = hogar;
          this.edicion.set(true);
          this.seleccionados.set(hogar.recursos ?? []);
          this.form.patchValue({ esPadre: !!hogar.esPadre, numPersonas: hogar.numPersonas, idZona: hogar.idZona });
        }
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensaje.set(this.aviso.textoError(err, 'No se pudo cargar la información del hogar'));
      },
    });
  }

  estaMarcado(idRecurso: number): boolean {
    return this.seleccionados().includes(idRecurso);
  }

  alternar(idRecurso: number, marcado: boolean): void {
    this.seleccionados.update((lista) => (marcado ? [...lista, idRecurso] : lista.filter((id) => id !== idRecurso)));
    this.errorServicios.set(false);
  }

  guardar(): void {
    this.mensaje.set('');
    this.form.markAllAsTouched();
    if (this.seleccionados().length === 0) {
      this.errorServicios.set(true);
    }
    if (this.form.invalid || this.seleccionados().length === 0) {
      return;
    }
    const valores = this.form.getRawValue();
    const hogar: Hogar = {
      idHogar: this.hogarActual?.idHogar,
      idUsuario: this.auth.idUsuario(),
      idZona: valores.idZona as number,
      esPadre: valores.esPadre,
      numPersonas: valores.numPersonas,
      recursos: this.seleccionados(),
    };
    this.guardando.set(true);
    const peticion = this.edicion() ? this.hogarService.update(hogar) : this.hogarService.insert(hogar);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.auth.marcarHogarCreado();
        this.aviso.ok(this.edicion() ? 'Datos del hogar actualizados' : 'Hogar registrado. ¡Ya puedes registrar tu consumo!');
        this.dialogRef?.close(true);
        this.router.navigate(['/consumo']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.mensaje.set(this.aviso.textoError(err, 'No se pudo guardar el hogar'));
      },
    });
  }

  cancelar(): void {
    if (this.dialogRef) {
      if (!this.edicion()) {
        this.hogarService.limpiar();
        this.auth.limpiarSesion();
      }
      this.dialogRef.close(false);
      return;
    }
    if (this.auth.tieneHogar()) {
      this.router.navigate(['/consumo']);
    } else {
      this.hogarService.limpiar();
      this.auth.logout();
    }
  }
}