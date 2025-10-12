import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error: string | null = null;

  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.loading = true;
    this.error = null;
    this.productService.getProducts().subscribe({
      next: res => { this.products = res; this.loading = false; },
      error: err => { this.error = 'No se pudo cargar la lista. Comprueba JSON Server.'; this.loading = false; }
    });
  }

  edit(id?: number) {
    if (!id) return;
    this.router.navigate(['/products/edit', id]);
  }

  remove(id?: number) {
    if (!id) return;
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => this.fetchProducts(),
      error: () => alert('Error al eliminar el producto.')
    });
  }
}
