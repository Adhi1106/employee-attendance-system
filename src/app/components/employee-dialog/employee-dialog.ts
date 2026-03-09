import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { EmployeeInput, EmployeeRecord } from '../../services/employee-management.service';

interface EmployeeDialogData {
  mode: 'add' | 'edit';
  employee?: EmployeeRecord;
}

@Component({
  selector: 'app-employee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './employee-dialog.html',
  styleUrls: ['./employee-dialog.css'],
})
export class EmployeeDialog {
  readonly form;

  get isEditMode() {
    return this.data.mode === 'edit';
  }

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<EmployeeDialog>,
    @Inject(MAT_DIALOG_DATA) public readonly data: EmployeeDialogData,
  ) {
    this.form = this.formBuilder.group({
      id: [null as string | number | null],
      name: ['', Validators.required],
      department: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['Employee' as 'Employee' | 'HR', Validators.required],
      avatar: [''],
    });

    if (data.employee) {
      this.form.patchValue(data.employee);
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const payload: EmployeeInput = {
      name: formValue.name ?? '',
      department: formValue.department ?? '',
      email: formValue.email ?? '',
      role: formValue.role ?? 'Employee',
      avatar: formValue.avatar ?? '',
    };

    if (this.isEditMode && this.data.employee) {
      payload.id = this.data.employee.id;
    }

    this.dialogRef.close(payload);
  }

  close() {
    this.dialogRef.close();
  }
}
