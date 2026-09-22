import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';

export interface IErrorMessageProps {
  message: string;
  messageType?: MessageBarType;
}

const ErrorMessage: React.FC<IErrorMessageProps> = (props) => (
  <MessageBar messageBarType={props.messageType !== undefined ? props.messageType : MessageBarType.error}>
    {props.message}
  </MessageBar>
);

export default ErrorMessage;
