import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Color } from '../models/color.model';
import { ColorService } from '../services/color.service';

export const colorsResolver: ResolveFn<Color[]> = () => inject(ColorService).getAll();
