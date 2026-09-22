import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { approvalRuleService } from '../../../../services/approvalRuleService';
import { IApprovalRule, IApprovalRuleDto } from '../../../../models/IApprovalRule';
import { ApiError } from '../../../../models/IApiError';
import { formatCurrency } from '../../../../utils/Formatters';
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

const roleOptions: IDropdownOption[] = ['Manager', 'DepartmentHead', 'Finance'].map((r) => ({ key: r, text: r }));

const emptyForm: IApprovalRuleDto = {
  minimumAmount: 0,
  approvalLevel: 1,
  approverRole: 'Manager',
  isActive: true
};

const ApprovalRulesAdmin: React.FC = () => {
  const [formOpen, setFormOpen] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<IApprovalRule | undefined>(undefined);
  const [form, setForm] = React.useState<IApprovalRuleDto>(emptyForm);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<IApprovalRule | undefined>(undefined);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);

  const fetchPage = React.useCallback(
    (page: number, pageSize: number) => approvalRuleService.getPage(page, pageSize),
    []
  );
  const pagination = usePagination(fetchPage);

  const openCreate = (): void => {
    setEditing(undefined);
    setForm(emptyForm);
    setFormError(undefined);
    setFormOpen(true);
  };

  const openEdit = (item: IApprovalRule): void => {
    setEditing(item);
    setForm({
      minimumAmount: item.MinimumAmount,
      maximumAmount: item.MaximumAmount,
      approvalLevel: item.ApprovalLevel,
      approverRole: item.ApproverRole,
      isActive: item.IsActive
    });
    setFormError(undefined);
    setFormOpen(true);
  };

  const save = (): void => {
    setSaving(true);
    setFormError(undefined);
    const request = editing
      ? approvalRuleService.update(editing.ApprovalRuleId, form)
      : approvalRuleService.create(form);

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
    approvalRuleService.remove(deleteTarget.ApprovalRuleId)
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
      <TableCard title={editing ? 'Edit Approval Rule' : 'New Approval Rule'}>
        <Stack tokens={{ childrenGap: 12 }}>
          {formError && <ErrorMessage message={formError} />}
          <FormRow label="Minimum Amount" required>
            <TextField
              type="number"
              value={String(form.minimumAmount)}
              onChange={(_e, value) => setForm({ ...form, minimumAmount: value ? Number(value) : 0 })}
            />
          </FormRow>
          <FormRow label="Maximum Amount">
            <TextField
              type="number"
              placeholder="No upper limit"
              value={form.maximumAmount !== undefined ? String(form.maximumAmount) : ''}
              onChange={(_e, value) => setForm({ ...form, maximumAmount: value ? Number(value) : undefined })}
            />
          </FormRow>
          <FormRow label="Approval Level" required>
            <TextField
              type="number"
              value={String(form.approvalLevel)}
              onChange={(_e, value) => setForm({ ...form, approvalLevel: value ? Number(value) : 1 })}
            />
          </FormRow>
          <FormRow label="Approver Role" required>
            <Dropdown
              selectedKey={form.approverRole}
              options={roleOptions}
              onChange={(_e, option) => setForm({ ...form, approverRole: String(option?.key || 'Manager') })}
            />
          </FormRow>
          <FormRow label="Active">
            <Toggle
              checked={form.isActive}
              onChange={(_e, checked) => setForm({ ...form, isActive: !!checked })}
            />
          </FormRow>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton text="Save" onClick={save} disabled={saving} />
            <DefaultButton text="Cancel" onClick={() => setFormOpen(false)} />
          </Stack>
        </Stack>
      </TableCard>
    );
  }

  const columns: IColumn[] = [
    {
      key: 'range', name: 'Amount Range', minWidth: 150,
      onRender: (item: IApprovalRule) =>
        `${formatCurrency(item.MinimumAmount)} - ${item.MaximumAmount !== undefined ? formatCurrency(item.MaximumAmount) : 'No limit'}`
    },
    { key: 'level', name: 'Level', fieldName: 'ApprovalLevel', minWidth: 60 },
    { key: 'role', name: 'Approver Role', fieldName: 'ApproverRole', minWidth: 130 },
    {
      key: 'active', name: 'Active', minWidth: 70,
      onRender: (item: IApprovalRule) => (item.IsActive ? 'Yes' : 'No')
    },
    {
      key: 'actions', name: '', minWidth: 90,
      onRender: (item: IApprovalRule) => (
        <RowActions onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />
      )
    }
  ];

  return (
    <div>
      <ListToolbar buttonText="New Approval Rule" onButtonClick={openCreate} />
      {(pagination.error || actionError) && <ErrorMessage message={pagination.error || actionError || ''} />}
      <TableCard>
        {pagination.loading && pagination.pageItems.length === 0 ? <LoadingState /> : pagination.totalCount === 0 ? (
          <EmptyState message="No approval rules found." />
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
        title="Delete Approval Rule"
        subText="Are you sure you want to delete this approval rule?"
        confirmButtonText="Delete"
        onConfirm={remove}
        onDismiss={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default ApprovalRulesAdmin;
