import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { LeaveRequest } from './leave-request';
import { LeaveService } from '../../services/leave.service';
import { EmployeeManagementService } from '../../services/employee-management.service';

describe('LeaveRequest', () => {
  let component: LeaveRequest;
  let fixture: ComponentFixture<LeaveRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveRequest],
      providers: [
        {
          provide: LeaveService,
          useValue: {
            addRequest: () => of({}),
          },
        },
        {
          provide: EmployeeManagementService,
          useValue: {
            getEmployees: () => of([]),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
