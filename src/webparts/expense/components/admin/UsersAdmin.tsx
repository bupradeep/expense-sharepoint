import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { userService } from '../../../../services/userService';
import { departmentService } from '../../../../services/departmentService';
import { IUser, IUserDto } from '../../../../models/IUser';
import { IDepartment } from '../../../../models/IDepartment';
import { UserRoles, UserRole } from '../../../../models/Roles';
import { ApiError } from '../../../../models/IApiError';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import TableCard from '../common/TableCard';
import RowActions from '../common/RowActions';
import FormRow from '../common/FormRow';
import ListToolbar from '../common/ListToolbar';
import PaginationControls from '../common/PaginationControls';
import { usePagination } from '../common/usePagination';
import UserDetail from './UserDetail';

const emptyForm: IUserDto = {
  fullName: '',
  email: '',
  employeeCode: '',
  employeeObjectId: '',
  role: UserRoles.Employee,
  isActive: true
};

const roleOptions: IDropdownOption[] = Object.keys(UserRoles).map((role) => ({ key: role, text: role }));

type View = 'list' | 'form' | 'detail';

const UsersAdmin: React.FC = () => {
  const [departments, setDepartments] = React.useState<IDepartment[]>([]);
  const [allUsers, setAllUsers] = React.useState<IUser[]>([]);
  const [view, setView] = React.useState<View>('list');
  const [editing, setEditing] = React.useState<IUser | undefined>(undefined);
  const [viewing, setViewing] = React.useState<IUser | undefined>(undefined);
  const [form, setForm] = React.useState<IUserDto>(emptyForm);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<IUser | undefined>(undefined);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);

  const fetchPage = React.useCallback(
    (page: number, pageSize: number) => userService.getPage(page, pageSize),
    []
  );
  const pagination = usePagination(fetchPage);

  const loadManagerOptions = React.useCallback((): void => {
    userService.getAll().then(setAllUsers).catch(() => { /* manager dropdown is best-effort */ });
  }, []);

  React.useEffect(() => {
    departmentService.getAll().then(setDepartments).catch(() => { /* department dropdown is best-effort */ });
    loadManagerOptions();
  }, [loadManagerOptions]);

  const departmentOptions: IDropdownOption[] = departments.map((d) => ({ key: d.DepartmentId, text: d.DepartmentName }));

  // A user can't be their own manager, so the dropdown excludes whoever is currently being edited.
  const managerOptions: IDropdownOption[] = allUsers
    .filter((u) => !editing || u.UserId !== editing.UserId)
    .map((u) => ({ key: u.UserId, text: u.FullName }));

  const openCreate = (): void => {
    setEditing(undefined);
    setForm(emptyForm);
    setFormError(undefined);
    setView('form');
  };

  const openEdit = (item: IUser): void => {
    setEditing(item);
    setForm({
      fullName: item.FullName,
      email: item.Email,
      employeeCode: item.EmployeeCode,
      employeeObjectId: item.EmployeeObjectId,
      role: item.Role,
      departmentId: item.DepartmentId,
      managerId: item.ManagerId,
      isActive: item.IsActive
    });
    setFormError(undefined);
    setView('form');
  };

  const openView = (item: IUser): void => {
    setViewing(item);
    setView('detail');
  };

  const save = (): void => {
    setSaving(true);
    setFormError(undefined);
    const request = editing
      ? userService.update(editing.UserId, form)
      : userService.create(form);

    request
      .then(() => {
        setSaving(false);
        setView('list');
        pagination.reload();
        loadManagerOptions();
      })
      .catch((err: ApiError) => {
        setSaving(false);
        setFormError(err.message);
      });
  };

  const remove = (): void => {
    if (!deleteTarget) {
      return;
    }
    userService.remove(deleteTarget.UserId)
      .then(() => {
        setDeleteTarget(undefined);
        pagination.reload();
      })
      .catch((err: ApiError) => {
        setDeleteTarget(undefined);
        setActionError(err.message);
      });
  };

  if (view === 'form') {
    return (
      <TableCard title={editing ? 'Edit User' : 'New User'}>
        <Stack tokens={{ childrenGap: 12 }}>
          {formError && <ErrorMessage message={formError} />}
          <FormRow label="Full Name" required>
            <TextField
              value={form.fullName}
              onChange={(_e, value) => setForm({ ...form, fullName: value || '' })}
            />
          </FormRow>
          <FormRow label="Email" required>
            <TextField
              value={form.email}
              onChange={(_e, value) => setForm({ ...form, email: value || '' })}
            />
          </FormRow>
          <FormRow label="Employee Code" required>
            <TextField
              value={form.employeeCode}
              onChange={(_e, value) => setForm({ ...form, employeeCode: value || '' })}
            />
          </FormRow>
          <FormRow label="Employee Object Id (Azure AD)" required>
            <TextField
              value={form.employeeObjectId}
              onChange={(_e, value) => setForm({ ...form, employeeObjectId: value || '' })}
            />
          </FormRow>
          <FormRow label="Role">
            <Dropdown
              selectedKey={form.role}
              options={roleOptions}
              onChange={(_e, option) => setForm({ ...form, role: option?.key as UserRole })}
            />
          </FormRow>
          <FormRow label="Department">
            <Dropdown
              selectedKey={form.departmentId}
              options={departmentOptions}
              onChange={(_e, option) => setForm({ ...form, departmentId: option?.key as number })}
            />
          </FormRow>
          <FormRow label="Manager">
            <Dropdown
              selectedKey={form.managerId}
              options={managerOptions}
              placeholder="No manager mapped"
              onChange={(_e, option) => setForm({ ...form, managerId: option?.key as number })}
            />
          </FormRow>
          <FormRow label="Active">
            <Toggle
              checked={form.isActive}
              onChange={(_e, checked) => setForm({ ...form, isActive: !!checked })}
            />
          </FormRow>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton
              text="Save"
              onClick={save}
              disabled={saving || !form.fullName || !form.email || !form.employeeCode || !form.employeeObjectId}
            />
            <DefaultButton text="Cancel" onClick={() => setView('list')} />
          </Stack>
        </Stack>
      </TableCard>
    );
  }

  if (view === 'detail' && viewing) {
    return <UserDetail user={viewing} onClose={() => setView('list')} />;
  }

  const columns: IColumn[] = [
    { key: 'name', name: 'Full Name', fieldName: 'FullName', minWidth: 160, isResizable: true },
    { key: 'email', name: 'Email', fieldName: 'Email', minWidth: 200, isResizable: true },
    { key: 'role', name: 'Role', fieldName: 'Role', minWidth: 120, isResizable: true },
    {
      key: 'manager', name: 'Manager', minWidth: 140, isResizable: true,
      onRender: (item: IUser) => item.Manager?.FullName || '—'
    },
    {
      key: 'actions', name: '', minWidth: 120,
      onRender: (item: IUser) => (
        <RowActions onView={() => openView(item)} onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />
      )
    }
  ];

  return (
    <div>
      <ListToolbar buttonText="New User" onButtonClick={openCreate} />
      {(pagination.error || actionError) && <ErrorMessage message={pagination.error || actionError || ''} />}
      <TableCard>
        {pagination.loading && pagination.pageItems.length === 0 ? <LoadingState /> : pagination.totalCount === 0 ? (
          <EmptyState message="No users found." />
        ) : (
          <>
            <DetailsList
              items={pagination.pageItems}
              columns={columns}
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
            />
            <PaginationControls
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              loading={pagination.loading}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
            />
          </>
        )}
      </TableCard>

      <ConfirmDialog
        hidden={!deleteTarget}
        title="Delete User"
        subText={`Are you sure you want to delete "${deleteTarget?.FullName}"?`}
        confirmButtonText="Delete"
        onConfirm={remove}
        onDismiss={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default UsersAdmin;
