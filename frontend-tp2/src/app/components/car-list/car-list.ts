import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { Carro } from '../../models/car.model';
import { CarService } from '../../services/car.service';

@Component({
  selector: 'app-car-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './car-list.html',
  styleUrl: '../task-board/task-board.css',
})
export class CarList {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(CarService);
  private readonly catalogCars = signal<Carro[]>(this.route.snapshot.data['cars']);
  protected readonly cars = signal<Carro[]>(this.catalogCars());
  protected readonly nameFilter = signal('');
  protected readonly colorFilter = signal('');
  protected readonly statusFilter = signal('');
  protected readonly itemsPerPage = signal(10);
  protected readonly currentPage = signal(1);
  protected readonly errorMessage = signal('');
  protected readonly availableColors = computed(() => {
    const colors = new Map<number, string>();
    this.catalogCars().forEach((car) => { if (car.cor) colors.set(car.cor.id, car.cor.nome); });
    return [...colors.entries()].map(([id, nome]) => ({ id, nome })).sort((first, second) => first.nome.localeCompare(second.nome));
  });
  protected readonly availableStatuses = computed(() => {
    const statuses = new Map<number, string>();
    this.catalogCars().forEach((car) => { if (car.statusUso) statuses.set(car.statusUso.id, car.statusUso.nome); });
    return [...statuses.entries()].map(([id, nome]) => ({ id, nome })).sort((first, second) => first.nome.localeCompare(second.nome));
  });
  protected readonly filteredCars = computed(() => this.cars());
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.cars().length / this.itemsPerPage())));
  protected readonly visibleCars = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredCars().slice(start, start + this.itemsPerPage());
  });

  protected setNameFilter(value: string): void { this.nameFilter.set(value); this.loadFilteredCars(); }
  protected setColorFilter(value: string): void { this.colorFilter.set(value); this.loadFilteredCars(); }
  protected setStatusFilter(value: string): void { this.statusFilter.set(value); this.loadFilteredCars(); }
  protected setItemsPerPage(value: string): void { this.itemsPerPage.set(Number(value)); this.currentPage.set(1); }
  protected previousPage(): void { this.currentPage.update((page) => Math.max(1, page - 1)); }
  protected nextPage(): void { this.currentPage.update((page) => Math.min(this.totalPages(), page + 1)); }
  private loadFilteredCars(): void {
    this.currentPage.set(1);
    const requests: Observable<Carro[]>[] = [];
    const name = this.nameFilter().trim();
    if (name) requests.push(this.service.findByName(name));
    if (this.colorFilter()) requests.push(this.service.findByColor(Number(this.colorFilter())));
    if (this.statusFilter()) requests.push(this.service.findByStatus(Number(this.statusFilter())));

    if (!requests.length) {
      this.cars.set(this.catalogCars());
      return;
    }

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
  protected statusName(car: Carro): string { return car.statusUso?.nome ?? 'Sem status'; }
  protected colorLabel(car: Carro): string {
    const color = car.cor;
    if (!color) return 'Sem cor';
    const tone = color.tonalidade?.nome;
    return tone ? `${color.nome} - ${tone}` : color.nome;
  }
}
