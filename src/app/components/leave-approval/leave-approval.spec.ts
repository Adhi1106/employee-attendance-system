import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { LeaveApproval } from './leave-approval';
import { LeaveService } from '../../services/leave.service';

describe('LeaveApproval', () => {
  let component: LeaveApproval;
  let fixture: ComponentFixture<LeaveApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveApproval],
      providers: [
        {
          provide: LeaveService,
          useValue: {
            getRequests: () => of([]),
            updateRequest: () => of({}),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
