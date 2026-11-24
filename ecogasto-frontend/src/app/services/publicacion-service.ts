import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Publicacion } from '../model/publicacion';
import { Mensaje } from '../model/mensaje';

@Service()
export class PublicacionService {
  private httpClient: HttpClient = inject(HttpClient);

  list(): Observable<Publicacion[]> {
    return this.httpClient.get<Publicacion[]>(environment.apiUrl + '/publicaciones');
  }

  insert(publicacion: Publicacion): Observable<Publicacion> {
    return this.httpClient.post<Publicacion>(environment.apiUrl + '/publicaciones', publicacion);
  }

  delete(id: number): Observable<Mensaje> {
    return this.httpClient.delete<Mensaje>(environment.apiUrl + '/publicaciones/' + id);
  }
}
