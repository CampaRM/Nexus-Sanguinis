import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MedicalCenter } from '../models/entities.model';

@Injectable({
  providedIn: 'root',
})
export class MedicalCenterService {
  private apiUrl = 'http://localhost:3000/api/medical-centers';

  constructor(private http: HttpClient) {}

  getAll(): Observable<MedicalCenter[]> {
    return this.http.get<{ success: boolean; data: MedicalCenter[] }>(this.apiUrl).pipe(
      map((res) => res.data)
    );
  }

  getById(id: number): Observable<MedicalCenter> {
    return this.http.get<{ success: boolean; data: MedicalCenter }>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res.data)
    );
  }

  create(center: Partial<MedicalCenter>): Observable<MedicalCenter> {
    return this.http.post<{ success: boolean; data: MedicalCenter }>(this.apiUrl, center).pipe(
      map((res) => res.data)
    );
  }

  update(id: number, center: Partial<MedicalCenter>): Observable<MedicalCenter> {
    return this.http.put<{ success: boolean; data: MedicalCenter }>(`${this.apiUrl}/${id}`, center).pipe(
      map((res) => res.data)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
