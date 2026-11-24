import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { Tarifa } from '../../model/tarifa';
import { Recurso } from '../../model/recurso';
import { Zona } from '../../model/zona';
import { TarifaService } from '../../services/tarifa-service';
import { RecursoService } from '../../services/recurso-service';
import { ZonaService } from '../../services/zona-service';
import { AvisoService } from '../../services/aviso-service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatLabel, MatError, MatInput, MatSelect, MatOption],
  selector: 'app-admin-tarifa-nuevo-edit-component',
  styleUrl: '../admin-form.css',
  templateUrl: './admin-tarifa-nuevo-edit-component.html',
})
export class AdminTarifaNuevoEditComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private aviso: AvisoService = inject(AvisoService);
  private tarifaService: TarifaService = inject(TarifaService);
  private recursoService: RecursoService = inject(RecursoService);
  private zonaService: ZonaService = inject(ZonaService);

  id = 0;
  edicion = false;
  guardando = signal(false);
  recursos = signal<Recurso[]>([]);
  zonas = signal<Zona[]>([]);

  form = this.fb.nonNullable.group({
    idRecurso: [0, [Validators.required, Validators.min(1)]],
    idZona: [0, [Validators.required, Validators.min(1)]],
    tarifa: [0, [Validators.required, Validators.min(0)]],
    umbralBajo: [0, [Validators.required, Validators.min(0)]],
    umbralAlto: [0, [Validators.required, Validators.min(0)]],
    promedioNacional: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    const data = this.route.snapshot.params;
    this.edicion = data['id'] != null;
    this.id = Number(data['id']);
    this.recursoService.list().subscribe({ next: (lista) => this.recursos.set(lista), error: (err) => this.aviso.fallo(err, 'No se pudieron cargar los recursos') });
    this.zonaService.listTodas().subscribe({ next: (lista) => this.zonas.set(lista), error: (err) => this.aviso.fallo(err, 'No se pudieron cargar las zonas') });
    if (this.edicion) {

      this.tarifaService.list().subscribe({
        next: (lista) => {
          const encontrado = lista.find((x) => x.idTarifa === this.id);
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
    this.router.navigate(['/admin/tarifas']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const payload = this.form.getRawValue();
    const o = this.edicion ? { ...payload, idTarifa: this.id } : payload;
    const peticion = this.edicion ? this.tarifaService.update(o) : this.tarifaService.insert(o);
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
