import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DashboardMetrics } from '../models/entities.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/dashboard/metrics';

  constructor(private http: HttpClient) {}

  getMetrics(id_medical_center?: number): Observable<{ metrics: DashboardMetrics; summary: any }> {
    let params = new HttpParams();
    if (id_medical_center) {
      params = params.set('id_medical_center', id_medical_center.toString());
    }

    return this.http
      .get<{ success: boolean; data: { metrics: DashboardMetrics; summary: any } }>(this.apiUrl, { params })
      .pipe(map((res) => res.data));
  }
}
