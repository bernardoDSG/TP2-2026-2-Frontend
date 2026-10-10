import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Categoria } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-categoria-list',
  imports: [RouterLink, EntityMenu],
  templateUrl: './categoria-list.html',
  styleUrl: '../task-board/task-board.css',
})
export class CategoriaList {
  private readonly service = inject(CategoriaService);
  private searchRequestId = 0;
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly itemsPerPage = signal(10);
  protected readonly currentPage = signal(1);
  protected readonly errorMessage = signal('');
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.categorias().length / this.itemsPerPage())));
  protected readonly visibleCategorias = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.categorias().slice(start, start + this.itemsPerPage());
  });

  constructor() {
    this.load();
  }

  protected setSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.loadFilteredCategorias();
  }

  protected setItemsPerPage(value: string): void {
    this.itemsPerPage.set(Number(value));
    this.currentPage.set(1);
  }

  protected previousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  protected nextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  private load(): void {
    this.service.getAll().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: () => this.errorMessage.set('Não foi possível carregar as categorias.'),
    });
  }

  private loadFilteredCategorias(): void {
    this.currentPage.set(1);
    const requestId = ++this.searchRequestId;
    const name = this.searchTerm().trim();
    const request$ = name ? this.service.findByName(name) : this.service.getAll();
    request$.subscribe({
      next: (categorias) => {
        if (requestId === this.searchRequestId) this.categorias.set(categorias);
      },
      error: () => {
        if (requestId === this.searchRequestId) this.errorMessage.set('Não foi possível buscar as categorias.');
      },
    });
  }
}
