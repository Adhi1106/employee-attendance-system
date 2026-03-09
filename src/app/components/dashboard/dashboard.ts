import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { combineLatest } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { EmployeeManagementService } from '../../services/employee-management.service';
import { AttendanceRecord, AttendanceService } from '../../services/attendance.service';
import { LeaveService } from '../../services/leave.service';

interface LeaveRequestRow {
  id: string | number;
  employee: string;
  employeeId?: string;
  type: string;
  start: string;
  end: string;
  reason: string;
  status: string;
}

type CounterKey =
  | 'displayTotalEmployees'
  | 'displayPresentToday'
  | 'displayPendingLeaveRequests'
  | 'displayApprovedLeaves';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  animations: [
    trigger('cardEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('{{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class Dashboard implements OnInit {
  totalEmployees = 0;
  presentToday = 0;
  pendingLeaveRequests = 0;
  approvedLeaves = 0;

  displayTotalEmployees = 0;
  displayPresentToday = 0;
  displayPendingLeaveRequests = 0;
  displayApprovedLeaves = 0;

  readonly statCards = [
    { key: 'totalEmployees', label: 'Total Employees', icon: 'groups', className: 'metric-employee' },
    { key: 'presentToday', label: 'Present Today', icon: 'event_available', className: 'metric-present' },
    {
      key: 'pendingLeaveRequests',
      label: 'Pending Leave Requests',
      icon: 'pending_actions',
      className: 'metric-pending',
    },
    { key: 'approvedLeaves', label: 'Approved Leaves', icon: 'verified', className: 'metric-approved' },
  ] as const;

  readonly attendanceChartType: 'line' = 'line';
  attendanceChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };
  readonly attendanceChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  readonly leaveChartType: 'pie' = 'pie';
  leaveChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#f4c542', '#2eaf63', '#df4f58'] }],
  };
  readonly leaveChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  constructor(
    private readonly employeeManagementService: EmployeeManagementService,
    private readonly attendanceService: AttendanceService,
    private readonly leaveService: LeaveService,
  ) {}

  ngOnInit() {
    combineLatest({
      employees: this.employeeManagementService.getEmployees(),
      attendance: this.attendanceService.getAttendance(),
      leaves: this.leaveService.getRequests(),
    }).subscribe(({ employees, attendance, leaves }) => {
      const leaveRequests = leaves as LeaveRequestRow[];
      this.totalEmployees = employees.length;
      this.pendingLeaveRequests = leaveRequests.filter((request) => request.status === 'Pending').length;
      this.approvedLeaves = leaveRequests.filter((request) => request.status === 'Approved').length;
      this.presentToday = this.computePresentToday(attendance);

      this.animateCounter('displayTotalEmployees', this.totalEmployees);
      this.animateCounter('displayPresentToday', this.presentToday);
      this.animateCounter('displayPendingLeaveRequests', this.pendingLeaveRequests);
      this.animateCounter('displayApprovedLeaves', this.approvedLeaves);

      this.updateAttendanceChart(attendance);
      this.updateLeaveChart(leaveRequests);
    });
  }

  getCounterValue(key: (typeof this.statCards)[number]['key']): number {
    if (key === 'totalEmployees') {
      return this.displayTotalEmployees;
    }
    if (key === 'presentToday') {
      return this.displayPresentToday;
    }
    if (key === 'pendingLeaveRequests') {
      return this.displayPendingLeaveRequests;
    }
    return this.displayApprovedLeaves;
  }

  private computePresentToday(attendance: AttendanceRecord[]): number {
    const today = this.formatDate(new Date());
    const todayAttendance = attendance.filter((record) => record.date === today);

    if (todayAttendance.length === 0) {
      return 0;
    }

    const latestStatusByEmployee = new Map<string, 'Present' | 'Absent'>();
    todayAttendance.forEach((record) => {
      latestStatusByEmployee.set(String(record.employeeId), record.status);
    });

    return [...latestStatusByEmployee.values()].filter((status) => status === 'Present').length;
  }

  private updateAttendanceChart(attendance: AttendanceRecord[]) {
    const weekDates = this.getCurrentWeekDates();
    const presentData: number[] = [];
    const absentData: number[] = [];

    weekDates.forEach((date) => {
      const records = attendance.filter((record) => record.date === date);
      presentData.push(records.filter((record) => record.status === 'Present').length);
      absentData.push(records.filter((record) => record.status === 'Absent').length);
    });

    this.attendanceChartData = {
      labels: weekDates.map((date) => this.getWeekdayLabel(date)),
      datasets: [
        {
          label: 'Present',
          data: presentData,
          borderColor: '#ce346f',
          backgroundColor: 'rgba(206, 52, 111, 0.2)',
          pointBackgroundColor: '#ce346f',
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Absent',
          data: absentData,
          borderColor: '#f3b5c9',
          backgroundColor: 'rgba(243, 181, 201, 0.18)',
          pointBackgroundColor: '#f3b5c9',
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }

  private updateLeaveChart(leaves: LeaveRequestRow[]) {
    const pending = leaves.filter((leave) => leave.status === 'Pending').length;
    const approved = leaves.filter((leave) => leave.status === 'Approved').length;
    const rejected = leaves.filter((leave) => leave.status === 'Rejected').length;

    this.leaveChartData = {
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [
        {
          data: [pending, approved, rejected],
          backgroundColor: ['#f4c542', '#2eaf63', '#df4f58'],
        },
      ],
    };
  }

  private animateCounter(key: CounterKey, target: number) {
    const start = this[key];
    const duration = 700;
    const startTime = performance.now();

    const frame = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      this[key] = Math.round(start + (target - start) * progress);
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }

  private getCurrentWeekDates(): string[] {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return this.formatDate(date);
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getWeekdayLabel(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' });
  }
}
