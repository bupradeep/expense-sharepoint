import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { TextField } from '@fluentui/react/lib/TextField';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { expenseCategoryService } from '../../../../services/expenseCategoryService';
import { IExpenseCategory, IExpenseCategoryDto } from '../../../../models/IExpenseCategory';
import { ApiError } from '../../../../models/IApiError';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import TableCard from '../common/TableCard';
import RowActions from '../common/RowActions';
import FormRow from '../common/FormRow';
import ActiveToggle from '../common/ActiveToggle';
import ListToolbar from '../common/ListToolbar';
import PaginationControls from '../common/PaginationControls';
import { usePagination } from '../common/usePagination';

const emptyForm: IExpenseCategoryDto = { categoryName: '', isActive: true };

const ExpenseCategoriesAdmin: React.FC = () => {
  const [formOpen, setFormOpen] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<IExpenseCategory | undefined>(undefined);
  const [form, setForm] = React.useState<IExpenseCategoryDto>(emptyForm);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<IExpenseCategory | undefined>(undefined);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);

  const fetchPage = React.useCallback(
    (page: number, pageSize: number) => expenseCategoryService.getPage(page, pageSize),
    []
  );
  const pagination = usePagination(fetchPage);

  const openCreate = (): void => {
    setEditing(undefined);
    setForm(emptyForm);
    setFormError(undefined);
    setFormOpen(true);
  };

  const openEdit = (item: IExpenseCategory): void => {
    setEditing(item);
    setForm({ categoryName: item.CategoryName, isActive: item.IsActive });
    setFormError(undefined);
    setFormOpen(true);
  };

  const save = (): void => {
    setSaving(true);
    setFormError(undefined);
    const request = editing
      ? expenseCategoryService.update(editing.CategoryId, form)
      : expenseCategoryService.create(form);

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
    expenseCategoryService.remove(deleteTarget.CategoryId)
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
      <TableCard title={editing ? 'Edit Expense Category' : 'New Expense Category'}>
        <Stack tokens={{ childrenGap: 12 }}>
          {formError && <ErrorMessage message={formError} />}
          <FormRow label="Category Name" required>
            <TextField
              value={form.categoryName}
              onChange={(_e, value) => setForm({ ...form, categoryName: value || '' })}
            />
          </FormRow>
          <FormRow label="Active">
            <ActiveToggle
              checked={form.isActive}
              onChange={(_e, checked) => setForm({ ...form, isActive: !!checked })}
            />
          </FormRow>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton text="Save" onClick={save} disabled={saving || !form.categoryName} />
            <DefaultButton text="Cancel" onClick={() => setFormOpen(false)} />
          </Stack>
        </Stack>
      </TableCard>
    );
  }

  const columns: IColumn[] = [
    { key: 'name', name: 'Category', fieldName: 'CategoryName', minWidth: 200, isResizable: true },
    {
      key: 'active', name: 'Active', minWidth: 80,
      onRender: (item: IExpenseCategory) => (item.IsActive ? 'Yes' : 'No')
    },
    {
      key: 'actions', name: '', minWidth: 90,
      onRender: (item: IExpenseCategory) => (
        <RowActions onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />
      )
    }
  ];

  return (
    <div>
      <ListToolbar buttonText="New Category" onButtonClick={openCreate} />
      {(pagination.error || actionError) && <ErrorMessage message={pagination.error || actionError || ''} />}
      <TableCard>
        {pagination.loading && pagination.pageItems.length === 0 ? <LoadingState /> : pagination.totalCount === 0 ? (
          <EmptyState message="No expense categories found." />
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
        title="Delete Expense Category"
        subText={`Are you sure you want to delete "${deleteTarget?.CategoryName}"?`}
        confirmButtonText="Delete"
        onConfirm={remove}
        onDismiss={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default ExpenseCategoriesAdmin;
