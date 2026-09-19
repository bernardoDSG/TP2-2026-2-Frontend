import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Color, ColorPayload } from '../models/color.model';

@Injectable({ providedIn: 'root' })
export class ColorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/cores';

  getAll(page = 0, pageSize = 100): Observable<Color[]> {
    return this.http.get<Color[]>(this.apiUrl, { params: { page, pageSize } });
  }

  findByName(name: string, page = 0, pageSize = 100): Observable<Color[]> {
    return this.http.get<Color[]>(`${this.apiUrl}/nome/${encodeURIComponent(name)}`, { params: { page, pageSize } });
  }

  create(color: ColorPayload): Observable<Color> {
    return this.http.post<Color>(this.apiUrl, color);
  }

  update(id: number, color: ColorPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, color);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
