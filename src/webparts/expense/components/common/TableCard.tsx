import * as React from 'react';
import styles from './TableCard.module.scss';

export interface ITableCardProps {
  title?: string;
  children?: React.ReactNode;
}

const TableCard: React.FC<ITableCardProps> = (props) => (
  <div className={styles.card}>
    {props.title && <div className={styles.title}>{props.title}</div>}
    <div className={styles.body}>{props.children}</div>
  </div>
);

export default TableCard;
