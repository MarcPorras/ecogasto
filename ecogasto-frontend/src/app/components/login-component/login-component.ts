import { Component, inject, input, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { TerminosDialogo } from '../terminos-dialogo/terminos-dialogo';
import { HogarNuevoEditComponent } from '../hogar-nuevo-edit-component/hogar-nuevo-edit-component';

const PATRON_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function coincidenPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmar = control.get('confirmarPassword')?.value;
  return password === confirmar ? null : { noCoinciden: true };
}

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login-component',
  styleUrl: './login-component.css',
  templateUrl: './login-component.html',
})
export class LoginComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private auth: LoginService = inject(LoginService);
  private router: Router = inject(Router);
  private dialog: MatDialog = inject(MatDialog);
  private aviso: AvisoService = inject(AvisoService);

  embebido = input(false);
  modoRegistro = signal(false);
  enviando = signal(false);
  mensajeLogin = signal('');
  mensajeRegistro = signal('');
  registroExitoso = signal(false);
  intentoRegistro = signal(false);

  formLogin = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  formRegistro = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(40)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(PATRON_PASSWORD)]],
      confirmarPassword: ['', Validators.required],
      aceptaTerminos: [false, Validators.requiredTrue],
    },
    { validators: coincidenPasswords },
  );

  ngOnInit(): void {
    if (!this.embebido() && this.auth.logueado()) {
      this.auth.limpiarSesion();
    }
  }

  cambiarModo(registro: boolean): void {
    this.modoRegistro.set(registro);
    this.mensajeLogin.set('');
    this.mensajeRegistro.set('');
    this.registroExitoso.set(false);
  }

  verTerminos(evento: Event): void {
    evento.preventDefault();
    this.dialog.open(TerminosDialogo);
  }

  olvideContrasena(evento: Event): void {
    evento.preventDefault();
    this.aviso.alerta('Para recuperar tu contraseña comunícate con el administrador de EcoGasto.');
  }

  iniciarSesion(): void {
    this.mensajeLogin.set('');
    if (this.formLogin.invalid) {
      this.mensajeLogin.set('Ingresa tu usuario y contraseña.');
      return;
    }
    this.enviando.set(true);
    this.auth.login(this.formLogin.getRawValue()).subscribe({
      next: (sesion) => {
        this.enviando.set(false);
        if (sesion.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (sesion.tieneHogar) {
          this.router.navigate(['/consumo']);
        } else {
          this.dialog.open(HogarNuevoEditComponent, {
            width: '560px',
            maxWidth: '94vw',
            disableClose: true,
          });
        }
      },
      error: (err) => {
        this.enviando.set(false);
        this.mensajeLogin.set(this.aviso.textoError(err, 'No se pudo iniciar sesión'));
      },
    });
  }

  registrarse(): void {
    this.intentoRegistro.set(true);
    this.mensajeRegistro.set('');
    this.registroExitoso.set(false);
    if (this.formRegistro.invalid) {
      return;
    }
    this.enviando.set(true);
    this.auth.registrar(this.formRegistro.getRawValue()).subscribe({
      next: () => {
        this.enviando.set(false);
        const username = this.formRegistro.controls.username.value;
        this.formRegistro.reset({ aceptaTerminos: false });
        this.intentoRegistro.set(false);
        this.formLogin.reset({ username, password: '' });
        this.registroExitoso.set(true);
        this.aviso.ok('¡Registro exitoso! Ya puedes iniciar sesión.');
        this.modoRegistro.set(false);
        this.mensajeLogin.set('');
      },
      error: (err) => {
        this.enviando.set(false);
        this.mensajeRegistro.set(this.aviso.textoError(err, 'No se pudo completar el registro'));
      },
    });
  }

  errorUsuario(): string {
    const c = this.formRegistro.controls.username;
    if (c.hasError('required')) return 'El usuario es obligatorio';
    if (c.hasError('minlength') || c.hasError('maxlength')) return 'Debe tener entre 4 y 40 caracteres';
    return '';
  }

  errorEmail(): string {
    const c = this.formRegistro.controls.email;
    if (c.hasError('required')) return 'El email es obligatorio';
    if (c.hasError('email')) return 'Email inválido';
    return '';
  }

  errorPassword(): string {
    const c = this.formRegistro.controls.password;
    if (c.hasError('required')) return 'La contraseña es obligatoria';
    if (c.hasError('pattern')) return 'Mínimo 8 caracteres, con mayúscula, minúscula y número';
    return '';
  }

  errorConfirmar(): string {
    const c = this.formRegistro.controls.confirmarPassword;
    if (c.hasError('required')) return 'Confirma tu contraseña';
    if (this.formRegistro.hasError('noCoinciden')) return 'Las contraseñas no coinciden';
    return '';
  }

  errorTerminos(): string {
    return this.formRegistro.controls.aceptaTerminos.hasError('required') ? 'Debes aceptar los términos y condiciones' : '';
  }
}