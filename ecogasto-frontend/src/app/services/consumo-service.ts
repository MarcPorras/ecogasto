import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Consumo } from '../model/consumo';
import { SerieConsumo } from '../model/serie-consumo';
import { Mensaje } from '../model/mensaje';

@Service()
export class ConsumoService {
  private httpClient: HttpClient = inject(HttpClient);

  listPorHogar(idHogar: number): Observable<Consumo[]> {
    return this.httpClient.get<Consumo[]>(environment.apiUrl + '/consumos/hogar/' + idHogar);
  }

  serie(idHogar: number, idRecurso: number, anio: number): Observable<SerieConsumo[]> {
    const params = new HttpParams().set('anio', anio);
    return this.httpClient.get<SerieConsumo[]>(
      environment.apiUrl + '/consumos/hogar/' + idHogar + '/recurso/' + idRecurso + '/serie',
      { params },
    );
  }

  insert(consumo: Consumo): Observable<Consumo> {
    return this.httpClient.post<Consumo>(environment.apiUrl + '/consumos', consumo);
  }

  update(consumo: Consumo): Observable<Consumo> {
    return this.httpClient.put<Consumo>(environment.apiUrl + '/consumos/' + consumo.idConsumo, consumo);
  }

  delete(id: number): Observable<Mensaje> {
    return this.httpClient.delete<Mensaje>(environment.apiUrl + '/consumos/' + id);
  }
}
