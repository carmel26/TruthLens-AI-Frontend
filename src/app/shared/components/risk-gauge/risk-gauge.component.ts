import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-risk-gauge',
  standalone: true,
  templateUrl: './risk-gauge.component.html',
  styleUrl: './risk-gauge.component.css',
})
export class RiskGaugeComponent {
  @Input() score: number = 0;
  @Input() label: string = 'Risk Score';

  get dashOffset(): number {
    const circumference = 301.6;
    return circumference - (this.score / 100) * circumference;
  }

  get ringColor(): string {
    if (this.score < 20) return '#22c55e';
    if (this.score < 35) return '#86efac';
    if (this.score < 50) return '#fbbf24';
    if (this.score < 65) return '#f97316';
    if (this.score < 80) return '#ef4444';
    return '#991b1b';
  }
}
