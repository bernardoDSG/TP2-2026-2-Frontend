import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Color, ColorPayload } from '../../models/color.model';
import { ColorService } from '../../services/color.service';

@Component({ selector: 'app-color-board', imports: [CommonModule, ReactiveFormsModule, RouterLink], templateUrl: './color-board.html', styleUrl: '../task-board/task-board.css' })
export class ColorBoard {
  private readonly service = inject(ColorService); private readonly fb = inject(FormBuilder);
  private searchRequestId = 0;
  protected readonly colors = signal<Color[]>([]); protected readonly searchTerm = signal(''); protected readonly itemsPerPage = signal(10); protected readonly currentPage = signal(1); protected readonly editingId = signal<number | null>(null); protected readonly isSaving = signal(false); protected readonly deletingId = signal<number | null>(null); protected readonly errorMessage = signal('');
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.colors().length / this.itemsPerPage())));
  protected readonly visibleColors = computed(() => { const start = (this.currentPage() - 1) * this.itemsPerPage(); return this.colors().slice(start, start + this.itemsPerPage()); });
  protected readonly form = this.fb.nonNullable.group({ nome: ['', [Validators.required, Validators.minLength(2)]], tonalidadeId: [1, Validators.required] });
  constructor() { this.load(); }
  private load(): void { this.service.getAll().subscribe({ next: (colors) => this.colors.set(colors), error: () => this.errorMessage.set('Não foi possível carregar as cores.') }); }
  protected edit(color: Color): void { this.editingId.set(color.id); this.form.setValue({ nome: color.nome, tonalidadeId: this.toneId(color) }); }
  protected cancel(): void { this.editingId.set(null); this.form.reset({ nome: '', tonalidadeId: 1 }); }
  protected save(): void { if (this.form.invalid || this.isSaving()) { this.form.markAllAsTouched(); return; } const payload: ColorPayload = { nome: this.form.controls.nome.value.trim(), tonalidadeId: this.form.controls.tonalidadeId.value }; const id = this.editingId(); this.isSaving.set(true); const request$: Observable<Color | void> = id === null ? this.service.create(payload) : this.service.update(id, payload); request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({ next: (created: Color | void) => { this.colors.update((colors) => id === null ? [{ ...(created as Color), nome: payload.nome, tonalidade: { id: payload.tonalidadeId, nome: this.toneName(payload.tonalidadeId) } }, ...colors] : colors.map((color) => color.id === id ? { ...color, nome: payload.nome, tonalidade: { id: payload.tonalidadeId, nome: this.toneName(payload.tonalidadeId) } } : color)); this.cancel(); }, error: () => this.errorMessage.set('Não foi possível salvar a cor.') }); }
  protected remove(color: Color): void { this.deletingId.set(color.id); this.service.delete(color.id).pipe(finalize(() => this.deletingId.set(null))).subscribe({ next: () => { this.colors.update((colors) => colors.filter((item) => item.id !== color.id)); this.currentPage.update((page) => Math.min(page, this.totalPages())); }, error: () => this.errorMessage.set('Não foi possível excluir a cor.') }); }
  protected setSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
    const requestId = ++this.searchRequestId;
    const search = value.trim();
    const request$ = search ? this.service.findByName(search) : this.service.getAll();
    request$.subscribe({
      next: (colors) => { if (requestId === this.searchRequestId) this.colors.set(colors); },
      error: () => { if (requestId === this.searchRequestId) this.errorMessage.set('Não foi possível buscar as cores.'); },
    });
  }
  protected setItemsPerPage(value: string): void { this.itemsPerPage.set(Number(value)); this.currentPage.set(1); }
  protected previousPage(): void { this.currentPage.update((page) => Math.max(1, page - 1)); }
  protected nextPage(): void { this.currentPage.update((page) => Math.min(this.totalPages(), page + 1)); }
  protected toneName(id: number): string { return ({ 1: 'Claro', 2: 'Escuro', 3: 'Puro' } as Record<number, string>)[id] ?? 'Desconhecido'; }
  protected toneId(color: Color): number { const tone = color.tonalidade as (Color['tonalidade'] & { ID?: number; NOME?: string }) | null; return tone?.id ?? tone?.ID ?? 1; }
}
