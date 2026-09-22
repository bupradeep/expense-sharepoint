import * as React from 'react';
import { Label } from '@fluentui/react/lib/Label';
import styles from './FormRow.module.scss';

export interface IFormRowProps {
  label: string;
  required?: boolean;
  children?: React.ReactNode;
}

const FormRow: React.FC<IFormRowProps> = (props) => (
  <div className={styles.row}>
    <Label className={styles.label}>{props.label}{props.required ? ' *' : ''} :</Label>
    <div className={styles.control}>{props.children}</div>
  </div>
);

export default FormRow;
