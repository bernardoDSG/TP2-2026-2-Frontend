import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Carro } from '../../models/car.model';
import { CarService } from '../../services/car.service';

@Component({ selector: 'app-car-delete', imports: [CommonModule, RouterLink], templateUrl: './car-delete.html', styleUrl: '../task-board/task-board.css' })
export class CarDelete {
  private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly service = inject(CarService);
  protected readonly car = signal<Carro | null>(null); protected readonly isDeleting = signal(false); protected readonly errorMessage = signal('');
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));
  constructor() { this.service.getById(this.id).subscribe({ next: (car) => this.car.set(car), error: () => this.errorMessage.set('Não foi possível carregar o carro.') }); }
  protected remove(): void { this.isDeleting.set(true); this.service.delete(this.id).pipe(finalize(() => this.isDeleting.set(false))).subscribe({ next: () => this.router.navigateByUrl('/carros'), error: () => this.errorMessage.set('Não foi possível excluir o carro.') }); }
}
