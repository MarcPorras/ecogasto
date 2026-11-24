import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Indicadores } from '../model/indicadores';
import { NivelConsumo } from '../model/nivel-consumo';
import { Carencia } from '../model/carencia';
import { PromedioZona } from '../model/promedio-zona';
import { Auditoria } from '../model/auditoria';
import { Usuario } from '../model/usuario';
import { Consumo } from '../model/consumo';
import { Mensaje } from '../model/mensaje';

@Service()
export class AdminService {
  private httpClient: HttpClient = inject(HttpClient);
  private base = environment.apiUrl + '/admin';

  indicadores(): Observable<Indicadores> {
    return this.httpClient.get<Indicadores>(this.base + '/reportes/indicadores');
  }

  nivelConsumo(): Observable<NivelConsumo[]> {
    return this.httpClient.get<NivelConsumo[]>(this.base + '/reportes/nivel-consumo');
  }

  carencias(): Observable<Carencia[]> {
    return this.httpClient.get<Carencia[]>(this.base + '/reportes/carencias-zona');
  }

  promedioMensual(anio: number): Observable<PromedioZona[]> {
    return this.httpClient.get<PromedioZona[]>(this.base + '/reportes/promedio-mensual', {
      params: new HttpParams().set('anio', anio),
    });
  }

  auditoria(): Observable<Auditoria[]> {
    return this.httpClient.get<Auditoria[]>(this.base + '/auditoria');
  }

  listUsuarios(): Observable<Usuario[]> {
    return this.httpClient.get<Usuario[]>(this.base + '/usuarios');
  }

  insertUsuario(usuario: Usuario): Observable<Usuario> {
    return this.httpClient.post<Usuario>(this.base + '/usuarios', usuario);
  }

  updateUsuario(usuario: Usuario): Observable<Usuario> {
    return this.httpClient.put<Usuario>(this.base + '/usuarios/' + usuario.idUsuario, usuario);
  }

  deleteUsuario(id: number): Observable<Mensaje> {
    return this.httpClient.delete<Mensaje>(this.base + '/usuarios/' + id);
  }

  listConsumos(): Observable<Consumo[]> {
    return this.httpClient.get<Consumo[]>(this.base + '/consumos');
  }

  insertConsumo(consumo: Consumo): Observable<Consumo> {
    return this.httpClient.post<Consumo>(this.base + '/consumos', consumo);
  }

  updateConsumo(consumo: Consumo): Observable<Consumo> {
    return this.httpClient.put<Consumo>(this.base + '/consumos/' + consumo.idConsumo, consumo);
  }

  deleteConsumo(id: number): Observable<Mensaje> {
    return this.httpClient.delete<Mensaje>(this.base + '/consumos/' + id);
  }
}
