import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { CompaniesService } from '../../core/services/companies.service';
import { AuthService } from '../../core/services/auth.service';
import { Company } from '../../core/models/company.model';

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
    MatToolbarModule,
    MatChipsModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>JobReady CRM</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/dashboard" routerLinkActive="active-link">Dashboard</a>
      <a mat-button routerLink="/companies" routerLinkActive="active-link">Companies</a>
      <span class="user" *ngIf="auth.currentUser() as u">{{ u.name }}</span>
      <button mat-button (click)="logout()">Salir</button>
    </mat-toolbar>

    <div class="container">
      <div class="header">
        <h2>Companies <span class="count">({{ filteredItems().length }} / {{ items().length }})</span></h2>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon> Nueva
        </button>
      </div>

      <form [formGroup]="filterForm" class="filters">
        <mat-form-field appearance="outline" class="search">
          <mat-label>Buscar</mat-label>
          <input matInput formControlName="search" placeholder="Nombre o notas" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Sector</mat-label>
          <mat-select formControlName="sector">
            <mat-option value="">Todos</mat-option>
            <mat-option *ngFor="let s of sectors()" [value]="s">{{ s }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Rating mínimo</mat-label>
          <mat-select formControlName="minRating">
            <mat-option [value]="0">Cualquiera</mat-option>
            <mat-option [value]="1">1 ★+</mat-option>
            <mat-option [value]="2">2 ★+</mat-option>
            <mat-option [value]="3">3 ★+</mat-option>
            <mat-option [value]="4">4 ★+</mat-option>
            <mat-option [value]="5">5 ★</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-button type="button" (click)="clearFilters()" *ngIf="hasFilters()">
          <mat-icon>clear</mat-icon> Limpiar
        </button>
      </form>

      <p *ngIf="loading()">Cargando...</p>
      <p *ngIf="!loading() && !items().length">No hay empresas. Crea la primera con el botón "Nueva".</p>
      <p *ngIf="!loading() && items().length && !filteredItems().length">Ningún resultado con esos filtros.</p>

      <table mat-table [dataSource]="filteredItems()" *ngIf="filteredItems().length">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let item">{{ item.name }}</td>
        </ng-container>

        <ng-container matColumnDef="sector">
          <th mat-header-cell *matHeaderCellDef>Sector</th>
          <td mat-cell *matCellDef="let item">{{ item.sector || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="rating">
          <th mat-header-cell *matHeaderCellDef>Rating</th>
          <td mat-cell *matCellDef="let item">{{ item.rating || 0 }} / 5</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let item">
            <button mat-icon-button [routerLink]="[item.id]" aria-label="Editar"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="delete(item.id)" aria-label="Eliminar"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </div>
  `,
  styles: [`
    .container { max-width:1100px; margin:24px auto; padding:0 16px; }
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    .count { font-size:.9rem; color:#888; font-weight:400; }
    .filters {
      display:grid;
      grid-template-columns:2fr 1fr 1fr auto;
      gap:12px;
      align-items:start;
      margin-bottom:8px;
    }
    @media (max-width:800px) { .filters { grid-template-columns:1fr 1fr; } }
    .search { width:100%; }
    table { width:100%; }
    .spacer { flex:1; }
    .user { margin-right:12px; font-size:14px; opacity:.85; }
    .active-link { background: rgba(255,255,255,.15); }
  `],
})
export class CompaniesListComponent implements OnInit {
  private service = inject(CompaniesService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  items = signal<Company[]>([]);
  filteredItems = signal<Company[]>([]);
  loading = signal(false);
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

  hasFilters = signal(false);

  ngOnInit() {
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

  applyFilters() {
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

  clearFilters() {
    this.filterForm.reset({ search: '', sector: '', minRating: 0 });
  }

  delete(id: number) {
    if (!confirm('¿Eliminar esta empresa?')) return;
    this.service.delete(id).subscribe(() => {
      this.items.update((list) => list.filter((i) => i.id !== id));
      this.applyFilters();
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
