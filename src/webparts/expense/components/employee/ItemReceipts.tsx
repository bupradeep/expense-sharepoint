import * as React from 'react';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { Link } from '@fluentui/react/lib/Link';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { expenseReceiptService } from '../../../../services/expenseReceiptService';
import { uploadReceiptFile } from '../../../../utils/SharePointFileUpload';
import { IExpenseClaim } from '../../../../models/IExpenseClaim';
import { IExpenseItem } from '../../../../models/IExpenseItem';
import { IExpenseReceipt } from '../../../../models/IExpenseReceipt';
import { IUser } from '../../../../models/IUser';
import ErrorMessage from '../common/ErrorMessage';

export interface IItemReceiptsProps {
  context: WebPartContext;
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
      uploadReceiptFile(props.context, props.claim.ClaimNumber, file)
        .then((uploaded) => expenseReceiptService.create({
          expenseClaimId: props.claim.ExpenseClaimId,
          expenseItemId,
          fileName: uploaded.fileName,
          filePath: uploaded.serverRelativeUrl,
          fileType: file.type,
          fileSize: uploaded.size,
          uploadedBy: props.currentUser.UserId
        }))
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

  return (
    <Stack tokens={{ childrenGap: 4 }}>
      <Text styles={{ root: { fontWeight: 600 } }}>Receipts</Text>
      {error && <ErrorMessage message={error} />}
      {props.receipts.length === 0 && <Text variant="small">No receipts attached.</Text>}
      {props.receipts.map((receipt) => (
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }} key={receipt.ReceiptId}>
          <Link href={receipt.FilePath} target="_blank" rel="noreferrer">{receipt.FileName}</Link>
          {props.canEdit && (
            <IconButton
              iconProps={{ iconName: 'Delete' }}
              title="Remove receipt"
              ariaLabel="Remove receipt"
              onClick={() => removeReceipt(receipt.ReceiptId)}
            />
          )}
        </Stack>
      ))}
      {props.canEdit && (
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
          <input
            ref={inputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <DefaultButton
            text={uploading ? 'Uploading...' : 'Upload Receipt'}
            iconProps={{ iconName: 'Attach' }}
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          />
        </Stack>
      )}
    </Stack>
  );
};

export default ItemReceipts;
