import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { App } from './app';
import { EmployeeManagementService } from './services/employee-management.service';
import { AttendanceService } from './services/attendance.service';
import { LeaveService } from './services/leave.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: EmployeeManagementService,
          useValue: {
            getEmployees: () => of([]),
          },
        },
        {
          provide: AttendanceService,
          useValue: {
            getAttendance: () => of([]),
          },
        },
        {
          provide: LeaveService,
          useValue: {
            getRequests: () => of([]),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-toolbar')?.textContent).toContain(
      'Employee Attendance & Leave Management System',
    );
  });
});
