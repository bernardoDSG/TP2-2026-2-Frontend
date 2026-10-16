import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable, of, switchMap } from 'rxjs';
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
  styleUrls: ['../task-board/task-board.css', './car-form.css'],
})
export class CarForm implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(CarService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly isEditing = this.id > 0;
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly currentImageUrl = signal<string | null>(null);
  protected readonly imagePreviewUrl = signal<string | null>(null);
  protected readonly imageUnavailable = signal(false);
  protected readonly selectedImage = signal<File | null>(null);
  protected readonly removeCurrentImage = signal(false);
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
        next: (car) => {
          this.form.setValue({
            nome: car.nomeCarro,
            statusUsoId: car.statusUsoId,
            corId: car.corId,
            marcaId: car.marcaId,
            categoriaId: car.categoriaId,
          });
          this.currentImageUrl.set(car.imagemUrl);
        },
        error: () => this.errorMessage.set('Não foi possível carregar o carro.'),
      });
    }
  }

  protected colorLabel(color: Color): string {
    return `${color.nome} - ${color.tonalidade}`;
  }

  ngOnDestroy(): void {
    const previewUrl = this.imagePreviewUrl();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }

  protected chooseImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (this.imagePreviewUrl()) URL.revokeObjectURL(this.imagePreviewUrl()!);
    this.imagePreviewUrl.set(null);
    this.selectedImage.set(null);
    this.errorMessage.set('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      this.errorMessage.set('Escolha uma imagem JPEG, PNG, GIF ou WebP.');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('A imagem deve ter no máximo 5 MB.');
      input.value = '';
      return;
    }
    this.selectedImage.set(file);
    this.imagePreviewUrl.set(URL.createObjectURL(file));
    this.removeCurrentImage.set(false);
  }

  protected markImageUnavailable(): void {
    this.imageUnavailable.set(true);
  }

  protected toggleRemoveImage(): void {
    this.removeCurrentImage.update((remove) => !remove);
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
    let request$: Observable<void>;
    if (this.isEditing) {
      request$ = this.service.update(this.id, payload).pipe(switchMap(() => this.saveImage(this.id)));
    } else {
      request$ = this.service.create(payload).pipe(switchMap((car) => this.saveImage(car.id)));
    }
    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => this.router.navigateByUrl('/carros'),
      error: (error: { status?: number }) => this.errorMessage.set(
        error.status === 400 ? 'A imagem não é válida. Envie JPEG, PNG, GIF ou WebP com até 5 MB.' : 'Não foi possível salvar o carro.',
      ),
    });
  }

  private saveImage(carId: number): Observable<void> {
    if (this.selectedImage()) return this.service.uploadImage(carId, this.selectedImage()!);
    if (this.isEditing && this.removeCurrentImage()) return this.service.deleteImage(carId);
    return of(undefined);
  }
}
