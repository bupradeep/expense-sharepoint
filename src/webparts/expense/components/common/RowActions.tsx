import * as React from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';

export interface IRowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const RowActions: React.FC<IRowActionsProps> = (props) => (
  <Stack horizontal tokens={{ childrenGap: 4 }}>
    <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" ariaLabel="Edit" onClick={props.onEdit} />
    <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" ariaLabel="Delete" onClick={props.onDelete} />
  </Stack>
);

export default RowActions;
