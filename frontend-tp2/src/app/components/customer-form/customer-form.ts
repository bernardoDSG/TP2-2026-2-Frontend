import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ClientePayload } from '../../models/cliente.model';
import { CepService } from '../../services/cep.service';
import { ClienteService } from '../../services/cliente.service';

const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const cpf = String(control.value ?? '').replace(/\D/g, '');
  if (!cpf) return null;
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return { cpf: true };
  const digit = (length: number, weightStart: number) => {
    const sum = cpf.slice(0, length).split('').reduce((total, value, index) => total + Number(value) * (weightStart - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return Number(cpf[9]) === digit(9, 10) && Number(cpf[10]) === digit(10, 11) ? null : { cpf: true };
};

const digitsLengthValidator = (min: number, max: number): ValidatorFn => (control: AbstractControl) => {
  const value = String(control.value ?? '').replace(/\D/g, '');
  return value.length >= min && value.length <= max ? null : { digitsLength: true };
};

@Component({
  selector: 'app-customer-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-form.html',
  styleUrls: ['../task-board/task-board.css', './customer-form.css'],
})
export class CustomerForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly customers = inject(ClienteService);
  private readonly cepService = inject(CepService);

  protected readonly isSaving = signal(false);
  protected readonly isLookingUpCep = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    cpf: ['', [Validators.required, cpfValidator]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    telefone: ['', [Validators.required, digitsLengthValidator(10, 11)]],
    cep: ['', [Validators.required, digitsLengthValidator(8, 8)]],
    logradouro: ['', [Validators.required, Validators.maxLength(160)]],
    numero: ['', [Validators.required, Validators.maxLength(20)]],
    complemento: ['', Validators.maxLength(100)],
    bairro: ['', [Validators.required, Validators.maxLength(100)]],
    municipio: ['', [Validators.required, Validators.maxLength(100)]],
    estadoNome: ['', [Validators.required, Validators.maxLength(100)]],
    estadoSigla: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
  });

  protected lookupCep(): void {
    const cep = this.form.controls.cep.value.replace(/\D/g, '');
    if (cep.length !== 8 || this.isLookingUpCep()) {
      this.form.controls.cep.markAsTouched();
      return;
    }
    this.errorMessage.set('');
    this.isLookingUpCep.set(true);
    this.cepService.lookup(cep).pipe(finalize(() => this.isLookingUpCep.set(false))).subscribe({
      next: (address) => {
        if (address.erro) {
          this.errorMessage.set('CEP não encontrado. Confira o número e tente novamente.');
          return;
        }
        this.form.patchValue({
          logradouro: address.logradouro ?? '',
          bairro: address.bairro ?? '',
          municipio: address.localidade ?? '',
          estadoNome: address.estado ?? address.uf ?? '',
          estadoSigla: address.uf ?? '',
        });
      },
      error: () => this.errorMessage.set('Não foi possível consultar o CEP. Tente novamente.'),
    });
  }

  protected save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: ClientePayload = {
      ...value,
      cpf: value.cpf.replace(/\D/g, ''),
      telefone: value.telefone.replace(/\D/g, ''),
      cep: value.cep.replace(/\D/g, ''),
      estadoSigla: value.estadoSigla.toUpperCase(),
    };
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSaving.set(true);
    this.customers.create(payload).pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.successMessage.set('Cliente cadastrado com sucesso.');
        this.form.reset();
      },
      error: (error: { status?: number }) => this.errorMessage.set(
        error.status === 409 ? 'Este CPF já está cadastrado.' : 'Não foi possível cadastrar o cliente. Revise os dados e tente novamente.',
      ),
    });
  }
}