import * as React from 'react';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import styles from './ListToolbar.module.scss';

export interface IListToolbarProps {
  buttonText: string;
  onButtonClick: () => void;
  endContent?: React.ReactNode;
}

const ListToolbar: React.FC<IListToolbarProps> = (props) => (
  <div className={styles.toolbar}>
    <PrimaryButton
      iconProps={{ iconName: 'Add' }}
      text={props.buttonText}
      onClick={props.onButtonClick}
      styles={{
        root: { backgroundColor: '#cfe8fb', border: '1px solid #a6d1f0', color: '#004578' },
        rootHovered: { backgroundColor: '#b4d6ef', border: '1px solid #8fc4ea', color: '#004578' },
        rootPressed: { backgroundColor: '#9fc9e8', border: '1px solid #8fc4ea', color: '#004578' },
        icon: { color: '#004578' },
        iconHovered: { color: '#004578' }
      }}
    />
    {props.endContent}
  </div>
);

export default ListToolbar;
