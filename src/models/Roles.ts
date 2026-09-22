export type UserRole = 'Employee' | 'Admin' | 'Manager' | 'Finance' | 'FinanceHead' | 'DepartmentHead';

export const UserRoles: { [K in UserRole]: K } = {
  Employee: 'Employee',
  Admin: 'Admin',
  Manager: 'Manager',
  Finance: 'Finance',
  FinanceHead: 'FinanceHead',
  DepartmentHead: 'DepartmentHead'
};

export function isAdminRole(role: UserRole | undefined): boolean {
  return role === UserRoles.Admin;
}
