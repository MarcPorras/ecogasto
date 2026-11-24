import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Zona } from '../../model/zona';
import { ZonaService } from '../../services/zona-service';
import { AvisoService } from '../../services/aviso-service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatLabel, MatError, MatInput, MatCheckbox],
  selector: 'app-admin-zona-nuevo-edit-component',
  styleUrl: '../admin-form.css',
  templateUrl: './admin-zona-nuevo-edit-component.html',
})
export class AdminZonaNuevoEditComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private aviso: AvisoService = inject(AvisoService);
  private zonaService: ZonaService = inject(ZonaService);

  id = 0;
  edicion = false;
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    descripcion: [''],
    activa: [true],
  });

  ngOnInit(): void {
    const data = this.route.snapshot.params;
    this.edicion = data['id'] != null;
    this.id = Number(data['id']);
    if (this.edicion) {

      this.zonaService.listTodas().subscribe({
        next: (lista) => {
          const encontrado = lista.find((x) => x.idZona === this.id);
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
    this.router.navigate(['/admin/zonas']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const payload = this.form.getRawValue();
    const o = this.edicion ? { ...payload, idZona: this.id } : payload;
    const peticion = this.edicion ? this.zonaService.update(o) : this.zonaService.insert(o);
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
