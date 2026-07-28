import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalysisService } from '../../core/services/analysis.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent],
  templateUrl: './analyzer.component.html',
  styleUrl: './analyzer.component.css',
})
export class AnalyzerComponent implements OnInit {
  textInput = '';
  urlInput = '';
  activeTab: 'text' | 'url' | 'both' = 'text';
  loading = signal(false);
  errorMsg = signal('');

  tabs: { key: 'text' | 'url' | 'both'; label: string }[] = [
    { key: 'text', label: 'Text / Message' },
    { key: 'url', label: 'URL' },
    { key: 'both', label: 'Text + URL' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analysisService: AnalysisService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['text']) {
        this.textInput = params['text'];
        this.activeTab = 'text';
      }
      if (params['url']) {
        this.urlInput = params['url'];
        this.activeTab = 'url';
      }
      if (params['text'] && params['url']) {
        this.activeTab = 'both';
      }
      if (params['text'] || params['url']) {
        setTimeout(() => this.analyze(), 100);
      }
    });
  }

  analyze(): void {
    const text = this.textInput.trim();
    const url = this.urlInput.trim();

    if (!text && !url) {
      this.errorMsg.set('Please provide text or a URL to analyze.');
      return;
    }

    this.errorMsg.set('');
    this.loading.set(true);

    const request = { ...(text && { text }), ...(url && { url }) };

    this.analysisService.analyze(request).subscribe({
      next: result => {
        this.loading.set(false);
        this.router.navigate(['/results', result.id]);
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.error || 'Analysis failed. Please try again.');
      },
    });
  }

  clear(): void {
    this.textInput = '';
    this.urlInput = '';
    this.errorMsg.set('');
  }
}
