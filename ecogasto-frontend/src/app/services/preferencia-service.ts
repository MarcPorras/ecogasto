import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Preferencia } from '../model/preferencia';

@Service()
export class PreferenciaService {
  private httpClient: HttpClient = inject(HttpClient);

  listId(idUsuario: number): Observable<Preferencia> {
    return this.httpClient.get<Preferencia>(environment.apiUrl + '/preferencias/usuario/' + idUsuario);
  }

  update(idUsuario: number, preferencia: Preferencia): Observable<Preferencia> {
    return this.httpClient.put<Preferencia>(environment.apiUrl + '/preferencias/usuario/' + idUsuario, preferencia);
  }
}
