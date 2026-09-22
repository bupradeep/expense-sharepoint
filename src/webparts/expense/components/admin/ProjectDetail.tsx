import * as React from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { IProject } from '../../../../models/IProject';
import TableCard from '../common/TableCard';
import FormRow from '../common/FormRow';

export interface IProjectDetailProps {
  project: IProject;
  onClose: () => void;
}

const ProjectDetail: React.FC<IProjectDetailProps> = (props) => (
  <TableCard title="Project Details">
    <Stack tokens={{ childrenGap: 12 }}>
      <FormRow label="Project Name"><Text>{props.project.ProjectName}</Text></FormRow>
      <FormRow label="Project Code"><Text>{props.project.ProjectCode}</Text></FormRow>
      <FormRow label="Client Name"><Text>{props.project.ClientName || '—'}</Text></FormRow>
      <FormRow label="Cost Center"><Text>{props.project.CostCenter || '—'}</Text></FormRow>
      <FormRow label="Active"><Text>{props.project.IsActive ? 'Yes' : 'No'}</Text></FormRow>
      <DefaultButton text="Back" onClick={props.onClose} />
    </Stack>
  </TableCard>
);

export default ProjectDetail;
