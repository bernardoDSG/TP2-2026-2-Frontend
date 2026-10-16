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

  findByColor(colorId: number, page = 0, pageSize = 100): Observable<Carro[]> {
    return this.http.get<Carro[]>(`${this.apiUrl}/cor/${colorId}`, { params: { page, pageSize } });
  }

  findByStatus(statusId: number, page = 0, pageSize = 100): Observable<Carro[]> {
    return this.http.get<Carro[]>(`${this.apiUrl}/status-uso/${statusId}`, { params: { page, pageSize } });
  }

  findByBrand(brandId: number, page = 0, pageSize = 100): Observable<Carro[]> {
    return this.http.get<Carro[]>(`${this.apiUrl}/marca/${brandId}`, { params: { page, pageSize } });
  }

  findByCategory(categoryId: number, page = 0, pageSize = 100): Observable<Carro[]> {
    return this.http.get<Carro[]>(`${this.apiUrl}/categoria/${categoryId}`, { params: { page, pageSize } });
  }

  create(carro: CarroPayload): Observable<Carro> {
    return this.http.post<Carro>(this.apiUrl, carro);
  }

  uploadImage(id: number, image: File): Observable<void> {
    const data = new FormData();
    data.append('imagem', image, image.name);
    return this.http.post<void>(`${this.apiUrl}/${id}/imagem`, data);
  }

  deleteImage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/imagem`);
  }

  update(id: number, carro: CarroPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, carro);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
