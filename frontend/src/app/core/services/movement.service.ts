import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MovementHistory } from '../models/entities.model';

@Injectable({
  providedIn: 'root',
})
export class MovementService {
  private apiUrl = 'http://localhost:3000/api/movements';

  constructor(private http: HttpClient) {}

  getAll(id_blood_unit?: number, id_user?: number, limit = 50): Observable<MovementHistory[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (id_blood_unit) params = params.set('id_blood_unit', id_blood_unit.toString());
    if (id_user) params = params.set('id_user', id_user.toString());

    return this.http
      .get<{ success: boolean; data: MovementHistory[] }>(this.apiUrl, { params })
      .pipe(map((res) => res.data));
  }
}
