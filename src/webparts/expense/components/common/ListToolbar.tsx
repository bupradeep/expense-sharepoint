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
    <PrimaryButton iconProps={{ iconName: 'Add' }} text={props.buttonText} onClick={props.onButtonClick} />
    {props.endContent}
  </div>
);

export default ListToolbar;
