import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskLevel } from '../../../core/models/analysis.model';

// SVG icon paths keyed by risk level.
// Each value is a self-contained 16×16 SVG string rendered via [innerHTML].
const ICONS: Record<string, string> = {
  trustworthy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
    <path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd"/>
  </svg>`,
  mostly_trustworthy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
    <path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd"/>
  </svg>`,
  needs_verification: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
    <path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/>
  </svg>`,
  suspicious: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
    <path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/>
  </svg>`,
  high_risk: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z"/>
  </svg>`,
  scam: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
    <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" clip-rule="evenodd"/>
  </svg>`,
  misinformation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
    <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/>
  </svg>`,
};

@Component({
  selector: 'app-risk-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-badge.component.html',
  styleUrl: './risk-badge.component.css',
})
export class RiskBadgeComponent {
  @Input() riskLevel!: RiskLevel | null;

  get iconSvg(): string {
    return ICONS[this.riskLevel ?? ''] ?? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
    </svg>`;
  }

  get label(): string {
    const labels: Record<string, string> = {
      trustworthy: 'Likely Trustworthy',
      mostly_trustworthy: 'Mostly Trustworthy',
      needs_verification: 'Needs Verification',
      suspicious: 'Suspicious',
      high_risk: 'High Risk',
      scam: 'Potential Scam',
      misinformation: 'Potential Misinformation',
    };
    return labels[this.riskLevel ?? ''] ?? 'Unknown';
  }

  get badgeClass(): string {
    const classes: Record<string, string> = {
      trustworthy: 'bg-green-100 text-green-700 border-green-300',
      mostly_trustworthy: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      needs_verification: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      suspicious: 'bg-orange-100 text-orange-700 border-orange-300',
      high_risk: 'bg-red-100 text-red-700 border-red-300',
      scam: 'bg-red-200 text-red-800 border-red-500',
      misinformation: 'bg-purple-100 text-purple-700 border-purple-300',
    };
    return classes[this.riskLevel ?? ''] ?? 'bg-gray-100 text-gray-600 border-gray-300';
  }
}
