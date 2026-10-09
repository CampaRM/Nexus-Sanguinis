import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { TransferService } from '../../core/services/transfer.service';
import { DashboardMetrics } from '../../core/models/entities.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="saas-page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'DASHBOARD.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'DASHBOARD.SUBTITLE' | translate }}</p>
        </div>
        <button class="btn btn-outline" (click)="loadMetrics()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          <span>{{ 'COMMON.REFRESH' | translate }}</span>
        </button>
      </div>

      <!-- Key Metrics Overview Grid -->
      <div class="metrics-grid">
        <!-- Metric 1: Total Available Units -->
        <div class="card metric-card metric-primary">
          <div class="metric-icon-wrap icon-primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">{{ 'DASHBOARD.METRIC_TOTAL_UNITS' | translate }}</span>
            <span class="metric-value">{{ metrics?.totalAvailableUnits ?? 0 }}</span>
          </div>
        </div>

        <!-- Metric 2: Expiration Warnings < 7 days -->
        <div class="card metric-card metric-amber">
          <div class="metric-icon-wrap icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">{{ 'DASHBOARD.METRIC_EXPIRING_SOON' | translate }}</span>
            <span class="metric-value text-amber">{{ metrics?.expiringSoonCount ?? 0 }}</span>
          </div>
        </div>

        <!-- Metric 3: Pending Transfers -->
        <div class="card metric-card metric-navy">
          <div class="metric-icon-wrap icon-navy">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3 4 7l4 4"></path>
              <path d="M4 7h16"></path>
              <path d="m16 21 4-4-4-4"></path>
              <path d="M20 17H4"></path>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">{{ 'DASHBOARD.METRIC_PENDING_TRANSFERS' | translate }}</span>
            <span class="metric-value text-blue">{{ metrics?.pendingRequestsCount ?? 0 }}</span>
          </div>
        </div>

        <!-- Extra Metric: Connected Facilities -->
        <div class="card metric-card metric-slate">
          <div class="metric-icon-wrap icon-slate">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
              <path d="M9 22v-4h6v4"></path>
              <path d="M8 6h.01"></path>
              <path d="M16 6h.01"></path>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">{{ 'DASHBOARD.METRIC_ACTIVE_CENTERS' | translate }}</span>
            <span class="metric-value">{{ totalCenters }}</span>
          </div>
        </div>
      </div>

      <!-- Two Columns: Inventory Distribution & Urgent Expirations -->
      <div class="dashboard-columns">
        <!-- Blood Type Breakdown Grid -->
        <div class="card dashboard-card">
          <h2 class="card-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#8B0000" class="heading-icon">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
            </svg>
            <span>{{ 'DASHBOARD.DISTRIBUTION_TITLE' | translate }}</span>
          </h2>
          <div class="blood-grid">
            @for (type of bloodTypes; track type) {
              <div class="blood-type-box">
                <div class="blood-badge">{{ type }}</div>
                <div class="blood-count">{{ getUnitsCount(type) }} <small>{{ 'COMMON.UNITS' | translate }}</small></div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    [style.width.%]="calcPercentage(getUnitsCount(type))"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Urgent Expiration Alerts -->
        <div class="card dashboard-card">
          <div class="card-header-flex">
            <h2 class="card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" class="heading-icon">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>{{ 'DASHBOARD.EXPIRATION_ALERTS_TITLE' | translate }}</span>
            </h2>
            <span class="status-pill status-near_expiration">
              <span class="status-dot"></span>
              <span>{{ metrics?.expiringSoonCount ?? 0 }} Alerts</span>
            </span>
          </div>

          @if (!metrics?.expiringSoonUnits || metrics?.expiringSoonUnits?.length === 0) {
            <p class="empty-state">{{ 'DASHBOARD.NO_EXPIRING_UNITS' | translate }}</p>
          } @else {
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Bag ID</th>
                    <th>Type</th>
                    <th>Days Left</th>
                    <th>Facility</th>
                  </tr>
                </thead>
                <tbody>
                  @for (unit of metrics?.expiringSoonUnits; track unit.id_blood_unit) {
                    <tr>
                      <td><span class="id-tag">#{{ unit.id_blood_unit }}</span></td>
                      <td><span class="blood-chip">{{ unit.blood_type }}</span></td>
                      <td>
                        <span class="status-pill" [class.status-rejected]="unit.days_remaining <= 3" [class.status-near_expiration]="unit.days_remaining > 3">
                          <span class="status-dot"></span>
                          <span>{{ unit.days_remaining }} {{ 'DASHBOARD.DAYS_LEFT' | translate }}</span>
                        </span>
                      </td>
                      <td class="cell-subtext">{{ unit.medical_center }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

      <!-- Pending Transfer Approvals Section -->
      <div class="card dashboard-card pending-section">
        <div class="card-header-flex">
          <h2 class="card-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" stroke-width="2" class="heading-icon">
              <rect width="16" height="13" x="1" y="3" rx="2"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>{{ 'DASHBOARD.PENDING_REQUESTS_TITLE' | translate }}</span>
          </h2>
          <a routerLink="/transfers" class="btn btn-sm btn-outline">
            <span>{{ 'TRANSFERS.ALL_TRANSFERS' | translate }}</span>
            &rarr;
          </a>
        </div>

        @if (!metrics?.pendingRequestsList || metrics?.pendingRequestsList?.length === 0) {
          <p class="empty-state">{{ 'DASHBOARD.NO_PENDING_REQUESTS' | translate }}</p>
        } @else {
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Req #</th>
                  <th>Blood Type</th>
                  <th>Units</th>
                  <th>Requesting Center</th>
                  <th>Supplying Bank</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (req of metrics?.pendingRequestsList; track req.id_transfer_request) {
                  <tr>
                    <td><span class="id-tag">#{{ req.id_transfer_request }}</span></td>
                    <td><span class="blood-chip">{{ req.blood_type }}</span></td>
                    <td><strong>{{ req.quantity }}</strong></td>
                    <td><strong class="cell-main-text">{{ req.requesting_center?.name }}</strong></td>
                    <td><span class="cell-subtext">{{ req.supplying_center?.name }}</span></td>
                    <td class="text-right">
                      <button class="btn btn-sm btn-primary" (click)="quickApprove(req.id_transfer_request)">
                        {{ 'DASHBOARD.QUICK_ACTION_APPROVE' | translate }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
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
    .cell-main-text {
      color: #0F172A;
      font-weight: 600;
    }
    .cell-subtext {
      color: #64748B;
      font-size: 0.8rem;
    }
    .blood-chip {
      background: #FEE2E2;
      color: #8B0000;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
      font-size: 0.825rem;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .metric-card {
      display: flex;
      align-items: center;
      gap: 1.15rem;
      padding: 1.25rem;
      border-left: 4px solid transparent;
      &.metric-primary { border-left-color: #8B0000; }
      &.metric-amber { border-left-color: #D97706; }
      &.metric-navy { border-left-color: #1E3A8A; }
      &.metric-slate { border-left-color: #64748B; }
    }
    .metric-icon-wrap {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      flex-shrink: 0;
      &.icon-primary { background: #FEE2E2; color: #8B0000; }
      &.icon-amber { background: #FEF3C7; color: #D97706; }
      &.icon-navy { background: #DBEAFE; color: #1E3A8A; }
      &.icon-slate { background: #F1F5F9; color: #475569; }
    }
    .metric-info {
      display: flex;
      flex-direction: column;
    }
    .metric-label {
      font-size: 0.725rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748B;
      letter-spacing: 0.04em;
    }
    .metric-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.2;
    }
    .text-amber { color: #D97706; }
    .text-blue { color: #1E3A8A; }
    .dashboard-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      @media (max-width: 960px) {
        grid-template-columns: 1fr;
      }
    }
    .card-heading {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0F172A;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .card-header-flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      .card-heading { margin-bottom: 0; }
    }
    .blood-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.85rem;
    }
    .blood-type-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 0.75rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }
    .blood-count {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0F172A;
      small { font-size: 0.725rem; color: #64748B; font-weight: 500; }
    }
    .progress-bar {
      width: 100%;
      height: 5px;
      background: #E2E8F0;
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #8B0000;
      border-radius: 3px;
    }
    .empty-state {
      color: #64748B;
      font-size: 0.85rem;
      text-align: center;
      padding: 2rem 0;
    }
    .pending-section {
      margin-top: 1.5rem;
    }
    .text-right { text-align: right; }
  `],
})
export class DashboardComponent implements OnInit {
  metrics: DashboardMetrics | null = null;
  totalCenters = 0;
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private dashboardService: DashboardService,
    private transferService: TransferService
  ) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics() {
    this.dashboardService.getMetrics().subscribe({
      next: (res) => {
        this.metrics = res.metrics;
        this.totalCenters = res.summary?.totalCenters || 0;
      },
    });
  }

  getUnitsCount(type: string): number {
    return this.metrics?.bloodTypeBreakdown?.[type] ?? 0;
  }

  calcPercentage(count: number): number {
    const total = this.metrics?.totalAvailableUnits || 1;
    return Math.min(100, Math.round((count / total) * 100));
  }

  quickApprove(id_transfer_request: number) {
    this.transferService.processTransfer(id_transfer_request, 'APPROVE').subscribe({
      next: () => {
        this.loadMetrics();
      },
      error: (err) => {
        alert(err.error?.message || 'Error processing transfer');
      },
    });
  }
}
