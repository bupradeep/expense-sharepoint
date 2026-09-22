import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { departmentService } from '../../../../services/departmentService';
import { IDepartment, IDepartmentDto } from '../../../../models/IDepartment';
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
import DepartmentDetail from './DepartmentDetail';

const emptyForm: IDepartmentDto = { departmentName: '', isActive: true };

type View = 'list' | 'form' | 'detail';

const DepartmentsAdmin: React.FC = () => {
  const [view, setView] = React.useState<View>('list');
  const [editing, setEditing] = React.useState<IDepartment | undefined>(undefined);
  const [viewing, setViewing] = React.useState<IDepartment | undefined>(undefined);
  const [form, setForm] = React.useState<IDepartmentDto>(emptyForm);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<IDepartment | undefined>(undefined);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);

  const fetchPage = React.useCallback(
    (page: number, pageSize: number) => departmentService.getPage(page, pageSize),
    []
  );
  const pagination = usePagination(fetchPage);

  const openCreate = (): void => {
    setEditing(undefined);
    setForm(emptyForm);
    setFormError(undefined);
    setView('form');
  };

  const openEdit = (item: IDepartment): void => {
    setEditing(item);
    setForm({ departmentName: item.DepartmentName, isActive: item.IsActive });
    setFormError(undefined);
    setView('form');
  };

  const openView = (item: IDepartment): void => {
    setViewing(item);
    setView('detail');
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
        setView('list');
        pagination.reload();
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
        pagination.reload();
      })
      .catch((err: ApiError) => {
        setDeleteTarget(undefined);
        setActionError(err.message);
      });
  };

  if (view === 'form') {
    return (
      <TableCard title={editing ? 'Edit Department' : 'New Department'}>
        <Stack tokens={{ childrenGap: 12 }}>
          {formError && <ErrorMessage message={formError} />}
          <FormRow label="Department Name" required>
            <TextField
              value={form.departmentName}
              onChange={(_e, value) => setForm({ ...form, departmentName: value || '' })}
            />
          </FormRow>
          <FormRow label="Active">
            <Toggle
              checked={form.isActive}
              onChange={(_e, checked) => setForm({ ...form, isActive: !!checked })}
            />
          </FormRow>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton text="Save" onClick={save} disabled={saving || !form.departmentName} />
            <DefaultButton text="Cancel" onClick={() => setView('list')} />
          </Stack>
        </Stack>
      </TableCard>
    );
  }

  if (view === 'detail' && viewing) {
    return <DepartmentDetail department={viewing} onClose={() => setView('list')} />;
  }

  const columns: IColumn[] = [
    { key: 'name', name: 'Department', fieldName: 'DepartmentName', minWidth: 200, isResizable: true },
    {
      key: 'active', name: 'Active', minWidth: 80,
      onRender: (item: IDepartment) => (item.IsActive ? 'Yes' : 'No')
    },
    {
      key: 'actions', name: '', minWidth: 120,
      onRender: (item: IDepartment) => (
        <RowActions onView={() => openView(item)} onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />
      )
    }
  ];

  return (
    <div>
      <ListToolbar buttonText="New Department" onButtonClick={openCreate} />
      {(pagination.error || actionError) && <ErrorMessage message={pagination.error || actionError || ''} />}
      <TableCard>
        {pagination.loading && pagination.pageItems.length === 0 ? <LoadingState /> : pagination.totalCount === 0 ? (
          <EmptyState message="No departments found." />
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
