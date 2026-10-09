import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovementService } from '../../core/services/movement.service';
import { MovementHistory } from '../../core/models/entities.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="saas-page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'MOVEMENTS.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'MOVEMENTS.SUBTITLE' | translate }}</p>
        </div>
        <button class="btn btn-outline" (click)="loadMovements()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          <span>{{ 'COMMON.REFRESH' | translate }}</span>
        </button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'MOVEMENTS.COL_ID' | translate }}</th>
              <th>{{ 'MOVEMENTS.COL_UNIT_ID' | translate }}</th>
              <th>{{ 'MOVEMENTS.COL_BLOOD_INFO' | translate }}</th>
              <th>{{ 'MOVEMENTS.COL_ACTION' | translate }}</th>
              <th>{{ 'MOVEMENTS.COL_USER' | translate }}</th>
              <th>{{ 'MOVEMENTS.COL_DATE' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @if (loading) {
              <tr>
                <td colspan="6" class="text-center py-5 text-muted">{{ 'COMMON.LOADING' | translate }}</td>
              </tr>
            } @else if (movements.length === 0) {
              <tr>
                <td colspan="6" class="text-center py-5 text-muted">{{ 'MOVEMENTS.NO_LOGS' | translate }}</td>
              </tr>
            } @else {
              @for (m of movements; track m.id_movement_history) {
                <tr>
                  <td><span class="id-tag">#{{ m.id_movement_history }}</span></td>
                  <td>
                    <span class="bag-chip">Bag #{{ m.id_blood_unit }}</span>
                  </td>
                  <td>
                    @if (m.blood_unit) {
                      <span class="blood-chip">{{ m.blood_unit.blood_type }}{{ m.blood_unit.rh_factor === 'POSITIVE' ? '+' : '-' }}</span>
                    } @else {
                      <span class="cell-subtext">—</span>
                    }
                  </td>
                  <td>
                    <div class="action-entry">
                      <span class="action-bullet">●</span>
                      <code>{{ m.action }}</code>
                    </div>
                  </td>
                  <td>
                    <div class="user-pill">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="user-icon">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>{{ m.user?.full_name ?? 'System Service' }}</span>
                    </div>
                  </td>
                  <td><span class="cell-subtext">{{ m.timestamp | date:'medium' }}</span></td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .saas-page-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1.75rem 2rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.02em;
    }
    .page-subtitle {
      color: #64748B;
      font-size: 0.85rem;
      margin-top: 0.2rem;
    }
    .id-tag {
      font-family: monospace;
      font-weight: 700;
      color: #64748B;
      font-size: 0.8rem;
    }
    .bag-chip {
      font-family: monospace;
      font-size: 0.8rem;
      font-weight: 600;
      color: #1E3A8A;
      background: #EFF6FF;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      border: 1px solid #DBEAFE;
    }
    .blood-chip {
      background: #FEE2E2;
      color: #8B0000;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
      font-size: 0.8rem;
    }
    .action-entry {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      code {
        font-size: 0.825rem;
        color: #0F172A;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 500;
      }
    }
    .action-bullet {
      color: #8B0000;
      font-size: 0.65rem;
    }
    .user-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.825rem;
      color: #475569;
      font-weight: 500;
    }
    .user-icon {
      color: #94A3B8;
      flex-shrink: 0;
    }
    .cell-subtext {
      color: #64748B;
      font-size: 0.8rem;
    }
    .text-center { text-align: center; }
    .py-5 { padding: 2.5rem 0; }
  `],
})
export class MovementsComponent implements OnInit {
  movements: MovementHistory[] = [];
  loading = false;

  constructor(private movementService: MovementService) {}

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements() {
    this.loading = true;
    this.movementService.getAll().subscribe({
      next: (data) => {
        this.movements = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
