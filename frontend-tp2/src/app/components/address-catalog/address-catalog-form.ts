import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Estado, EstadoPayload, Municipio, MunicipioPayload } from '../../models/address-catalog.model';
import { EstadoService } from '../../services/estado.service';
import { MunicipioService } from '../../services/municipio.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-address-catalog-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, EntityMenu],
  templateUrl: './address-catalog-form.html',
  styleUrl: '../task-board/task-board.css',
})
export class AddressCatalogForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly estadoService = inject(EstadoService);
  private readonly municipioService = inject(MunicipioService);
  protected readonly kind = this.route.snapshot.paramMap.get('kind') === 'municipios' ? 'municipios' : 'estados';
  protected readonly isEstado = this.kind === 'estados';
  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly isEditing = this.id > 0;
  protected readonly estados = signal<Estado[]>([]);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    sigla: ['', this.isEstado ? [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)] : []],
    estadoId: [0, this.isEstado ? [] : [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.estadoService.getAll().subscribe({
      next: (estados) => this.estados.set(estados),
      error: () => this.errorMessage.set('Não foi possível carregar os estados.'),
    });
    if (this.isEditing) {
      if (this.isEstado) {
        this.estadoService.getById(this.id).subscribe({
          next: (estado) => this.form.patchValue({ nome: estado.nome, sigla: estado.sigla }),
          error: () => this.errorMessage.set('Não foi possível carregar o estado.'),
        });
      } else {
        this.municipioService.getById(this.id).subscribe({
          next: (municipio) => this.form.patchValue({ nome: municipio.nome, estadoId: municipio.estado.id }),
          error: () => this.errorMessage.set('Não foi possível carregar o município.'),
        });
      }
    }
  }

  protected save(): void {
    if (this.form.invalid || this.isSaving() || (!this.isEstado && (this.estados().length === 0 || this.form.controls.estadoId.value < 1))) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const request$: Observable<Estado | Municipio> = this.isEstado
      ? this.isEditing
        ? this.estadoService.update(this.id, { nome: value.nome.trim(), sigla: value.sigla.trim().toUpperCase() } satisfies EstadoPayload)
        : this.estadoService.create({ nome: value.nome.trim(), sigla: value.sigla.trim().toUpperCase() })
      : this.isEditing
        ? this.municipioService.update(this.id, { nome: value.nome.trim(), estadoId: value.estadoId } satisfies MunicipioPayload)
        : this.municipioService.create({ nome: value.nome.trim(), estadoId: value.estadoId });
    this.isSaving.set(true);
    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => this.router.navigateByUrl(`/enderecos/${this.kind}`),
      error: (error: { status?: number }) => this.errorMessage.set(
        error.status === 409 ? `Já existe um ${this.isEstado ? 'estado' : 'município'} com esses dados.` : 'Não foi possível salvar o cadastro.',
      ),
    });
  }
}