import { users, transactions, debtors, debtorPayments, monthlyBalances, 
         type User, type InsertUser, type Transaction, type InsertTransaction,
         type Debtor, type InsertDebtor, type DebtorPayment, type InsertDebtorPayment,
         type MonthlyBalance, type InsertMonthlyBalance } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sum, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction methods
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransactionsByType(userId: number, type: string): Promise<Transaction[]>;
  getActiveTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  
  // Debtor methods
  getDebtors(userId: number): Promise<Debtor[]>;
  getDebtor(id: number): Promise<Debtor | undefined>;
  createDebtor(debtor: InsertDebtor): Promise<Debtor>;
  updateDebtor(id: number, debtor: Partial<InsertDebtor>): Promise<Debtor>;
  deleteDebtor(id: number): Promise<void>;
  
  // Debtor payment methods
  getDebtorPayments(debtorId: number): Promise<DebtorPayment[]>;
  createDebtorPayment(payment: InsertDebtorPayment): Promise<DebtorPayment>;
  
  // Monthly balance methods
  getMonthlyBalances(userId: number, year: number): Promise<MonthlyBalance[]>;
  createOrUpdateMonthlyBalance(balance: InsertMonthlyBalance): Promise<MonthlyBalance>;
  
  // Dashboard data
  getDashboardData(userId: number): Promise<{
    currentBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    amountToReceive: number;
    fixedExpenses: Transaction[];
    activeInstallments: Transaction[];
    recentDebtors: Debtor[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByType(userId: number, type: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, type)))
      .orderBy(desc(transactions.createdAt));
  }

  async getActiveTransactions(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.isActive, true)))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [updatedTransaction] = await db.update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async getDebtors(userId: number): Promise<Debtor[]> {
    return await db.select().from(debtors)
      .where(eq(debtors.userId, userId))
      .orderBy(desc(debtors.createdAt));
  }

  async getDebtor(id: number): Promise<Debtor | undefined> {
    const [debtor] = await db.select().from(debtors).where(eq(debtors.id, id));
    return debtor || undefined;
  }

  async createDebtor(debtor: InsertDebtor): Promise<Debtor> {
    const [newDebtor] = await db.insert(debtors).values(debtor).returning();
    return newDebtor;
  }

  async updateDebtor(id: number, debtor: Partial<InsertDebtor>): Promise<Debtor> {
    const [updatedDebtor] = await db.update(debtors)
      .set(debtor)
      .where(eq(debtors.id, id))
      .returning();
    return updatedDebtor;
  }

  async deleteDebtor(id: number): Promise<void> {
    await db.delete(debtors).where(eq(debtors.id, id));
  }

  async getDebtorPayments(debtorId: number): Promise<DebtorPayment[]> {
    return await db.select().from(debtorPayments)
      .where(eq(debtorPayments.debtorId, debtorId))
      .orderBy(desc(debtorPayments.paymentDate));
  }

  async createDebtorPayment(payment: InsertDebtorPayment): Promise<DebtorPayment> {
    const [newPayment] = await db.insert(debtorPayments).values(payment).returning();
    
    // Update debtor's paid amount
    const payments = await this.getDebtorPayments(payment.debtorId);
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    await db.update(debtors)
      .set({ paidAmount: totalPaid.toString() })
      .where(eq(debtors.id, payment.debtorId));
    
    return newPayment;
  }

  async getMonthlyBalances(userId: number, year: number): Promise<MonthlyBalance[]> {
    return await db.select().from(monthlyBalances)
      .where(and(eq(monthlyBalances.userId, userId), eq(monthlyBalances.year, year)))
      .orderBy(asc(monthlyBalances.month));
  }

  async createOrUpdateMonthlyBalance(balance: InsertMonthlyBalance): Promise<MonthlyBalance> {
    const existing = await db.select().from(monthlyBalances)
      .where(and(
        eq(monthlyBalances.userId, balance.userId),
        eq(monthlyBalances.year, balance.year),
        eq(monthlyBalances.month, balance.month)
      ));

    if (existing.length > 0) {
      const [updated] = await db.update(monthlyBalances)
        .set(balance)
        .where(eq(monthlyBalances.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(monthlyBalances).values(balance).returning();
      return created;
    }
  }

  async getDashboardData(userId: number): Promise<{
    currentBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    amountToReceive: number;
    fixedExpenses: Transaction[];
    activeInstallments: Transaction[];
    recentDebtors: Debtor[];
  }> {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Get current month balance
    const [currentBalance] = await db.select().from(monthlyBalances)
      .where(and(
        eq(monthlyBalances.userId, userId),
        eq(monthlyBalances.year, currentYear),
        eq(monthlyBalances.month, currentMonth)
      ));

    // Get fixed expenses
    const fixedExpenses = await db.select().from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'fixed_expense'),
        eq(transactions.isActive, true)
      ));

    // Get active installments
    const activeInstallments = await db.select().from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'installment'),
        eq(transactions.isActive, true)
      ));

    // Get recent debtors
    const recentDebtors = await db.select().from(debtors)
      .where(eq(debtors.userId, userId))
      .orderBy(desc(debtors.createdAt))
      .limit(5);

    // Calculate total amount to receive
    const amountToReceive = recentDebtors.reduce((sum, debtor) => {
      return sum + (parseFloat(debtor.totalAmount) - parseFloat(debtor.paidAmount));
    }, 0);

    // Calculate monthly expenses
    const monthlyExpenses = fixedExpenses.reduce((sum, expense) => {
      return sum + parseFloat(expense.amount);
    }, 0) + activeInstallments.reduce((sum, installment) => {
      return sum + parseFloat(installment.amount);
    }, 0);

    return {
      currentBalance: currentBalance ? parseFloat(currentBalance.balance) : 0,
      monthlyIncome: currentBalance ? parseFloat(currentBalance.income) : 0,
      monthlyExpenses,
      amountToReceive,
      fixedExpenses,
      activeInstallments,
      recentDebtors,
    };
  }
}

export const storage = new DatabaseStorage();
