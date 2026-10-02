import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-customer-delete',
  imports: [CommonModule, RouterLink, EntityMenu],
  templateUrl: './customer-delete.html',
  styleUrl: '../task-board/task-board.css',
})
export class CustomerDelete {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ClienteService);
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly customer = signal<Cliente | null>(null);
  protected readonly isDeleting = signal(false);
  protected readonly errorMessage = signal('');

  constructor() {
    this.service.getById(this.id).subscribe({
      next: (customer) => this.customer.set(customer),
      error: () => this.errorMessage.set('Não foi possível carregar o cliente.'),
    });
  }

  protected remove(): void {
    this.isDeleting.set(true);
    this.service.delete(this.id).pipe(finalize(() => this.isDeleting.set(false))).subscribe({
      next: () => this.router.navigateByUrl('/clientes'),
      error: () => this.errorMessage.set('Não foi possível excluir o cliente.'),
    });
  }
}