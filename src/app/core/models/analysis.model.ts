// Core domain models for TruthLens AI frontend

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "analyst" | "admin";
  country: string;
  language: string;
  date_joined: string;
  is_verified: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface AnalyzeRequest {
  text?: string;
  url?: string;
}

export interface ExtractedClaim {
  id: string;
  claim_text: string;
  claim_type: string;
  requires_verification: boolean;
  is_suspicious: boolean;
  suspicion_reason: string;
}

export interface URLOnlineCheck {
  checked: boolean;
  reachable: boolean | null;
  status_code?: number | null;
  final_url?: string;
  redirect_count?: number;
  error?: string | null;
}

export interface URLCrosscheckLinks {
  google_safe_browsing?: string;
  virustotal?: string;
  urlscan?: string;
  whois?: string;
}

export interface URLAnalysisResult {
  url: string;
  domain: string;
  uses_https: boolean | null;
  domain_age_days: number | null;
  is_typosquatting_suspected: boolean;
  is_brand_impersonation_suspected: boolean;
  redirects_detected: boolean;
  redirect_chain: string[];
  redirect_count: number;
  final_url: string;
  tld_risk: number;
  path_depth: number;
  encoding_issues: boolean;
  signal_detail: Record<string, unknown>;
  suspicious_patterns: string[];
  reputation_signals: {
    online_check?: URLOnlineCheck;
    crosscheck_links?: URLCrosscheckLinks;
  } & Record<string, unknown>;
  url_risk_score: number | null;
  url_risk_details: string;
}

/** Response from the lightweight POST /api/v1/analysis/url-info/ endpoint */
export interface URLInfoResult {
  url: string;
  domain: string;
  risk_score: number;
  risk_label: string;
  confidence: number;
  uses_https: boolean;
  is_brand_impersonation_suspected: boolean;
  is_typosquatting_suspected: boolean;
  suspicious_patterns: string[];
  signal_detail: Record<string, unknown>;
  findings: string[];
  tld_risk: number;
  path_depth: number;
  encoding_issues: boolean;
  latency_ms: number;
}

export interface RiskAssessmentResult {
  content_analysis_score: number;
  source_reliability_score: number;
  evidence_score: number;
  url_risk_score: number;
  community_score: number;
  scam_pattern_score: number;
  total_risk_score: number;
  weights_used: Record<string, number>;
  key_findings: string[];
}

export interface Evidence {
  id: string;
  evidence_type: "supporting" | "contradicting" | "neutral";
  title: string;
  description: string;
  source_url: string;
  source_name: string;
  reliability_score: number | null;
  is_mock: boolean;
}

export interface SubmittedContent {
  id: string;
  content_type: "text" | "url" | "image" | "document";
  raw_text: string;
  url: string;
  created_at: string;
}

export type RiskLevel =
  | "trustworthy"
  | "mostly_trustworthy"
  | "needs_verification"
  | "suspicious"
  | "high_risk"
  | "scam"
  | "misinformation";

export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";

export interface Analysis {
  id: string;
  status: AnalysisStatus;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  threat_category: string | null;
  confidence_score: number | null;
  summary: string;
  explanation: string;
  recommendation: string;
  agent_scores: Record<string, number>;
  content: SubmittedContent;
  claims: ExtractedClaim[];
  url_analysis: URLAnalysisResult | null;
  risk_assessment: RiskAssessmentResult | null;
  evidence: Evidence[];
  created_at: string;
  completed_at: string | null;
}

export interface AnalysisList {
  id: string;
  status: AnalysisStatus;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  threat_category: string | null;
  confidence_score: number | null;
  summary: string;
  created_at: string;
}

export interface ScamReportRequest {
  report_category: string;
  raw_text?: string;
  url?: string;
  description?: string;
  phone_number?: string;
  country?: string;
}

export interface ThreatCampaign {
  id: string;
  title: string;
  description: string;
  threat_category: string;
  status: string;
  risk_level: string;
  report_count: number;
  affected_countries: string[];
  related_urls: string[];
  recommendation: string;
  first_detected_at: string;
  last_activity_at: string;
}

export interface ApiError {
  error?: string;
  detail?: string;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
