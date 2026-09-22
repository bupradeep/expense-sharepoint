import * as React from 'react';
import { Persona, PersonaSize } from '@fluentui/react/lib/Persona';
import { IUser } from '../../../../models/IUser';
import styles from './PageHeader.module.scss';

export interface IPageHeaderProps {
  user: IUser;
}

const PageHeader: React.FC<IPageHeaderProps> = (props) => (
  <div className={styles.header}>
    <Persona text={props.user.FullName} size={PersonaSize.size32} />
    <span className={styles.roleBadge}>{props.user.Role}</span>
  </div>
);

export default PageHeader;
