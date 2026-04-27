import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StatsService } from '../../core/services/stats.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../core/models/stats.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressBarModule,
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

    <div class="dashboard">
      <h1>Panel de Control</h1>
      <p *ngIf="loading()">Cargando métricas...</p>

      <ng-container *ngIf="stats() as s">
        <div class="metrics-grid">
          <mat-card class="metric-card highlight">
            <mat-card-content>
              <mat-icon>business</mat-icon>
              <div class="metric-value">{{ s.total }}</div>
              <div class="metric-label">Empresas registradas</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <mat-icon>star</mat-icon>
              <div class="metric-value">{{ s.avgRating || '—' }}</div>
              <div class="metric-label">Rating medio</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <mat-icon>category</mat-icon>
              <div class="metric-value">{{ s.bySector.length }}</div>
              <div class="metric-label">Sectores distintos</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <mat-icon>trending_up</mat-icon>
              <div class="metric-value">{{ topSector() }}</div>
              <div class="metric-label">Sector top</div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="row">
          <mat-card class="col">
            <mat-card-header>
              <mat-card-title>Distribución por sector</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p *ngIf="!s.bySector.length" class="empty">Sin datos.</p>
              <div *ngFor="let item of s.bySector" class="bar-row">
                <span class="bar-label">{{ item.sector }}</span>
                <mat-progress-bar mode="determinate" [value]="(item.count / s.total) * 100"></mat-progress-bar>
                <span class="bar-count">{{ item.count }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="col">
            <mat-card-header>
              <mat-card-title>Distribución por rating</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p *ngIf="!s.byRating.length" class="empty">Sin datos.</p>
              <div *ngFor="let item of s.byRating" class="bar-row">
                <span class="bar-label">{{ item.rating }} ★</span>
                <mat-progress-bar mode="determinate" [value]="(item.count / s.total) * 100" color="accent"></mat-progress-bar>
                <span class="bar-count">{{ item.count }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="recent-card">
          <mat-card-header>
            <mat-card-title>Actividad reciente</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p *ngIf="!s.recent.length" class="empty">Aún no hay empresas. <a routerLink="/companies/new">Crea la primera</a>.</p>
            <a class="recent-item" *ngFor="let item of s.recent" [routerLink]="['/companies', item.id]">
              <div class="recent-main">
                <strong>{{ item.name }}</strong>
                <span class="muted">{{ item.sector || 'Sin sector' }}</span>
              </div>
              <div class="recent-meta">
                <span class="rating">{{ item.rating || 0 }} ★</span>
                <span class="muted">{{ item.createdAt | date:'short' }}</span>
              </div>
            </a>
          </mat-card-content>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: [`
    .dashboard { padding:24px; max-width:1200px; margin:0 auto; }
    h1 { margin-top:0; }
    .spacer { flex:1; }
    .user { margin-right:12px; font-size:14px; opacity:.85; }
    .active-link { background: rgba(255,255,255,.15); }

    .metrics-grid {
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));
      gap:16px;
      margin-bottom:24px;
    }
    .metric-card {
      text-align:center;
      transition:transform .15s ease;
    }
    .metric-card:hover { transform:translateY(-2px); }
    .metric-card mat-icon { font-size:32px; width:32px; height:32px; color:#1976d2; }
    .metric-card.highlight { background:linear-gradient(135deg,#1976d2,#1565c0); color:#fff; }
    .metric-card.highlight mat-icon { color:#fff; }
    .metric-value { font-size:2.5rem; font-weight:700; line-height:1.1; margin-top:8px; }
    .metric-label { color:#666; font-size:.9rem; margin-top:4px; }
    .metric-card.highlight .metric-label { color:rgba(255,255,255,.85); }

    .row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; }
    @media (max-width:800px) { .row { grid-template-columns:1fr; } }
    .col { min-height:200px; }

    .bar-row {
      display:grid;
      grid-template-columns:120px 1fr 40px;
      align-items:center;
      gap:12px;
      padding:6px 0;
    }
    .bar-label { font-size:.9rem; }
    .bar-count { text-align:right; font-weight:600; }

    .recent-card { margin-top:8px; }
    .recent-item {
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:12px 8px;
      border-bottom:1px solid #eee;
      text-decoration:none;
      color:inherit;
      transition:background .1s ease;
    }
    .recent-item:last-child { border-bottom:0; }
    .recent-item:hover { background:#fafafa; }
    .recent-main { display:flex; flex-direction:column; }
    .recent-meta { display:flex; flex-direction:column; align-items:flex-end; gap:2px; font-size:.85rem; }
    .rating { color:#f9a825; font-weight:600; }
    .muted { color:#888; font-size:.85rem; }
    .empty { color:#888; font-style:italic; }
  `],
})
export class DashboardComponent implements OnInit {
  private statsService = inject(StatsService);
  private router = inject(Router);
  auth = inject(AuthService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(false);

  topSector = computed(() => {
    const s = this.stats();
    return s?.bySector?.[0]?.sector ?? '—';
  });

  ngOnInit() {
    this.loading.set(true);
    this.statsService.getDashboard().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
