export interface IDepartment {
  DepartmentId: number;
  DepartmentName: string;
  IsActive: boolean;
}

export interface IDepartmentDto {
  departmentName: string;
  isActive?: boolean;
}
