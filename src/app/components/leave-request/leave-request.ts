import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { LeaveService } from '../../services/leave.service';
import { EmployeeManagementService, EmployeeRecord } from '../../services/employee-management.service';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './leave-request.html',
  styleUrls: ['./leave-request.css'],
})
export class LeaveRequest implements OnInit {
  employees: EmployeeRecord[] = [];
  minDate = new Date();
  leaveTypes = ['Sick Leave', 'Casual Leave', 'Vacation', 'Work From Home'];
  isSubmitting = false;
  isLoadingEmployees = true;

  readonly leaveForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly leaveService: LeaveService,
    private readonly employeeManagementService: EmployeeManagementService,
    private readonly snackBar: MatSnackBar,
  ) {
    this.leaveForm = this.formBuilder.group(
      {
        employeeId: ['', Validators.required],
        type: ['', Validators.required],
        start: [null as Date | null, Validators.required],
        end: [null as Date | null, Validators.required],
        reason: ['', Validators.required],
      },
      { validators: this.dateRangeValidator },
    );
  }

  ngOnInit() {
    this.minDate = this.getDateWithoutTime(new Date());
    this.employeeManagementService.getEmployees().subscribe((employees) => {
      this.employees = employees;
      this.isLoadingEmployees = false;
    });
  }

  submitLeave() {
    if (this.isSubmitting) {
      return;
    }

    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields correctly.', 'Close', { duration: 2200 });
      return;
    }

    const formValue = this.leaveForm.getRawValue();
    const selectedEmployee = this.employees.find(
      (employee) => String(employee.id) === String(formValue.employeeId),
    );

    if (!selectedEmployee) {
      this.snackBar.open('Please select a valid employee.', 'Close', { duration: 2200 });
      return;
    }

    this.isSubmitting = true;
    this.leaveService
      .addRequest({
        employee: selectedEmployee.name,
        employeeId: String(selectedEmployee.id),
        type: formValue.type ?? '',
        start: this.formatDate(formValue.start),
        end: this.formatDate(formValue.end),
        reason: formValue.reason ?? '',
        status: 'Pending',
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe(() => {
        this.snackBar.open('Leave request submitted successfully.', 'Close', { duration: 2200 });
        this.leaveForm.reset({
          employeeId: '',
          type: '',
          start: null,
          end: null,
          reason: '',
        });
      });
  }

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('start')?.value as Date | null;
    const endDate = control.get('end')?.value as Date | null;

    if (!startDate || !endDate) {
      return null;
    }

    return endDate >= startDate ? null : { invalidDateRange: true };
  }

  private formatDate(value: Date | null): string {
    if (!value) {
      return '';
    }

    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDateWithoutTime(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
