import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { departmentService } from '../../../../services/departmentService';
import { IDepartment, IDepartmentDto } from '../../../../models/IDepartment';
import { ApiError } from '../../../../models/IApiError';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';
import TableCard from '../common/TableCard';
import RowActions from '../common/RowActions';

const emptyForm: IDepartmentDto = { departmentName: '', isActive: true };

const DepartmentsAdmin: React.FC = () => {
  const [items, setItems] = React.useState<IDepartment[] | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [panelOpen, setPanelOpen] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<IDepartment | undefined>(undefined);
  const [form, setForm] = React.useState<IDepartmentDto>(emptyForm);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<IDepartment | undefined>(undefined);

  const load = React.useCallback(() => {
    setError(undefined);
    departmentService.getAll()
      .then(setItems)
      .catch((err: ApiError) => setError(err.message));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const openCreate = (): void => {
    setEditing(undefined);
    setForm(emptyForm);
    setFormError(undefined);
    setPanelOpen(true);
  };

  const openEdit = (item: IDepartment): void => {
    setEditing(item);
    setForm({ departmentName: item.DepartmentName, isActive: item.IsActive });
    setFormError(undefined);
    setPanelOpen(true);
  };

  const save = (): void => {
    setSaving(true);
    setFormError(undefined);
    const request = editing
      ? departmentService.update(editing.DepartmentId, form)
      : departmentService.create(form);

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
    departmentService.remove(deleteTarget.DepartmentId)
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
    { key: 'new', text: 'New Department', iconProps: { iconName: 'Add' }, onClick: openCreate }
  ];

  const columns: IColumn[] = [
    { key: 'name', name: 'Department', fieldName: 'DepartmentName', minWidth: 200, isResizable: true },
    {
      key: 'active', name: 'Active', minWidth: 80,
      onRender: (item: IDepartment) => (item.IsActive ? 'Yes' : 'No')
    },
    {
      key: 'actions', name: '', minWidth: 90,
      onRender: (item: IDepartment) => (
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
        headerText={editing ? 'Edit Department' : 'New Department'}
      >
        <Stack tokens={{ childrenGap: 12 }}>
          {formError && <ErrorMessage message={formError} />}
          <TextField
            label="Department Name"
            required
            value={form.departmentName}
            onChange={(_e, value) => setForm({ ...form, departmentName: value || '' })}
          />
          <Toggle
            label="Active"
            checked={form.isActive}
            onChange={(_e, checked) => setForm({ ...form, isActive: !!checked })}
          />
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton text="Save" onClick={save} disabled={saving || !form.departmentName} />
            <DefaultButton text="Cancel" onClick={() => setPanelOpen(false)} />
          </Stack>
        </Stack>
      </Panel>

      <ConfirmDialog
        hidden={!deleteTarget}
        title="Delete Department"
        subText={`Are you sure you want to delete "${deleteTarget?.DepartmentName}"?`}
        confirmButtonText="Delete"
        onConfirm={remove}
        onDismiss={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default DepartmentsAdmin;
