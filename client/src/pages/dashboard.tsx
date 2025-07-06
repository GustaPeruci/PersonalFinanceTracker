import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Download, AlertTriangle } from "lucide-react";
import OverviewCards from "@/components/dashboard/overview-cards";
import BalanceChart from "@/components/dashboard/balance-chart";
import ExpenseChart from "@/components/dashboard/expense-chart";
import FixedExpenses from "@/components/dashboard/fixed-expenses";
import Installments from "@/components/dashboard/installments";
import DebtorsOverview from "@/components/dashboard/debtors-overview";
import TransactionForm from "@/components/forms/transaction-form";
import { useState } from "react";

export default function Dashboard() {
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">FinanceControl</h1>
      </div>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h2>
              <p className="text-gray-600">Controle completo das suas finanças pessoais</p>
            </div>
            <div className="flex space-x-3">
              <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Transação
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Transação</DialogTitle>
                  </DialogHeader>
                  <TransactionForm onSuccess={() => setIsTransactionDialogOpen(false)} />
                </DialogContent>
              </Dialog>
              
              <Button onClick={handleExportExcel} className="bg-success hover:bg-success/90">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <OverviewCards data={dashboardData} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BalanceChart />
          <ExpenseChart />
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <FixedExpenses expenses={dashboardData?.fixedExpenses || []} />
          <Installments installments={dashboardData?.activeInstallments || []} />
        </div>

        {/* Debtors */}
        <DebtorsOverview debtors={dashboardData?.recentDebtors || []} />

        {/* Critical Months Alert */}
        {dashboardData?.currentBalance < 0 && (
          <Card className="bg-yellow-50 border-yellow-200 mb-8">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Atenção: Saldo Negativo</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Seu saldo atual está negativo. Considere revisar suas despesas ou buscar receitas adicionais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <Plus className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-semibold text-gray-900">Adicionar Receita</h4>
              <p className="text-sm text-gray-600">Registrar novo crédito</p>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <Plus className="h-6 w-6 text-error mb-2" />
              <h4 className="font-semibold text-gray-900">Adicionar Despesa</h4>
              <p className="text-sm text-gray-600">Registrar nova despesa</p>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <Plus className="h-6 w-6 text-warning mb-2" />
              <h4 className="font-semibold text-gray-900">Novo Parcelamento</h4>
              <p className="text-sm text-gray-600">Registrar compra parcelada</p>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleExportExcel}>
            <CardContent className="p-4">
              <Download className="h-6 w-6 text-success mb-2" />
              <h4 className="font-semibold text-gray-900">Exportar Dados</h4>
              <p className="text-sm text-gray-600">Gerar relatório Excel</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
