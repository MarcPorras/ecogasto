import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Publicacion } from '../../model/publicacion';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { PublicacionService } from '../../services/publicacion-service';
import { ConfirmDialogo } from '../confirm-dialogo/confirm-dialogo';

@Component({
  imports: [ReactiveFormsModule, DatePipe],
  selector: 'app-social-comunidad-component',
  styleUrl: './social-comunidad-component.css',
  templateUrl: './social-comunidad-component.html',
})
export class SocialComunidadComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private dialog: MatDialog = inject(MatDialog);
  private publicacionService: PublicacionService = inject(PublicacionService);

  lista = signal<Publicacion[]>([]);
  cargando = signal(true);
  enviando = signal(false);
  mensaje = signal('');
  idUsuario = this.auth.idUsuario();

  form = this.fb.nonNullable.group({
    contenido: ['', [Validators.required, Validators.maxLength(500)]],
    imagenUrl: [''],
  });

  longitud = computed(() => this.form.controls.contenido.value.length);

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.publicacionService.list().subscribe({
      next: (lista) => {
        this.lista.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.aviso.fallo(err, 'No se pudo cargar la comunidad');
      },
    });
  }

  iniciales(nombre: string | undefined): string {
    return (nombre ?? '?').slice(0, 2).toUpperCase();
  }

  publicar(): void {
    this.mensaje.set('');
    const { contenido, imagenUrl } = this.form.getRawValue();
    if (contenido.trim().length === 0) {
      this.mensaje.set('Escribe algo para publicar');
      return;
    }
    if (contenido.length > 500) {
      this.mensaje.set('Máximo 500 caracteres');
      return;
    }
    this.enviando.set(true);
    const publicacion: Publicacion = { idUsuario: this.idUsuario, contenido: contenido.trim(), imagenUrl: imagenUrl.trim() || undefined };
    this.publicacionService.insert(publicacion).subscribe({
      next: () => {
        this.enviando.set(false);
        this.form.reset({ contenido: '', imagenUrl: '' });
        this.aviso.ok('Publicación compartida con la comunidad');
        this.cargar();
      },
      error: (err) => {
        this.enviando.set(false);
        this.mensaje.set(this.aviso.textoError(err, 'No se pudo publicar'));
      },
    });
  }

  borrar(publicacion: Publicacion): void {
    this.dialog
      .open(ConfirmDialogo, { data: { titulo: 'Eliminar publicación', mensaje: '¿Eliminar esta publicación?' } })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.publicacionService.delete(publicacion.idPublicacion!).subscribe({
          next: () => {
            this.aviso.ok('Publicación eliminada');
            this.cargar();
          },
          error: (err) => this.aviso.fallo(err, 'No se pudo eliminar la publicación'),
        });
      });
  }
}
