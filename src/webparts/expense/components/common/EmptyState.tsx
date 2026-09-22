import * as React from 'react';
import { Text } from '@fluentui/react/lib/Text';
import styles from './EmptyState.module.scss';

export interface IEmptyStateProps {
  message: string;
}

const EmptyState: React.FC<IEmptyStateProps> = (props) => (
  <div className={styles.empty}>
    <Text>{props.message}</Text>
  </div>
);

export default EmptyState;
