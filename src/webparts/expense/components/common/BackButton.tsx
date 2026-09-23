import * as React from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';

export interface IBackButtonProps {
  onClick: () => void;
  text?: string;
}

// Shared small, left-aligned back control used at the top of every detail/sub-page
// so navigation looks the same across the admin, employee, and approvals areas.
const BackButton: React.FC<IBackButtonProps> = (props) => (
  <DefaultButton
    text={props.text || 'Back'}
    iconProps={{ iconName: 'ChevronLeft' }}
    onClick={props.onClick}
    styles={{
      root: { alignSelf: 'flex-start', minWidth: 'auto', height: 28, padding: '0 10px' },
      icon: { fontSize: 12 },
      label: { fontSize: 13 }
    }}
  />
);

export default BackButton;
