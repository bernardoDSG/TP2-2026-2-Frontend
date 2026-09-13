import { Routes } from '@angular/router';
import { CarDelete } from './components/car-delete/car-delete';
import { CarForm } from './components/car-form/car-form';
import { CarList } from './components/car-list/car-list';
import { ColorBoard } from './components/color-board/color-board';
import { carsResolver } from './resolvers/cars.resolver';
import { colorsResolver } from './resolvers/colors.resolver';

export const routes: Routes = [
	{ path: '', redirectTo: 'carros', pathMatch: 'full' },
	{ path: 'carros', component: CarList, resolve: { cars: carsResolver } },
	{ path: 'carros/cadastro', component: CarForm, resolve: { colors: colorsResolver } },
	{ path: 'carros/editar/:id', component: CarForm, resolve: { colors: colorsResolver } },
	{ path: 'carros/excluir/:id', component: CarDelete },
	{ path: 'cores', component: ColorBoard, resolve: { colors: colorsResolver } },
	{ path: '**', redirectTo: 'carros' },
];
