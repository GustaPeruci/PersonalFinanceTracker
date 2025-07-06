import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingUp, TrendingDown } from "lucide-react";
import BalanceChart from "@/components/dashboard/balance-chart";
import ExpenseChart from "@/components/dashboard/expense-chart";

export default function Reports() {
  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const handleExportExcel = async () => {
    try {
      const response = await fetch("/api/export/excel");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financeiro_${new Date().getFullYear()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export Excel:", error);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await fetch("/api/export/csv");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transacoes.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export CSV:", error);
    }
  };

  const totalCredits = transactions
    .filter((t: any) => t.type === 'credit')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter((t: any) => t.type !== 'credit')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Relatórios</h1>
      </div>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h2>
              <p className="text-gray-600">Análise completa das suas finanças</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleExportExcel} className="bg-success hover:bg-success/90">
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
              <Button onClick={handleExportCsv} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Créditos</p>
                  <p className="text-2xl font-bold text-success">
                    R$ {totalCredits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Despesas</p>
                  <p className="text-2xl font-bold text-error">
                    R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-error" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Saldo Total</p>
                  <p className={`text-2xl font-bold ${
                    totalCredits - totalExpenses >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    R$ {(totalCredits - totalExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`h-8 w-8 ${
                  totalCredits - totalExpenses >= 0 ? 'text-success' : 'text-error'
                }`}>
                  {totalCredits - totalExpenses >= 0 ? 
                    <TrendingUp className="h-8 w-8" /> : 
                    <TrendingDown className="h-8 w-8" />
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BalanceChart />
          <ExpenseChart />
        </div>

        {/* Transaction Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Transações</span>
                <span className="font-semibold">{transactions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transações Ativas</span>
                <span className="font-semibold">
                  {transactions.filter((t: any) => t.isActive).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Parcelamentos Ativos</span>
                <span className="font-semibold">
                  {transactions.filter((t: any) => t.type === 'installment' && t.isActive).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Despesas Fixas</span>
                <span className="font-semibold">
                  {transactions.filter((t: any) => t.type === 'fixed_expense').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
