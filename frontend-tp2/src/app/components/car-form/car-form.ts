import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Carro, CarroPayload } from '../../models/car.model';
import { Color } from '../../models/color.model';
import { CarService } from '../../services/car.service';

@Component({
  selector: 'app-car-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './car-form.html',
  styleUrl: '../task-board/task-board.css',
})
export class CarForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(CarService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly isEditing = this.id > 0;
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly colors = this.route.snapshot.data['colors'] as Color[];
  protected readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    statusUsoId: [1, Validators.required],
    corId: [0, Validators.required],
  });

  constructor() {
    if (this.isEditing) {
      this.service.getById(this.id).subscribe({
        next: (car) => this.form.setValue({
          nome: car.nome,
          statusUsoId: car.statusUso?.id ?? 1,
          corId: car.cor?.id ?? 0,
        }),
        error: () => this.errorMessage.set('Não foi possível carregar o carro.'),
      });
    }
  }

  protected colorLabel(color: Color): string {
    const tone = color.tonalidade?.nome ?? color.tonalidade?.NOME;
    return tone ? `${color.nome} - ${tone}` : color.nome;
  }

  protected save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CarroPayload = {
      nome: this.form.controls.nome.value.trim(),
      StatusUsoId: this.form.controls.statusUsoId.value,
      corId: this.form.controls.corId.value,
    };
    this.isSaving.set(true);
    const request$: Observable<Carro | void> = this.isEditing
      ? this.service.update(this.id, payload)
      : this.service.create(payload);

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => this.router.navigateByUrl('/carros'),
      error: () => this.errorMessage.set('Não foi possível salvar o carro.'),
    });
  }
}
