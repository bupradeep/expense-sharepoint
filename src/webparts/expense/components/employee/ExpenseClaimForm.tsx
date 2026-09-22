import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { departmentService } from '../../../../services/departmentService';
import { projectService } from '../../../../services/projectService';
import { expenseService } from '../../../../services/expenseService';
import { IDepartment } from '../../../../models/IDepartment';
import { IProject } from '../../../../models/IProject';
import { IExpenseClaim, IExpenseClaimCreateDto, IExpenseClaimUpdateDto } from '../../../../models/IExpenseClaim';
import { IExpenseItemDto } from '../../../../models/IExpenseItem';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import ErrorMessage from '../common/ErrorMessage';
import ExpenseItemEditor from './ExpenseItemEditor';

export interface IExpenseClaimFormProps {
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
  const [claimDate, setClaimDate] = React.useState<string>(
    existingClaim?.ClaimDate || new Date().toISOString().slice(0, 10)
  );
  const [businessPurpose, setBusinessPurpose] = React.useState<string>(existingClaim?.BusinessPurpose || '');
  const [location, setLocation] = React.useState<string>(existingClaim?.Location || '');
  const [paymentMethod, setPaymentMethod] = React.useState<string>(existingClaim?.PaymentMethod || '');
  const [remarks, setRemarks] = React.useState<string>(existingClaim?.Remarks || '');
  const [items, setItems] = React.useState<IExpenseItemDto[]>(toItemDtos(existingClaim));
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    departmentService.getAll().then(setDepartments).catch(() => { /* dropdown is best-effort */ });
    projectService.getAll().then(setProjects).catch(() => { /* dropdown is best-effort */ });
  }, []);

  const departmentOptions: IDropdownOption[] = departments.map((d) => ({ key: d.DepartmentId, text: d.DepartmentName }));
  const projectOptions: IDropdownOption[] = projects.map((p) => ({ key: p.ProjectId, text: p.ProjectName }));

  const isValid = !!departmentId && !!businessPurpose && items.length > 0 &&
    items.every((i) => i.categoryId && i.expenseDate && i.amount > 0);

  const save = (): void => {
    if (!departmentId) {
      setFormError('Department is required.');
      return;
    }

    setSaving(true);
    setFormError(undefined);

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
        .then((claim) => {
          setSaving(false);
          props.onSaved(claim);
        })
        .catch((err: ApiError) => {
          setSaving(false);
          setFormError(err.message);
        });
    } else {
      const dto: IExpenseClaimCreateDto = {
        claimNumber: generateClaimNumber(),
        employeeId: currentUser.UserId,
        departmentId,
        projectId,
        claimDate,
        businessPurpose,
        location,
        paymentMethod,
        remarks,
        createdBy: currentUser.UserId,
        items
      };
      expenseService.create(dto)
        .then((claim) => {
          setSaving(false);
          props.onSaved(claim);
        })
        .catch((err: ApiError) => {
          setSaving(false);
          setFormError(err.message);
        });
    }
  };

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      {formError && <ErrorMessage message={formError} />}
      <Stack horizontal tokens={{ childrenGap: 12 }} wrap>
        <Dropdown
          label="Department"
          required
          selectedKey={departmentId}
          options={departmentOptions}
          onChange={(_e, option) => setDepartmentId(Number(option?.key))}
          styles={{ root: { width: 200 } }}
        />
        <Dropdown
          label="Project"
          selectedKey={projectId}
          options={projectOptions}
          onChange={(_e, option) => setProjectId(option ? Number(option.key) : undefined)}
          styles={{ root: { width: 200 } }}
        />
        <TextField
          label="Claim Date"
          type="date"
          value={claimDate}
          onChange={(_e, value) => setClaimDate(value || '')}
          styles={{ root: { width: 150 } }}
        />
      </Stack>
      <TextField
        label="Business Purpose"
        required
        value={businessPurpose}
        onChange={(_e, value) => setBusinessPurpose(value || '')}
      />
      <Stack horizontal tokens={{ childrenGap: 12 }} wrap>
        <TextField
          label="Location"
          value={location}
          onChange={(_e, value) => setLocation(value || '')}
          styles={{ root: { width: 200 } }}
        />
        <TextField
          label="Payment Method"
          value={paymentMethod}
          onChange={(_e, value) => setPaymentMethod(value || '')}
          styles={{ root: { width: 200 } }}
        />
      </Stack>
      <TextField
        label="Remarks"
        multiline
        value={remarks}
        onChange={(_e, value) => setRemarks(value || '')}
      />

      <ExpenseItemEditor items={items} onChange={setItems} />

      <Stack horizontal tokens={{ childrenGap: 8 }}>
        <PrimaryButton text="Save" onClick={save} disabled={saving || !isValid} />
        <DefaultButton text="Cancel" onClick={props.onCancel} />
      </Stack>
    </Stack>
  );
};

export default ExpenseClaimForm;
