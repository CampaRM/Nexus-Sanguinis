import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TransferRequest } from '../models/entities.model';

@Injectable({
  providedIn: 'root',
})
export class TransferService {
  private apiUrl = 'http://localhost:3000/api/transfers';

  constructor(private http: HttpClient) {}

  getAll(status?: string): Observable<TransferRequest[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);

    return this.http.get<{ success: boolean; data: TransferRequest[] }>(this.apiUrl, { params }).pipe(
      map((res) => res.data)
    );
  }

  getById(id: number): Observable<TransferRequest> {
    return this.http.get<{ success: boolean; data: TransferRequest }>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res.data)
    );
  }

  create(request: {
    id_requesting_center: number;
    id_supplying_center: number;
    blood_type: string;
    quantity: number;
  }): Observable<TransferRequest> {
    return this.http.post<{ success: boolean; data: TransferRequest }>(this.apiUrl, request).pipe(
      map((res) => res.data)
    );
  }

  processTransfer(
    id: number,
    action: 'APPROVE' | 'REJECT',
    bloodUnitIds?: number[]
  ): Observable<TransferRequest> {
    return this.http
      .post<{ success: boolean; data: TransferRequest }>(`${this.apiUrl}/${id}/process`, {
        action,
        id_blood_units: bloodUnitIds,
      })
      .pipe(map((res) => res.data));
  }
}
