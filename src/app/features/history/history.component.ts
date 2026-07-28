import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnalysisService } from '../../core/services/analysis.service';
import { AnalysisList, PaginatedResponse } from '../../core/models/analysis.model';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink, RiskBadgeComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit {
  analyses = signal<AnalysisList[]>([]);
  loading = signal(true);
  hasMore = signal(false);
  page = 1;

  constructor(private service: AnalysisService) {}

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadMore(): void {
    this.page++;
    this.loadPage(this.page);
  }

  private loadPage(page: number): void {
    this.loading.set(true);
    this.service.listAnalyses(page).subscribe({
      next: (data: PaginatedResponse<AnalysisList>) => {
        if (page === 1) {
          this.analyses.set(data.results);
        } else {
          this.analyses.update(prev => [...prev, ...data.results]);
        }
        this.hasMore.set(!!data.next);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  scoreColor(score: number | null): string {
    if (score === null) return 'text-gray-400';
    if (score < 30) return 'text-green-600';
    if (score < 55) return 'text-yellow-600';
    if (score < 75) return 'text-orange-600';
    return 'text-red-600';
  }
}
