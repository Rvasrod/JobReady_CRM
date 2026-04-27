import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CompaniesService } from '../../core/services/companies.service';
import { Company } from '../../core/models/company.model';
import { AppToolbarComponent } from '../../shared/components/app-toolbar.component';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    AppToolbarComponent,
  ],
  templateUrl: './companies-list.component.html',
  styleUrl: './companies-list.component.scss',
})
export class CompaniesListComponent implements OnInit {
  private service = inject(CompaniesService);
  private fb = inject(FormBuilder);

  items = signal<Company[]>([]);
  filteredItems = signal<Company[]>([]);
  loading = signal(false);
  hasFilters = signal(false);
  displayedColumns = ['name', 'sector', 'rating', 'actions'];

  filterForm = this.fb.nonNullable.group({
    search: [''],
    sector: [''],
    minRating: [0],
  });

  sectors = computed(() =>
    Array.from(
      new Set(
        this.items()
          .map((c) => c.sector?.trim())
          .filter((s): s is string => !!s)
      )
    ).sort()
  );

  ngOnInit(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.filteredItems.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const { search, sector, minRating } = this.filterForm.getRawValue();
    const term = (search ?? '').trim().toLowerCase();
    const sec = (sector ?? '').trim();
    const min = Number(minRating) || 0;

    this.hasFilters.set(!!term || !!sec || min > 0);

    this.filteredItems.set(
      this.items().filter((c) => {
        if (term) {
          const hay = `${c.name} ${c.sector ?? ''} ${c.notes ?? ''}`.toLowerCase();
          if (!hay.includes(term)) return false;
        }
        if (sec && c.sector !== sec) return false;
        if (min > 0 && (c.rating ?? 0) < min) return false;
        return true;
      })
    );
  }

  clearFilters(): void {
    this.filterForm.reset({ search: '', sector: '', minRating: 0 });
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar esta empresa?')) return;
    this.service.delete(id).subscribe(() => {
      this.items.update((list) => list.filter((i) => i.id !== id));
      this.applyFilters();
    });
  }
}
