import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'credit', 'fixed_expense', 'installment', 'loan'
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  category: text("category"), // 'education', 'transport', 'subscription', etc.
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  installments: integer("installments").default(1),
  remainingInstallments: integer("remaining_installments").default(1),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const debtors = sqliteTable("debtors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  totalAmount: real("total_amount").notNull(),
  paidAmount: real("paid_amount").default(0),
  description: text("description"),
  dueDate: text("due_date"),
  status: text("status").default("active"), // 'active', 'paid', 'overdue'
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const debtorPayments = sqliteTable("debtor_payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  debtorId: integer("debtor_id").references(() => debtors.id),
  amount: real("amount").notNull(),
  paymentDate: text("payment_date").notNull(),
  description: text("description"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const monthlyBalances = sqliteTable("monthly_balances", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  income: real("income").default(0),
  expenses: real("expenses").default(0),
  balance: real("balance").default(0),
  accumulatedBalance: real("accumulated_balance").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
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
  createdAt: true,
});

export const insertDebtorSchema = createInsertSchema(debtors).omit({
  id: true,
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
