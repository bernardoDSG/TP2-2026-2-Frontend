import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, firstValueFrom, from, of, switchMap, tap } from 'rxjs';
import { Estado, Municipio } from '../../models/address-catalog.model';
import { ClienteEndereco, ClientePayload, EnderecoPayload } from '../../models/cliente.model';
import { CepAddress, CepService } from '../../services/cep.service';
import { ClienteService } from '../../services/cliente.service';
import { EstadoService } from '../../services/estado.service';
import { MunicipioService } from '../../services/municipio.service';
import { EntityMenu } from '../entity-menu/entity-menu';

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
  imports: [CommonModule, ReactiveFormsModule, RouterLink, EntityMenu],
  templateUrl: './customer-form.html',
  styleUrls: ['../task-board/task-board.css', './customer-form.css'],
})
export class CustomerForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly customers = inject(ClienteService);
  private readonly cepService = inject(CepService);
  private readonly estadoService = inject(EstadoService);
  private readonly municipioService = inject(MunicipioService);

  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly isEditing = this.id > 0;
  protected readonly isSaving = signal(false);
  protected readonly isLookingUpCep = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly estados = signal<Estado[]>([]);
  protected readonly municipios = signal<Municipio[]>([]);
  protected readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    cpf: ['', [Validators.required, cpfValidator]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    telefone: ['', [Validators.required, digitsLengthValidator(10, 11)]],
    enderecos: this.formBuilder.array([this.createAddressForm()]),
  });

  protected get addresses() { return this.form.controls.enderecos; }

  private createAddressForm(address?: ClienteEndereco) {
    return this.formBuilder.nonNullable.group({
      cep: [address?.cep ?? '', [Validators.required, digitsLengthValidator(8, 8)]],
      logradouro: [address?.logradouro ?? '', [Validators.required, Validators.maxLength(160)]],
      numero: [address?.numero ?? '', [Validators.required, Validators.maxLength(20)]],
      complemento: [address?.complemento ?? '', Validators.maxLength(100)],
      bairro: [address?.bairro ?? '', [Validators.required, Validators.maxLength(100)]],
      estadoId: [address?.municipio.estado.id ?? 0, [Validators.required, Validators.min(1)]],
      municipioId: [address?.municipio.id ?? 0, [Validators.required, Validators.min(1)]],
    });
  }

  constructor() {
    this.estadoService.getAll().subscribe({
      next: (estados) => this.estados.set(estados),
      error: () => this.errorMessage.set('Não foi possível carregar os estados cadastrados.'),
    });
    this.municipioService.getAll().subscribe({
      next: (municipios) => this.municipios.set(municipios),
      error: () => this.errorMessage.set('Não foi possível carregar os municípios cadastrados.'),
    });
    if (this.isEditing) {
      this.customers.getById(this.id).subscribe({
        next: (cliente) => {
          this.form.patchValue({ nome: cliente.nome, cpf: cliente.cpf, email: cliente.email, telefone: cliente.telefone });
          this.form.setControl('enderecos', this.formBuilder.array(cliente.enderecos.map((address) => this.createAddressForm(address))));
        },
        error: () => this.errorMessage.set('Não foi possível carregar o cliente.'),
      });
    }
  }

  protected addAddress(): void {
    this.addresses.push(this.createAddressForm());
  }

  protected removeAddress(index: number): void {
    if (this.addresses.length > 1) this.addresses.removeAt(index);
  }

  protected municipiosForState(estadoId: number | string): Municipio[] {
    return this.municipios().filter((municipio) => Number(municipio.estado.id) === Number(estadoId));
  }

  protected setAddressState(index: number, value: string): void {
    this.addresses.at(index).patchValue({ estadoId: Number(value), municipioId: 0 });
  }

  protected lookupCep(index: number): void {
    const address = this.addresses.at(index);
    const cep = address.controls.cep.value.replace(/\D/g, '');
    if (cep.length !== 8 || this.isLookingUpCep()) {
      address.controls.cep.markAsTouched();
      return;
    }
    this.errorMessage.set('');
    this.isLookingUpCep.set(true);
    this.cepService.lookup(cep).pipe(
      switchMap((cepAddress) => {
        if (cepAddress.erro) {
          this.errorMessage.set('CEP não encontrado. Confira o número e tente novamente.');
          return of(null);
        }
        return from(this.findOrCreateLocation(cepAddress)).pipe(tap(({ estado, municipio }) => {
          this.errorMessage.set('');
          address.patchValue({
            logradouro: cepAddress.logradouro ?? '',
            bairro: cepAddress.bairro ?? '',
            estadoId: estado.id,
            municipioId: municipio.id,
          });
        }));
      }),
      finalize(() => this.isLookingUpCep.set(false)),
    ).subscribe({
      error: () => this.errorMessage.set('Não foi possível preencher os dados do CEP. Confira a conexão e tente novamente.'),
    });
  }

  private async findOrCreateLocation(cepAddress: CepAddress): Promise<{ estado: Estado; municipio: Municipio }> {
    const sigla = cepAddress.uf.trim().toUpperCase();
    const nomeEstado = cepAddress.estado?.trim() || sigla;
    const nomeMunicipio = cepAddress.localidade.trim();
    let estado = this.estados().find((item) => item.sigla.toUpperCase() === sigla);

    if (!estado) {
      try {
        estado = await firstValueFrom(this.estadoService.create({ nome: nomeEstado, sigla }));
      } catch (error) {
        if ((error as { status?: number }).status !== 409) throw error;
        const estados = await firstValueFrom(this.estadoService.getAll());
        this.estados.set(estados);
        estado = estados.find((item) => item.sigla.toUpperCase() === sigla);
        if (!estado) throw error;
      }
      this.estados.update((estados) => estados.some((item) => item.id === estado!.id) ? estados : [...estados, estado!]);
    }

    let municipio = this.municipios().find((item) =>
      item.estado.id === estado!.id && item.nome.localeCompare(nomeMunicipio, undefined, { sensitivity: 'base' }) === 0,
    );
    if (!municipio) {
      try {
        municipio = await firstValueFrom(this.municipioService.create({ nome: nomeMunicipio, estadoId: estado.id }));
      } catch (error) {
        if ((error as { status?: number }).status !== 409) throw error;
        const municipios = await firstValueFrom(this.municipioService.getAll());
        this.municipios.set(municipios);
        municipio = municipios.find((item) =>
          item.estado.id === estado!.id && item.nome.localeCompare(nomeMunicipio, undefined, { sensitivity: 'base' }) === 0,
        );
        if (!municipio) throw error;
      }
      this.municipios.update((municipios) => municipios.some((item) => item.id === municipio!.id) ? municipios : [...municipios, municipio!]);
    }

    return { estado, municipio };
  }

  protected save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: ClientePayload = {
      nome: value.nome.trim(),
      cpf: value.cpf.replace(/\D/g, ''),
      email: value.email.trim(),
      telefone: value.telefone.replace(/\D/g, ''),
      enderecos: value.enderecos.map((address): EnderecoPayload => ({
        ...address,
        cep: address.cep.replace(/\D/g, ''),
        municipioId: Number(address.municipioId),
      })),
    };
    this.errorMessage.set('');
    this.isSaving.set(true);
    const request$ = this.isEditing
      ? this.customers.update(this.id, payload)
      : this.customers.create(payload);
    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.router.navigateByUrl('/clientes');
      },
      error: (error: { status?: number }) => this.errorMessage.set(
        error.status === 409 ? 'Este CPF já está cadastrado.' : 'Não foi possível cadastrar o cliente. Revise os dados e tente novamente.',
      ),
    });
  }
}