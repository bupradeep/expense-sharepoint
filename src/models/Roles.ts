export type UserRole = 'Employee' | 'Admin' | 'Manager' | 'Finance' | 'DepartmentHead';

export const UserRoles: { [K in UserRole]: K } = {
  Employee: 'Employee',
  Admin: 'Admin',
  Manager: 'Manager',
  Finance: 'Finance',
  DepartmentHead: 'DepartmentHead'
};

export function isAdminRole(role: UserRole | undefined): boolean {
  return role === UserRoles.Admin;
}
