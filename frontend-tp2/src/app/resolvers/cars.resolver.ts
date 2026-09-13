import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Carro } from '../models/car.model';
import { CarService } from '../services/car.service';

export const carsResolver: ResolveFn<Carro[]> = () => inject(CarService).getAll();
