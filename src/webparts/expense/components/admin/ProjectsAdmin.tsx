import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { projectService } from '../../../../services/projectService';
import { IProject, IProjectDto } from '../../../../models/IProject';
import { ApiError } from '../../../../models/IApiError';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';
import TableCard from '../common/TableCard';
import RowActions from '../common/RowActions';
import FormRow from '../common/FormRow';
import PaginationControls from '../common/PaginationControls';
import { usePagination } from '../common/usePagination';

const emptyForm: IProjectDto = { projectName: '', projectCode: '', clientName: '', costCenter: '', isActive: true };

const ProjectsAdmin: React.FC = () => {
  const [formOpen, setFormOpen] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<IProject | undefined>(undefined);
  const [form, setForm] = React.useState<IProjectDto>(emptyForm);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<IProject | undefined>(undefined);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);

  const fetchPage = React.useCallback(
    (page: number, pageSize: number) => projectService.getPage(page, pageSize),
    []
  );
  const pagination = usePagination(fetchPage);

  const openCreate = (): void => {
    setEditing(undefined);
    setForm(emptyForm);
    setFormError(undefined);
    setFormOpen(true);
  };

  const openEdit = (item: IProject): void => {
    setEditing(item);
    setForm({
      projectName: item.ProjectName,
      projectCode: item.ProjectCode,
      clientName: item.ClientName || '',
      costCenter: item.CostCenter || '',
      isActive: item.IsActive
    });
    setFormError(undefined);
    setFormOpen(true);
  };

  const save = (): void => {
    setSaving(true);
    setFormError(undefined);
    const request = editing
      ? projectService.update(editing.ProjectId, form)
      : projectService.create(form);

    request
      .then(() => {
        setSaving(false);
        setFormOpen(false);
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
    projectService.remove(deleteTarget.ProjectId)
      .then(() => {
        setDeleteTarget(undefined);
        pagination.reload();
      })
      .catch((err: ApiError) => {
        setDeleteTarget(undefined);
        setActionError(err.message);
      });
  };

  if (formOpen) {
    return (
      <TableCard title={editing ? 'Edit Project' : 'New Project'}>
        <Stack tokens={{ childrenGap: 12 }}>
          {formError && <ErrorMessage message={formError} />}
          <FormRow label="Project Name" required>
            <TextField
              value={form.projectName}
              onChange={(_e, value) => setForm({ ...form, projectName: value || '' })}
            />
          </FormRow>
          <FormRow label="Project Code" required>
            <TextField
              value={form.projectCode}
              onChange={(_e, value) => setForm({ ...form, projectCode: value || '' })}
            />
          </FormRow>
          <FormRow label="Client Name">
            <TextField
              value={form.clientName}
              onChange={(_e, value) => setForm({ ...form, clientName: value || '' })}
            />
          </FormRow>
          <FormRow label="Cost Center">
            <TextField
              value={form.costCenter}
              onChange={(_e, value) => setForm({ ...form, costCenter: value || '' })}
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
              disabled={saving || !form.projectName || !form.projectCode}
            />
            <DefaultButton text="Cancel" onClick={() => setFormOpen(false)} />
          </Stack>
        </Stack>
      </TableCard>
    );
  }

  const commandBarItems: ICommandBarItemProps[] = [
    { key: 'new', text: 'New Project', iconProps: { iconName: 'Add' }, onClick: openCreate }
  ];

  const columns: IColumn[] = [
    { key: 'name', name: 'Project', fieldName: 'ProjectName', minWidth: 160, isResizable: true },
    { key: 'code', name: 'Code', fieldName: 'ProjectCode', minWidth: 100, isResizable: true },
    { key: 'client', name: 'Client', fieldName: 'ClientName', minWidth: 120, isResizable: true },
    { key: 'costCenter', name: 'Cost Center', fieldName: 'CostCenter', minWidth: 110, isResizable: true },
    {
      key: 'active', name: 'Active', minWidth: 70,
      onRender: (item: IProject) => (item.IsActive ? 'Yes' : 'No')
    },
    {
      key: 'actions', name: '', minWidth: 90,
      onRender: (item: IProject) => (
        <RowActions onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />
      )
    }
  ];

  return (
    <div>
      <CommandBar items={commandBarItems} />
      {(pagination.error || actionError) && <ErrorMessage message={pagination.error || actionError || ''} />}
      <TableCard>
        {pagination.loading && pagination.pageItems.length === 0 ? <LoadingState /> : (
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
        title="Delete Project"
        subText={`Are you sure you want to delete "${deleteTarget?.ProjectName}"?`}
        confirmButtonText="Delete"
        onConfirm={remove}
        onDismiss={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default ProjectsAdmin;
