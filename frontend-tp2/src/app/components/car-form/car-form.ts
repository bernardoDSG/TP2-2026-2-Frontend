import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Carro, CarroPayload } from '../../models/car.model';
import { Categoria } from '../../models/categoria.model';
import { Color } from '../../models/color.model';
import { Marca } from '../../models/marca.model';
import { StatusUso } from '../../models/status-uso.model';
import { CarService } from '../../services/car.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-car-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, EntityMenu],
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
  protected readonly marcas = this.route.snapshot.data['marcas'] as Marca[];
  protected readonly categorias = this.route.snapshot.data['categorias'] as Categoria[];
  protected readonly statuses = this.route.snapshot.data['statuses'] as StatusUso[];
  protected readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    statusUsoId: [1, Validators.required],
    corId: [0, Validators.required],
    marcaId: [0, [Validators.required, Validators.min(1)]],
    categoriaId: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    if (this.isEditing) {
      this.service.getById(this.id).subscribe({
        next: (car) => this.form.setValue({
          nome: car.nomeCarro,
          statusUsoId: car.statusUsoId,
          corId: car.corId,
          marcaId: car.marcaId,
          categoriaId: car.categoriaId,
        }),
        error: () => this.errorMessage.set('Não foi possível carregar o carro.'),
      });
    }
  }

  protected colorLabel(color: Color): string {
    return `${color.nome} - ${color.tonalidade}`;
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
      marcaId: this.form.controls.marcaId.value,
      categoriaId: this.form.controls.categoriaId.value,
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
