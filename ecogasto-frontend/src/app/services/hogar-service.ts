import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Hogar } from '../model/hogar';

@Service()
export class HogarService {
  private httpClient: HttpClient = inject(HttpClient);

  readonly hogar = signal<Hogar | null>(null);

  buscarPorUsuario(idUsuario: number): Observable<Hogar> {
    return this.httpClient
      .get<Hogar>(environment.apiUrl + '/hogares/usuario/' + idUsuario)
      .pipe(tap((hogar) => this.hogar.set(hogar)));
  }

  asegurar(idUsuario: number): Observable<Hogar> {
    const actual = this.hogar();
    return actual ? of(actual) : this.buscarPorUsuario(idUsuario);
  }

  insert(hogar: Hogar): Observable<Hogar> {
    return this.httpClient
      .post<Hogar>(environment.apiUrl + '/hogares', hogar)
      .pipe(tap((creado) => this.hogar.set(creado)));
  }

  update(hogar: Hogar): Observable<Hogar> {
    return this.httpClient
      .put<Hogar>(environment.apiUrl + '/hogares/' + hogar.idHogar, hogar)
      .pipe(tap((actualizado) => this.hogar.set(actualizado)));
  }

  limpiar(): void {
    this.hogar.set(null);
  }
}
