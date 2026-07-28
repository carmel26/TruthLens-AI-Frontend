import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Analysis,
  AnalysisList,
  AnalyzeRequest,
  PaginatedResponse,
  ScamReportRequest,
  ThreatCampaign,
  URLInfoResult,
} from '../models/analysis.model';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Submit text/URL for analysis */
  analyze(request: AnalyzeRequest): Observable<Analysis> {
    return this.http.post<Analysis>(`${this.apiUrl}/analysis/analyze/`, request);
  }

  /** Get a specific analysis by ID */
  getAnalysis(id: string): Observable<Analysis> {
    return this.http.get<Analysis>(`${this.apiUrl}/analysis/${id}/`);
  }

  /** List the authenticated user's analyses */
  listAnalyses(page = 1): Observable<PaginatedResponse<AnalysisList>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<PaginatedResponse<AnalysisList>>(
      `${this.apiUrl}/analysis/`,
      { params }
    );
  }

  /** Submit a scam/misinformation report */
  submitReport(report: ScamReportRequest): Observable<{ message: string; report_id: string }> {
    return this.http.post<{ message: string; report_id: string }>(
      `${this.apiUrl}/community/report/`,
      report
    );
  }

  /** List active threat campaigns */
  getThreatCampaigns(): Observable<ThreatCampaign[]> {
    return this.http.get<ThreatCampaign[]>(`${this.apiUrl}/community/campaigns/`);
  }

  /** Lightweight URL scanner — returns signal breakdown without full pipeline */
  checkUrl(url: string): Observable<URLInfoResult> {
    return this.http.post<URLInfoResult>(`${this.apiUrl}/analysis/url-info/`, { url });
  }
}
