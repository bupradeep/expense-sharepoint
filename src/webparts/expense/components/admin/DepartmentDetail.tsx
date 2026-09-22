import * as React from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { IDepartment } from '../../../../models/IDepartment';
import TableCard from '../common/TableCard';
import FormRow from '../common/FormRow';

export interface IDepartmentDetailProps {
  department: IDepartment;
  onClose: () => void;
}

const DepartmentDetail: React.FC<IDepartmentDetailProps> = (props) => (
  <TableCard title="Department Details">
    <Stack tokens={{ childrenGap: 12 }}>
      <FormRow label="Department Name"><Text>{props.department.DepartmentName}</Text></FormRow>
      <FormRow label="Active"><Text>{props.department.IsActive ? 'Yes' : 'No'}</Text></FormRow>
      <DefaultButton text="Back" onClick={props.onClose} />
    </Stack>
  </TableCard>
);

export default DepartmentDetail;
