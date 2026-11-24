import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Publicacion } from '../../model/publicacion';
import { LoginService } from '../../services/login-service';
import { AvisoService } from '../../services/aviso-service';
import { PublicacionService } from '../../services/publicacion-service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-social-fotos-component',
  styleUrl: './social-fotos-component.css',
  templateUrl: './social-fotos-component.html',
})
export class SocialFotosComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private auth: LoginService = inject(LoginService);
  private aviso: AvisoService = inject(AvisoService);
  private publicacionService: PublicacionService = inject(PublicacionService);

  lista = signal<Publicacion[]>([]);
  enviando = signal(false);
  mensaje = signal('');
  vistaPrevia = signal('');
  vistaRota = signal(false);

  form = this.fb.nonNullable.group({
    imagenUrl: [''],
    contenido: [''],
  });

  fotos = computed(() => this.lista().filter((p) => !!p.imagenUrl));

  ideas = [
    { imagen: 'images/cultivando.jpg', titulo: 'Mi jardín sostenible', texto: 'Cultivando mis propias verduras 🌱', alt: 'Huerto en casa' },
    { imagen: 'images/panelsolar.jpg.webp', titulo: 'Panel solar instalado', texto: '¡Energía limpia en casa! ☀️', alt: 'Panel solar' },
    { imagen: 'images/bicicleta.jpg', titulo: 'Transporte ecológico', texto: 'Al trabajo en bicicleta 🚴‍♂️', alt: 'Bicicleta' },
  ];

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.publicacionService.list().subscribe({
      next: (lista) => this.lista.set(lista),
      error: (err) => this.aviso.fallo(err, 'No se pudieron cargar las fotos'),
    });
  }

  previsualizar(): void {
    const url = this.form.controls.imagenUrl.value.trim();
    this.vistaRota.set(false);
    this.vistaPrevia.set(/^https?:\/\//i.test(url) ? url : '');
  }

  publicar(): void {
    this.mensaje.set('');
    const { imagenUrl, contenido } = this.form.getRawValue();
    if (!/^https?:\/\//i.test(imagenUrl.trim())) {
      this.mensaje.set('Pega la dirección (URL) de una foto que empiece con http o https');
      return;
    }
    if (contenido.trim().length === 0) {
      this.mensaje.set('Describe tu acción sostenible');
      return;
    }
    this.enviando.set(true);
    const publicacion: Publicacion = { idUsuario: this.auth.idUsuario(), contenido: contenido.trim(), imagenUrl: imagenUrl.trim() };
    this.publicacionService.insert(publicacion).subscribe({
      next: () => {
        this.enviando.set(false);
        this.form.reset({ imagenUrl: '', contenido: '' });
        this.vistaPrevia.set('');
        this.aviso.ok('Foto compartida con la comunidad');
        this.cargar();
      },
      error: (err) => {
        this.enviando.set(false);
        this.mensaje.set(this.aviso.textoError(err, 'No se pudo publicar la foto'));
      },
    });
  }
}
