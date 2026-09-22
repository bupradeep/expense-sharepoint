import * as React from 'react';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';

export interface ILoadingStateProps {
  label?: string;
}

const LoadingState: React.FC<ILoadingStateProps> = (props) => (
  <Spinner size={SpinnerSize.large} label={props.label || 'Loading...'} />
);

export default LoadingState;
