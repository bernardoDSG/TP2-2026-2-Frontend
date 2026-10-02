import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { Color } from '../../models/color.model';
import { ColorService } from '../../services/color.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({ selector: 'app-color-board', imports: [CommonModule, RouterLink, EntityMenu], templateUrl: './color-board.html', styleUrl: '../task-board/task-board.css' })
export class ColorBoard {
  private readonly service = inject(ColorService);
  private searchRequestId = 0;
  protected readonly colors = signal<Color[]>([]); protected readonly searchTerm = signal(''); protected readonly toneFilter = signal(''); protected readonly itemsPerPage = signal(10); protected readonly currentPage = signal(1); protected readonly errorMessage = signal('');
  protected readonly filteredColors = computed(() => this.colors());
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredColors().length / this.itemsPerPage())));
  protected readonly visibleColors = computed(() => { const start = (this.currentPage() - 1) * this.itemsPerPage(); return this.filteredColors().slice(start, start + this.itemsPerPage()); });
  constructor() { this.load(); }
  private load(): void { this.service.getAll().subscribe({ next: (colors) => this.colors.set(colors), error: () => this.errorMessage.set('Não foi possível carregar as cores.') }); }
  protected setSearchTerm(value: string): void { this.searchTerm.set(value); this.loadFilteredColors(); }
  protected setToneFilter(value: string): void { this.toneFilter.set(value); this.loadFilteredColors(); }
  protected setItemsPerPage(value: string): void { this.itemsPerPage.set(Number(value)); this.currentPage.set(1); }
  protected previousPage(): void { this.currentPage.update((page) => Math.max(1, page - 1)); }
  protected nextPage(): void { this.currentPage.update((page) => Math.min(this.totalPages(), page + 1)); }
  private loadFilteredColors(): void {
    this.currentPage.set(1);
    const requestId = ++this.searchRequestId;
    const requests: Observable<Color[]>[] = [];
    const name = this.searchTerm().trim();
    if (name) requests.push(this.service.findByName(name));
    if (this.toneFilter()) requests.push(this.service.findByTone(Number(this.toneFilter())));
    const request$ = requests.length ? forkJoin(requests) : forkJoin([this.service.getAll()]);
    request$.subscribe({
      next: (results) => {
        if (requestId !== this.searchRequestId) return;
        const matchingIds = results.slice(1).reduce((ids, result) => {
          const resultIds = new Set(result.map((color) => color.id));
          return new Set([...ids].filter((id) => resultIds.has(id)));
        }, new Set(results[0].map((color) => color.id)));
        this.colors.set(results[0].filter((color) => matchingIds.has(color.id)));
      },
      error: () => { if (requestId === this.searchRequestId) this.errorMessage.set('Não foi possível buscar as cores.'); },
    });
  }
}
