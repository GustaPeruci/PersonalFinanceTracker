import { storage } from "./storage";
import { Transaction, InsertTransaction } from "@shared/schema";

export interface MonthlyProjection {
  year: number;
  month: number;
  monthName: string;
  income: number;
  fixedExpenses: number;
  installments: number;
  totalExpenses: number;
  netBalance: number;
  accumulatedBalance: number;
  transactions: {
    credits: Transaction[];
    fixedExpenses: Transaction[];
    installments: Transaction[];
  };
}

export interface ProjectionAnalysis {
  currentProjections: MonthlyProjection[];
  newProjections: MonthlyProjection[];
  impact: {
    monthlyImpact: number;
    totalImpact: number;
    criticalMonths: string[];
    recommendedAction: string;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export class FinancialProjector {
  private monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  async generateProjections(userId: number, months: number = 12): Promise<MonthlyProjection[]> {
    const transactions = await storage.getTransactions(userId);
    const projections: MonthlyProjection[] = [];
    
    const currentDate = new Date();
    let accumulatedBalance = 0;

    for (let i = 0; i < months; i++) {
      const projectionDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const year = projectionDate.getFullYear();
      const month = projectionDate.getMonth() + 1;
      
      const monthlyTransactions = this.getTransactionsForMonth(transactions, year, month);
      
      const income = this.calculateMonthlyIncome(monthlyTransactions.credits);
      const fixedExpenses = this.calculateMonthlyExpenses(monthlyTransactions.fixedExpenses);
      const installments = this.calculateMonthlyInstallments(monthlyTransactions.installments, year, month);
      
      const totalExpenses = fixedExpenses + installments;
      const netBalance = income - totalExpenses;
      accumulatedBalance += netBalance;

      projections.push({
        year,
        month,
        monthName: this.monthNames[month - 1],
        income,
        fixedExpenses,
        installments,
        totalExpenses,
        netBalance,
        accumulatedBalance,
        transactions: monthlyTransactions
      });
    }

    return projections;
  }

  async analyzeNewTransaction(userId: number, newTransaction: InsertTransaction): Promise<ProjectionAnalysis> {
    // Get current projections
    const currentProjections = await this.generateProjections(userId, 12);
    
    // Create temporary transaction to simulate impact
    const tempTransaction: Transaction = {
      id: -1,
      ...newTransaction,
      createdAt: new Date().toISOString(),
    };
    
    // Get all existing transactions plus the new one
    const existingTransactions = await storage.getTransactions(userId);
    const transactionsWithNew = [...existingTransactions, tempTransaction];
    
    // Generate new projections with the additional transaction
    const newProjections = this.generateProjectionsFromTransactions(transactionsWithNew, 12);
    
    // Calculate impact
    const impact = this.calculateImpact(currentProjections, newProjections, newTransaction);
    
    return {
      currentProjections,
      newProjections,
      impact
    };
  }

  private generateProjectionsFromTransactions(transactions: Transaction[], months: number): MonthlyProjection[] {
    const projections: MonthlyProjection[] = [];
    const currentDate = new Date();
    let accumulatedBalance = 0;

    for (let i = 0; i < months; i++) {
      const projectionDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const year = projectionDate.getFullYear();
      const month = projectionDate.getMonth() + 1;
      
      const monthlyTransactions = this.getTransactionsForMonth(transactions, year, month);
      
      const income = this.calculateMonthlyIncome(monthlyTransactions.credits);
      const fixedExpenses = this.calculateMonthlyExpenses(monthlyTransactions.fixedExpenses);
      const installments = this.calculateMonthlyInstallments(monthlyTransactions.installments, year, month);
      
      const totalExpenses = fixedExpenses + installments;
      const netBalance = income - totalExpenses;
      accumulatedBalance += netBalance;

      projections.push({
        year,
        month,
        monthName: this.monthNames[month - 1],
        income,
        fixedExpenses,
        installments,
        totalExpenses,
        netBalance,
        accumulatedBalance,
        transactions: monthlyTransactions
      });
    }

    return projections;
  }

  private getTransactionsForMonth(transactions: Transaction[], year: number, month: number) {
    const credits = transactions.filter(t => 
      t.type === 'credit' && this.isTransactionActiveInMonth(t, year, month)
    );
    
    const fixedExpenses = transactions.filter(t => 
      t.type === 'fixed_expense' && this.isTransactionActiveInMonth(t, year, month)
    );
    
    const installments = transactions.filter(t => 
      t.type === 'installment' && this.isInstallmentActiveInMonth(t, year, month)
    );

    return { credits, fixedExpenses, installments };
  }

  private isTransactionActiveInMonth(transaction: Transaction, year: number, month: number): boolean {
    if (!transaction.isActive) return false;
    
    const startDate = new Date(transaction.startDate);
    const checkDate = new Date(year, month - 1, 1);
    
    if (transaction.endDate) {
      const endDate = new Date(transaction.endDate);
      return checkDate >= startDate && checkDate <= endDate;
    }
    
    return checkDate >= startDate;
  }

  private isInstallmentActiveInMonth(transaction: Transaction, year: number, month: number): boolean {
    if (!transaction.isActive || transaction.type !== 'installment') return false;
    
    const startDate = new Date(transaction.startDate);
    const checkDate = new Date(year, month - 1, 1);
    
    const monthsDiff = (checkDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (checkDate.getMonth() - startDate.getMonth());
    
    return monthsDiff >= 0 && monthsDiff < (transaction.installments || 1);
  }

  private calculateMonthlyIncome(credits: Transaction[]): number {
    return credits.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  }

  private calculateMonthlyExpenses(expenses: Transaction[]): number {
    return expenses.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  }

  private calculateMonthlyInstallments(installments: Transaction[], year: number, month: number): number {
    return installments
      .filter(t => this.isInstallmentActiveInMonth(t, year, month))
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  }

  private calculateImpact(current: MonthlyProjection[], projected: MonthlyProjection[], newTransaction: InsertTransaction) {
    const monthlyImpact = newTransaction.type === 'credit' 
      ? parseFloat(newTransaction.amount.toString())
      : -parseFloat(newTransaction.amount.toString());
    
    const totalImpact = newTransaction.type === 'installment' 
      ? monthlyImpact * (newTransaction.installments || 1)
      : monthlyImpact;
    
    const criticalMonths = projected
      .filter(p => p.netBalance < 0 || p.accumulatedBalance < -1000)
      .map(p => `${p.monthName}/${p.year}`);
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let recommendedAction = 'Transação recomendada - impacto positivo nas finanças.';
    
    if (newTransaction.type !== 'credit') {
      const worstMonth = projected.reduce((worst, current) => 
        current.accumulatedBalance < worst.accumulatedBalance ? current : worst
      );
      
      if (worstMonth.accumulatedBalance < -2000) {
        riskLevel = 'high';
        recommendedAction = 'Atenção! Esta transação pode causar dificuldades financeiras significativas. Considere renegociar valores ou prazos.';
      } else if (worstMonth.accumulatedBalance < -500 || criticalMonths.length > 3) {
        riskLevel = 'medium';
        recommendedAction = 'Cuidado! Esta transação pode apertar o orçamento. Monitore de perto os meses críticos.';
      } else {
        recommendedAction = 'Transação viável, mas monitore o saldo acumulado nos próximos meses.';
      }
    }

    return {
      monthlyImpact,
      totalImpact,
      criticalMonths,
      recommendedAction,
      riskLevel
    };
  }
}

export const financialProjector = new FinancialProjector();