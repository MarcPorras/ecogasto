import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { Ecotip } from '../../model/ecotip';
import { Recurso } from '../../model/recurso';
import { EcotipService } from '../../services/ecotip-service';
import { RecursoService } from '../../services/recurso-service';
import { AvisoService } from '../../services/aviso-service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatLabel, MatError, MatInput, MatSelect, MatOption, MatCheckbox],
  selector: 'app-admin-ecotip-nuevo-edit-component',
  styleUrl: '../admin-form.css',
  templateUrl: './admin-ecotip-nuevo-edit-component.html',
})
export class AdminEcotipNuevoEditComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private aviso: AvisoService = inject(AvisoService);
  private ecotipService: EcotipService = inject(EcotipService);
  private recursoService: RecursoService = inject(RecursoService);

  id = 0;
  edicion = false;
  guardando = signal(false);
  recursos = signal<Recurso[]>([]);
  segmentoOpciones = ['Todos', 'Padre de familia', 'Joven independiente'];

  form = this.fb.nonNullable.group({
    idRecurso: [0, [Validators.required, Validators.min(1)]],
    segmento: ['Todos', [Validators.required]],
    texto: ['', [Validators.required]],
    activo: [true],
  });

  ngOnInit(): void {
    const data = this.route.snapshot.params;
    this.edicion = data['id'] != null;
    this.id = Number(data['id']);
    this.recursoService.list().subscribe({ next: (lista) => this.recursos.set(lista), error: (err) => this.aviso.fallo(err, 'No se pudieron cargar los recursos') });
    if (this.edicion) {

      this.ecotipService.list().subscribe({
        next: (lista) => {
          const encontrado = lista.find((x) => x.idTip === this.id);
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
    this.router.navigate(['/admin/tips']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const payload = this.form.getRawValue();
    const o = this.edicion ? { ...payload, idTip: this.id } : payload;
    const peticion = this.edicion ? this.ecotipService.update(o) : this.ecotipService.insert(o);
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
