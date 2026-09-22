import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';

export interface IConfirmDialogProps {
  hidden: boolean;
  title: string;
  subText: string;
  confirmButtonText?: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

const ConfirmDialog: React.FC<IConfirmDialogProps> = (props) => (
  <Dialog
    hidden={props.hidden}
    onDismiss={props.onDismiss}
    dialogContentProps={{
      type: DialogType.normal,
      title: props.title,
      subText: props.subText
    }}
  >
    <DialogFooter>
      <PrimaryButton onClick={props.onConfirm} text={props.confirmButtonText || 'Confirm'} />
      <DefaultButton onClick={props.onDismiss} text="Cancel" />
    </DialogFooter>
  </Dialog>
);

export default ConfirmDialog;
