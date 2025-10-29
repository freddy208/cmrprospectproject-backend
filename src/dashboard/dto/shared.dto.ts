export type CountBy = { key: string; count: number };

export class TopProspectDto {
  id!: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  status!: string;
  country!: string;
  assignedToId?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}

export class ActivityDto {
  id!: string;
  prospectId!: string;
  userId!: string;
  type?: string | null;
  notes?: string | null;
  createdAt!: Date;
}
