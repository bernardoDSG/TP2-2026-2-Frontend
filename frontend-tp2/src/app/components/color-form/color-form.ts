import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Color, ColorPayload } from '../../models/color.model';
import { ColorService } from '../../services/color.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-color-form',
  imports: [ReactiveFormsModule, RouterLink, EntityMenu],
  templateUrl: './color-form.html',
  styleUrl: '../task-board/task-board.css',
})
export class ColorForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ColorService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly isEditing = this.id > 0;
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    tonalidadeId: [1, Validators.required],
  });

  constructor() {
    if (this.isEditing) {
      this.service.getById(this.id).subscribe({
        next: (color) => this.form.setValue({ nome: color.nome, tonalidadeId: this.toneId(color) }),
        error: () => this.errorMessage.set('Não foi possível carregar a cor.'),
      });
    }
  }

  protected save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: ColorPayload = {
      nome: this.form.controls.nome.value.trim(),
      tonalidadeId: this.form.controls.tonalidadeId.value,
    };
    const request$: Observable<Color | void> = this.isEditing
      ? this.service.update(this.id, payload)
      : this.service.create(payload);
    this.isSaving.set(true);
    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => this.router.navigateByUrl('/cores'),
      error: () => this.errorMessage.set('Não foi possível salvar a cor.'),
    });
  }

  private toneId(color: Color): number {
    const tone = color.tonalidade as (Color['tonalidade'] & { ID?: number }) | null;
    return tone?.id ?? tone?.ID ?? 1;
  }
}