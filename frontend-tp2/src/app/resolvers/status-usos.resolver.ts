import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { StatusUso } from '../models/status-uso.model';
import { StatusUsoService } from '../services/status-uso.service';

export const statusUsosResolver: ResolveFn<StatusUso[]> = () => inject(StatusUsoService).getAll();
