import * as React from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { IUser } from '../../../../models/IUser';
import TableCard from '../common/TableCard';
import FormRow from '../common/FormRow';

export interface IUserDetailProps {
  user: IUser;
  onClose: () => void;
}

const UserDetail: React.FC<IUserDetailProps> = (props) => (
  <TableCard title="User Details">
    <Stack tokens={{ childrenGap: 12 }}>
      <FormRow label="Full Name"><Text>{props.user.FullName}</Text></FormRow>
      <FormRow label="Email"><Text>{props.user.Email}</Text></FormRow>
      <FormRow label="Employee Code"><Text>{props.user.EmployeeCode}</Text></FormRow>
      <FormRow label="Employee Object Id"><Text>{props.user.EmployeeObjectId}</Text></FormRow>
      <FormRow label="Role"><Text>{props.user.Role}</Text></FormRow>
      <FormRow label="Department"><Text>{props.user.Department?.DepartmentName || '—'}</Text></FormRow>
      <FormRow label="Active"><Text>{props.user.IsActive ? 'Yes' : 'No'}</Text></FormRow>
      <DefaultButton text="Back" onClick={props.onClose} />
    </Stack>
  </TableCard>
);

export default UserDetail;
