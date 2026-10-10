import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusUso } from '../models/status-uso.model';

@Injectable({ providedIn: 'root' })
export class StatusUsoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/status-usos';

  getAll(): Observable<StatusUso[]> {
    return this.http.get<StatusUso[]>(this.apiUrl);
  }
}
