import { UserRole } from './Roles';
import { IDepartment } from './IDepartment';

export interface IUser {
  UserId: number;
  FullName: string;
  Email: string;
  EmployeeCode: string;
  EmployeeObjectId: string;
  Role: UserRole;
  DepartmentId?: number;
  Department?: IDepartment;
  IsActive: boolean;
}

export interface IUserDto {
  fullName: string;
  email: string;
  employeeCode: string;
  employeeObjectId: string;
  role?: UserRole;
  departmentId?: number;
  isActive?: boolean;
}
