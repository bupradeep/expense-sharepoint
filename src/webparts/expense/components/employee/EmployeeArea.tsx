import * as React from 'react';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IUser } from '../../../../models/IUser';
import { UserRoles } from '../../../../models/Roles';
import MyExpenses from './MyExpenses';
import MyApprovals from '../approvals/MyApprovals';
import ApprovalHistoryAdmin from '../admin/ApprovalHistoryAdmin';
import ReportsAdmin from '../admin/ReportsAdmin';
import ReimbursementsAdmin from '../admin/ReimbursementsAdmin';

export interface IEmployeeAreaProps {
  context: WebPartContext;
  currentUser: IUser;
}

const EmployeeArea: React.FC<IEmployeeAreaProps> = (props) => {
  const role = props.currentUser.Role;

  // Finance is a pure review role -- it can only approve/reject/send back claims pending
  // its review and never files its own claims (enforced server-side too, in
  // expenseService.js's createExpense), so it never sees My Expenses or a New Claim button.
  // It does get read access to what its own review stage has already decided (Approval History,
  // filterable by approver), plus Reports and a view-only Reimbursement tab -- marking a claim as
  // paid stays with whoever owns the reimbursement workflow in Admin.
  if (role === UserRoles.Finance) {
    return (
      <Pivot>
        <PivotItem headerText="Approvals">
          <MyApprovals currentUser={props.currentUser} />
        </PivotItem>
        <PivotItem headerText="Approval History">
          <ApprovalHistoryAdmin />
        </PivotItem>
        <PivotItem headerText="Reports">
          <ReportsAdmin />
        </PivotItem>
        <PivotItem headerText="Reimbursement">
          <ReimbursementsAdmin currentUser={props.currentUser} viewOnly />
        </PivotItem>
      </Pivot>
    );
  }

  // Manager and DepartmentHead both review claims AND may file their own, so they get both tabs.
  if (role !== UserRoles.Manager && role !== UserRoles.DepartmentHead) {
    return <MyExpenses context={props.context} currentUser={props.currentUser} />;
  }

  return (
    <Pivot>
      <PivotItem headerText="My Expenses">
        <MyExpenses context={props.context} currentUser={props.currentUser} />
      </PivotItem>
      <PivotItem headerText="Approvals">
        <MyApprovals currentUser={props.currentUser} />
      </PivotItem>
    </Pivot>
  );
};

export default EmployeeArea;
