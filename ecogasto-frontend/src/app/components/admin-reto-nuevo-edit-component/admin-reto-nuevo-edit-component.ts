import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { Reto } from '../../model/reto';
import { Recurso } from '../../model/recurso';
import { RetoService } from '../../services/reto-service';
import { RecursoService } from '../../services/recurso-service';
import { AvisoService } from '../../services/aviso-service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatLabel, MatError, MatInput, MatSelect, MatOption, MatCheckbox],
  selector: 'app-admin-reto-nuevo-edit-component',
  styleUrl: '../admin-form.css',
  templateUrl: './admin-reto-nuevo-edit-component.html',
})
export class AdminRetoNuevoEditComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private aviso: AvisoService = inject(AvisoService);
  private retoService: RetoService = inject(RetoService);
  private recursoService: RecursoService = inject(RecursoService);

  id = 0;
  edicion = false;
  guardando = signal(false);
  recursos = signal<Recurso[]>([]);

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    idRecurso: [0, [Validators.required, Validators.min(1)]],
    metaPorcentaje: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    puntos: [50, [Validators.required, Validators.min(1)]],
    activo: [true],
  });

  ngOnInit(): void {
    const data = this.route.snapshot.params;
    this.edicion = data['id'] != null;
    this.id = Number(data['id']);
    this.recursoService.list().subscribe({ next: (lista) => this.recursos.set(lista), error: (err) => this.aviso.fallo(err, 'No se pudieron cargar los recursos') });
    if (this.edicion) {

      this.retoService.list().subscribe({
        next: (lista) => {
          const encontrado = lista.find((x) => x.idReto === this.id);
          if (encontrado) {
            this.form.patchValue(encontrado);
          } else {
            this.aviso.alerta('No se encontró el registro');
            this.volver();
          }
        },
        error: (err) => this.aviso.fallo(err, 'No se pudo cargar el registro'),
      });
    }
  }

  volver(): void {
    this.router.navigate(['/admin/retos']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const payload = this.form.getRawValue();
    const o = this.edicion ? { ...payload, idReto: this.id } : payload;
    const peticion = this.edicion ? this.retoService.update(o) : this.retoService.insert(o);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.aviso.ok(this.edicion ? 'Registro actualizado' : 'Registro creado');
        this.volver();
      },
      error: (err) => {
        this.guardando.set(false);
        this.aviso.fallo(err, 'No se pudo guardar');
      },
    });
  }
}
