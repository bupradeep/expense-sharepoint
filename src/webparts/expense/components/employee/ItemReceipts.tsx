import * as React from 'react';
import { ActionButton, IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { Link } from '@fluentui/react/lib/Link';
import { expenseReceiptService } from '../../../../services/expenseReceiptService';
import { IExpenseClaim } from '../../../../models/IExpenseClaim';
import { IExpenseItem } from '../../../../models/IExpenseItem';
import { IExpenseReceipt } from '../../../../models/IExpenseReceipt';
import { IUser } from '../../../../models/IUser';
import ErrorMessage from '../common/ErrorMessage';
import itemStyles from '../common/ExpenseItemsView.module.scss';
import styles from './ExpenseItemEditor.module.scss';

export interface IItemReceiptsProps {
  currentUser: IUser;
  claim: IExpenseClaim;
  item: IExpenseItem;
  receipts: IExpenseReceipt[];
  canEdit: boolean;
  onChanged: () => void;
}

const ItemReceipts: React.FC<IItemReceiptsProps> = (props) => {
  const [uploading, setUploading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null): void => {
    if (!fileList || fileList.length === 0 || !props.item.ExpenseItemId) {
      return;
    }

    const expenseItemId = props.item.ExpenseItemId;
    const files = Array.from(fileList);

    setUploading(true);
    setError(undefined);

    Promise.all(files.map((file) =>
      expenseReceiptService.upload(file, { expenseClaimId: props.claim.ExpenseClaimId, expenseItemId })
    ))
      .then(() => {
        setUploading(false);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        props.onChanged();
      })
      .catch((err: Error) => {
        setUploading(false);
        setError(err.message);
      });
  };

  const removeReceipt = (receiptId: number): void => {
    expenseReceiptService.remove(receiptId)
      .then(props.onChanged)
      .catch((err: Error) => setError(err.message));
  };

  const openReceipt = (receipt: IExpenseReceipt): void => {
    expenseReceiptService.download(receipt.ReceiptId)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Give the new tab a moment to actually load the blob before revoking its URL.
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      })
      .catch((err: Error) => setError(err.message));
  };

  return (
    <Stack tokens={{ childrenGap: 4 }}>
      <Text variant="small" className={itemStyles.fieldLabel}>Receipts</Text>
      {error && <ErrorMessage message={error} />}
      <Stack horizontal wrap verticalAlign="center" tokens={{ childrenGap: 6 }}>
        {props.receipts.length === 0 && <Text variant="small">No receipts attached.</Text>}
        {props.receipts.map((receipt) => (
          <Stack horizontal verticalAlign="center" className={styles.fileChip} key={receipt.ReceiptId} tokens={{ childrenGap: 4 }}>
            <Link onClick={() => openReceipt(receipt)}>
              <Text variant="small">{receipt.FileName}</Text>
            </Link>
            {props.canEdit && (
              <IconButton
                className={styles.chipRemove}
                iconProps={{ iconName: 'Cancel' }}
                title="Remove receipt"
                ariaLabel="Remove receipt"
                onClick={() => removeReceipt(receipt.ReceiptId)}
              />
            )}
          </Stack>
        ))}
        {props.canEdit && (
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <ActionButton
              className={styles.attachButton}
              iconProps={{ iconName: 'Attach' }}
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? 'Uploading...' : 'Upload Receipt'}
            </ActionButton>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default ItemReceipts;
