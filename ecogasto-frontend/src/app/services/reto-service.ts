import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reto } from '../model/reto';
import { RetoUsuario } from '../model/reto-usuario';
import { CompletarReto } from '../model/completar-reto';
import { Insignia } from '../model/insignia';
import { Mensaje } from '../model/mensaje';

@Service()
export class RetoService {
  private httpClient: HttpClient = inject(HttpClient);

  list(): Observable<Reto[]> {
    return this.httpClient.get<Reto[]>(environment.apiUrl + '/retos');
  }

  listActivos(): Observable<Reto[]> {
    return this.httpClient.get<Reto[]>(environment.apiUrl + '/retos/activos');
  }

  insert(reto: Reto): Observable<Reto> {
    return this.httpClient.post<Reto>(environment.apiUrl + '/retos', reto);
  }

  update(reto: Reto): Observable<Reto> {
    return this.httpClient.put<Reto>(environment.apiUrl + '/retos/' + reto.idReto, reto);
  }

  delete(id: number): Observable<Mensaje> {
    return this.httpClient.delete<Mensaje>(environment.apiUrl + '/retos/' + id);
  }

  unirse(idUsuario: number, idReto: number): Observable<RetoUsuario> {
    return this.httpClient.post<RetoUsuario>(environment.apiUrl + '/retos-usuario', { idUsuario, idReto });
  }

  misRetos(idUsuario: number): Observable<RetoUsuario[]> {
    return this.httpClient.get<RetoUsuario[]>(environment.apiUrl + '/retos-usuario/usuario/' + idUsuario);
  }

  completar(idRetoUsuario: number): Observable<CompletarReto> {
    return this.httpClient.put<CompletarReto>(environment.apiUrl + '/retos-usuario/' + idRetoUsuario + '/completar', {});
  }

  misInsignias(idUsuario: number): Observable<Insignia[]> {
    return this.httpClient.get<Insignia[]>(environment.apiUrl + '/insignias/usuario/' + idUsuario);
  }
}
