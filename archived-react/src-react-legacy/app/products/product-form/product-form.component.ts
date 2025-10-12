import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../models/product.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate('260ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  isEditing = false;
  idToEdit?: number;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.idToEdit = Number(id);
      this.productService.getProduct(this.idToEdit).subscribe({
        next: p => this.form.patchValue(p),
        error: () => { alert('Error al cargar el producto.'); this.router.navigate(['/products']); }
      });
    }
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const payload: Product = this.form.value;
    if (this.isEditing && this.idToEdit != null) {
      this.productService.updateProduct(this.idToEdit, payload).subscribe({
        next: () => { alert('Producto actualizado con éxito'); this.router.navigate(['/products']); },
        error: () => alert('Error al actualizar el producto'),
        complete: () => this.isSubmitting = false
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: () => { alert('Producto creado con éxito'); this.router.navigate(['/products']); },
        error: () => alert('Error al crear el producto'),
        complete: () => this.isSubmitting = false
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}
