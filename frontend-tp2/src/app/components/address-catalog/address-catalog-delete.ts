import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { EstadoService } from '../../services/estado.service';
import { MunicipioService } from '../../services/municipio.service';
import { EntityMenu } from '../entity-menu/entity-menu';

@Component({
  selector: 'app-address-catalog-delete',
  imports: [RouterLink, EntityMenu],
  templateUrl: './address-catalog-delete.html',
  styleUrl: '../task-board/task-board.css',
})
export class AddressCatalogDelete {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly estadoService = inject(EstadoService);
  private readonly municipioService = inject(MunicipioService);
  protected readonly kind = this.route.snapshot.paramMap.get('kind') === 'municipios' ? 'municipios' : 'estados';
  protected readonly isEstado = this.kind === 'estados';
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly name = signal('');
  protected readonly detail = signal('');
  protected readonly isDeleting = signal(false);
  protected readonly errorMessage = signal('');

  constructor() {
    if (this.isEstado) {
      this.estadoService.getById(this.id).subscribe({
        next: (estado) => { this.name.set(estado.nome); this.detail.set(estado.sigla); },
        error: () => this.errorMessage.set('Não foi possível carregar o estado.'),
      });
    } else {
      this.municipioService.getById(this.id).subscribe({
        next: (municipio) => { this.name.set(municipio.nome); this.detail.set(`${municipio.estado.nome} (${municipio.estado.sigla})`); },
        error: () => this.errorMessage.set('Não foi possível carregar o município.'),
      });
    }
  }

  protected remove(): void {
    const request$ = this.isEstado ? this.estadoService.delete(this.id) : this.municipioService.delete(this.id);
    this.isDeleting.set(true);
    request$.pipe(finalize(() => this.isDeleting.set(false))).subscribe({
      next: () => this.router.navigateByUrl('/enderecos'),
      error: (error: { status?: number }) => this.errorMessage.set(
        error.status === 409
          ? this.isEstado ? 'Este estado possui municípios cadastrados.' : 'Este município está associado a endereços de clientes.'
          : 'Não foi possível excluir o cadastro.',
      ),
    });
  }
}