import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { AttendanceService } from '../../services/attendance.service';
import { EmployeeManagementService, EmployeeRecord } from '../../services/employee-management.service';

@Component({
  selector: 'app-mark-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  templateUrl: './mark-attendance.html',
  styleUrls: ['./mark-attendance.css'],
})
export class MarkAttendance implements OnInit {
  employees: EmployeeRecord[] = [];
  isSubmitting = false;
  isLoadingEmployees = true;
  readonly todayDate = this.getDateWithoutTime(new Date());
  readonly todayOnlyFilter = (date: Date | null): boolean => this.isToday(date);
  attendance = {
    employeeId: '' as string | number,
    employeeName: '',
    date: this.todayDate,
    status: 'Present' as 'Present' | 'Absent',
  };

  constructor(
    private readonly employeeManagementService: EmployeeManagementService,
    private readonly attendanceService: AttendanceService,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.employeeManagementService.getEmployees().subscribe((employees) => {
      this.employees = employees;
      this.isLoadingEmployees = false;
    });
  }

  onEmployeeChange(employeeId: string | number) {
    const employee = this.employees.find((item) => String(item.id) === String(employeeId));
    this.attendance.employeeName = employee?.name ?? '';
  }

  submitAttendance() {
    if (this.isSubmitting || !this.attendance.employeeId || !this.attendance.date || !this.attendance.status) {
      if (!this.attendance.employeeId || !this.attendance.date) {
        this.snackBar.open('Please select employee and date to mark attendance.', 'Close', { duration: 2200 });
      }
      return;
    }

    if (!this.isToday(this.attendance.date)) {
      this.snackBar.open('Attendance can only be marked for today.', 'Close', { duration: 2200 });
      return;
    }

    this.isSubmitting = true;
    this.attendanceService
      .markAttendance({
        employeeId: String(this.attendance.employeeId),
        employeeName: this.attendance.employeeName,
        date: this.formatDate(this.attendance.date),
        status: this.attendance.status,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe(() => {
        this.snackBar.open('Attendance marked successfully.', 'Close', { duration: 2200 });
        this.attendance = {
          employeeId: '',
          employeeName: '',
          date: this.todayDate,
          status: 'Present',
        };
      });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDateWithoutTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private isToday(date: Date | null): boolean {
    if (!date) {
      return false;
    }

    const selectedDate = this.getDateWithoutTime(date);
    return selectedDate.getTime() === this.todayDate.getTime();
  }
}
