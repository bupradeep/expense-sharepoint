import * as React from 'react';
import styles from './TableCard.module.scss';

export interface ITableCardProps {
  title?: string;
  headerAction?: React.ReactNode;
  children?: React.ReactNode;
}

const TableCard: React.FC<ITableCardProps> = (props) => (
  <div className={styles.card}>
    {(props.title || props.headerAction) && (
      <div className={styles.titleRow}>
        {props.title && <div className={styles.title}>{props.title}</div>}
        {props.headerAction}
      </div>
    )}
    <div className={styles.body}>{props.children}</div>
  </div>
);

export default TableCard;
