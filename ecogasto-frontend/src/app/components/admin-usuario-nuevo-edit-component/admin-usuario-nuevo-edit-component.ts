import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { Usuario } from '../../model/usuario';
import { AdminService } from '../../services/admin-service';
import { AvisoService } from '../../services/aviso-service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatLabel, MatError, MatInput, MatSelect, MatOption, MatCheckbox],
  selector: 'app-admin-usuario-nuevo-edit-component',
  styleUrl: '../admin-form.css',
  templateUrl: './admin-usuario-nuevo-edit-component.html',
})
export class AdminUsuarioNuevoEditComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private aviso: AvisoService = inject(AvisoService);
  private adminService: AdminService = inject(AdminService);

  id = 0;
  edicion = false;
  guardando = signal(false);
  segmentoOpciones = ['Padre de familia', 'Joven independiente'];
  rolOpciones = ['USER', 'ADMIN'];

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    nombreCompleto: [''],
    segmento: [''],
    rol: ['USER', [Validators.required]],
    activo: [true],
  });

  ngOnInit(): void {
    const data = this.route.snapshot.params;
    this.edicion = data['id'] != null;
    this.id = Number(data['id']);
    if (!this.edicion) {
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    }
    if (this.edicion) {

      this.adminService.listUsuarios().subscribe({
        next: (lista) => {
          const encontrado = lista.find((x) => x.idUsuario === this.id);
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
    this.router.navigate(['/admin/usuarios']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const { password, ...resto } = this.form.getRawValue();
    const payload = password ? { ...resto, password } : resto;
    const o = this.edicion ? { ...payload, idUsuario: this.id } : payload;
    const peticion = this.edicion ? this.adminService.updateUsuario(o) : this.adminService.insertUsuario(o);
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
