import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Carro, CarroPayload } from '../models/car.model';

@Injectable({ providedIn: 'root' })
export class CarService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/carros';

  getAll(page = 0, pageSize = 100): Observable<Carro[]> {
    return this.http.get<Carro[]>(this.apiUrl, { params: { page, pageSize } });
  }

  getById(id: number): Observable<Carro> {
    return this.http.get<Carro>(`${this.apiUrl}/${id}`);
  }

  findByName(name: string, page = 0, pageSize = 100): Observable<Carro[]> {
    return this.http.get<Carro[]>(`${this.apiUrl}/nome/${encodeURIComponent(name)}`, { params: { page, pageSize } });
  }

  create(carro: CarroPayload): Observable<Carro> {
    return this.http.post<Carro>(this.apiUrl, carro);
  }

  update(id: number, carro: CarroPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, carro);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
