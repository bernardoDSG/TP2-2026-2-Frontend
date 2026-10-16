import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Setor, SetorPayload, Vaga, VagaPayload } from '../models/yard.model';

@Injectable({ providedIn: 'root' })
export class YardService {
  private readonly http = inject(HttpClient);
  private readonly sectorsUrl = 'http://localhost:8080/setores';
  private readonly slotsUrl = 'http://localhost:8080/vagas';

  getSectors(): Observable<Setor[]> {
    return this.http.get<Setor[]>(this.sectorsUrl);
  }

  getSlots(): Observable<Vaga[]> {
    return this.http.get<Vaga[]>(this.slotsUrl);
  }

  createSector(payload: SetorPayload): Observable<Setor> {
    return this.http.post<Setor>(this.sectorsUrl, payload);
  }

  updateSector(id: number, payload: SetorPayload): Observable<Setor> {
    return this.http.put<Setor>(`${this.sectorsUrl}/${id}`, payload);
  }

  deleteSector(id: number): Observable<void> {
    return this.http.delete<void>(`${this.sectorsUrl}/${id}`);
  }

  createSlot(payload: VagaPayload): Observable<Vaga> {
    return this.http.post<Vaga>(this.slotsUrl, payload);
  }

  updateSlot(id: number, payload: VagaPayload): Observable<Vaga> {
    return this.http.put<Vaga>(`${this.slotsUrl}/${id}`, payload);
  }

  deleteSlot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.slotsUrl}/${id}`);
  }
}
