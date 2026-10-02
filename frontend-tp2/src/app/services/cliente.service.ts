import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente, ClientePayload } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/clientes';

  create(cliente: ClientePayload): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }
}