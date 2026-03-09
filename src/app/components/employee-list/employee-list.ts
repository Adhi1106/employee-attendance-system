import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, of } from 'rxjs';
import {
  EmployeeInput,
  EmployeeManagementService,
  EmployeeRecord,
} from '../../services/employee-management.service';
import { EmployeeDialog } from '../employee-dialog/employee-dialog';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css'],
})
export class EmployeeList implements OnInit {
  readonly displayedColumns = ['avatar', 'name', 'department', 'email', 'role', 'actions'];

  employees: EmployeeRecord[] = [];
  departments: string[] = [];
  departmentFilter = 'All';

  constructor(
    private readonly employeeManagementService: EmployeeManagementService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  openAddEmployeeDialog() {
    const dialogRef = this.dialog.open(EmployeeDialog, {
      data: { mode: 'add' },
      width: '520px',
    });

    dialogRef.afterClosed().subscribe((employee?: EmployeeInput) => {
      if (!employee) {
        return;
      }

      this.employeeManagementService.addEmployee(employee).subscribe(() => {
        this.snackBar.open('Employee added successfully.', 'Close', { duration: 2200 });
        this.loadData();
      });
    });
  }

  openEditEmployeeDialog(employee: EmployeeRecord) {
    const dialogRef = this.dialog.open(EmployeeDialog, {
      data: { mode: 'edit', employee },
      width: '520px',
    });

    dialogRef.afterClosed().subscribe((updated?: EmployeeRecord) => {
      if (!updated) {
        return;
      }

      this.employeeManagementService.updateEmployee(employee.id, updated).subscribe(() => {
        this.snackBar.open('Employee details updated.', 'Close', { duration: 2200 });
        this.loadData();
      });
    });
  }

  deleteEmployee(employee: EmployeeRecord) {
    const confirmed = window.confirm(`Delete employee "${employee.name}"?`);
    if (!confirmed) {
      return;
    }

    this.employeeManagementService.deleteEmployee(employee.id).subscribe(() => {
      this.snackBar.open('Employee deleted successfully.', 'Close', { duration: 2200 });
      this.loadData();
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  get filteredEmployees(): EmployeeRecord[] {
    if (this.departmentFilter === 'All') {
      return this.employees;
    }

    return this.employees.filter(
      (employee) => employee.department.toLowerCase() === this.departmentFilter.toLowerCase(),
    );
  }

  private loadData() {
    this.employeeManagementService
      .getEmployees()
      .pipe(catchError(() => of([])))
      .subscribe((employees) => {
      this.employees = employees;
      this.departments = ['All', ...new Set(employees.map((employee) => employee.department))];
    });
  }
}
