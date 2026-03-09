import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AttendanceTracker } from './attendance-tracker';
import { AttendanceService } from '../../services/attendance.service';

describe('AttendanceTracker', () => {
  let component: AttendanceTracker;
  let fixture: ComponentFixture<AttendanceTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceTracker],
      providers: [
        {
          provide: AttendanceService,
          useValue: {
            getAttendance: () => of([]),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceTracker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
