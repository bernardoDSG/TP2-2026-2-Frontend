import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Carro } from '../../models/car.model';
import { Color } from '../../models/color.model';
import { CarService } from '../../services/car.service';
import { ColorService } from '../../services/color.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-color-delete',
  imports: [RouterLink, EntityMenu],
  templateUrl: './color-delete.html',
  styleUrl: '../task-board/task-board.css',
})
export class ColorDelete {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly colorService = inject(ColorService);
  private readonly carService = inject(CarService);
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly color = signal<Color | null>(null);
  protected readonly linkedCars = signal<Carro[]>([]);
  protected readonly replacementColors = signal<Color[]>([]);
  protected readonly replacementColorId = signal<number | null>(null);
  protected readonly isDeleting = signal(false);
  protected readonly errorMessage = signal('');

  constructor() {
    this.colorService.getById(this.id).subscribe({
      next: (color) => this.color.set(color),
      error: () => this.errorMessage.set('Não foi possível carregar a cor.'),
    });
    this.colorService.getAll().subscribe({
      next: (colors) => this.replacementColors.set(colors.filter((color) => color.id !== this.id)),
      error: () => this.errorMessage.set('Não foi possível carregar as cores substitutas.'),
    });
    this.carService.findByColor(this.id, 0, 1000).subscribe({
      next: (cars) => this.linkedCars.set(cars),
      error: () => this.errorMessage.set('Não foi possível verificar os carros vinculados.'),
    });
  }

  protected setReplacementColor(value: string): void {
    this.replacementColorId.set(value ? Number(value) : null);
  }

  protected remove(): void {
    const replacementId = this.replacementColorId();
    if (this.linkedCars().length > 0 && replacementId === null) return;
    this.isDeleting.set(true);
    this.colorService.delete(this.id, replacementId ?? undefined).pipe(finalize(() => this.isDeleting.set(false))).subscribe({
      next: () => this.router.navigateByUrl('/cores'),
      error: () => this.errorMessage.set('Não foi possível excluir a cor.'),
    });
  }
}