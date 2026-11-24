import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tarifa } from '../model/tarifa';
import { Mensaje } from '../model/mensaje';

@Service()
export class TarifaService {
  private httpClient: HttpClient = inject(HttpClient);

  list(): Observable<Tarifa[]> {
    return this.httpClient.get<Tarifa[]>(environment.apiUrl + '/tarifas');
  }

  insert(tarifa: Tarifa): Observable<Tarifa> {
    return this.httpClient.post<Tarifa>(environment.apiUrl + '/tarifas', tarifa);
  }

  update(tarifa: Tarifa): Observable<Tarifa> {
    return this.httpClient.put<Tarifa>(environment.apiUrl + '/tarifas/' + tarifa.idTarifa, tarifa);
  }

  delete(id: number): Observable<Mensaje> {
    return this.httpClient.delete<Mensaje>(environment.apiUrl + '/tarifas/' + id);
  }
}
