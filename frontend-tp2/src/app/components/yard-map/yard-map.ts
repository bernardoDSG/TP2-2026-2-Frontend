import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Carro } from '../../models/car.model';
import { Setor, TipoVaga, Vaga, VagaPayload } from '../../models/yard.model';
import { CarService } from '../../services/car.service';
import { YardService } from '../../services/yard.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-yard-map',
  imports: [CommonModule, ReactiveFormsModule, EntityMenu],
  templateUrl: './yard-map.html',
  styleUrl: './yard-map.css',
})
export class YardMap {
  private readonly formBuilder = inject(FormBuilder);
  private readonly yardService = inject(YardService);
  private readonly carService = inject(CarService);

  protected readonly sectors = signal<Setor[]>([]);
  protected readonly slots = signal<Vaga[]>([]);
  protected readonly cars = signal<Carro[]>([]);
  protected readonly selectedSectorId = signal(0);
  protected readonly selectedSlotId = signal(0);
  protected readonly showSectorForm = signal(false);
  protected readonly isEditingSector = signal(false);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly activeSector = computed(() => this.sectors().find((sector) => sector.id === this.selectedSectorId()) ?? null);
  protected readonly sectorSlots = computed(() => this.slots().filter((slot) => slot.setorId === this.selectedSectorId()));
  protected readonly selectedSlot = computed(() => this.slots().find((slot) => slot.id === this.selectedSlotId()) ?? null);
  protected readonly gridCells = computed(() => {
    const sector = this.activeSector();
    if (!sector) return [];
    const slotsByPosition = new Map(this.sectorSlots().map((slot) => [`${slot.linha}:${slot.coluna}`, slot]));
    return Array.from({ length: sector.linhas * sector.colunas }, (_, index) => {
      const linha = Math.floor(index / sector.colunas) + 1;
      const coluna = (index % sector.colunas) + 1;
      return { linha, coluna, vaga: slotsByPosition.get(`${linha}:${coluna}`) };
    });
  });
  protected readonly occupiedCount = computed(() => this.sectorSlots().filter((slot) => slot.carroId !== null).length);
  protected readonly availableCars = computed(() => {
    const currentSlotId = this.selectedSlotId();
    const assignedCarIds = new Set(this.slots()
      .filter((slot) => slot.id !== currentSlotId && slot.carroId !== null)
      .map((slot) => slot.carroId));
    return this.cars().filter((car) => !assignedCarIds.has(car.id));
  });

