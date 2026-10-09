import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicalCenterService } from '../../core/services/medical-center.service';
import { AuthService } from '../../core/services/auth.service';
import { MedicalCenter } from '../../core/models/entities.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-centers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="saas-page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'CENTERS.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'CENTERS.SUBTITLE' | translate }}</p>
        </div>
        @if (authService.isAdmin()) {
          <button class="btn btn-primary" (click)="openCreateModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>{{ 'CENTERS.ADD_CENTER' | translate }}</span>
          </button>
        }
      </div>

      <!-- Advanced Data Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ 'CENTERS.COL_ID' | translate }}</th>
              <th>{{ 'CENTERS.COL_NAME' | translate }}</th>
              <th>{{ 'CENTERS.COL_TYPE' | translate }}</th>
              <th>{{ 'CENTERS.COL_ADDRESS' | translate }}</th>
              <th>{{ 'CENTERS.COL_PHONE' | translate }}</th>
              <th>{{ 'CENTERS.COL_UNITS_COUNT' | translate }}</th>
              <th class="text-right">{{ 'CENTERS.COL_ACTIONS' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @if (loading) {
              <tr>
                <td colspan="7" class="text-center py-5 text-muted">{{ 'COMMON.LOADING' | translate }}</td>
              </tr>
            } @else {
              @for (c of centers; track c.id_medical_center) {
                <tr>
                  <td><span class="id-tag">#{{ c.id_medical_center }}</span></td>
                  <td><strong class="cell-main-text">{{ c.name }}</strong></td>
                  <td>
                    <span class="status-pill status-in_transit">
                      <span class="status-dot"></span>
                      <span>{{ 'CENTER_TYPES.' + c.type | translate }}</span>
                    </span>
                  </td>
                  <td><span class="cell-subtext">{{ c.address }}</span></td>
                  <td><span class="phone-chip">{{ c.phone }}</span></td>
                  <td>
                    <span class="status-pill status-pending">
                      <span class="status-dot"></span>
                      <span>{{ c._count?.blood_units ?? 0 }} {{ 'COMMON.UNITS' | translate }}</span>
                    </span>
                  </td>
                  <td class="row-actions-cell">
                    <div class="row-menu-container">
                      <button
                        type="button"
                        class="btn-icon-dots"
                        (click)="toggleMenu(c.id_medical_center, $event)"
                        title="Options"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2"></circle>
                          <circle cx="12" cy="12" r="2"></circle>
                          <circle cx="12" cy="19" r="2"></circle>
                        </svg>
                      </button>

                      @if (activeMenuId === c.id_medical_center) {
                        <div class="floating-row-menu" (click)="$event.stopPropagation()">
                          <button type="button" class="menu-item" (click)="openEditModal(c); closeMenu()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                            <span>{{ 'CENTERS.ACTION_EDIT' | translate }}</span>
                          </button>
                          @if (authService.isAdmin()) {
                            <div class="menu-divider"></div>
                            <button type="button" class="menu-item menu-danger" (click)="deleteCenter(c.id_medical_center); closeMenu()">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              <span>{{ 'CENTERS.ACTION_DELETE' | translate }}</span>
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

      <!-- Compact Humanized Modal (Create) -->
      @if (showCreateModal) {
        <div class="modal-backdrop">
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
                  <path d="M9 22v-4h6v4"></path>
                  <path d="M8 6h.01"></path>
                  <path d="M16 6h.01"></path>
                </svg>
              </div>
              <div>
                <h2 class="modal-title">{{ 'CENTERS.MODAL_NEW_TITLE' | translate }}</h2>
                <p class="modal-subtitle">Connect institution to the centralized transfusion grid</p>
              </div>
            </div>

            <form [formGroup]="centerForm" (ngSubmit)="submitCreate()">
              <div class="form-section-card">
                <div class="form-section-header">1. Institution Designation</div>
                <div class="form-row">
                  <div class="form-group flex-2">
                    <label class="form-label">{{ 'CENTERS.FIELD_NAME' | translate }} <span class="req">*</span></label>
                    <input
                      type="text"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('name')"
                      formControlName="name"
                      placeholder="e.g. St. Jude Regional Hospital"
                    />
                    @if (isFieldInvalid('name')) {
                      <span class="field-error">Facility name is required</span>
                    }
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label">{{ 'CENTERS.FIELD_TYPE' | translate }} <span class="req">*</span></label>
                    <select class="form-select" formControlName="type">
                      <option value="HOSPITAL">{{ 'CENTER_TYPES.HOSPITAL' | translate }}</option>
                      <option value="CLINIC">{{ 'CENTER_TYPES.CLINIC' | translate }}</option>
                      <option value="REGIONAL_BANK">{{ 'CENTER_TYPES.REGIONAL_BANK' | translate }}</option>
                      <option value="MOBILE_UNIT">{{ 'CENTER_TYPES.MOBILE_UNIT' | translate }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="form-section-card">
                <div class="form-section-header">2. Location & Contact Channels</div>
                <div class="form-group">
                  <label class="form-label">{{ 'CENTERS.FIELD_ADDRESS' | translate }} <span class="req">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('address')"
                    formControlName="address"
                    placeholder="Physical street address, City, Dept"
                  />
                  @if (isFieldInvalid('address')) {
                    <span class="field-error">Full address is required</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">{{ 'CENTERS.FIELD_PHONE' | translate }} <span class="req">*</span></label>
                  <div class="phone-input-group">
                    <select class="form-select phone-prefix-select" formControlName="phone_prefix">
                      @for (code of countryCodes; track code.prefix) {
                        <option [value]="code.prefix">{{ code.label }}</option>
                      }
                    </select>
                    <input
                      type="tel"
                      class="form-control phone-number-input"
                      [class.is-invalid]="isFieldInvalid('phone_number')"
                      formControlName="phone_number"
                      placeholder="5555-0100"
                    />
                  </div>
                  @if (isFieldInvalid('phone_number')) {
                    <span class="field-error">Valid phone number required</span>
                  }
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-outline" (click)="showCreateModal = false">
                  {{ 'CENTERS.BTN_CANCEL' | translate }}
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="centerForm.invalid">
                  {{ 'CENTERS.BTN_SAVE' | translate }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Compact Humanized Modal (Edit) -->
      @if (showEditModal && editingCenter) {
        <div class="modal-backdrop">
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </div>
              <div>
                <h2 class="modal-title">{{ 'CENTERS.MODAL_EDIT_TITLE' | translate }}</h2>
                <p class="modal-subtitle">Modifying Record #{{ editingCenter.id_medical_center }}</p>
              </div>
            </div>

            <form [formGroup]="centerForm" (ngSubmit)="submitEdit()">
              <div class="form-section-card">
                <div class="form-section-header">1. Institution Designation</div>
                <div class="form-row">
                  <div class="form-group flex-2">
                    <label class="form-label">{{ 'CENTERS.FIELD_NAME' | translate }} <span class="req">*</span></label>
                    <input type="text" class="form-control" formControlName="name" />
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label">{{ 'CENTERS.FIELD_TYPE' | translate }} <span class="req">*</span></label>
                    <select class="form-select" formControlName="type">
                      <option value="HOSPITAL">{{ 'CENTER_TYPES.HOSPITAL' | translate }}</option>
                      <option value="CLINIC">{{ 'CENTER_TYPES.CLINIC' | translate }}</option>
                      <option value="REGIONAL_BANK">{{ 'CENTER_TYPES.REGIONAL_BANK' | translate }}</option>
                      <option value="MOBILE_UNIT">{{ 'CENTER_TYPES.MOBILE_UNIT' | translate }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="form-section-card">
                <div class="form-section-header">2. Location & Contact Channels</div>
                <div class="form-group">
                  <label class="form-label">{{ 'CENTERS.FIELD_ADDRESS' | translate }} <span class="req">*</span></label>
                  <input type="text" class="form-control" formControlName="address" />
                </div>

                <div class="form-group">
                  <label class="form-label">{{ 'CENTERS.FIELD_PHONE' | translate }} <span class="req">*</span></label>
                  <div class="phone-input-group">
                    <select class="form-select phone-prefix-select" formControlName="phone_prefix">
                      @for (code of countryCodes; track code.prefix) {
                        <option [value]="code.prefix">{{ code.label }}</option>
                      }
                    </select>
                    <input type="tel" class="form-control phone-number-input" formControlName="phone_number" />
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-outline" (click)="showEditModal = false">
                  {{ 'CENTERS.BTN_CANCEL' | translate }}
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="centerForm.invalid">
                  {{ 'CENTERS.BTN_SAVE' | translate }}
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
      font-size: 0.825rem;
    }
    .phone-chip {
      font-family: monospace;
      font-size: 0.8rem;
      color: #334155;
      background: #F1F5F9;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .py-5 { padding: 2.5rem 0; }

    /* Modals & Form Sections */
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
    .flex-2 { flex: 2; }
    .req { color: #DC2626; }
    .field-error {
      font-size: 0.725rem;
      color: #DC2626;
      margin-top: 0.25rem;
      display: block;
    }
    .is-invalid {
      border-color: #DC2626 !important;
      background-color: #FEF2F2 !important;
    }
    .phone-input-group {
      display: flex;
      gap: 0.5rem;
      .phone-prefix-select {
        flex: 0 0 145px;
        min-width: 135px;
        font-weight: 500;
      }
      .phone-number-input {
        flex: 1;
      }
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }
  `],
})
export class CentersComponent implements OnInit {
  centers: MedicalCenter[] = [];
  loading = false;
  showCreateModal = false;
  showEditModal = false;
  editingCenter: MedicalCenter | null = null;
  activeMenuId: number | null = null;

  readonly countryCodes = [
    { prefix: '+502', label: '+502 GT' },
    { prefix: '+1', label: '+1 US/CA' },
    { prefix: '+52', label: '+52 MX' },
    { prefix: '+34', label: '+34 ES' },
    { prefix: '+57', label: '+57 CO' },
    { prefix: '+503', label: '+503 SV' },
    { prefix: '+504', label: '+504 HN' },
    { prefix: '+506', label: '+506 CR' },
    { prefix: '+507', label: '+507 PA' },
    { prefix: '+54', label: '+54 AR' },
    { prefix: '+56', label: '+56 CL' },
    { prefix: '+51', label: '+51 PE' },
  ];

  centerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private centerService: MedicalCenterService,
    public authService: AuthService,
    private elementRef: ElementRef
  ) {
    this.centerForm = this.fb.group({
      name: ['', Validators.required],
      type: ['HOSPITAL', Validators.required],
      address: ['', Validators.required],
      phone_prefix: ['+502', Validators.required],
      phone_number: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCenters();
  }

  loadCenters() {
    this.loading = true;
    this.centerService.getAll().subscribe({
      next: (data) => {
        this.centers = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
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

  isFieldInvalid(fieldName: string): boolean {
    const ctrl = this.centerForm.get(fieldName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  openCreateModal() {
    this.centerForm.reset({
      type: 'HOSPITAL',
      phone_prefix: '+502',
      phone_number: '',
    });
    this.showCreateModal = true;
  }

  private splitPhone(phone: string): { prefix: string; number: string } {
    if (!phone) return { prefix: '+502', number: '' };
    const matched = this.countryCodes.find((c) => phone.startsWith(c.prefix));
    if (matched) {
      return {
        prefix: matched.prefix,
        number: phone.substring(matched.prefix.length).trim().replace(/^[- ]+/, ''),
      };
    }
    return { prefix: '+502', number: phone.trim() };
  }

  submitCreate() {
    if (this.centerForm.invalid) {
      this.centerForm.markAllAsTouched();
      return;
    }

    const val = this.centerForm.value;
    const fullPhone = `${val.phone_prefix} ${val.phone_number.trim()}`;

    this.centerService
      .create({
        name: val.name,
        type: val.type,
        address: val.address,
        phone: fullPhone,
      })
      .subscribe({
        next: () => {
          this.showCreateModal = false;
          this.loadCenters();
        },
        error: (err) => alert(err.error?.message || 'Error creating medical center'),
      });
  }

  openEditModal(center: MedicalCenter) {
    this.editingCenter = center;
    const parsedPhone = this.splitPhone(center.phone);
    this.centerForm.patchValue({
      name: center.name,
      type: center.type,
      address: center.address,
      phone_prefix: parsedPhone.prefix,
      phone_number: parsedPhone.number,
    });
    this.showEditModal = true;
  }

  submitEdit() {
    if (!this.editingCenter || this.centerForm.invalid) {
      this.centerForm.markAllAsTouched();
      return;
    }

    const val = this.centerForm.value;
    const fullPhone = `${val.phone_prefix} ${val.phone_number.trim()}`;

    this.centerService
      .update(this.editingCenter.id_medical_center, {
        name: val.name,
        type: val.type,
        address: val.address,
        phone: fullPhone,
      })
      .subscribe({
        next: () => {
          this.showEditModal = false;
          this.loadCenters();
        },
        error: (err) => alert(err.error?.message || 'Error updating medical center'),
      });
  }

  deleteCenter(id: number) {
    if (confirm('Are you sure you want to remove this medical center?')) {
      this.centerService.delete(id).subscribe({
        next: () => this.loadCenters(),
        error: (err) => alert(err.error?.message || 'Error deleting center'),
      });
    }
  }
}
