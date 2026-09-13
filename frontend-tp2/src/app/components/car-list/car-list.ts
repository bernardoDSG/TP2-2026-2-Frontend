import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { Carro } from '../../models/car.model';

@Component({
  selector: 'app-car-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './car-list.html',
  styleUrl: '../task-board/task-board.css',
})
export class CarList {
  private readonly route = inject(ActivatedRoute);
  protected readonly cars = signal<Carro[]>(this.route.snapshot.data['cars']);
  protected readonly searchTerm = signal('');
  protected readonly errorMessage = signal('');
  protected readonly filteredCars = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    return query ? this.cars().filter((car) => car.nome.toLowerCase().includes(query)) : this.cars();
  });


  protected setSearchTerm(value: string): void { this.searchTerm.set(value); }
  protected statusName(car: Carro): string { return car.statusUso?.nome ?? 'Sem status'; }
  protected colorLabel(car: Carro): string {
    const color = car.cor;
    if (!color) return 'Sem cor';
    const tone = color.tonalidade?.nome;
    return tone ? `${color.nome} - ${tone}` : color.nome;
  }
}
