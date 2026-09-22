export interface IProject {
  ProjectId: number;
  ProjectName: string;
  ProjectCode: string;
  ClientName?: string;
  CostCenter?: string;
  IsActive: boolean;
}

export interface IProjectDto {
  projectName: string;
  projectCode: string;
  clientName?: string;
  costCenter?: string;
  isActive?: boolean;
}
