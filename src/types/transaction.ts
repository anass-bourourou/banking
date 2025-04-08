
export interface Transaction {
  id: string | number;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  account_id?: number;
  category?: string;
  recipient_account?: string;
  recipient_name?: string;
  transfer_type?: 'standard' | 'instantané' | 'multiple' | 'instant' | 'mass';
  status: 'completed' | 'pending' | 'failed';
  reference_id?: string;
  fees?: number;
}

export interface TransferData {
  fromAccountId: number;
  toAccount?: string | number;
  beneficiaryId?: string;
  amount: number;
  motif?: string;
  description?: string;
  transferType?: 'standard' | 'instant' | 'mass';
  recipients?: Array<{id: string, amount: number}>;
  isInstant?: boolean;
  fees?: number;
  smsValidationId?: number;
  validationCode?: string;
  recipientName?: string;
  scheduledDate?: string;
}
