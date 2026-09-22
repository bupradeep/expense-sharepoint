import * as React from 'react';
import styles from './Expense.module.scss';
import { IExpenseProps } from './IExpenseProps';
import { configureApiClient } from '../../../utils/ApiClient';
import { resolveCurrentUser, CurrentUserResult } from '../../../utils/CurrentUserResolver';
import { isAdminRole } from '../../../models/Roles';
import LoadingState from './common/LoadingState';
import ErrorMessage from './common/ErrorMessage';
import PageHeader from './common/PageHeader';
import { MessageBarType } from '@fluentui/react/lib/MessageBar';
import AdminConsole from './admin/AdminConsole';
import EmployeeArea from './employee/EmployeeArea';

function renderContent(result: CurrentUserResult | undefined): JSX.Element {
  if (!result) {
    return <LoadingState label="Loading your profile..." />;
  }

  if (result.state === 'not-registered') {
    return (
      <ErrorMessage
        messageType={MessageBarType.warning}
        message="Your account isn't set up in the Expense system yet. Contact your administrator."
      />
    );
  }

  if (result.state === 'error') {
    return <ErrorMessage message={result.message} />;
  }

  return (
    <>
      <PageHeader user={result.user} />
      {isAdminRole(result.user.Role)
        ? <AdminConsole currentUser={result.user} />
        : <EmployeeArea currentUser={result.user} />}
    </>
  );
}

const Expense: React.FC<IExpenseProps> = (props) => {
  const [result, setResult] = React.useState<CurrentUserResult | undefined>(undefined);

  React.useEffect(() => {
    configureApiClient(props.apiBaseUrl);

    resolveCurrentUser(props.context.pageContext.aadInfo?.userId?.toString())
      .then(setResult)
      .catch((err: Error) => setResult({ state: 'error', message: err.message || 'Unexpected error' }));
  }, [props.apiBaseUrl]);

  return (
    <div className={styles.expense}>
      {renderContent(result)}
    </div>
  );
};

export default Expense;
