import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { departmentService } from '../../../../services/departmentService';
import { projectService } from '../../../../services/projectService';
import { expenseService } from '../../../../services/expenseService';
import { expenseReceiptService } from '../../../../services/expenseReceiptService';
import { IDepartment } from '../../../../models/IDepartment';
import { IProject } from '../../../../models/IProject';
import { IExpenseClaim, IExpenseClaimCreateDto, IExpenseClaimUpdateDto } from '../../../../models/IExpenseClaim';
import { IExpenseItemDto } from '../../../../models/IExpenseItem';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import ErrorMessage from '../common/ErrorMessage';
import FormRow from '../common/FormRow';
import TableCard from '../common/TableCard';
import ExpenseItemEditor, { IExpenseItemEditorHandle } from './ExpenseItemEditor';

export interface IExpenseClaimFormProps {
  context: WebPartContext;
  currentUser: IUser;
  existingClaim?: IExpenseClaim;
  onSaved: (claim: IExpenseClaim) => void;
  onCancel: () => void;
}

function toItemDtos(claim: IExpenseClaim | undefined): IExpenseItemDto[] {
  if (!claim || !claim.Items) {
    return [];
  }
  return claim.Items.map((item) => ({
    categoryId: item.CategoryId,
    expenseDate: item.ExpenseDate,
    amount: item.Amount,
    merchantName: item.MerchantName,
    description: item.Description,
    businessPurpose: item.BusinessPurpose,
    paymentMethod: item.PaymentMethod,
    isPolicyException: item.IsPolicyException,
    policyExceptionReason: item.PolicyExceptionReason
  }));
}

function generateClaimNumber(): string {
  return `EXP-${Date.now()}`;
}

const ExpenseClaimForm: React.FC<IExpenseClaimFormProps> = (props) => {
  const { currentUser, existingClaim } = props;

  const [departments, setDepartments] = React.useState<IDepartment[]>([]);
  const [projects, setProjects] = React.useState<IProject[]>([]);
  const [departmentId, setDepartmentId] = React.useState<number | undefined>(
    existingClaim ? existingClaim.DepartmentId : currentUser.DepartmentId
  );
  const [projectId, setProjectId] = React.useState<number | undefined>(existingClaim?.ProjectId);
  const [businessPurpose, setBusinessPurpose] = React.useState<string>(existingClaim?.BusinessPurpose || '');
  const [location, setLocation] = React.useState<string>(existingClaim?.Location || '');
  const [paymentMethod, setPaymentMethod] = React.useState<string>(existingClaim?.PaymentMethod || '');
  const [remarks, setRemarks] = React.useState<string>(existingClaim?.Remarks || '');
  const [items, setItems] = React.useState<IExpenseItemDto[]>(toItemDtos(existingClaim));
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);
  const itemEditorRef = React.useRef<IExpenseItemEditorHandle>(null);

  React.useEffect(() => {
    departmentService.getAll().then(setDepartments).catch(() => { /* dropdown is best-effort */ });
    projectService.getAll().then(setProjects).catch(() => { /* dropdown is best-effort */ });
  }, []);

  const departmentOptions: IDropdownOption[] = departments.map((d) => ({ key: d.DepartmentId, text: d.DepartmentName }));
  const projectOptions: IDropdownOption[] = projects.map((p) => ({ key: p.ProjectId, text: p.ProjectName }));

  const isValid = !!departmentId && !!projectId && !!businessPurpose && items.length > 0 &&
    items.every((i) => i.categoryId && i.expenseDate && i.amount > 0);

  const uploadPendingReceipts = (claim: IExpenseClaim): Promise<IExpenseClaim> => {
    const filesByIndex = itemEditorRef.current?.getPendingFilesByIndex() || [];
    const savedItems = claim.Items || [];

    const uploads: Array<Promise<unknown>> = [];
    filesByIndex.forEach((files, index) => {
      const savedItem = savedItems[index];
      if (!files.length || !savedItem) {
        return;
      }
      files.forEach((file) => {
        uploads.push(
          expenseReceiptService.upload(file, {
            expenseClaimId: claim.ExpenseClaimId,
            expenseItemId: savedItem.ExpenseItemId
          })
        );
      });
    });

    return Promise.all(uploads).then(() => claim);
  };

  const save = (): void => {
    if (!departmentId) {
      setFormError('Department is required.');
      return;
    }
    if (!projectId) {
      setFormError('Project is required.');
      return;
    }

    setSaving(true);
    setFormError(undefined);

    let savedClaim: IExpenseClaim | undefined;

    const onSuccess = (claim: IExpenseClaim): void => {
      savedClaim = claim;
      setSaving(false);
      props.onSaved(claim);
    };
    const onFailure = (err: ApiError | Error): void => {
      setSaving(false);
      setFormError(savedClaim ? `Claim saved, but attaching receipts failed: ${err.message}` : err.message);
    };

    if (existingClaim) {
      const dto: IExpenseClaimUpdateDto = {
        businessPurpose,
        location,
        paymentMethod,
        remarks,
        updatedBy: currentUser.UserId,
        items
      };
      expenseService.update(existingClaim.ExpenseClaimId, dto)
        .then(uploadPendingReceipts)
        .then(onSuccess)
        .catch(onFailure);
    } else {
      const dto: IExpenseClaimCreateDto = {
        claimNumber: generateClaimNumber(),
        employeeId: currentUser.UserId,
        departmentId,
        projectId,
        businessPurpose,
        location,
        paymentMethod,
        remarks,
        createdBy: currentUser.UserId,
        items
      };
      expenseService.create(dto)
        .then(uploadPendingReceipts)
        .then(onSuccess)
        .catch(onFailure);
    }
  };

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {formError && <ErrorMessage message={formError} />}
      <TableCard title={existingClaim ? 'Edit Expense Claim' : 'New Expense Claim'}>
        <Stack tokens={{ childrenGap: 12 }}>
          <FormRow label="Department" required>
            <Dropdown
              selectedKey={departmentId}
              options={departmentOptions}
              onChange={(_e, option) => setDepartmentId(Number(option?.key))}
            />
          </FormRow>
          <FormRow label="Project" required>
            <Dropdown
              selectedKey={projectId}
              options={projectOptions}
              onChange={(_e, option) => setProjectId(option ? Number(option.key) : undefined)}
            />
          </FormRow>
          <FormRow label="Business Purpose" required>
            <TextField
              value={businessPurpose}
              onChange={(_e, value) => setBusinessPurpose(value || '')}
            />
          </FormRow>
          <FormRow label="Location">
            <TextField
              value={location}
              onChange={(_e, value) => setLocation(value || '')}
            />
          </FormRow>
          <FormRow label="Payment Method">
            <TextField
              value={paymentMethod}
              onChange={(_e, value) => setPaymentMethod(value || '')}
            />
          </FormRow>
          <FormRow label="Remarks">
            <TextField
              multiline
              value={remarks}
              onChange={(_e, value) => setRemarks(value || '')}
            />
          </FormRow>
        </Stack>
      </TableCard>

      <TableCard title="Expense Items">
        <ExpenseItemEditor ref={itemEditorRef} items={items} onChange={setItems} />
      </TableCard>

      <Stack horizontal tokens={{ childrenGap: 8 }}>
        <PrimaryButton text="Save" onClick={save} disabled={saving || !isValid} />
        <DefaultButton text="Cancel" onClick={props.onCancel} />
      </Stack>
    </Stack>
  );
};

export default ExpenseClaimForm;
