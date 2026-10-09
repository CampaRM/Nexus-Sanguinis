import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BloodUnit } from '../models/entities.model';

export interface BloodUnitFilterParams {
  blood_type?: string;
  rh_factor?: string;
  status?: string;
  id_medical_center?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedBloodUnits {
  items: BloodUnit[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class BloodUnitService {
  private apiUrl = 'http://localhost:3000/api/blood-units';

  constructor(private http: HttpClient) {}

  getFiltered(filters: BloodUnitFilterParams): Observable<PaginatedBloodUnits> {
    let params = new HttpParams();

    if (filters.blood_type) params = params.set('blood_type', filters.blood_type);
    if (filters.rh_factor) params = params.set('rh_factor', filters.rh_factor);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.id_medical_center) params = params.set('id_medical_center', filters.id_medical_center.toString());
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<{ success: boolean; data: PaginatedBloodUnits }>(this.apiUrl, { params }).pipe(
      map((res) => res.data)
    );
  }

  getById(id: number): Observable<BloodUnit> {
    return this.http.get<{ success: boolean; data: BloodUnit }>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res.data)
    );
  }

  create(unit: any): Observable<BloodUnit> {
    return this.http.post<{ success: boolean; data: BloodUnit }>(this.apiUrl, unit).pipe(
      map((res) => res.data)
    );
  }

  update(id: number, data: any): Observable<BloodUnit> {
    return this.http.put<{ success: boolean; data: BloodUnit }>(`${this.apiUrl}/${id}`, data).pipe(
      map((res) => res.data)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
