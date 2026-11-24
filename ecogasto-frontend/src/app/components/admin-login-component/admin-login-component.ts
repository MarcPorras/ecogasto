import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatFormField, MatLabel, MatError, MatPrefix, MatSuffix, MatInput, MatButton, MatIconButton, MatIcon],
  selector: 'app-admin-login-component',
  styleUrl: './admin-login-component.css',
  templateUrl: './admin-login-component.html',
})
export class AdminLoginComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private auth: LoginService = inject(LoginService);
  private router: Router = inject(Router);
  private aviso: AvisoService = inject(AvisoService);

  enviando = signal(false);
  ocultarPassword = signal(true);
  mensajeError = signal('');

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.auth.logueado() && this.auth.esAdmin()) {
      this.router.navigate(['/admin']);
    }
  }

  alternarPassword(): void {
    this.ocultarPassword.update((v) => !v);
  }

  ingresar(): void {
    this.mensajeError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (sesion) => {
        this.enviando.set(false);
        if (sesion.rol !== 'ADMIN') {
          this.auth.limpiarSesion();
          this.mensajeError.set('Acceso denegado: esta cuenta no cuenta con permisos de administrador.');
          return;
        }
        this.aviso.ok('Bienvenido al panel de administración');
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.enviando.set(false);
        this.mensajeError.set(this.aviso.textoError(err, 'Credenciales incorrectas'));
      },
    });
  }
}