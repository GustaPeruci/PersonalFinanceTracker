import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertDebtorSchema, insertDebtorPaymentSchema } from "@shared/schema";
import { z } from "zod";
import ExcelJS from "exceljs";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const userId = 1; // For now, use a default user ID
      const data = await storage.getDashboardData(userId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = 1;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:type", async (req, res) => {
    try {
      const userId = 1;
      const { type } = req.params;
      const transactions = await storage.getTransactionsByType(userId, type);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions by type" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const userId = 1;
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({
        ...validatedData,
        userId,
      });
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid transaction data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create transaction" });
      }
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(parseInt(id), validatedData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid transaction data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update transaction" });
      }
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTransaction(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // Debtors routes
  app.get("/api/debtors", async (req, res) => {
    try {
      const userId = 1;
      const debtors = await storage.getDebtors(userId);
      res.json(debtors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch debtors" });
    }
  });

  app.get("/api/debtors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const debtor = await storage.getDebtor(parseInt(id));
      if (!debtor) {
        return res.status(404).json({ error: "Debtor not found" });
      }
      res.json(debtor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch debtor" });
    }
  });

  app.post("/api/debtors", async (req, res) => {
    try {
      const userId = 1;
      const validatedData = insertDebtorSchema.parse(req.body);
      const debtor = await storage.createDebtor({
        ...validatedData,
        userId,
      });
      res.json(debtor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid debtor data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create debtor" });
      }
    }
  });

  app.put("/api/debtors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertDebtorSchema.partial().parse(req.body);
      const debtor = await storage.updateDebtor(parseInt(id), validatedData);
      res.json(debtor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid debtor data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update debtor" });
      }
    }
  });

  app.delete("/api/debtors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDebtor(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete debtor" });
    }
  });

  // Debtor payments routes
  app.get("/api/debtors/:id/payments", async (req, res) => {
    try {
      const { id } = req.params;
      const payments = await storage.getDebtorPayments(parseInt(id));
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch debtor payments" });
    }
  });

  app.post("/api/debtors/:id/payments", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertDebtorPaymentSchema.parse(req.body);
      const payment = await storage.createDebtorPayment({
        ...validatedData,
        debtorId: parseInt(id),
      });
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid payment data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create payment" });
      }
    }
  });

  // Monthly balances routes
  app.get("/api/monthly-balances/:year", async (req, res) => {
    try {
      const userId = 1;
      const { year } = req.params;
      const balances = await storage.getMonthlyBalances(userId, parseInt(year));
      res.json(balances);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly balances" });
    }
  });

  // Export routes
  app.get("/api/export/excel", async (req, res) => {
    try {
      const userId = 1;
      const currentYear = new Date().getFullYear();
      
      // Get all data
      const transactions = await storage.getTransactions(userId);
      const debtors = await storage.getDebtors(userId);
      const balances = await storage.getMonthlyBalances(userId, currentYear);
      
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      
      // Summary sheet
      const summarySheet = workbook.addWorksheet('Resumo');
      summarySheet.addRow(['Resumo Financeiro', currentYear]);
      summarySheet.addRow([]);
      summarySheet.addRow(['Categoria', 'Valor']);
      
      const dashboard = await storage.getDashboardData(userId);
      summarySheet.addRow(['Saldo Atual', dashboard.currentBalance]);
      summarySheet.addRow(['Receita Mensal', dashboard.monthlyIncome]);
      summarySheet.addRow(['Despesas Mensais', dashboard.monthlyExpenses]);
      summarySheet.addRow(['A Receber', dashboard.amountToReceive]);
      
      // Transactions sheet
      const transactionsSheet = workbook.addWorksheet('Transações');
      transactionsSheet.addRow(['ID', 'Tipo', 'Descrição', 'Valor', 'Categoria', 'Data Início', 'Parcelas', 'Status']);
      transactions.forEach(transaction => {
        transactionsSheet.addRow([
          transaction.id,
          transaction.type,
          transaction.description,
          parseFloat(transaction.amount),
          transaction.category,
          transaction.startDate,
          transaction.installments,
          transaction.isActive ? 'Ativo' : 'Inativo'
        ]);
      });
      
      // Debtors sheet
      const debtorsSheet = workbook.addWorksheet('Devedores');
      debtorsSheet.addRow(['ID', 'Nome', 'Valor Total', 'Valor Pago', 'Saldo Devedor', 'Status']);
      debtors.forEach(debtor => {
        const balance = parseFloat(debtor.totalAmount) - parseFloat(debtor.paidAmount);
        debtorsSheet.addRow([
          debtor.id,
          debtor.name,
          parseFloat(debtor.totalAmount),
          parseFloat(debtor.paidAmount),
          balance,
          debtor.status
        ]);
      });
      
      // Monthly balances sheet
      const balancesSheet = workbook.addWorksheet('Saldos Mensais');
      balancesSheet.addRow(['Mês', 'Receita', 'Despesas', 'Saldo', 'Saldo Acumulado']);
      balances.forEach(balance => {
        balancesSheet.addRow([
          `${balance.month}/${balance.year}`,
          parseFloat(balance.income),
          parseFloat(balance.expenses),
          parseFloat(balance.balance),
          parseFloat(balance.accumulatedBalance)
        ]);
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=financeiro_${currentYear}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      res.status(500).json({ error: "Failed to export Excel file" });
    }
  });

  app.get("/api/export/csv", async (req, res) => {
    try {
      const userId = 1;
      const transactions = await storage.getTransactions(userId);
      
      const csv = [
        ['ID', 'Tipo', 'Descrição', 'Valor', 'Categoria', 'Data Início', 'Parcelas', 'Status'].join(','),
        ...transactions.map(t => [
          t.id,
          t.type,
          `"${t.description}"`,
          t.amount,
          t.category || '',
          t.startDate,
          t.installments,
          t.isActive ? 'Ativo' : 'Inativo'
        ].join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transacoes.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export CSV file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
