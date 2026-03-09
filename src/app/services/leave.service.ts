import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, concat, map, of, tap } from 'rxjs';

export interface LeaveRequestRecord {
  id?: string | number;
  employee: string;
  employeeId: string;
  type: string;
  start: string;
  end: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {

  private apiUrl = 'http://localhost:3000/leaveRequests';
  private readonly cacheWindowMs = 12_000;
  private readonly storageKey = 'ealm_cache_leave_requests';
  private fallbackRequests: LeaveRequestRecord[] = this.loadCachedRequests();
  private lastFetchAt = 0;

  constructor(private http: HttpClient) {}

  getRequests() {
    const cachedRequests = [...this.fallbackRequests];
    const shouldRefresh = Date.now() - this.lastFetchAt > this.cacheWindowMs;

    if (!shouldRefresh) {
      return of(cachedRequests);
    }

    const remoteRequest$ = this.http.get<LeaveRequestRecord[]>(this.apiUrl).pipe(
      map((requests) => this.normalizeRequests(requests)),
      tap((requests) => {
        this.fallbackRequests = requests;
        this.lastFetchAt = Date.now();
        this.persistCache();
      }),
      catchError(() => of(cachedRequests)),
    );

    return concat(of(cachedRequests), remoteRequest$);
  }

  addRequest(data: LeaveRequestRecord) {
    const normalizedData = this.normalizeRequest(data);
    return this.http.post<LeaveRequestRecord>(this.apiUrl, normalizedData).pipe(
      map((request) => this.normalizeRequest(request)),
      tap((request) => {
        this.fallbackRequests = this.upsertRequest(request);
        this.lastFetchAt = Date.now();
        this.persistCache();
      }),
      catchError(() => {
        const fallbackRequest: LeaveRequestRecord = {
          ...normalizedData,
          id: this.generateLocalId(),
        };
        this.fallbackRequests = this.upsertRequest(fallbackRequest);
        this.lastFetchAt = Date.now();
        this.persistCache();
        return of(fallbackRequest);
      }),
    );
  }

  updateRequest(id: number | string, data: LeaveRequestRecord) {
    const normalized = this.normalizeRequest({ ...data, id });
    return this.http.put<LeaveRequestRecord>(`${this.apiUrl}/${id}`, normalized).pipe(
      map((request) => this.normalizeRequest(request)),
      tap((request) => {
        this.fallbackRequests = this.upsertRequest(request);
        this.lastFetchAt = Date.now();
        this.persistCache();
      }),
      catchError(() => {
        this.fallbackRequests = this.upsertRequest(normalized);
        this.lastFetchAt = Date.now();
        this.persistCache();
        return of(normalized);
      }),
    );
  }

  private normalizeRequests(requests: LeaveRequestRecord[] | null | undefined): LeaveRequestRecord[] {
    if (!Array.isArray(requests)) {
      return [];
    }
    return requests.map((request) => this.normalizeRequest(request));
  }

  private loadCachedRequests(): LeaveRequestRecord[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const rawValue = localStorage.getItem(this.storageKey);
      if (!rawValue) {
        return [];
      }

      const parsed = JSON.parse(rawValue) as LeaveRequestRecord[];
      return this.normalizeRequests(parsed);
    } catch {
      return [];
    }
  }

  private persistCache() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.fallbackRequests));
    } catch {
      // Ignore storage write failures and continue with in-memory cache.
    }
  }

  private normalizeRequest(request: Partial<LeaveRequestRecord>): LeaveRequestRecord {
    const status = request.status ?? 'Pending';
    return {
      id: request.id,
      employee: request.employee?.trim() ?? '',
      employeeId: String(request.employeeId ?? ''),
      type: request.type?.trim() ?? '',
      start: request.start ?? '',
      end: request.end ?? '',
      reason: request.reason?.trim() ?? '',
      status: status === 'Approved' || status === 'Rejected' ? status : 'Pending',
    };
  }

  private upsertRequest(request: LeaveRequestRecord): LeaveRequestRecord[] {
    const requestId = String(request.id ?? '');
    if (!requestId) {
      return [...this.fallbackRequests, request];
    }

    const filtered = this.fallbackRequests.filter((item) => String(item.id) !== requestId);
    return [...filtered, request];
  }

  private generateLocalId(): string {
    return `local-leave-${Date.now()}`;
  }
}
