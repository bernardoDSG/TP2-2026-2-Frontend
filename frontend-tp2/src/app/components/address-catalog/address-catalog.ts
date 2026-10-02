import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Estado, Municipio } from '../../models/address-catalog.model';
import { EstadoService } from '../../services/estado.service';
import { MunicipioService } from '../../services/municipio.service';
import { EntityMenu } from '../entity-menu/entity-menu';

type AddressTab = 'estados' | 'municipios';

@Component({
  selector: 'app-address-catalog',
  imports: [CommonModule, RouterLink, EntityMenu],
  templateUrl: './address-catalog.html',
  styleUrl: '../task-board/task-board.css',
})
export class AddressCatalog {
  private readonly route = inject(ActivatedRoute);
  private readonly estadosService = inject(EstadoService);
  private readonly municipiosService = inject(MunicipioService);
  protected readonly activeTab = signal<AddressTab>(this.route.snapshot.paramMap.get('kind') === 'municipios' ? 'municipios' : 'estados');
  protected readonly estados = signal<Estado[]>([]);
  protected readonly municipios = signal<Municipio[]>([]);
  protected readonly errorMessage = signal('');

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.activeTab.set(params.get('kind') === 'municipios' ? 'municipios' : 'estados');
    });
    this.load();
  }

  private load(): void {
    this.estadosService.getAll().subscribe({
      next: (estados) => this.estados.set(estados),
      error: () => this.errorMessage.set('Não foi possível carregar os estados.'),
    });
    this.municipiosService.getAll().subscribe({
      next: (municipios) => this.municipios.set(municipios),
      error: () => this.errorMessage.set('Não foi possível carregar os municípios.'),
    });
  }
}