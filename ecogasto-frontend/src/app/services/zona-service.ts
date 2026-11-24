import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Zona } from '../model/zona';
import { Mensaje } from '../model/mensaje';

@Service()
export class ZonaService {
  private httpClient: HttpClient = inject(HttpClient);

  list(): Observable<Zona[]> {
    return this.httpClient.get<Zona[]>(environment.apiUrl + '/zonas');
  }

  listTodas(): Observable<Zona[]> {
    return this.httpClient.get<Zona[]>(environment.apiUrl + '/zonas/todas');
  }

  insert(zona: Zona): Observable<Zona> {
    return this.httpClient.post<Zona>(environment.apiUrl + '/zonas', zona);
  }

  update(zona: Zona): Observable<Zona> {
    return this.httpClient.put<Zona>(environment.apiUrl + '/zonas/' + zona.idZona, zona);
  }

  delete(id: number): Observable<Mensaje> {
    return this.httpClient.delete<Mensaje>(environment.apiUrl + '/zonas/' + id);
  }
}
