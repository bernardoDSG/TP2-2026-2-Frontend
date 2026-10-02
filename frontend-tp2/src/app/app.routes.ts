import { Routes } from '@angular/router';
import { CarDelete } from './components/car-delete/car-delete';
import { CarForm } from './components/car-form/car-form';
import { CarList } from './components/car-list/car-list';
import { ColorBoard } from './components/color-board/color-board';
import { ColorDelete } from './components/color-delete/color-delete';
import { ColorForm } from './components/color-form/color-form';
import { CustomerList } from './components/customer-list/customer-list';
import { CustomerForm } from './components/customer-form/customer-form';
import { CustomerDelete } from './components/customer-delete/customer-delete';
import { AddressCatalog } from './components/address-catalog/address-catalog';
import { AddressCatalogForm } from './components/address-catalog/address-catalog-form';
import { AddressCatalogDelete } from './components/address-catalog/address-catalog-delete';
import { carsResolver } from './resolvers/cars.resolver';
import { colorsResolver } from './resolvers/colors.resolver';

export const routes: Routes = [
	{ path: '', redirectTo: 'carros', pathMatch: 'full' },
	{ path: 'carros', component: CarList, resolve: { cars: carsResolver } },
	{ path: 'carros/cadastro', component: CarForm, resolve: { colors: colorsResolver } },
	{ path: 'carros/editar/:id', component: CarForm, resolve: { colors: colorsResolver } },
	{ path: 'carros/excluir/:id', component: CarDelete },
	{ path: 'clientes', component: CustomerList },
	{ path: 'clientes/cadastro', component: CustomerForm },
	{ path: 'clientes/editar/:id', component: CustomerForm },
	{ path: 'clientes/excluir/:id', component: CustomerDelete },
	{ path: 'cores', component: ColorBoard, resolve: { colors: colorsResolver } },
	{ path: 'cores/cadastro', component: ColorForm },
	{ path: 'cores/editar/:id', component: ColorForm },
	{ path: 'cores/excluir/:id', component: ColorDelete },
	{ path: 'enderecos/:kind/cadastro', component: AddressCatalogForm },
	{ path: 'enderecos/:kind/editar/:id', component: AddressCatalogForm },
	{ path: 'enderecos/:kind/excluir/:id', component: AddressCatalogDelete },
	{ path: 'enderecos/:kind', component: AddressCatalog },
	{ path: 'enderecos', redirectTo: 'enderecos/estados', pathMatch: 'full' },
	{ path: '**', redirectTo: 'carros' },
];
