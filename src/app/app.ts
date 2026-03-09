import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { take } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { AppRole, RoleService } from './services/role.service';
import { EmployeeManagementService } from './services/employee-management.service';
import { AttendanceService } from './services/attendance.service';
import { LeaveService } from './services/leave.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('260ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class App {
  isMobile = false;
  isSidenavOpened = true;
  selectedRole: AppRole;

  private readonly employeeNavItems: NavItem[] = [
    { label: 'Dashboard', route: '/', icon: 'dashboard' },
    { label: 'Mark Attendance', route: '/mark-attendance', icon: 'how_to_reg' },
    { label: 'Apply Leave', route: '/leave-request', icon: 'event_note' },
    { label: 'My Leave Status', route: '/my-leave-status', icon: 'history' },
  ];

  private readonly hrNavItems: NavItem[] = [
    { label: 'Dashboard', route: '/', icon: 'dashboard' },
    { label: 'Employees', route: '/employees', icon: 'groups' },
    { label: 'Attendance Tracker', route: '/attendance', icon: 'fact_check' },
    { label: 'Leave Approval', route: '/leave-approval', icon: 'task_alt' },
    { label: 'Reports', route: '/reports', icon: 'query_stats' },
  ];

  private readonly employeeDefaultRoute = '/mark-attendance';
  private readonly hrDefaultRoute = '/employees';

  constructor(
    private readonly roleService: RoleService,
    private readonly router: Router,
    private readonly employeeManagementService: EmployeeManagementService,
    private readonly attendanceService: AttendanceService,
    private readonly leaveService: LeaveService,
  ) {
    this.selectedRole = this.roleService.getRole();
    this.syncLayoutState();
    this.warmUpData();
  }

  get navItems(): NavItem[] {
    return this.selectedRole === 'HR' ? this.hrNavItems : this.employeeNavItems;
  }

  @HostListener('window:resize')
  onResize() {
    this.syncLayoutState();
  }

  toggleSidenav() {
    this.isSidenavOpened = !this.isSidenavOpened;
  }

  closeSidenavOnMobile() {
    if (this.isMobile) {
      this.isSidenavOpened = false;
    }
  }

  onRoleChange(role: AppRole) {
    if (this.selectedRole === role) {
      return;
    }

    this.selectedRole = role;
    this.roleService.setRole(role);
    const targetRoute = role === 'HR' ? this.hrDefaultRoute : this.employeeDefaultRoute;
    this.router.navigateByUrl(targetRoute);
    this.closeSidenavOnMobile();
  }

  private warmUpData() {
    this.employeeManagementService.getEmployees().pipe(take(1)).subscribe();
    this.attendanceService.getAttendance().pipe(take(1)).subscribe();
    this.leaveService.getRequests().pipe(take(1)).subscribe();
  }

  private syncLayoutState() {
    if (typeof window === 'undefined') {
      return;
    }

    this.isMobile = window.innerWidth < 992;
    this.isSidenavOpened = !this.isMobile;
  }
}
