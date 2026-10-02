import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Estado, EstadoPayload } from '../models/address-catalog.model';

@Injectable({ providedIn: 'root' })
export class EstadoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/estados';

  getAll(): Observable<Estado[]> { return this.http.get<Estado[]>(this.apiUrl); }
  getById(id: number): Observable<Estado> { return this.http.get<Estado>(`${this.apiUrl}/${id}`); }
  create(payload: EstadoPayload): Observable<Estado> { return this.http.post<Estado>(this.apiUrl, payload); }
  update(id: number, payload: EstadoPayload): Observable<Estado> { return this.http.put<Estado>(`${this.apiUrl}/${id}`, payload); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}