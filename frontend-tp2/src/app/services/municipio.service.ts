import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Municipio, MunicipioPayload } from '../models/address-catalog.model';

@Injectable({ providedIn: 'root' })
export class MunicipioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/municipios';

  getAll(): Observable<Municipio[]> { return this.http.get<Municipio[]>(this.apiUrl); }
  getById(id: number): Observable<Municipio> { return this.http.get<Municipio>(`${this.apiUrl}/${id}`); }
  create(payload: MunicipioPayload): Observable<Municipio> { return this.http.post<Municipio>(this.apiUrl, payload); }
  update(id: number, payload: MunicipioPayload): Observable<Municipio> { return this.http.put<Municipio>(`${this.apiUrl}/${id}`, payload); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}