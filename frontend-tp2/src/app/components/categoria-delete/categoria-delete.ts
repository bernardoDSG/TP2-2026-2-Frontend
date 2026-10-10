import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Carro } from '../../models/car.model';
import { Categoria } from '../../models/categoria.model';
import { CarService } from '../../services/car.service';
import { CategoriaService } from '../../services/categoria.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-categoria-delete',
  imports: [RouterLink, EntityMenu],
  templateUrl: './categoria-delete.html',
  styleUrl: '../task-board/task-board.css',
})
export class CategoriaDelete {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoriaService = inject(CategoriaService);
  private readonly carService = inject(CarService);
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly categoria = signal<Categoria | null>(null);
  protected readonly linkedCars = signal<Carro[]>([]);
  protected readonly replacementCategorias = signal<Categoria[]>([]);
  protected readonly replacementCategoriaId = signal<number | null>(null);
  protected readonly isDeleting = signal(false);
  protected readonly errorMessage = signal('');

  constructor() {
    this.categoriaService.getById(this.id).subscribe({
      next: (categoria) => this.categoria.set(categoria),
      error: () => this.errorMessage.set('Não foi possível carregar a categoria.'),
    });
    this.categoriaService.getAll().subscribe({
      next: (categorias) => this.replacementCategorias.set(categorias.filter((categoria) => categoria.id !== this.id)),
      error: () => this.errorMessage.set('Não foi possível carregar as categorias substitutas.'),
    });
    this.carService.findByCategory(this.id, 0, 1000).subscribe({
      next: (cars) => this.linkedCars.set(cars),
      error: () => this.errorMessage.set('Não foi possível verificar os carros vinculados.'),
    });
  }

  protected setReplacementCategoria(value: string): void {
    this.replacementCategoriaId.set(value ? Number(value) : null);
  }

  protected remove(): void {
    const replacementId = this.replacementCategoriaId();
    if (this.linkedCars().length > 0 && replacementId === null) return;
    this.isDeleting.set(true);
    this.categoriaService.delete(this.id, replacementId ?? undefined).pipe(finalize(() => this.isDeleting.set(false))).subscribe({
      next: () => this.router.navigateByUrl('/categorias'),
      error: () => this.errorMessage.set('Não foi possível excluir a categoria.'),
    });
  }
}
