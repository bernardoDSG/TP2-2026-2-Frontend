import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria, CategoriaPayload } from '../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/categorias';

  getAll(page = 0, pageSize = 100): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl, { params: { page, pageSize } });
  }

  getById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  findByName(name: string, page = 0, pageSize = 100): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/nome/${encodeURIComponent(name)}`, { params: { page, pageSize } });
  }

  create(categoria: CategoriaPayload): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  update(id: number, categoria: CategoriaPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, categoria);
  }

  delete(id: number, replacementCategoriaId?: number): Observable<void> {
    let params = new HttpParams();
    if (replacementCategoriaId !== undefined) params = params.set('replacementCategoriaId', replacementCategoriaId);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }
}
