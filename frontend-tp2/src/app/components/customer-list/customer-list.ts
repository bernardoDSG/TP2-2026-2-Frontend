import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-customer-list',
  imports: [CommonModule, RouterLink, EntityMenu],
  templateUrl: './customer-list.html',
  styleUrl: '../task-board/task-board.css',
})
export class CustomerList {
  private readonly service = inject(ClienteService);
  protected readonly customers = signal<Cliente[]>([]);
  protected readonly errorMessage = signal('');

  constructor() {
    this.load();
  }

  private load(): void {
    this.service.getAll().subscribe({
      next: (customers) => this.customers.set(customers),
      error: () => this.errorMessage.set('Não foi possível carregar os clientes.'),
    });
  }

}