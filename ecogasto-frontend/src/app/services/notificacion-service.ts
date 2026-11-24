import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notificacion } from '../model/notificacion';
import { Mensaje } from '../model/mensaje';

@Service()
export class NotificacionService {
  private httpClient: HttpClient = inject(HttpClient);
  private base = environment.apiUrl + '/notificaciones/usuario/';

  readonly noLeidas = signal(0);

  list(idUsuario: number): Observable<Notificacion[]> {
    return this.httpClient
      .get<Notificacion[]>(this.base + idUsuario)
      .pipe(tap((lista) => this.noLeidas.set(lista.filter((n) => !n.leida).length)));
  }

  marcarLeidas(idUsuario: number): Observable<Mensaje> {
    return this.httpClient.put<Mensaje>(this.base + idUsuario + '/leidas', {});
  }

  eliminarTodas(idUsuario: number): Observable<Mensaje> {
    return this.httpClient.delete<Mensaje>(this.base + idUsuario);
  }

  reiniciar(): void {
    this.noLeidas.set(0);
  }
}
