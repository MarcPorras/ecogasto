import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Impacto } from '../model/impacto';
import { Comparacion } from '../model/comparacion';
import { PromedioZona } from '../model/promedio-zona';
import { Ranking } from '../model/ranking';
import { ResumenLogros } from '../model/resumen-logros';

@Service()
export class ReporteService {
  private httpClient: HttpClient = inject(HttpClient);
  private base = environment.apiUrl + '/reportes';

  impacto(idHogar: number, anio: number, mes: number): Observable<Impacto[]> {
    return this.httpClient.get<Impacto[]>(this.base + '/impacto/hogar/' + idHogar, { params: this.periodo(anio, mes) });
  }

  comparacionNacional(idHogar: number, anio: number, mes: number): Observable<Comparacion[]> {
    return this.httpClient.get<Comparacion[]>(this.base + '/comparacion-nacional/hogar/' + idHogar, {
      params: this.periodo(anio, mes),
    });
  }

  hogaresSimilares(idHogar: number, anio: number, mes: number): Observable<Comparacion[]> {
    return this.httpClient.get<Comparacion[]>(this.base + '/hogares-similares/hogar/' + idHogar, {
      params: this.periodo(anio, mes),
    });
  }

  promedioZona(idZona: number, anio: number): Observable<PromedioZona[]> {
    return this.httpClient.get<PromedioZona[]>(this.base + '/zona/' + idZona + '/promedio-mensual', {
      params: new HttpParams().set('anio', anio),
    });
  }

  ranking(zona: string, segmento: string): Observable<Ranking[]> {
    const params = new HttpParams().set('zona', zona).set('segmento', segmento);
    return this.httpClient.get<Ranking[]>(this.base + '/ranking', { params });
  }

  resumenLogros(idUsuario: number): Observable<ResumenLogros> {
    return this.httpClient.get<ResumenLogros>(this.base + '/resumen-logros/usuario/' + idUsuario);
  }

  private periodo(anio: number, mes: number): HttpParams {
    return new HttpParams().set('anio', anio).set('mes', mes);
  }
}
