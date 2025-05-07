
// Import necessary types from the service files
import type { Account } from './AccountService';
import type { Beneficiary } from './BeneficiaryService';
import type { Notification } from './NotificationService';
import { AccountService } from './AccountService';
import { TransactionService } from './TransactionService';
import { TransferService } from './TransferService';
import { BeneficiaryService } from './BeneficiaryService';
import { NotificationService } from './NotificationService';

// Re-export correct types
export type { Transaction } from '@/types/transaction';
export type { TransferData } from '@/types/transaction';
export type { Account } from './AccountService';
export type { Beneficiary } from './BeneficiaryService';
export type { Notification } from './NotificationService';

// Re-export all domain-specific services
export { AccountService } from './AccountService';
export { TransactionService } from './TransactionService';
export { TransferService } from './TransferService';
export { BeneficiaryService } from './BeneficiaryService';
export { NotificationService } from './NotificationService';

// DataService class for backward compatibility - connects to SpringBoot
export class DataService {
  static getAccounts = AccountService.getAccounts;
  static getAccountById = AccountService.getAccountById;
  static getRecentTransactions = TransactionService.getRecentTransactions;
  static getTransactionsByAccount = TransactionService.getTransactionsByAccountId;
  static createTransfer = TransferService.createTransfer;
  static getBeneficiaries = BeneficiaryService.getBeneficiaries;
  static addBeneficiary = BeneficiaryService.addBeneficiary;
  static getNotifications = NotificationService.getNotifications;
}
