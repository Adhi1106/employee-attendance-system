import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { LeaveService } from '../../services/leave.service';

interface LeaveRequestRow {
  id: string | number;
  employee: string;
  employeeId: string;
  type: string;
  start: string;
  end: string;
  reason: string;
  status: string;
}

@Component({
  selector: 'app-leave-approval',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatChipsModule],
  templateUrl: './leave-approval.html',
  styleUrls: ['./leave-approval.css'],
})
export class LeaveApproval implements OnInit {
  readonly displayedColumns = ['employee', 'type', 'start', 'end', 'reason', 'status', 'actions'];
  leaveRequests: LeaveRequestRow[] = [];
  isLoading = true;
  private readonly processingIds = new Set<string>();

  constructor(
    private readonly leaveService: LeaveService,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  updateStatus(request: LeaveRequestRow, status: 'Approved' | 'Rejected') {
    const requestId = String(request.id);
    if (this.processingIds.has(requestId)) {
      return;
    }

    this.processingIds.add(requestId);
    const updated = { ...request, status };
    this.leaveService
      .updateRequest(request.id, updated)
      .pipe(
        finalize(() => {
          this.processingIds.delete(requestId);
        }),
      )
      .subscribe(() => {
        this.leaveRequests = this.leaveRequests.filter((item) => String(item.id) !== requestId);
        this.snackBar.open(
          status === 'Approved' ? 'Leave approved successfully.' : 'Leave rejected successfully.',
          'Close',
          { duration: 2200 },
        );
      });
  }

  getChipClass(status: string): string {
    if (status === 'Approved') {
      return 'chip-approved';
    }
    if (status === 'Rejected') {
      return 'chip-rejected';
    }
    return 'chip-pending';
  }

  isProcessing(requestId: string | number): boolean {
    return this.processingIds.has(String(requestId));
  }

  private loadRequests() {
    this.isLoading = true;
    this.leaveService.getRequests().subscribe((requests) => {
      this.isLoading = false;
      this.leaveRequests = (requests as Partial<LeaveRequestRow>[])
        .map((request) => ({
          id: request.id ?? '',
          employee: request.employee ?? '',
          employeeId: request.employeeId ?? '',
          type: request.type ?? '',
          start: request.start ?? '',
          end: request.end ?? '',
          reason: request.reason ?? '',
          status: request.status ?? 'Pending',
        }))
        .filter((request) => request.status === 'Pending');
    });
  }
}
