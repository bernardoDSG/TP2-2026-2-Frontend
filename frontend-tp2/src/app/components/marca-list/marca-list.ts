import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Marca } from '../../models/marca.model';
import { MarcaService } from '../../services/marca.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-marca-list',
  imports: [RouterLink, EntityMenu],
  templateUrl: './marca-list.html',
  styleUrl: '../task-board/task-board.css',
})
export class MarcaList {
  private readonly service = inject(MarcaService);
  private searchRequestId = 0;
  protected readonly marcas = signal<Marca[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly itemsPerPage = signal(10);
  protected readonly currentPage = signal(1);
  protected readonly errorMessage = signal('');
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.marcas().length / this.itemsPerPage())));
  protected readonly visibleMarcas = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.marcas().slice(start, start + this.itemsPerPage());
  });

  constructor() {
    this.load();
  }

  protected setSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.loadFilteredMarcas();
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
      next: (marcas) => this.marcas.set(marcas),
      error: () => this.errorMessage.set('Não foi possível carregar as marcas.'),
    });
  }

  private loadFilteredMarcas(): void {
    this.currentPage.set(1);
    const requestId = ++this.searchRequestId;
    const name = this.searchTerm().trim();
    const request$ = name ? this.service.findByName(name) : this.service.getAll();
    request$.subscribe({
      next: (marcas) => {
        if (requestId === this.searchRequestId) this.marcas.set(marcas);
      },
      error: () => {
        if (requestId === this.searchRequestId) this.errorMessage.set('Não foi possível buscar as marcas.');
      },
    });
  }
}
