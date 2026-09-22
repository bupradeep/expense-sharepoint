import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
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

const emptyForm: IProjectDto = { projectName: '', projectCode: '', clientName: '', costCenter: '', isActive: true };

const ProjectsAdmin: React.FC = () => {
  const [items, setItems] = React.useState<IProject[] | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [panelOpen, setPanelOpen] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<IProject | undefined>(undefined);
  const [form, setForm] = React.useState<IProjectDto>(emptyForm);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<IProject | undefined>(undefined);

  const load = React.useCallback(() => {
    setError(undefined);
    projectService.getAll()
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
    setPanelOpen(true);
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
    projectService.remove(deleteTarget.ProjectId)
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
        headerText={editing ? 'Edit Project' : 'New Project'}
      >
        <Stack tokens={{ childrenGap: 12 }}>
          {formError && <ErrorMessage message={formError} />}
          <TextField
            label="Project Name"
            required
            value={form.projectName}
            onChange={(_e, value) => setForm({ ...form, projectName: value || '' })}
          />
          <TextField
            label="Project Code"
            required
            value={form.projectCode}
            onChange={(_e, value) => setForm({ ...form, projectCode: value || '' })}
          />
          <TextField
            label="Client Name"
            value={form.clientName}
            onChange={(_e, value) => setForm({ ...form, clientName: value || '' })}
          />
          <TextField
            label="Cost Center"
            value={form.costCenter}
            onChange={(_e, value) => setForm({ ...form, costCenter: value || '' })}
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
              disabled={saving || !form.projectName || !form.projectCode}
            />
            <DefaultButton text="Cancel" onClick={() => setPanelOpen(false)} />
          </Stack>
        </Stack>
      </Panel>

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
