import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Marca, MarcaPayload } from '../models/marca.model';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/marcas';

  getAll(page = 0, pageSize = 100): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.apiUrl, { params: { page, pageSize } });
  }

  getById(id: number): Observable<Marca> {
    return this.http.get<Marca>(`${this.apiUrl}/${id}`);
  }

  findByName(name: string, page = 0, pageSize = 100): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.apiUrl}/nome/${encodeURIComponent(name)}`, { params: { page, pageSize } });
  }

  create(marca: MarcaPayload): Observable<Marca> {
    return this.http.post<Marca>(this.apiUrl, marca);
  }

  update(id: number, marca: MarcaPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, marca);
  }

  delete(id: number, replacementMarcaId?: number): Observable<void> {
    let params = new HttpParams();
    if (replacementMarcaId !== undefined) params = params.set('replacementMarcaId', replacementMarcaId);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }
}
