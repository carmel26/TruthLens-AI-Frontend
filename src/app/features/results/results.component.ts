import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AnalysisService } from "../../core/services/analysis.service";
import {
  Analysis,
  URLAnalysisResult,
  URLOnlineCheck,
} from "../../core/models/analysis.model";
import { RiskBadgeComponent } from "../../shared/components/risk-badge/risk-badge.component";
import { RiskGaugeComponent } from "../../shared/components/risk-gauge/risk-gauge.component";
import { SkeletonComponent } from "../../shared/components/skeleton/skeleton.component";

/** Human-readable label for a suspicious_patterns key */
const PATTERN_LABELS: Record<string, string> = {
  no_https: "No HTTPS encryption",
  ip_address_as_host: "IP address used as host",
  brand_impersonation: "Brand impersonation detected",
  typosquatting_suspected: "Typosquatting (lookalike domain)",
  punycode_idn: "Punycode / IDN domain",
  homoglyph_chars: "Homoglyph characters in domain",
  excessive_subdomains: "Excessive subdomain depth",
  suspicious_path_keywords: "Suspicious path keywords",
  encoding_abuse: "Excessive percent-encoding",
  deep_path: "Unusually deep URL path",
  non_standard_port: "Non-standard port",
  long_url: "Unusually long URL",
  dangerous_scheme: "Dangerous URI scheme",
};

/** Human-readable label for an external cross-check provider */
const CROSSCHECK_LABELS: Record<string, string> = {
  google_safe_browsing: "Google Safe Browsing",
  virustotal: "VirusTotal",
  urlscan: "urlscan.io",
  whois: "WHOIS Lookup",
};

@Component({
  selector: "app-results",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RiskBadgeComponent,
    RiskGaugeComponent,
    SkeletonComponent,
  ],
  templateUrl: "./results.component.html",
  styleUrl: "./results.component.css",
})
export class ResultsComponent implements OnInit {
  analysis = signal<Analysis | null>(null);
  loading = signal(true);
  error = signal("");

  constructor(
    private route: ActivatedRoute,
    private service: AnalysisService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")!;
    this.service.getAnalysis(id).subscribe({
      next: (data) => {
        this.analysis.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.detail || "Could not load analysis result.");
        this.loading.set(false);
      },
    });
  }

  formatCategory(cat: string | null): string {
    if (!cat) return "Unknown";
    return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  recommendationClass(): string {
    const level = this.analysis()?.risk_level;
    if (!level) return "bg-gray-50 border-gray-200 text-gray-700";
    if (["scam", "high_risk", "misinformation"].includes(level))
      return "bg-red-50 border-red-200 text-red-800";
    if (["suspicious", "needs_verification"].includes(level))
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
    return "bg-green-50 border-green-200 text-green-800";
  }

  scoreBreakdown(): { label: string; score: number }[] {
    const ra = this.analysis()?.risk_assessment;
    if (!ra) return [];
    return [
      { label: "Content Analysis", score: ra.content_analysis_score },
      { label: "Source Reliability", score: ra.source_reliability_score },
      { label: "Evidence Verification", score: ra.evidence_score },
      { label: "URL Risk", score: ra.url_risk_score },
      { label: "Community Reports", score: ra.community_score },
      { label: "Scam Pattern Detection", score: ra.scam_pattern_score },
    ];
  }

  /** Convert a raw suspicious_patterns key into a human label */
  patternLabel(key: string): string {
    // Handle dynamic keys like "suspicious_tld:.xyz"
    if (key.startsWith("suspicious_tld:")) {
      const tld = key.split(":")[1] ?? "";
      return `High-risk TLD: ${tld}`;
    }
    return PATTERN_LABELS[key] ?? key.replace(/_/g, " ");
  }

  /** Severity badge class for a URL risk score */
  urlScoreClass(score: number | null): string {
    if (score === null) return "text-gray-600";
    if (score >= 70) return "text-red-600 font-bold";
    if (score >= 40) return "text-orange-500 font-semibold";
    return "text-green-600 font-semibold";
  }

  /** Return only the non-trivial signal_detail entries as display pairs */
  signalDetailRows(ua: URLAnalysisResult): { key: string; value: string }[] {
    const detail = ua.signal_detail ?? {};
    return Object.entries(detail)
      .filter(([, v]) => v !== false && v !== null)
      .map(([k, v]) => ({
        key: k.replace(/_/g, " "),
        value: Array.isArray(v) ? (v as string[]).join(", ") : String(v),
      }));
  }

  /** External links the user can click to independently verify the link's accuracy */
  crosscheckLinks(ua: URLAnalysisResult): { label: string; url: string }[] {
    const links = ua.reputation_signals?.crosscheck_links ?? {};
    return Object.entries(links)
      .filter(([, url]) => !!url)
      .map(([key, url]) => ({
        label: CROSSCHECK_LABELS[key] ?? key,
        url: url as string,
      }));
  }

  /** Live reachability result from the quick online check, if one was performed */
  onlineCheck(ua: URLAnalysisResult): URLOnlineCheck | undefined {
    return ua.reputation_signals?.online_check;
  }
}
