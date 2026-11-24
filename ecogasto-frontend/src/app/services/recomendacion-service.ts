import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recomendacion } from '../model/recomendacion';

@Service()
export class RecomendacionService {
  private httpClient: HttpClient = inject(HttpClient);

  personalizada(idUsuario: number): Observable<Recomendacion> {
    return this.httpClient.get<Recomendacion>(environment.apiUrl + '/recomendaciones/personalizada/usuario/' + idUsuario);
  }

  valorar(idRecomendacion: number, util: boolean): Observable<Recomendacion> {
    return this.httpClient.put<Recomendacion>(environment.apiUrl + '/recomendaciones/' + idRecomendacion + '/valoracion', { util });
  }
}
