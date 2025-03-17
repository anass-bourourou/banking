
// Import necessary types from the service files
import type { Account } from './AccountService';
import type { Transaction, TransferData } from './TransactionService';
import type { Beneficiary } from './BeneficiaryService';
import type { Notification } from './NotificationService';

// Re-export all domain-specific services
export * from './AccountService';
export * from './TransactionService';
export * from './BeneficiaryService';
export * from './NotificationService';

// Re-export specific types for backward compatibility
export type {
  Account,
  Transaction,
  Beneficiary,
  TransferData,
  Notification
}

// Export a namespace for backward compatibility
import { AccountService } from './AccountService';
import { TransactionService } from './TransactionService';
import { BeneficiaryService } from './BeneficiaryService';
import { NotificationService } from './NotificationService';

// DataService class for backward compatibility
export class DataService {
  static getAccounts = AccountService.getAccounts;
  static getAccountById = AccountService.getAccountById;
  static getRecentTransactions = TransactionService.getRecentTransactions;
  static getTransactionsByAccount = TransactionService.getTransactionsByAccount;
  static createTransfer = TransactionService.createTransfer;
  static getBeneficiaries = BeneficiaryService.getBeneficiaries;
  static addBeneficiary = BeneficiaryService.addBeneficiary;
  static getNotifications = NotificationService.getNotifications;
}
