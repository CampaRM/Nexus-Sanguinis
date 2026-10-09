import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransferService } from '../../core/services/transfer.service';
import { MedicalCenterService } from '../../core/services/medical-center.service';
import { TransferRequest, MedicalCenter } from '../../core/models/entities.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="saas-page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'TRANSFERS.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'TRANSFERS.SUBTITLE' | translate }}</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>{{ 'TRANSFERS.CREATE_REQUEST' | translate }}</span>
        </button>
      </div>

      <!-- Filter bar with translated status pills -->
      <div class="filter-card">
        <div class="filter-header-label">FILTER STATUS:</div>
        <div class="status-filters">
          <button
            class="filter-pill"
            [class.active]="selectedStatus === ''"
            (click)="filterByStatus('')"
          >
            {{ 'TRANSFERS.ALL_TRANSFERS' | translate }}
          </button>
          <button
            class="filter-pill pill-amber"
            [class.active]="selectedStatus === 'PENDING'"
            (click)="filterByStatus('PENDING')"
          >
            <span class="status-dot-mini dot-amber"></span>
            {{ 'STATUS.PENDING' | translate }}
          </button>
          <button
            class="filter-pill pill-green"
            [class.active]="selectedStatus === 'COMPLETED'"
            (click)="filterByStatus('COMPLETED')"
          >
            <span class="status-dot-mini dot-green"></span>
            {{ 'STATUS.COMPLETED' | translate }}
          </button>
          <button
            class="filter-pill pill-red"
            [class.active]="selectedStatus === 'REJECTED'"
            (click)="filterByStatus('REJECTED')"
          >
            <span class="status-dot-mini dot-red"></span>
            {{ 'STATUS.REJECTED' | translate }}
          </button>
        </div>
      </div>

      <!-- Advanced Data Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'TRANSFERS.COL_ID' | translate }}</th>
              <th>{{ 'TRANSFERS.COL_REQUESTING' | translate }}</th>
              <th>{{ 'TRANSFERS.COL_SUPPLYING' | translate }}</th>
              <th>{{ 'TRANSFERS.COL_BLOOD_TYPE' | translate }}</th>
              <th>{{ 'TRANSFERS.COL_QTY' | translate }}</th>
              <th>{{ 'TRANSFERS.COL_STATUS' | translate }}</th>
              <th>{{ 'TRANSFERS.COL_DATE' | translate }}</th>
              <th class="text-right">{{ 'TRANSFERS.COL_ACTIONS' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @if (loading) {
              <tr>
                <td colspan="8" class="text-center py-5 text-muted">{{ 'COMMON.LOADING' | translate }}</td>
              </tr>
            } @else if (requests.length === 0) {
              <tr>
                <td colspan="8" class="text-center py-5 text-muted">{{ 'TRANSFERS.NO_REQUESTS' | translate }}</td>
              </tr>
            } @else {
              @for (req of requests; track req.id_transfer_request) {
                <tr>
                  <td><span class="id-tag">#{{ req.id_transfer_request }}</span></td>
                  <td>
                    <div class="facility-cell">
                      <strong class="cell-main-text">{{ req.requesting_center?.name }}</strong>
                      <span class="cell-subtext">{{ 'CENTER_TYPES.' + req.requesting_center?.type | translate }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="facility-cell">
                      <span class="cell-main-text">{{ req.supplying_center?.name }}</span>
                      <span class="cell-subtext">{{ 'CENTER_TYPES.' + req.supplying_center?.type | translate }}</span>
                    </div>
                  </td>
                  <td><span class="blood-chip">{{ req.blood_type }}</span></td>
                  <td><strong>{{ req.quantity }} {{ 'COMMON.UNITS' | translate }}</strong></td>
                  <td>
                    <span class="status-pill status-{{ req.status.toLowerCase() }}">
                      <span class="status-dot"></span>
                      <span>{{ 'STATUS.' + req.status | translate }}</span>
                    </span>
                  </td>
                  <td><span class="cell-subtext">{{ req.request_date | date:'short' }}</span></td>
                  <td class="row-actions-cell">
                    <div class="row-menu-container">
                      <button
                        type="button"
                        class="btn-icon-dots"
                        (click)="toggleMenu(req.id_transfer_request, $event)"
                        title="Actions"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2"></circle>
                          <circle cx="12" cy="12" r="2"></circle>
                          <circle cx="12" cy="19" r="2"></circle>
                        </svg>
                      </button>

                      @if (activeMenuId === req.id_transfer_request) {
                        <div class="floating-row-menu" (click)="$event.stopPropagation()">
                          @if (req.status === 'PENDING') {
                            <button type="button" class="menu-item" (click)="openProcessModal(req); closeMenu()">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                              </svg>
                              <span>{{ 'TRANSFERS.ACTION_PROCESS' | translate }}</span>
                            </button>
                            <div class="menu-divider"></div>
                            <button type="button" class="menu-item menu-danger" (click)="quickReject(req); closeMenu()">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                              </svg>
                              <span>{{ 'TRANSFERS.ACTION_REJECT' | translate }}</span>
                            </button>
                          } @else {
                            <div class="menu-item-info">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                              </svg>
                              <span>{{ req.transfer_details?.length ?? 0 }} {{ 'TRANSFERS.BAGS_TRANSFERRED' | translate }}</span>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Humanized Grouped Modal (Create Transfer Request) -->
      @if (showCreateModal) {
        <div class="modal-backdrop">
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 3 4 7l4 4"></path>
                  <path d="M4 7h16"></path>
                  <path d="m16 21 4-4-4-4"></path>
                  <path d="M20 17H4"></path>
                </svg>
              </div>
              <div>
                <h2 class="modal-title">{{ 'TRANSFERS.MODAL_NEW_TITLE' | translate }}</h2>
                <p class="modal-subtitle">Initiate an ACID transactional inter-facility blood transfer</p>
              </div>
            </div>

            <form [formGroup]="createForm" (ngSubmit)="submitCreate()">
              <!-- Step 1: Facilities -->
              <div class="form-section-card">
                <div class="form-section-header">1. Route & Institutional Facilities</div>
                <div class="form-group">
                  <label class="form-label">{{ 'TRANSFERS.FIELD_REQUESTING' | translate }} <span class="req">*</span></label>
                  <select class="form-select" formControlName="id_requesting_center">
                    @for (c of medicalCenters; track c.id_medical_center) {
                      <option [ngValue]="c.id_medical_center">
                        {{ c.name }} ({{ 'CENTER_TYPES.' + c.type | translate }})
                      </option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">{{ 'TRANSFERS.FIELD_SUPPLYING' | translate }} <span class="req">*</span></label>
                  <select class="form-select" formControlName="id_supplying_center">
                    @for (c of medicalCenters; track c.id_medical_center) {
                      <option [ngValue]="c.id_medical_center">
                        {{ c.name }} ({{ 'CENTER_TYPES.' + c.type | translate }})
                      </option>
                    }
                  </select>
                </div>
              </div>

              <!-- Step 2: Blood Specifications -->
              <div class="form-section-card">
                <div class="form-section-header">2. Blood Type & Volume Demand</div>
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label">{{ 'TRANSFERS.FIELD_TYPE' | translate }} <span class="req">*</span></label>
                    <select class="form-select" formControlName="blood_type">
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label">{{ 'TRANSFERS.FIELD_QTY' | translate }} <span class="req">*</span></label>
                    <input
                      type="number"
                      class="form-control"
                      [class.is-invalid]="createForm.get('quantity')?.invalid && createForm.get('quantity')?.touched"
                      formControlName="quantity"
                      min="1"
                      max="20"
                    />
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-outline" (click)="showCreateModal = false">
                  {{ 'TRANSFERS.BTN_CANCEL' | translate }}
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="createForm.invalid">
                  {{ 'TRANSFERS.BTN_SUBMIT' | translate }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- ACID Transaction Processing Modal -->
      @if (showProcessModal && processingRequest) {
        <div class="modal-backdrop">
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-header-icon alert-badge-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <div>
                <h2 class="modal-title">{{ 'TRANSFERS.MODAL_PROCESS_TITLE' | translate }}</h2>
                <p class="modal-subtitle">Transfer Request #{{ processingRequest.id_transfer_request }}</p>
              </div>
            </div>

            <div class="transaction-detail-box">
              <div class="tx-item">
                <span class="tx-label">Donor Center (Supplying):</span>
                <span class="tx-val">{{ processingRequest.supplying_center?.name }}</span>
              </div>
              <div class="tx-item">
                <span class="tx-label">Recipient Center (Requesting):</span>
                <span class="tx-val">{{ processingRequest.requesting_center?.name }}</span>
              </div>
              <div class="tx-item highlight">
                <span class="tx-label">Transfer Demand:</span>
                <span class="tx-val">{{ processingRequest.quantity }} {{ 'COMMON.UNITS' | translate }} (Group {{ processingRequest.blood_type }})</span>
              </div>
            </div>

            <div class="acid-guarantee-notice">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shield-svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <p>{{ 'TRANSFERS.MODAL_PROCESS_DESC' | translate }}</p>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" (click)="showProcessModal = false">
                {{ 'TRANSFERS.BTN_CANCEL' | translate }}
              </button>
              <button type="button" class="btn btn-danger" (click)="executeProcess('REJECT')">
                {{ 'TRANSFERS.BTN_REJECT' | translate }}
              </button>
              <button type="button" class="btn btn-primary" (click)="executeProcess('APPROVE')">
                {{ 'TRANSFERS.BTN_APPROVE_ACID' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
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
    .filter-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 0.75rem 1.25rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }
    .filter-header-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #94A3B8;
      letter-spacing: 0.06em;
    }
    .status-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .filter-pill {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      color: #475569;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.775rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.15s ease;
      &:hover { background: #F1F5F9; color: #0F172A; }
      &.active {
        background: #1E3A8A;
        color: #FFFFFF;
        border-color: #1E3A8A;
        box-shadow: 0 1px 3px rgba(30, 58, 138, 0.2);
      }
      &.pill-amber.active { background: #D97706; border-color: #D97706; }
      &.pill-green.active { background: #16A34A; border-color: #16A34A; }
      &.pill-red.active { background: #DC2626; border-color: #DC2626; }
    }
    .status-dot-mini {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      &.dot-amber { background-color: #F59E0B; }
      &.dot-green { background-color: #10B981; }
      &.dot-red { background-color: #EF4444; }
    }
    .id-tag {
      font-family: monospace;
      font-weight: 700;
      color: #64748B;
      font-size: 0.8rem;
    }
    .facility-cell {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
    }
    .cell-main-text {
      color: #0F172A;
      font-weight: 600;
    }
    .cell-subtext {
      color: #64748B;
      font-size: 0.775rem;
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
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .py-5 { padding: 2.5rem 0; }

    .menu-item-info {
      padding: 0.5rem 0.85rem;
      font-size: 0.8rem;
      color: #64748B;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Modals & Forms */
    .modal-header {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid #F1F5F9;
    }
    .modal-header-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #EFF6FF;
      color: #1E3A8A;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      &.alert-badge-icon {
        background: #FEF3C7;
        color: #D97706;
      }
    }
    .modal-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0F172A;
    }
    .modal-subtitle {
      font-size: 0.775rem;
      color: #64748B;
    }
    .form-section-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .form-section-header {
      font-size: 0.725rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #1E3A8A;
      margin-bottom: 0.75rem;
    }
    .form-row {
      display: flex;
      gap: 0.75rem;
    }
    .flex-1 { flex: 1; }
    .req { color: #DC2626; }
    .transaction-detail-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .tx-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      &.highlight {
        padding-top: 0.5rem;
        border-top: 1px dashed #E2E8F0;
        font-weight: 700;
        color: #8B0000;
      }
    }
    .tx-label { color: #64748B; }
    .tx-val { font-weight: 600; color: #0F172A; }
    .acid-guarantee-notice {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      padding: 0.85rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      p { font-size: 0.825rem; color: #1E3A8A; line-height: 1.4; margin: 0; }
    }
    .shield-svg {
      color: #2563EB;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }
  `],
})
export class TransfersComponent implements OnInit {
  requests: TransferRequest[] = [];
  medicalCenters: MedicalCenter[] = [];
  loading = false;
  selectedStatus = '';
  activeMenuId: number | null = null;

  showCreateModal = false;
  showProcessModal = false;
  processingRequest: TransferRequest | null = null;

  createForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private transferService: TransferService,
    private medicalCenterService: MedicalCenterService
  ) {
    this.createForm = this.fb.group({
      id_requesting_center: [2, Validators.required],
      id_supplying_center: [1, Validators.required],
      blood_type: ['O', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    });
  }

  ngOnInit(): void {
    this.loadCenters();
    this.loadTransfers();
  }

  loadCenters() {
    this.medicalCenterService.getAll().subscribe({
      next: (centers) => (this.medicalCenters = centers),
    });
  }

  loadTransfers() {
    this.loading = true;
    this.transferService.getAll(this.selectedStatus || undefined).subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.loadTransfers();
  }

  toggleMenu(id: number, event: MouseEvent) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  closeMenu() {
    this.activeMenuId = null;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.activeMenuId = null;
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  submitCreate() {
    if (this.createForm.invalid) return;

    this.transferService.create(this.createForm.value).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.loadTransfers();
      },
      error: (err) => alert(err.error?.message || 'Error submitting request'),
    });
  }

  openProcessModal(req: TransferRequest) {
    this.processingRequest = req;
    this.showProcessModal = true;
  }

  quickReject(req: TransferRequest) {
    if (confirm('Are you sure you want to reject this transfer request?')) {
      this.transferService.processTransfer(req.id_transfer_request, 'REJECT').subscribe({
        next: () => this.loadTransfers(),
        error: (err) => alert(err.error?.message || 'Error rejecting transfer'),
      });
    }
  }

  executeProcess(action: 'APPROVE' | 'REJECT') {
    if (!this.processingRequest) return;

    this.transferService
      .processTransfer(this.processingRequest.id_transfer_request, action)
      .subscribe({
        next: () => {
          this.showProcessModal = false;
          this.loadTransfers();
        },
        error: (err) => alert(err.error?.message || 'Error processing transfer'),
      });
  }
}
