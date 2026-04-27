import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StatsService } from '../../core/services/stats.service';
import { DashboardStats } from '../../core/models/stats.model';
import { AppToolbarComponent } from '../../shared/components/app-toolbar.component';

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
    MatProgressBarModule,
    AppToolbarComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private statsService = inject(StatsService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(false);

  topSector = computed(() => this.stats()?.bySector?.[0]?.sector ?? '—');

  ngOnInit(): void {
    this.loading.set(true);
    this.statsService.getDashboard().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
