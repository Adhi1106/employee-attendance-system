import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { Dashboard } from './dashboard';
import { EmployeeManagementService } from '../../services/employee-management.service';
import { AttendanceService } from '../../services/attendance.service';
import { LeaveService } from '../../services/leave.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
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
        provideCharts(withDefaultRegisterables()),
        provideNoopAnimations(),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
