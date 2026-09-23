import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { IExpenseItem } from '../../../../models/IExpenseItem';
import { formatCurrency, formatDate } from '../../../../utils/Formatters';
import EmptyState from './EmptyState';
import styles from './ExpenseItemsView.module.scss';

export interface IExpenseItemsViewProps {
  items: IExpenseItem[];
  // Optional per-item extra content (e.g. receipts) rendered below the item's fields.
  renderExtra?: (item: IExpenseItem) => React.ReactNode;
}

const ExpenseItemsView: React.FC<IExpenseItemsViewProps> = ({ items, renderExtra }) => {
  if (!items.length) {
    return <EmptyState message="No expense items." />;
  }

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      {items.map((item) => (
        <div className={styles.itemCard} key={item.ExpenseItemId}>
          <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className={styles.itemHeader}>
            <Text className={styles.itemTitle}>{item.ExpenseCategory?.CategoryName || 'Item'}</Text>
            <Text styles={{ root: { fontWeight: 600 } }}>{formatCurrency(item.Amount)}</Text>
          </Stack>

          <div className={styles.fieldGrid}>
            <div className={styles.fieldNarrow}>
              <Text variant="small" className={styles.fieldLabel}>Date</Text>
              <Text>{formatDate(item.ExpenseDate)}</Text>
            </div>
            {item.MerchantName && (
              <div className={styles.fieldWide}>
                <Text variant="small" className={styles.fieldLabel}>Merchant</Text>
                <Text>{item.MerchantName}</Text>
              </div>
            )}
            {item.PaymentMethod && (
              <div className={styles.fieldNarrow}>
                <Text variant="small" className={styles.fieldLabel}>Payment Method</Text>
                <Text>{item.PaymentMethod}</Text>
              </div>
            )}
          </div>

          {item.Description && (
            <Stack styles={{ root: { marginTop: 4 } }}>
              <Text variant="small" className={styles.fieldLabel}>Description</Text>
              <Text>{item.Description}</Text>
            </Stack>
          )}

          {renderExtra && (
            <div className={styles.extraRow}>
              {renderExtra(item)}
            </div>
          )}
        </div>
      ))}
    </Stack>
  );
};

export default ExpenseItemsView;
