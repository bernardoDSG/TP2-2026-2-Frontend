import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Carro } from '../../models/car.model';
import { Marca } from '../../models/marca.model';
import { CarService } from '../../services/car.service';
import { MarcaService } from '../../services/marca.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-marca-delete',
  imports: [RouterLink, EntityMenu],
  templateUrl: './marca-delete.html',
  styleUrl: '../task-board/task-board.css',
})
export class MarcaDelete {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly marcaService = inject(MarcaService);
  private readonly carService = inject(CarService);
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly marca = signal<Marca | null>(null);
  protected readonly linkedCars = signal<Carro[]>([]);
  protected readonly replacementMarcas = signal<Marca[]>([]);
  protected readonly replacementMarcaId = signal<number | null>(null);
  protected readonly isDeleting = signal(false);
  protected readonly errorMessage = signal('');

  constructor() {
    this.marcaService.getById(this.id).subscribe({
      next: (marca) => this.marca.set(marca),
      error: () => this.errorMessage.set('Não foi possível carregar a marca.'),
    });
    this.marcaService.getAll().subscribe({
      next: (marcas) => this.replacementMarcas.set(marcas.filter((marca) => marca.id !== this.id)),
      error: () => this.errorMessage.set('Não foi possível carregar as marcas substitutas.'),
    });
    this.carService.findByBrand(this.id, 0, 1000).subscribe({
      next: (cars) => this.linkedCars.set(cars),
      error: () => this.errorMessage.set('Não foi possível verificar os carros vinculados.'),
    });
  }

  protected setReplacementMarca(value: string): void {
    this.replacementMarcaId.set(value ? Number(value) : null);
  }

  protected remove(): void {
    const replacementId = this.replacementMarcaId();
    if (this.linkedCars().length > 0 && replacementId === null) return;
    this.isDeleting.set(true);
    this.marcaService.delete(this.id, replacementId ?? undefined).pipe(finalize(() => this.isDeleting.set(false))).subscribe({
      next: () => this.router.navigateByUrl('/marcas'),
      error: () => this.errorMessage.set('Não foi possível excluir a marca.'),
    });
  }
}
