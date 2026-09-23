import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { ActionButton, IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { expenseCategoryService } from '../../../../services/expenseCategoryService';
import { IExpenseCategory } from '../../../../models/IExpenseCategory';
import { IExpenseItemDto } from '../../../../models/IExpenseItem';
import FormRow from '../common/FormRow';
import styles from './ExpenseItemEditor.module.scss';

export interface IExpenseItemEditorProps {
  items: IExpenseItemDto[];
  onChange: (items: IExpenseItemDto[]) => void;
}

export interface IExpenseItemEditorHandle {
  getPendingFilesByIndex: () => File[][];
}

const emptyItem = (): IExpenseItemDto => ({
  categoryId: 0,
  expenseDate: new Date().toISOString().slice(0, 10),
  amount: 0
});

const ExpenseItemEditor = React.forwardRef<IExpenseItemEditorHandle, IExpenseItemEditorProps>((props, ref) => {
  const [categories, setCategories] = React.useState<IExpenseCategory[]>([]);
  const [filesByIndex, setFilesByIndex] = React.useState<File[][]>(() => props.items.map(() => []));
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    expenseCategoryService.getAll().then(setCategories).catch(() => { /* dropdown is best-effort */ });
  }, []);

  React.useImperativeHandle(ref, () => ({
    getPendingFilesByIndex: () => filesByIndex
  }), [filesByIndex]);

  const categoryOptions: IDropdownOption[] = categories.map((c) => ({ key: c.CategoryId, text: c.CategoryName }));

  const updateItem = (index: number, patch: Partial<IExpenseItemDto>): void => {
    const next = props.items.slice();
    next[index] = { ...next[index], ...patch };
    props.onChange(next);
  };

  const removeItem = (index: number): void => {
    const next = props.items.slice();
    next.splice(index, 1);
    props.onChange(next);

    const nextFiles = filesByIndex.slice();
    nextFiles.splice(index, 1);
    setFilesByIndex(nextFiles);
  };

  const addItem = (): void => {
    props.onChange([...props.items, emptyItem()]);
    setFilesByIndex([...filesByIndex, []]);
  };

  const addFiles = (index: number, fileList: FileList | null): void => {
    if (!fileList || fileList.length === 0) {
      return;
    }
    const next = filesByIndex.slice();
    next[index] = [...(next[index] || []), ...Array.from(fileList)];
    setFilesByIndex(next);

    const input = inputRefs.current[index];
    if (input) {
      input.value = '';
    }
  };

  const removeFile = (index: number, fileIndex: number): void => {
    const next = filesByIndex.slice();
    next[index] = next[index].filter((_f, i) => i !== fileIndex);
    setFilesByIndex(next);
  };

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      {props.items.map((item, index) => (
        <div className={styles.itemCard} key={index}>
          <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className={styles.itemHeader}>
            <Text className={styles.itemTitle}>{`Item ${index + 1}`}</Text>
            <IconButton
              className={styles.removeButton}
              iconProps={{ iconName: 'Delete' }}
              title="Remove item"
              ariaLabel="Remove item"
              onClick={() => removeItem(index)}
            />
          </Stack>

          <div className={styles.fieldGrid}>
            <div className={styles.fieldWide}>
              <FormRow label="Category" required>
                <Dropdown
                  selectedKey={item.categoryId || undefined}
                  options={categoryOptions}
                  onChange={(_e, option) => updateItem(index, { categoryId: Number(option?.key) })}
                />
              </FormRow>
            </div>
            <div className={styles.fieldNarrow}>
              <FormRow label="Date" required>
                <TextField
                  type="date"
                  value={item.expenseDate}
                  onChange={(_e, value) => updateItem(index, { expenseDate: value || '' })}
                />
              </FormRow>
            </div>
            <div className={styles.fieldAmount}>
              <FormRow label="Amount" required>
                <TextField
                  type="number"
                  value={String(item.amount)}
                  onChange={(_e, value) => updateItem(index, { amount: value ? Number(value) : 0 })}
                  styles={{ field: { textAlign: 'right' } }}
                />
              </FormRow>
            </div>
            <div className={styles.fieldWide}>
              <FormRow label="Merchant">
                <TextField
                  value={item.merchantName}
                  onChange={(_e, value) => updateItem(index, { merchantName: value || '' })}
                />
              </FormRow>
            </div>
          </div>
          <FormRow label="Description">
            <TextField
              value={item.description}
              onChange={(_e, value) => updateItem(index, { description: value || '' })}
            />
          </FormRow>

          <div className={styles.receiptsRow}>
            <Text variant="small" className={styles.receiptsLabel}>Receipts</Text>
            <Stack horizontal wrap verticalAlign="center" tokens={{ childrenGap: 6 }}>
              {(filesByIndex[index] || []).map((file, fileIndex) => (
                <Stack horizontal verticalAlign="center" className={styles.fileChip} key={fileIndex} tokens={{ childrenGap: 4 }}>
                  <Text variant="small">{file.name}</Text>
                  <IconButton
                    className={styles.chipRemove}
                    iconProps={{ iconName: 'Cancel' }}
                    title="Remove file"
                    ariaLabel="Remove file"
                    onClick={() => removeFile(index, fileIndex)}
                  />
                </Stack>
              ))}
              <input
                ref={(el) => { inputRefs.current[index] = el; }}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => addFiles(index, e.target.files)}
              />
              <ActionButton
                className={styles.attachButton}
                iconProps={{ iconName: 'Attach' }}
                onClick={() => inputRefs.current[index]?.click()}
              >
                Attach Receipt
              </ActionButton>
            </Stack>
          </div>
        </div>
      ))}
      <ActionButton className={styles.addItemButton} iconProps={{ iconName: 'Add' }} onClick={addItem}>
        Add Item
      </ActionButton>
    </Stack>
  );
});

ExpenseItemEditor.displayName = 'ExpenseItemEditor';

export default ExpenseItemEditor;
