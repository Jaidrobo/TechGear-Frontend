import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list';
import { ProductFormComponent } from './components/product-form/product-form';

export const routes: Routes = [
  { path: '', redirectTo: '/productos', pathMatch: 'full' },
  { path: 'productos', component: ProductListComponent },
  { path: 'registro', component: ProductFormComponent }
];

