import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BloodUnitService, PaginatedBloodUnits } from '../../core/services/blood-unit.service';
import { MedicalCenterService } from '../../core/services/medical-center.service';
import { BloodUnit, MedicalCenter } from '../../core/models/entities.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="saas-page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'INVENTORY.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'INVENTORY.SUBTITLE' | translate }}</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>{{ 'INVENTORY.ADD_UNIT' | translate }}</span>
        </button>
      </div>

      <!-- Filter Controls Bar -->
      <div class="filter-card">
        <div class="filter-col">
          <label class="filter-label">{{ 'INVENTORY.FILTER_TYPE' | translate }}</label>
          <select class="form-select select-sm" [(ngModel)]="filterBloodType" (change)="onFilterChange()">
            <option value="">{{ 'INVENTORY.ALL_TYPES' | translate }}</option>
            <option value="A">Type A</option>
            <option value="B">Type B</option>
            <option value="AB">Type AB</option>
            <option value="O">Type O</option>
          </select>
        </div>

        <div class="filter-col">
          <label class="filter-label">{{ 'INVENTORY.FILTER_RH' | translate }}</label>
          <select class="form-select select-sm" [(ngModel)]="filterRhFactor" (change)="onFilterChange()">
            <option value="">{{ 'INVENTORY.ALL_RH' | translate }}</option>
            <option value="POSITIVE">Rh Positive (+)</option>
            <option value="NEGATIVE">Rh Negative (-)</option>
          </select>
        </div>

        <div class="filter-col">
          <label class="filter-label">{{ 'INVENTORY.FILTER_STATUS' | translate }}</label>
          <select class="form-select select-sm" [(ngModel)]="filterStatus" (change)="onFilterChange()">
            <option value="">{{ 'INVENTORY.ALL_STATUSES' | translate }}</option>
            <option value="AVAILABLE">{{ 'STATUS.AVAILABLE' | translate }}</option>
            <option value="NEAR_EXPIRATION">{{ 'STATUS.NEAR_EXPIRATION' | translate }}</option>
            <option value="EXPIRED">{{ 'STATUS.EXPIRED' | translate }}</option>
            <option value="DISCARDED">{{ 'STATUS.DISCARDED' | translate }}</option>
            <option value="TRANSFERRED">{{ 'STATUS.TRANSFERRED' | translate }}</option>
          </select>
        </div>

        <div class="filter-col">
          <label class="filter-label">{{ 'INVENTORY.FILTER_CENTER' | translate }}</label>
          <select class="form-select select-sm" [(ngModel)]="filterCenter" (change)="onFilterChange()">
            <option [ngValue]="null">{{ 'INVENTORY.ALL_CENTERS' | translate }}</option>
            @for (c of medicalCenters; track c.id_medical_center) {
              <option [ngValue]="c.id_medical_center">{{ c.name }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Advanced Data Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'INVENTORY.COL_ID' | translate }}</th>
              <th>{{ 'INVENTORY.COL_TYPE' | translate }}</th>
              <th>{{ 'INVENTORY.COL_RH' | translate }}</th>
              <th>{{ 'INVENTORY.COL_EXTRACTION' | translate }}</th>
              <th>{{ 'INVENTORY.COL_EXPIRATION' | translate }}</th>
              <th>{{ 'INVENTORY.COL_STATUS' | translate }}</th>
              <th>{{ 'INVENTORY.COL_CENTER' | translate }}</th>
              <th class="text-right">{{ 'INVENTORY.COL_ACTIONS' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @if (loading) {
              <tr>
                <td colspan="8" class="text-center py-5 text-muted">{{ 'COMMON.LOADING' | translate }}</td>
              </tr>
            } @else if (data?.items?.length === 0) {
              <tr>
                <td colspan="8" class="text-center py-5 text-muted">{{ 'INVENTORY.NO_UNITS_FOUND' | translate }}</td>
              </tr>
            } @else {
              @for (unit of data?.items; track unit.id_blood_unit) {
                <tr>
                  <td><span class="id-tag">#{{ unit.id_blood_unit }}</span></td>
                  <td><span class="blood-chip">{{ unit.blood_type }}</span></td>
                  <td>
                    <span class="rh-badge" [class.rh-pos]="unit.rh_factor === 'POSITIVE'">
                      {{ unit.rh_factor === 'POSITIVE' ? 'Rh+' : 'Rh-' }}
                    </span>
                  </td>
                  <td><span class="cell-subtext">{{ unit.extraction_date | date:'mediumDate' }}</span></td>
                  <td><span class="cell-subtext">{{ unit.expiration_date | date:'mediumDate' }}</span></td>
                  <td>
                    <span class="status-pill status-{{ unit.status.toLowerCase() }}">
                      <span class="status-dot"></span>
                      <span>{{ 'STATUS.' + unit.status | translate }}</span>
                    </span>
                  </td>
                  <td><strong class="cell-main-text">{{ unit.medical_center?.name }}</strong></td>
                  <td class="row-actions-cell">
                    <div class="row-menu-container">
                      <button
                        type="button"
                        class="btn-icon-dots"
                        (click)="toggleMenu(unit.id_blood_unit, $event)"
                        title="Actions"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2"></circle>
                          <circle cx="12" cy="12" r="2"></circle>
                          <circle cx="12" cy="19" r="2"></circle>
                        </svg>
                      </button>

                      @if (activeMenuId === unit.id_blood_unit) {
                        <div class="floating-row-menu" (click)="$event.stopPropagation()">
                          <button type="button" class="menu-item" (click)="openEditModal(unit); closeMenu()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                            <span>{{ 'INVENTORY.ACTION_EDIT' | translate }}</span>
                          </button>
                          @if (unit.status !== 'DISCARDED') {
                            <div class="menu-divider"></div>
                            <button type="button" class="menu-item menu-danger" (click)="discardUnit(unit.id_blood_unit); closeMenu()">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              <span>{{ 'INVENTORY.ACTION_DISCARD' | translate }}</span>
                            </button>
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

      <!-- Pagination Controls -->
      <div class="pagination-bar">
        <span class="page-info">
          {{ 'INVENTORY.PAGE' | translate }} {{ currentPage }} {{ 'INVENTORY.OF' | translate }} {{ data?.pagination?.totalPages || 1 }} ({{ data?.pagination?.total || 0 }} {{ 'COMMON.UNITS' | translate }})
        </span>
        <div class="page-buttons">
          <button
            class="btn btn-sm btn-outline"
            [disabled]="currentPage <= 1"
            (click)="goToPage(currentPage - 1)"
          >
            &larr; {{ 'INVENTORY.PREV' | translate }}
          </button>
          <button
            class="btn btn-sm btn-outline"
            [disabled]="currentPage >= (data?.pagination?.totalPages || 1)"
            (click)="goToPage(currentPage + 1)"
          >
            {{ 'INVENTORY.NEXT' | translate }} &rarr;
          </button>
        </div>
      </div>

      <!-- Humanized Grouped Modal (Create Blood Unit) -->
      @if (showCreateModal) {
        <div class="modal-backdrop">
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
              </div>
              <div>
                <h2 class="modal-title">{{ 'INVENTORY.MODAL_NEW_TITLE' | translate }}</h2>
                <p class="modal-subtitle">Register newly collected physical blood bag into inventory</p>
              </div>
            </div>

            <form [formGroup]="createForm" (ngSubmit)="submitCreate()">
              <!-- Section 1: Biological Profile -->
              <div class="form-section-card">
                <div class="form-section-header">1. Biological Blood Profile</div>
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label">{{ 'INVENTORY.FIELD_TYPE' | translate }} <span class="req">*</span></label>
                    <select class="form-select" formControlName="blood_type">
                      <option value="A">Type A</option>
                      <option value="B">Type B</option>
                      <option value="AB">Type AB</option>
                      <option value="O">Type O</option>
                    </select>
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label">{{ 'INVENTORY.FIELD_RH' | translate }} <span class="req">*</span></label>
                    <select class="form-select" formControlName="rh_factor">
                      <option value="POSITIVE">Positive (+)</option>
                      <option value="NEGATIVE">Negative (-)</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">{{ 'INVENTORY.FIELD_CENTER' | translate }} <span class="req">*</span></label>
                  <select class="form-select" formControlName="id_medical_center">
                    @for (c of medicalCenters; track c.id_medical_center) {
                      <option [ngValue]="c.id_medical_center">{{ c.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Section 2: Dates -->
              <div class="form-section-card">
                <div class="form-section-header">2. Storage Life Dates</div>
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label">{{ 'INVENTORY.FIELD_EXTRACTION' | translate }} <span class="req">*</span></label>
                    <input type="date" class="form-control" formControlName="extraction_date" />
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label">{{ 'INVENTORY.FIELD_EXPIRATION' | translate }} <span class="req">*</span></label>
                    <input type="date" class="form-control" formControlName="expiration_date" />
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-outline" (click)="showCreateModal = false">
                  {{ 'INVENTORY.BTN_CANCEL' | translate }}
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="createForm.invalid">
                  {{ 'INVENTORY.BTN_SAVE' | translate }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Edit Modal (Update Status) -->
      @if (showEditModal && editingUnit) {
        <div class="modal-backdrop">
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </div>
              <div>
                <h2 class="modal-title">{{ 'INVENTORY.MODAL_EDIT_TITLE' | translate }}</h2>
                <p class="modal-subtitle">Updating Blood Bag #{{ editingUnit.id_blood_unit }}</p>
              </div>
            </div>

            <form [formGroup]="editForm" (ngSubmit)="submitEdit()">
              <div class="form-section-card">
                <div class="form-group">
                  <label class="form-label">{{ 'INVENTORY.FIELD_STATUS' | translate }} <span class="req">*</span></label>
                  <select class="form-select" formControlName="status">
                    <option value="AVAILABLE">{{ 'STATUS.AVAILABLE' | translate }}</option>
                    <option value="NEAR_EXPIRATION">{{ 'STATUS.NEAR_EXPIRATION' | translate }}</option>
                    <option value="EXPIRED">{{ 'STATUS.EXPIRED' | translate }}</option>
                    <option value="DISCARDED">{{ 'STATUS.DISCARDED' | translate }}</option>
                    <option value="TRANSFERRED">{{ 'STATUS.TRANSFERRED' | translate }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">{{ 'INVENTORY.FIELD_CENTER' | translate }} <span class="req">*</span></label>
                  <select class="form-select" formControlName="id_medical_center">
                    @for (c of medicalCenters; track c.id_medical_center) {
                      <option [ngValue]="c.id_medical_center">{{ c.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-outline" (click)="showEditModal = false">
                  {{ 'INVENTORY.BTN_CANCEL' | translate }}
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid">
                  {{ 'INVENTORY.BTN_SAVE' | translate }}
                </button>
              </div>
            </form>
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
      padding: 0.9rem 1.25rem;
      margin-bottom: 1.25rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }
    .filter-col {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .filter-label {
      font-size: 0.725rem;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .select-sm {
      padding: 0.45rem 0.75rem;
      font-size: 0.825rem;
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
    .rh-badge {
      display: inline-block;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      background: #F1F5F9;
      color: #475569;
      &.rh-pos {
        background: #EFF6FF;
        color: #1E3A8A;
      }
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .py-5 { padding: 2.5rem 0; }

    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.25rem;
      padding: 0.5rem 0;
    }
    .page-info {
      font-size: 0.85rem;
      color: #64748B;
    }
    .page-buttons {
      display: flex;
      gap: 0.5rem;
    }

    /* Modal Styles */
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
      background: #FEE2E2;
      color: #8B0000;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
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
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }
  `],
})
export class InventoryComponent implements OnInit {
  data: PaginatedBloodUnits | null = null;
  medicalCenters: MedicalCenter[] = [];
  loading = false;
  activeMenuId: number | null = null;

  filterBloodType = '';
  filterRhFactor = '';
  filterStatus = '';
  filterCenter: number | null = null;
  currentPage = 1;
  pageSize = 10;

  showCreateModal = false;
  showEditModal = false;
  editingUnit: BloodUnit | null = null;

  createForm: FormGroup;
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private bloodUnitService: BloodUnitService,
    private medicalCenterService: MedicalCenterService
  ) {
    const today = new Date().toISOString().split('T')[0];
    const in35Days = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    this.createForm = this.fb.group({
      blood_type: ['O', Validators.required],
      rh_factor: ['POSITIVE', Validators.required],
      id_medical_center: [1, Validators.required],
      extraction_date: [today, Validators.required],
      expiration_date: [in35Days, Validators.required],
    });

    this.editForm = this.fb.group({
      status: ['', Validators.required],
      id_medical_center: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCenters();
    this.loadUnits();
  }

  loadCenters() {
    this.medicalCenterService.getAll().subscribe({
      next: (centers) => (this.medicalCenters = centers),
    });
  }

  loadUnits() {
    this.loading = true;
    this.bloodUnitService
      .getFiltered({
        blood_type: this.filterBloodType || undefined,
        rh_factor: this.filterRhFactor || undefined,
        status: this.filterStatus || undefined,
        id_medical_center: this.filterCenter || undefined,
        page: this.currentPage,
        limit: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.data = res;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadUnits();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadUnits();
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

    this.bloodUnitService.create(this.createForm.value).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.loadUnits();
      },
      error: (err) => alert(err.error?.message || 'Error creating unit'),
    });
  }

  openEditModal(unit: BloodUnit) {
    this.editingUnit = unit;
    this.editForm.patchValue({
      status: unit.status,
      id_medical_center: unit.id_medical_center,
    });
    this.showEditModal = true;
  }

  submitEdit() {
    if (!this.editingUnit || this.editForm.invalid) return;

    this.bloodUnitService.update(this.editingUnit.id_blood_unit, this.editForm.value).subscribe({
      next: () => {
        this.showEditModal = false;
        this.loadUnits();
      },
      error: (err) => alert(err.error?.message || 'Error updating unit'),
    });
  }

  discardUnit(id: number) {
    if (confirm('Are you sure you want to discard this blood unit?')) {
      this.bloodUnitService.delete(id).subscribe({
        next: () => this.loadUnits(),
        error: (err) => alert(err.error?.message || 'Error discarding unit'),
      });
    }
  }
}
