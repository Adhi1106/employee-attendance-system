import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { AttendanceRecord, AttendanceService } from '../../services/attendance.service';
import { HighlightAbsentDirective } from '../../directives/highlight-absent.directive';

@Component({
  selector: 'app-attendance-tracker',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, HighlightAbsentDirective],
  templateUrl: './attendance-tracker.html',
  styleUrls: ['./attendance-tracker.css'],
})
export class AttendanceTracker implements OnInit {
  readonly displayedColumns = ['employeeName', 'date', 'status'];
  attendanceRecords: AttendanceRecord[] = [];

  constructor(private readonly attendanceService: AttendanceService) {}

  ngOnInit() {
    this.loadAttendance();
  }

  private loadAttendance() {
    this.attendanceService.getAttendance().subscribe((records) => {
      this.attendanceRecords = records.sort((a, b) => (a.date < b.date ? 1 : -1));
    });
  }
}
