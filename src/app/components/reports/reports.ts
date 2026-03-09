import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { forkJoin } from 'rxjs';
import { EmployeeManagementService } from '../../services/employee-management.service';
import { AttendanceService } from '../../services/attendance.service';
import { LeaveService } from '../../services/leave.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
})
export class Reports implements OnInit {
  totalEmployees = 0;
  totalAttendanceRecords = 0;
  totalLeaves = 0;
  pendingLeaves = 0;

  constructor(
    private readonly employeeManagementService: EmployeeManagementService,
    private readonly attendanceService: AttendanceService,
    private readonly leaveService: LeaveService,
  ) {}

  ngOnInit() {
    forkJoin({
      employees: this.employeeManagementService.getEmployees(),
      attendance: this.attendanceService.getAttendance(),
      leaves: this.leaveService.getRequests(),
    }).subscribe(({ employees, attendance, leaves }) => {
      this.totalEmployees = employees.length;
      this.totalAttendanceRecords = attendance.length;
      this.totalLeaves = leaves.length;
      this.pendingLeaves = leaves.filter((leave: { status: string }) => leave.status === 'Pending').length;
    });
  }
}
