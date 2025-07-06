import { Transaction, MonthlyBalance } from "@shared/schema";

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyFixed: number;
  monthlyInstallments: number;
}

export function calculateMonthlyBalance(
  transactions: Transaction[],
  year: number,
  month: number
): MonthlyBalance {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  let income = 0;
  let expenses = 0;

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.startDate);
    
    if (transaction.type === 'credit') {
      if (transactionDate >= startDate && transactionDate <= endDate) {
        income += parseFloat(transaction.amount);
      }
    } else {
      // For recurring transactions, check if they're active in this month
      if (transaction.type === 'fixed_expense' && transaction.isActive) {
        expenses += parseFloat(transaction.amount);
      } else if (transaction.type === 'installment' && transaction.isActive) {
        // Check if installment is active in this month
        const installmentEnd = new Date(transactionDate);
        installmentEnd.setMonth(installmentEnd.getMonth() + (transaction.installments || 1));
        
        if (transactionDate <= endDate && installmentEnd >= startDate) {
          expenses += parseFloat(transaction.amount);
        }
      }
    }
  });

  const balance = income - expenses;

  return {
    userId: 1, // Default user ID
    year,
    month,
    income: income.toString(),
    expenses: expenses.toString(),
    balance: balance.toString(),
    accumulatedBalance: balance.toString(), // This should be calculated with previous months
    id: 0,
    createdAt: new Date(),
  };
}

export function calculateFinancialSummary(transactions: Transaction[]): FinancialSummary {
  let totalIncome = 0;
  let totalExpenses = 0;
  let monthlyFixed = 0;
  let monthlyInstallments = 0;

  transactions.forEach((transaction) => {
    const amount = parseFloat(transaction.amount);
    
    if (transaction.type === 'credit') {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
      
      if (transaction.type === 'fixed_expense') {
        monthlyFixed += amount;
      } else if (transaction.type === 'installment') {
        monthlyInstallments += amount;
      }
    }
  });

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    monthlyFixed,
    monthlyInstallments,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month - 1];
}

export function isInstallmentActive(transaction: Transaction, currentDate: Date = new Date()): boolean {
  if (!transaction.isActive) return false;
  
  const startDate = new Date(transaction.startDate);
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + (transaction.installments || 1));
  
  return currentDate >= startDate && currentDate <= endDate;
}
