import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppRole = 'Employee' | 'HR';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly roleSubject = new BehaviorSubject<AppRole>('Employee');
  readonly role$ = this.roleSubject.asObservable();

  getRole(): AppRole {
    return this.roleSubject.value;
  }

  setRole(role: AppRole) {
    this.roleSubject.next(role);
  }

  isHrRole(): boolean {
    return this.roleSubject.value === 'HR';
  }
}
