import { Routes } from '@angular/router';

import { Dashboard } from './components/dashboard/dashboard';
import { EmployeeList } from './components/employee-list/employee-list';
import { AttendanceTracker } from './components/attendance-tracker/attendance-tracker';
import { LeaveRequest } from './components/leave-request/leave-request';
import { LeaveApproval } from './components/leave-approval/leave-approval';
import { MarkAttendance } from './components/mark-attendance/mark-attendance';
import { MyLeaveStatus } from './components/my-leave-status/my-leave-status';
import { Reports } from './components/reports/reports';
import { hrRoleGuard } from './guards/hr-role.guard';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'employees', component: EmployeeList, canActivate: [hrRoleGuard] },
  { path: 'attendance', component: AttendanceTracker, canActivate: [hrRoleGuard] },
  { path: 'leave-request', component: LeaveRequest },
  { path: 'leave-approval', component: LeaveApproval, canActivate: [hrRoleGuard] },
  { path: 'mark-attendance', component: MarkAttendance },
  { path: 'my-leave-status', component: MyLeaveStatus },
  { path: 'reports', component: Reports, canActivate: [hrRoleGuard] },
];
