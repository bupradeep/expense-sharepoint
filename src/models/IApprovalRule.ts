export interface IApprovalRule {
  ApprovalRuleId: number;
  MinimumAmount: number;
  MaximumAmount?: number;
  ApprovalLevel: number;
  ApproverRole: string;
  IsActive: boolean;
}

export interface IApprovalRuleDto {
  minimumAmount: number;
  maximumAmount?: number;
  approvalLevel: number;
  approverRole: string;
  isActive?: boolean;
}
