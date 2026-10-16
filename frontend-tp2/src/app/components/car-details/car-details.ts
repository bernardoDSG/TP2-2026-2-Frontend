import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Carro } from '../../models/car.model';
import { CarService } from '../../services/car.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-car-details',
  imports: [CommonModule, RouterLink, EntityMenu],
  templateUrl: './car-details.html',
  styleUrls: ['../task-board/task-board.css', './car-details.css'],
})
export class CarDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(CarService);
  protected readonly car = signal<Carro | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly imageUnavailable = signal(false);
  protected readonly errorMessage = signal('');

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getById(id).subscribe({
      next: (car) => {
        this.car.set(car);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os dados deste carro.');
        this.isLoading.set(false);
      },
    });
  }

  protected statusName(status: Carro['statusUso']): string {
    return status === 'SEMINOVO' ? 'Seminovo' : 'Usado';
  }

  protected markImageUnavailable(): void {
    this.imageUnavailable.set(true);
  }
}
