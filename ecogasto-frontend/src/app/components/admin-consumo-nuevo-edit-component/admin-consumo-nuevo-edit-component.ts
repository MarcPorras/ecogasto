import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { Consumo } from '../../model/consumo';
import { Recurso } from '../../model/recurso';
import { AdminService } from '../../services/admin-service';
import { RecursoService } from '../../services/recurso-service';
import { AvisoService } from '../../services/aviso-service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatLabel, MatError, MatInput, MatSelect, MatOption],
  selector: 'app-admin-consumo-nuevo-edit-component',
  styleUrl: '../admin-form.css',
  templateUrl: './admin-consumo-nuevo-edit-component.html',
})
export class AdminConsumoNuevoEditComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private aviso: AvisoService = inject(AvisoService);
  private adminService: AdminService = inject(AdminService);
  private recursoService: RecursoService = inject(RecursoService);

  id = 0;
  edicion = false;
  guardando = signal(false);
  recursos = signal<Recurso[]>([]);

  form = this.fb.nonNullable.group({
    idHogar: [0, [Validators.required, Validators.min(1)]],
    idRecurso: [0, [Validators.required, Validators.min(1)]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(2024)]],
    mes: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    valor: [0, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit(): void {
    const data = this.route.snapshot.params;
    this.edicion = data['id'] != null;
    this.id = Number(data['id']);
    this.recursoService.list().subscribe({ next: (lista) => this.recursos.set(lista), error: (err) => this.aviso.fallo(err, 'No se pudieron cargar los recursos') });
    if (this.edicion) {
      this.form.controls.idHogar.disable();
      this.form.controls.idRecurso.disable();
      this.form.controls.anio.disable();
      this.form.controls.mes.disable();
      this.adminService.listConsumos().subscribe({
        next: (lista) => {
          const encontrado = lista.find((x) => x.idConsumo === this.id);
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
    this.router.navigate(['/admin/consumos']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const payload = this.form.getRawValue();
    const o = this.edicion ? { ...payload, idConsumo: this.id } : payload;
    const peticion = this.edicion ? this.adminService.updateConsumo(o) : this.adminService.insertConsumo(o);
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
