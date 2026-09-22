import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
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
import ConfirmDialog from '../common/ConfirmDialog';
import TableCard from '../common/TableCard';
import RowActions from '../common/RowActions';

const emptyForm: IUserDto = {
  fullName: '',
  email: '',
  employeeCode: '',
  employeeObjectId: '',
  role: UserRoles.Employee,
  isActive: true
};

const roleOptions: IDropdownOption[] = Object.keys(UserRoles).map((role) => ({ key: role, text: role }));

const UsersAdmin: React.FC = () => {
  const [items, setItems] = React.useState<IUser[] | undefined>(undefined);
  const [departments, setDepartments] = React.useState<IDepartment[]>([]);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [panelOpen, setPanelOpen] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<IUser | undefined>(undefined);
  const [form, setForm] = React.useState<IUserDto>(emptyForm);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<IUser | undefined>(undefined);

  const load = React.useCallback(() => {
    setError(undefined);
    userService.getAll()
      .then(setItems)
      .catch((err: ApiError) => setError(err.message));
  }, []);

  React.useEffect(() => {
    load();
    departmentService.getAll().then(setDepartments).catch(() => { /* department dropdown is best-effort */ });
  }, [load]);

  const departmentOptions: IDropdownOption[] = departments.map((d) => ({ key: d.DepartmentId, text: d.DepartmentName }));

  const openCreate = (): void => {
    setEditing(undefined);
    setForm(emptyForm);
    setFormError(undefined);
    setPanelOpen(true);
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
      isActive: item.IsActive
    });
    setFormError(undefined);
    setPanelOpen(true);
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
        setPanelOpen(false);
        load();
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
        load();
      })
      .catch((err: ApiError) => {
        setDeleteTarget(undefined);
        setError(err.message);
      });
  };

  const commandBarItems: ICommandBarItemProps[] = [
    { key: 'new', text: 'New User', iconProps: { iconName: 'Add' }, onClick: openCreate }
  ];

  const columns: IColumn[] = [
    { key: 'name', name: 'Full Name', fieldName: 'FullName', minWidth: 140, isResizable: true },
    { key: 'email', name: 'Email', fieldName: 'Email', minWidth: 180, isResizable: true },
    { key: 'code', name: 'Employee Code', fieldName: 'EmployeeCode', minWidth: 110, isResizable: true },
    { key: 'role', name: 'Role', fieldName: 'Role', minWidth: 110, isResizable: true },
    {
      key: 'department', name: 'Department', minWidth: 120,
      onRender: (item: IUser) => item.Department?.DepartmentName || ''
    },
    {
      key: 'active', name: 'Active', minWidth: 70,
      onRender: (item: IUser) => (item.IsActive ? 'Yes' : 'No')
    },
    {
      key: 'actions', name: '', minWidth: 90,
      onRender: (item: IUser) => (
        <RowActions onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />
      )
    }
  ];

  return (
    <div>
      <CommandBar items={commandBarItems} />
      {error && <ErrorMessage message={error} />}
      <TableCard>
        {!items ? <LoadingState /> : (
          <DetailsList
            items={items}
            columns={columns}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />
        )}
      </TableCard>

      <Panel
        isOpen={panelOpen}
        onDismiss={() => setPanelOpen(false)}
        type={PanelType.smallFixedFar}
        headerText={editing ? 'Edit User' : 'New User'}
      >
        <Stack tokens={{ childrenGap: 12 }}>
          {formError && <ErrorMessage message={formError} />}
          <TextField
            label="Full Name"
            required
            value={form.fullName}
            onChange={(_e, value) => setForm({ ...form, fullName: value || '' })}
          />
          <TextField
            label="Email"
            required
            value={form.email}
            onChange={(_e, value) => setForm({ ...form, email: value || '' })}
          />
          <TextField
            label="Employee Code"
            required
            value={form.employeeCode}
            onChange={(_e, value) => setForm({ ...form, employeeCode: value || '' })}
          />
          <TextField
            label="Employee Object Id (Azure AD)"
            required
            value={form.employeeObjectId}
            onChange={(_e, value) => setForm({ ...form, employeeObjectId: value || '' })}
          />
          <Dropdown
            label="Role"
            selectedKey={form.role}
            options={roleOptions}
            onChange={(_e, option) => setForm({ ...form, role: option?.key as UserRole })}
          />
          <Dropdown
            label="Department"
            selectedKey={form.departmentId}
            options={departmentOptions}
            onChange={(_e, option) => setForm({ ...form, departmentId: option?.key as number })}
          />
          <Toggle
            label="Active"
            checked={form.isActive}
            onChange={(_e, checked) => setForm({ ...form, isActive: !!checked })}
          />
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton
              text="Save"
              onClick={save}
              disabled={saving || !form.fullName || !form.email || !form.employeeCode || !form.employeeObjectId}
            />
            <DefaultButton text="Cancel" onClick={() => setPanelOpen(false)} />
          </Stack>
        </Stack>
      </Panel>

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
