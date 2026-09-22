import * as React from 'react';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { IUser } from '../../../../models/IUser';
import { UserRoles } from '../../../../models/Roles';
import MyExpenses from './MyExpenses';
import MyApprovals from '../approvals/MyApprovals';

export interface IEmployeeAreaProps {
  currentUser: IUser;
}

const EmployeeArea: React.FC<IEmployeeAreaProps> = (props) => {
  if (props.currentUser.Role !== UserRoles.Manager) {
    return <MyExpenses currentUser={props.currentUser} />;
  }

  return (
    <Pivot>
      <PivotItem headerText="My Expenses">
        <MyExpenses currentUser={props.currentUser} />
      </PivotItem>
      <PivotItem headerText="Approvals">
        <MyApprovals currentUser={props.currentUser} />
      </PivotItem>
    </Pivot>
  );
};

export default EmployeeArea;
