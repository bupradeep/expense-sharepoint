import * as React from 'react';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { IUser } from '../../../../models/IUser';
import DepartmentsAdmin from './DepartmentsAdmin';
import ProjectsAdmin from './ProjectsAdmin';
import UsersAdmin from './UsersAdmin';
import ReimbursementsAdmin from './ReimbursementsAdmin';
import ReportsAdmin from './ReportsAdmin';

export interface IAdminConsoleProps {
  currentUser: IUser;
}

const AdminConsole: React.FC<IAdminConsoleProps> = (props) => (
  <Pivot>
    <PivotItem headerText="Departments">
      <DepartmentsAdmin />
    </PivotItem>
    <PivotItem headerText="Projects">
      <ProjectsAdmin />
    </PivotItem>
    <PivotItem headerText="Users">
      <UsersAdmin />
    </PivotItem>
    <PivotItem headerText="Reimbursements">
      <ReimbursementsAdmin currentUser={props.currentUser} />
    </PivotItem>
    <PivotItem headerText="Reports">
      <ReportsAdmin />
    </PivotItem>
  </Pivot>
);

export default AdminConsole;
