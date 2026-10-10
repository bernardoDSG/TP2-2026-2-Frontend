import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Categoria } from '../models/categoria.model';
import { CategoriaService } from '../services/categoria.service';

export const categoriasResolver: ResolveFn<Categoria[]> = () => inject(CategoriaService).getAll();
