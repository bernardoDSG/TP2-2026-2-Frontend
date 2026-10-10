import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EntityMenu } from '../entity-menu/entity-menu';
import { Carro } from '../../models/car.model';
import { StatusUso } from '../../models/status-uso.model';
import { CarService } from '../../services/car.service';

@Component({
  selector: 'app-car-list',
  imports: [CommonModule, RouterLink, EntityMenu],
  templateUrl: './car-list.html',
  styleUrl: '../task-board/task-board.css',
})
export class CarList {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(CarService);
  private readonly catalogCars = signal<Carro[]>(this.route.snapshot.data['cars']);
  protected readonly statuses = this.route.snapshot.data['statuses'] as StatusUso[];
  protected readonly cars = signal<Carro[]>(this.catalogCars());
  protected readonly nameFilter = signal('');
  protected readonly statusFilter = signal('');
  protected readonly colorFilter = signal('');
  protected readonly brandFilter = signal('');
  protected readonly categoryFilter = signal('');
  protected readonly itemsPerPage = signal(10);
  protected readonly currentPage = signal(1);
  protected readonly errorMessage = signal('');
  protected readonly availableColors = computed(() => {
    const colors = new Map<number, string>();
    this.catalogCars().forEach((car) => colors.set(car.corId, `${car.corNome} - ${car.tonalidade}`));
    return [...colors.entries()].map(([id, nome]) => ({ id, nome })).sort((first, second) => first.nome.localeCompare(second.nome));
  });
  protected readonly availableBrands = computed(() => {
    const brands = new Map<number, string>();
    this.catalogCars().forEach((car) => brands.set(car.marcaId, car.marcaNome));
    return [...brands.entries()].map(([id, nome]) => ({ id, nome })).sort((first, second) => first.nome.localeCompare(second.nome));
  });
  protected readonly availableCategories = computed(() => {
    const categories = new Map<number, string>();
    this.catalogCars().forEach((car) => categories.set(car.categoriaId, car.categoriaNome));
    return [...categories.entries()].map(([id, nome]) => ({ id, nome })).sort((first, second) => first.nome.localeCompare(second.nome));
  });
  protected readonly filteredCars = computed(() => this.cars());
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.cars().length / this.itemsPerPage())));
  protected readonly visibleCars = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredCars().slice(start, start + this.itemsPerPage());
  });

  protected setNameFilter(value: string): void { this.nameFilter.set(value); this.loadFilteredCars(); }
  protected setStatusFilter(value: string): void { this.statusFilter.set(value); this.loadFilteredCars(); }
  protected setColorFilter(value: string): void { this.colorFilter.set(value); this.loadFilteredCars(); }
  protected setBrandFilter(value: string): void { this.brandFilter.set(value); this.loadFilteredCars(); }
  protected setCategoryFilter(value: string): void { this.categoryFilter.set(value); this.loadFilteredCars(); }
  protected setItemsPerPage(value: string): void { this.itemsPerPage.set(Number(value)); this.currentPage.set(1); }
  protected previousPage(): void { this.currentPage.update((page) => Math.max(1, page - 1)); }
  protected nextPage(): void { this.currentPage.update((page) => Math.min(this.totalPages(), page + 1)); }
  private loadFilteredCars(): void {
    this.currentPage.set(1);
    const name = this.nameFilter().trim();
    const statusId = this.statusFilter();
    const colorId = this.colorFilter();
    const brandId = this.brandFilter();
    const categoryId = this.categoryFilter();
    if (!name && !statusId && !colorId && !brandId && !categoryId) {
      this.cars.set(this.catalogCars());
      return;
    }
    const requests = [];
    if (name) requests.push(this.service.findByName(name));
    if (statusId) requests.push(this.service.findByStatus(Number(statusId)));
    if (colorId) requests.push(this.service.findByColor(Number(colorId)));
    if (brandId) requests.push(this.service.findByBrand(Number(brandId)));
    if (categoryId) requests.push(this.service.findByCategory(Number(categoryId)));
    forkJoin(requests).subscribe({
      next: (results) => {
        const matchingIds = results.slice(1).reduce((ids, result) => {
          const resultIds = new Set(result.map((car) => car.id));
          return new Set([...ids].filter((id) => resultIds.has(id)));
        }, new Set(results[0].map((car) => car.id)));
        this.cars.set(results[0].filter((car) => matchingIds.has(car.id)));
      },
      error: () => this.errorMessage.set('Não foi possível aplicar os filtros de carros.'),
    });
  }
  protected statusName(car: Carro): string {
    return this.statuses.find((status) => status.nome.toUpperCase() === car.statusUso)?.nome ?? car.statusUso;
  }
  protected colorLabel(car: Carro): string { return `${car.corNome} - ${car.tonalidade}`; }
}
