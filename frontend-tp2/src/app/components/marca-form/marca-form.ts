import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Marca, MarcaPayload } from '../../models/marca.model';
import { MarcaService } from '../../services/marca.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-marca-form',
  imports: [ReactiveFormsModule, RouterLink, EntityMenu],
  templateUrl: './marca-form.html',
  styleUrl: '../task-board/task-board.css',
})
export class MarcaForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(MarcaService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly isEditing = this.id > 0;
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
  });

  constructor() {
    if (this.isEditing) {
      this.service.getById(this.id).subscribe({
        next: (marca) => this.form.setValue({ nome: marca.nome }),
        error: () => this.errorMessage.set('Não foi possível carregar a marca.'),
      });
    }
  }

  protected save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: MarcaPayload = { nome: this.form.controls.nome.value.trim() };
    const request$: Observable<Marca | void> = this.isEditing
      ? this.service.update(this.id, payload)
      : this.service.create(payload);
    this.isSaving.set(true);
    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => this.router.navigateByUrl('/marcas'),
      error: () => this.errorMessage.set('Não foi possível salvar a marca.'),
    });
  }
}
