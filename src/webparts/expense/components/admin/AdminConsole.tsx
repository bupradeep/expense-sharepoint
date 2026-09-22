import * as React from 'react';
import { CommandBarButton } from '@fluentui/react/lib/Button';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { Stack } from '@fluentui/react/lib/Stack';
import { IUser } from '../../../../models/IUser';
import DashboardAdmin from './DashboardAdmin';
import DepartmentsAdmin from './DepartmentsAdmin';
import ProjectsAdmin from './ProjectsAdmin';
import UsersAdmin from './UsersAdmin';
import ReimbursementsAdmin from './ReimbursementsAdmin';
import ReportsAdmin from './ReportsAdmin';
import ExpenseCategoriesAdmin from './ExpenseCategoriesAdmin';
import ApprovalRulesAdmin from './ApprovalRulesAdmin';
import ApprovalHistoryAdmin from './ApprovalHistoryAdmin';
import ExpenseClaimsAdmin from './ExpenseClaimsAdmin';
import AuditLogAdmin from './AuditLogAdmin';
import styles from './AdminConsole.module.scss';

export interface IAdminConsoleProps {
  currentUser: IUser;
}

type AdminTabKey =
  | 'dashboard' | 'claims' | 'reimbursement' | 'reports' | 'approvalRules' | 'approvalHistory'
  | 'departments' | 'projects' | 'users' | 'categories' | 'auditLog';

// These always render inline and never collapse into the "More" menu, regardless of
// available width -- unlike Pivot's built-in overflowBehavior, which decides what fits
// at runtime and can bump any of them depending on the container's width.
const PRIMARY_TABS: Array<{ key: AdminTabKey; text: string }> = [
  { key: 'dashboard', text: 'Dashboard' },
  { key: 'claims', text: 'Claims' },
  { key: 'reimbursement', text: 'Reimbursement' },
  { key: 'reports', text: 'Reports' },
  { key: 'approvalRules', text: 'Approval Rules' },
  { key: 'approvalHistory', text: 'Approval History' }
];

const OVERFLOW_TABS: Array<{ key: AdminTabKey; text: string }> = [
  { key: 'departments', text: 'Departments' },
  { key: 'projects', text: 'Projects' },
  { key: 'users', text: 'Users' },
  { key: 'categories', text: 'Expense Categories' },
  { key: 'auditLog', text: 'Audit Log' }
];

const AdminConsole: React.FC<IAdminConsoleProps> = (props) => {
  const [selected, setSelected] = React.useState<AdminTabKey>('dashboard');

  const isOverflowSelected = OVERFLOW_TABS.some((t) => t.key === selected);

  const overflowMenuItems: IContextualMenuItem[] = OVERFLOW_TABS.map((t) => ({
    key: t.key,
    text: t.text,
    onClick: () => { setSelected(t.key); }
  }));

  const renderTab = (): React.ReactNode => {
    switch (selected) {
      case 'dashboard': return <DashboardAdmin />;
      case 'claims': return <ExpenseClaimsAdmin currentUser={props.currentUser} />;
      case 'reimbursement': return <ReimbursementsAdmin currentUser={props.currentUser} />;
      case 'reports': return <ReportsAdmin />;
      case 'approvalRules': return <ApprovalRulesAdmin />;
      case 'approvalHistory': return <ApprovalHistoryAdmin />;
      case 'departments': return <DepartmentsAdmin />;
      case 'projects': return <ProjectsAdmin />;
      case 'users': return <UsersAdmin />;
      case 'categories': return <ExpenseCategoriesAdmin />;
      case 'auditLog': return <AuditLogAdmin />;
      default: return null;
    }
  };

  return (
    <div className={styles.adminConsole}>
      <Stack horizontal verticalAlign="center" className={styles.tabBar}>
        {PRIMARY_TABS.map((t) => (
          <CommandBarButton
            key={t.key}
            text={t.text}
            className={selected === t.key ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
            onClick={() => setSelected(t.key)}
          />
        ))}
        <CommandBarButton
          text="More"
          menuIconProps={{ iconName: 'ChevronDown' }}
          className={isOverflowSelected ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton}
          menuProps={{ items: overflowMenuItems }}
        />
      </Stack>
      <div className={styles.tabContent}>{renderTab()}</div>
    </div>
  );
};

export default AdminConsole;
