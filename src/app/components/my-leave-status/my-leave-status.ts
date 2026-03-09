import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { LeaveRequestRecord, LeaveService } from '../../services/leave.service';
import { EmployeeManagementService, EmployeeRecord } from '../../services/employee-management.service';

interface LeaveRow {
  id: string | number;
  employee: string;
  employeeId: string | number;
  type: string;
  start: string;
  end: string;
  reason: string;
  status: string;
}

@Component({
  selector: 'app-my-leave-status',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatTableModule, MatChipsModule],
  templateUrl: './my-leave-status.html',
  styleUrls: ['./my-leave-status.css'],
})
export class MyLeaveStatus implements OnInit {
  readonly displayedColumns = ['type', 'start', 'end', 'reason', 'status'];
  employees: EmployeeRecord[] = [];
  selectedEmployeeId: string | number = '';
  leaveRequests: LeaveRow[] = [];

  constructor(
    private readonly leaveService: LeaveService,
    private readonly employeeManagementService: EmployeeManagementService,
  ) {}

  ngOnInit() {
    this.employeeManagementService.getEmployees().subscribe((employees) => {
      this.employees = employees;
      if (employees.length > 0) {
        this.selectedEmployeeId = employees[0].id;
        this.loadLeaves();
      }
    });
  }

  onEmployeeChange() {
    this.loadLeaves();
  }

  getChipClass(status: string) {
    if (status === 'Approved') {
      return 'chip-approved';
    }
    if (status === 'Rejected') {
      return 'chip-rejected';
    }
    return 'chip-pending';
  }

  private loadLeaves() {
    this.leaveService.getRequests().subscribe((requests: LeaveRequestRecord[]) => {
      this.leaveRequests = requests
        .map((request) => ({
          id: request.id ?? '',
          employee: request.employee,
          employeeId: request.employeeId,
          type: request.type,
          start: request.start,
          end: request.end,
          reason: request.reason,
          status: request.status,
        }))
        .filter((request) => String(request.employeeId) === String(this.selectedEmployeeId));
    });
  }
}
