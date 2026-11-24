import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ecotip } from '../model/ecotip';
import { Mensaje } from '../model/mensaje';

@Service()
export class EcotipService {
  private httpClient: HttpClient = inject(HttpClient);

  list(): Observable<Ecotip[]> {
    return this.httpClient.get<Ecotip[]>(environment.apiUrl + '/ecotips');
  }

  listPorRecurso(idRecurso: number): Observable<Ecotip[]> {
    return this.httpClient.get<Ecotip[]>(environment.apiUrl + '/ecotips/recurso/' + idRecurso);
  }

  insert(tip: Ecotip): Observable<Ecotip> {
    return this.httpClient.post<Ecotip>(environment.apiUrl + '/ecotips', tip);
  }

  update(tip: Ecotip): Observable<Ecotip> {
    return this.httpClient.put<Ecotip>(environment.apiUrl + '/ecotips/' + tip.idTip, tip);
  }

  delete(id: number): Observable<Mensaje> {
    return this.httpClient.delete<Mensaje>(environment.apiUrl + '/ecotips/' + id);
  }
}
