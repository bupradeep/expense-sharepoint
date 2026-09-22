import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Label } from '@fluentui/react/lib/Label';
import { expenseCategoryService } from '../../../../services/expenseCategoryService';
import { IExpenseCategory } from '../../../../models/IExpenseCategory';
import { IExpenseItemDto } from '../../../../models/IExpenseItem';

export interface IExpenseItemEditorProps {
  items: IExpenseItemDto[];
  onChange: (items: IExpenseItemDto[]) => void;
}

const emptyItem = (): IExpenseItemDto => ({
  categoryId: 0,
  expenseDate: new Date().toISOString().slice(0, 10),
  amount: 0
});

const ExpenseItemEditor: React.FC<IExpenseItemEditorProps> = (props) => {
  const [categories, setCategories] = React.useState<IExpenseCategory[]>([]);

  React.useEffect(() => {
    expenseCategoryService.getAll().then(setCategories).catch(() => { /* dropdown is best-effort */ });
  }, []);

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
  };

  const addItem = (): void => {
    props.onChange([...props.items, emptyItem()]);
  };

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <Label>Expense Items</Label>
      {props.items.map((item, index) => (
        <Stack
          key={index}
          horizontal
          verticalAlign="end"
          tokens={{ childrenGap: 8 }}
          wrap
        >
          <Dropdown
            label="Category"
            selectedKey={item.categoryId || undefined}
            options={categoryOptions}
            onChange={(_e, option) => updateItem(index, { categoryId: Number(option?.key) })}
            styles={{ root: { width: 160 } }}
          />
          <TextField
            label="Date"
            type="date"
            value={item.expenseDate}
            onChange={(_e, value) => updateItem(index, { expenseDate: value || '' })}
            styles={{ root: { width: 150 } }}
          />
          <TextField
            label="Amount"
            type="number"
            value={String(item.amount)}
            onChange={(_e, value) => updateItem(index, { amount: value ? Number(value) : 0 })}
            styles={{ root: { width: 110 } }}
          />
          <TextField
            label="Merchant"
            value={item.merchantName}
            onChange={(_e, value) => updateItem(index, { merchantName: value || '' })}
            styles={{ root: { width: 150 } }}
          />
          <TextField
            label="Description"
            value={item.description}
            onChange={(_e, value) => updateItem(index, { description: value || '' })}
            styles={{ root: { width: 200 } }}
          />
          <IconButton iconProps={{ iconName: 'Delete' }} title="Remove item" onClick={() => removeItem(index)} />
        </Stack>
      ))}
      <DefaultButton text="Add Item" iconProps={{ iconName: 'Add' }} onClick={addItem} />
    </Stack>
  );
};

export default ExpenseItemEditor;