  protected readonly sectorForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(80)]],
    linhas: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
    colunas: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
  });

  protected readonly slotForm = this.formBuilder.nonNullable.group({
    codigoVaga: ['', [Validators.required, Validators.maxLength(40)]],
    linha: [1, [Validators.required, Validators.min(1)]],
    coluna: [1, [Validators.required, Validators.min(1)]],
    tipo: ['NORMAL' as TipoVaga, Validators.required],
    carroId: [0],
  });

  constructor() {
    this.load();
  }

  protected selectSector(value: string): void {
    this.selectedSectorId.set(Number(value));
    this.selectedSlotId.set(0);
    this.resetSlotForm();
    this.successMessage.set('');
  }

  protected selectSlot(slot: Vaga | undefined): void {
    if (!slot) return;
    this.selectedSlotId.set(slot.id);
    this.slotForm.setValue({
      codigoVaga: slot.codigoVaga,
      linha: slot.linha,
      coluna: slot.coluna,
      tipo: slot.tipo,
      carroId: slot.carroId ?? 0,
    });
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected beginNewSector(): void {
    this.isEditingSector.set(false);
    this.showSectorForm.set(true);
    this.sectorForm.reset({ nome: '', linhas: 1, colunas: 1 });
    this.errorMessage.set('');
  }

  protected editSector(): void {
    const sector = this.activeSector();
    if (!sector) return;
    this.isEditingSector.set(true);
    this.showSectorForm.set(true);
    this.sectorForm.setValue({ nome: sector.nome, linhas: sector.linhas, colunas: sector.colunas });
    this.errorMessage.set('');
  }

  protected cancelSectorForm(): void {
    this.showSectorForm.set(false);
    this.errorMessage.set('');
  }

  protected saveSector(): void {
    if (this.sectorForm.invalid || this.isSaving()) {
      this.sectorForm.markAllAsTouched();
      return;
    }
    const payload = this.sectorForm.getRawValue();
    const sector = this.activeSector();
    this.isSaving.set(true);
    const request$ = this.isEditingSector() && sector
      ? this.yardService.updateSector(sector.id, { ...payload, nome: payload.nome.trim() })
      : this.yardService.createSector({ ...payload, nome: payload.nome.trim() });
    request$.subscribe({
      next: (savedSector) => {
        this.selectedSectorId.set(savedSector.id);
        this.showSectorForm.set(false);
        this.errorMessage.set('');
        this.successMessage.set(this.isEditingSector() ? 'Setor atualizado.' : 'Setor cadastrado.');
        this.isSaving.set(false);
        this.load();
      },
      error: (error: { status?: number }) => this.handleError(error, 'Não foi possível salvar o setor.'),
    });
  }

  protected deleteSector(): void {
    const sector = this.activeSector();
    if (!sector || this.isSaving()) return;
    this.isSaving.set(true);
    this.yardService.deleteSector(sector.id).subscribe({
      next: () => {
        this.selectedSectorId.set(0);
        this.selectedSlotId.set(0);
        this.successMessage.set('Setor excluído.');
        this.isSaving.set(false);
        this.load();
      },
      error: (error: { status?: number }) => this.handleError(error, 'Não foi possível excluir o setor. Exclua as vagas primeiro.'),
    });
  }

  protected beginNewSlot(linha?: number, coluna?: number): void {
    if (!this.activeSector()) return;
    this.selectedSlotId.set(0);
    this.slotForm.reset({
      codigoVaga: '',
      linha: linha ?? 1,
      coluna: coluna ?? 1,
      tipo: 'NORMAL',
      carroId: 0,
    });
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected saveSlot(): void {
    const sector = this.activeSector();
    if (!sector || this.slotForm.invalid || this.isSaving()) {
      this.slotForm.markAllAsTouched();
      return;
    }
    const value = this.slotForm.getRawValue();
    const payload: VagaPayload = {
      ...value,
      codigoVaga: value.codigoVaga.trim(),
      setorId: sector.id,
      carroId: value.carroId > 0 ? value.carroId : null,
    };
    this.isSaving.set(true);
    const slotId = this.selectedSlotId();
    const request$ = slotId
      ? this.yardService.updateSlot(slotId, payload)
      : this.yardService.createSlot(payload);
    request$.subscribe({
      next: (savedSlot) => {
        this.selectedSlotId.set(savedSlot.id);
        this.successMessage.set(slotId ? 'Vaga atualizada.' : 'Vaga cadastrada.');
        this.errorMessage.set('');
        this.isSaving.set(false);
        this.load();
      },
      error: (error: { status?: number }) => this.handleError(error, 'Não foi possível salvar a vaga. Verifique o código, a posição e o carro selecionado.'),
    });
  }

  protected deleteSlot(): void {
    const slot = this.selectedSlot();
    if (!slot || this.isSaving()) return;
    this.isSaving.set(true);
    this.yardService.deleteSlot(slot.id).subscribe({
      next: () => {
        this.selectedSlotId.set(0);
        this.resetSlotForm();
        this.successMessage.set('Vaga excluída e carro liberado.');
        this.isSaving.set(false);
        this.load();
      },
      error: (error: { status?: number }) => this.handleError(error, 'Não foi possível excluir a vaga.'),
    });
  }

  protected formatType(tipo: TipoVaga): string {
    return tipo === 'PREFERENCIAL' ? 'Preferencial' : tipo === 'COBERTA' ? 'Coberta' : 'Normal';
  }

  private load(): void {
    this.isLoading.set(true);
    forkJoin({
      sectors: this.yardService.getSectors(),
      slots: this.yardService.getSlots(),
      cars: this.carService.getAll(0, 500),
    }).subscribe({
      next: ({ sectors, slots, cars }) => {
        this.sectors.set(sectors);
        this.slots.set(slots);
        this.cars.set(cars);
        if (!sectors.some((sector) => sector.id === this.selectedSectorId())) {
          this.selectedSectorId.set(sectors[0]?.id ?? 0);
        }
        if (!slots.some((slot) => slot.id === this.selectedSlotId())) {
          this.selectedSlotId.set(0);
          this.resetSlotForm();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar o mapa do pátio.');
        this.isLoading.set(false);
      },
    });
  }

  private resetSlotForm(): void {
    this.slotForm.reset({ codigoVaga: '', linha: 1, coluna: 1, tipo: 'NORMAL', carroId: 0 });
  }

  private handleError(error: { status?: number }, fallback: string): void {
    this.errorMessage.set(error.status === 409
      ? 'A vaga ou o setor já existe, ou há registros vinculados que impedem esta operação.'
      : fallback);
    this.isSaving.set(false);
  }
}
