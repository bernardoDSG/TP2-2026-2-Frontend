import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Marca } from '../models/marca.model';
import { MarcaService } from '../services/marca.service';

export const marcasResolver: ResolveFn<Marca[]> = () => inject(MarcaService).getAll();
