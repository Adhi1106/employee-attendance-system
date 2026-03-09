import { Pipe, PipeTransform } from '@angular/core';
import { EmployeeRecord } from '../services/employee-management.service';

@Pipe({
  name: 'employeeFilter',
  standalone: true,
})
export class EmployeeFilterPipe implements PipeTransform {
  transform(
    employees: EmployeeRecord[] | null,
    department: string,
    attendanceStatus: string,
    statusMap: Record<string, string>,
  ): EmployeeRecord[] {
    if (!employees) {
      return [];
    }

    return employees.filter((employee) => {
      const departmentPass =
        !department || department === 'All' || employee.department.toLowerCase() === department.toLowerCase();
      const attendanceValue = statusMap[String(employee.id)] ?? 'Not Marked';
      const attendancePass = !attendanceStatus || attendanceStatus === 'All' || attendanceValue === attendanceStatus;
      return departmentPass && attendancePass;
    });
  }
}
