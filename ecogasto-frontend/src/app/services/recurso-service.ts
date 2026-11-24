import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recurso } from '../model/recurso';

@Service()
export class RecursoService {
  private httpClient: HttpClient = inject(HttpClient);

  list(): Observable<Recurso[]> {
    return this.httpClient.get<Recurso[]>(environment.apiUrl + '/recursos');
  }
}
