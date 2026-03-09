import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, concat, map, of, tap } from 'rxjs';

export interface AttendanceRecord {
  id?: string | number;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'Present' | 'Absent';
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly apiUrl = 'http://localhost:3000/attendance';
  private readonly cacheWindowMs = 12_000;
  private readonly storageKey = 'ealm_cache_attendance';
  private fallbackAttendance: AttendanceRecord[] = this.loadCachedAttendance();
  private lastFetchAt = 0;

  constructor(private readonly http: HttpClient) {}

  getAttendance(): Observable<AttendanceRecord[]> {
    const cachedAttendance = [...this.fallbackAttendance];
    const shouldRefresh = Date.now() - this.lastFetchAt > this.cacheWindowMs;

    if (!shouldRefresh) {
      return of(cachedAttendance);
    }

    const remoteRequest$ = this.http.get<AttendanceRecord[]>(this.apiUrl).pipe(
      map((records) => this.normalizeAttendance(records)),
      tap((records) => {
        this.fallbackAttendance = records;
        this.lastFetchAt = Date.now();
        this.persistCache();
      }),
      catchError(() => of(cachedAttendance)),
    );

    return concat(of(cachedAttendance), remoteRequest$);
  }

  markAttendance(payload: AttendanceRecord) {
    const normalizedPayload = this.normalizeRecord(payload);
    return this.http.post<AttendanceRecord>(this.apiUrl, normalizedPayload).pipe(
      map((record) => this.normalizeRecord(record)),
      tap((record) => {
        this.fallbackAttendance = this.upsertAttendanceRecord(record);
        this.lastFetchAt = Date.now();
        this.persistCache();
      }),
      catchError(() => {
        const fallbackRecord: AttendanceRecord = {
          ...normalizedPayload,
          id: this.generateLocalId(),
        };
        this.fallbackAttendance = this.upsertAttendanceRecord(fallbackRecord);
        this.lastFetchAt = Date.now();
        this.persistCache();
        return of(fallbackRecord);
      }),
    );
  }

  private normalizeAttendance(records: AttendanceRecord[] | null | undefined): AttendanceRecord[] {
    if (!Array.isArray(records)) {
      return [];
    }
    return records.map((record) => this.normalizeRecord(record));
  }

  private loadCachedAttendance(): AttendanceRecord[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const rawValue = localStorage.getItem(this.storageKey);
      if (!rawValue) {
        return [];
      }

      const parsed = JSON.parse(rawValue) as AttendanceRecord[];
      return this.normalizeAttendance(parsed);
    } catch {
      return [];
    }
  }

  private persistCache() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.fallbackAttendance));
    } catch {
      // Ignore storage write failures and continue with in-memory cache.
    }
  }

  private normalizeRecord(record: AttendanceRecord): AttendanceRecord {
    return {
      ...record,
      employeeId: String(record.employeeId ?? ''),
      employeeName: record.employeeName?.trim() ?? '',
      date: record.date ?? '',
      status: record.status === 'Absent' ? 'Absent' : 'Present',
    };
  }

  private upsertAttendanceRecord(record: AttendanceRecord): AttendanceRecord[] {
    const filtered = this.fallbackAttendance.filter(
      (item) => !(item.employeeId === record.employeeId && item.date === record.date),
    );
    return [...filtered, record];
  }

  private generateLocalId(): string {
    return `local-att-${Date.now()}`;
  }
}
