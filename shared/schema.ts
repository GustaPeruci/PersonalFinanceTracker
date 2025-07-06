import { pgTable, text, serial, integer, boolean, decimal, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'credit', 'fixed_expense', 'installment', 'loan'
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category"), // 'education', 'transport', 'subscription', etc.
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  installments: integer("installments").default(1),
  remainingInstallments: integer("remaining_installments").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const debtors = pgTable("debtors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  description: text("description"),
  dueDate: date("due_date"),
  status: text("status").default("active"), // 'active', 'paid', 'overdue'
  createdAt: timestamp("created_at").defaultNow(),
});

export const debtorPayments = pgTable("debtor_payments", {
  id: serial("id").primaryKey(),
  debtorId: integer("debtor_id").references(() => debtors.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const monthlyBalances = pgTable("monthly_balances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  income: decimal("income", { precision: 10, scale: 2 }).default("0"),
  expenses: decimal("expenses", { precision: 10, scale: 2 }).default("0"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  accumulatedBalance: decimal("accumulated_balance", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const debtorsRelations = relations(debtors, ({ one, many }) => ({
  user: one(users, {
    fields: [debtors.userId],
    references: [users.id],
  }),
  payments: many(debtorPayments),
}));

export const debtorPaymentsRelations = relations(debtorPayments, ({ one }) => ({
  debtor: one(debtors, {
    fields: [debtorPayments.debtorId],
    references: [debtors.id],
  }),
}));

export const monthlyBalancesRelations = relations(monthlyBalances, ({ one }) => ({
  user: one(users, {
    fields: [monthlyBalances.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertDebtorSchema = createInsertSchema(debtors).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertDebtorPaymentSchema = createInsertSchema(debtorPayments).omit({
  id: true,
  createdAt: true,
});

export const insertMonthlyBalanceSchema = createInsertSchema(monthlyBalances).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertDebtor = z.infer<typeof insertDebtorSchema>;
export type Debtor = typeof debtors.$inferSelect;

export type InsertDebtorPayment = z.infer<typeof insertDebtorPaymentSchema>;
export type DebtorPayment = typeof debtorPayments.$inferSelect;

export type InsertMonthlyBalance = z.infer<typeof insertMonthlyBalanceSchema>;
export type MonthlyBalance = typeof monthlyBalances.$inferSelect;
