import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, concat, map, of, tap } from 'rxjs';

export interface EmployeeRecord {
  id: string | number;
  name: string;
  department: string;
  email: string;
  role: 'Employee' | 'HR';
  avatar?: string;
}

export type EmployeeInput = Omit<EmployeeRecord, 'id'> & { id?: string | number };

const DEFAULT_EMPLOYEES: EmployeeRecord[] = [
  {
    id: '1',
    name: 'Alice',
    department: 'HR',
    email: 'alice@company.com',
    role: 'HR',
    avatar: '',
  },
  {
    id: '2',
    name: 'Bob',
    department: 'IT',
    email: 'bob@company.com',
    role: 'Employee',
    avatar: '',
  },
  {
    id: '3',
    name: 'Charlie',
    department: 'Finance',
    email: 'charlie@company.com',
    role: 'Employee',
    avatar: '',
  },
];

@Injectable({
  providedIn: 'root',
})
export class EmployeeManagementService {
  private readonly apiUrl = 'http://localhost:3000/employees';
  private readonly cacheWindowMs = 12_000;
  private readonly storageKey = 'ealm_cache_employees';
  private fallbackEmployees: EmployeeRecord[] = this.loadCachedEmployees();
  private lastFetchAt = 0;

  constructor(private readonly http: HttpClient) {}

  getEmployees(): Observable<EmployeeRecord[]> {
    const cachedEmployees = this.getFallbackEmployees();
    const shouldRefresh = Date.now() - this.lastFetchAt > this.cacheWindowMs;

    if (!shouldRefresh) {
      return of(cachedEmployees);
    }

    const remoteRequest$ = this.http.get<EmployeeRecord[]>(this.apiUrl).pipe(
      map((employees) => this.normalizeEmployees(employees)),
      map((employees) => (employees.length > 0 ? employees : this.getDefaultEmployees())),
      tap((employees) => {
        this.fallbackEmployees = employees;
        this.lastFetchAt = Date.now();
        this.persistCache();
      }),
      catchError(() => of(cachedEmployees)),
    );

    return concat(of(cachedEmployees), remoteRequest$);
  }

  addEmployee(payload: EmployeeInput) {
    return this.http.post<EmployeeRecord>(this.apiUrl, payload).pipe(
      map((employee) => this.normalizeEmployee(employee)),
      tap((employee) => {
        this.fallbackEmployees = this.upsertLocalEmployee(employee);
        this.lastFetchAt = Date.now();
        this.persistCache();
      }),
      catchError(() => {
        const localEmployee = this.createLocalEmployee(payload);
        this.fallbackEmployees = this.upsertLocalEmployee(localEmployee);
        this.lastFetchAt = Date.now();
        this.persistCache();
        return of(localEmployee);
      }),
    );
  }

  updateEmployee(id: string | number, payload: EmployeeRecord) {
    const normalizedEmployee = this.normalizeEmployee({ ...payload, id });
    return this.http.put<EmployeeRecord>(`${this.apiUrl}/${id}`, normalizedEmployee).pipe(
      map((employee) => this.normalizeEmployee(employee)),
      tap((employee) => {
        this.fallbackEmployees = this.upsertLocalEmployee(employee);
        this.lastFetchAt = Date.now();
        this.persistCache();
      }),
      catchError(() => {
        this.fallbackEmployees = this.upsertLocalEmployee(normalizedEmployee);
        this.lastFetchAt = Date.now();
        this.persistCache();
        return of(normalizedEmployee);
      }),
    );
  }

  deleteEmployee(id: string | number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.fallbackEmployees = this.removeLocalEmployee(id);
        this.lastFetchAt = Date.now();
        this.persistCache();
      }),
      catchError(() => {
        this.fallbackEmployees = this.removeLocalEmployee(id);
        this.lastFetchAt = Date.now();
        this.persistCache();
        return of(void 0);
      }),
    );
  }

  private getDefaultEmployees(): EmployeeRecord[] {
    return DEFAULT_EMPLOYEES.map((employee) => ({ ...employee }));
  }

  private getFallbackEmployees(): EmployeeRecord[] {
    return this.fallbackEmployees.length > 0 ? [...this.fallbackEmployees] : this.getDefaultEmployees();
  }

  private loadCachedEmployees(): EmployeeRecord[] {
    if (typeof localStorage === 'undefined') {
      return this.getDefaultEmployees();
    }

    try {
      const rawValue = localStorage.getItem(this.storageKey);
      if (!rawValue) {
        return this.getDefaultEmployees();
      }

      const parsed = JSON.parse(rawValue) as EmployeeRecord[];
      const normalized = this.normalizeEmployees(parsed);
      return normalized.length > 0 ? normalized : this.getDefaultEmployees();
    } catch {
      return this.getDefaultEmployees();
    }
  }

  private persistCache() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.fallbackEmployees));
    } catch {
      // Ignore storage write failures and continue with in-memory cache.
    }
  }

  private normalizeEmployees(employees: EmployeeRecord[] | null | undefined): EmployeeRecord[] {
    if (!Array.isArray(employees)) {
      return [];
    }
    return employees.map((employee) => this.normalizeEmployee(employee));
  }

  private normalizeEmployee(employee: EmployeeInput | EmployeeRecord): EmployeeRecord {
    const nextId = employee.id ?? this.generateLocalId();
    return {
      id: nextId,
      name: employee.name?.trim() ?? '',
      department: employee.department?.trim() ?? '',
      email: employee.email?.trim() ?? '',
      role: employee.role ?? 'Employee',
      avatar: employee.avatar ?? '',
    };
  }

  private upsertLocalEmployee(employee: EmployeeRecord): EmployeeRecord[] {
    const targetId = String(employee.id);
    const next = this.fallbackEmployees.filter((item) => String(item.id) !== targetId);
    return [...next, employee];
  }

  private removeLocalEmployee(id: string | number): EmployeeRecord[] {
    const targetId = String(id);
    return this.fallbackEmployees.filter((employee) => String(employee.id) !== targetId);
  }

  private createLocalEmployee(payload: EmployeeInput): EmployeeRecord {
    return this.normalizeEmployee({
      ...payload,
      id: payload.id ?? this.generateLocalId(),
    });
  }

  private generateLocalId(): string {
    const numericIds = this.fallbackEmployees
      .map((employee) => Number(employee.id))
      .filter((id) => Number.isFinite(id));

    const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    return String(nextId);
  }
}
