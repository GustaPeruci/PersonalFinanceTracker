import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, CreditCard, TrendingUp, TrendingDown } from "lucide-react";
import TransactionForm from "@/components/forms/transaction-form";
import { useState } from "react";
import { Transaction } from "@shared/schema";

export default function Transactions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'fixed_expense':
        return <TrendingDown className="h-4 w-4 text-error" />;
      case 'installment':
        return <CreditCard className="h-4 w-4 text-warning" />;
      case 'loan':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'credit':
        return <Badge className="bg-success/10 text-success">Crédito</Badge>;
      case 'fixed_expense':
        return <Badge className="bg-error/10 text-error">Despesa Fixa</Badge>;
      case 'installment':
        return <Badge className="bg-warning/10 text-warning">Parcelamento</Badge>;
      case 'loan':
        return <Badge className="bg-purple-100 text-purple-700">Empréstimo</Badge>;
      default:
        return <Badge variant="secondary">Outros</Badge>;
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
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Transações</h1>
      </div>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transações</h2>
              <p className="text-gray-600">Histórico completo de receitas e despesas</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <TransactionForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4">
          {transactions.map((transaction: Transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.startDate).toLocaleDateString('pt-BR')}
                        {transaction.installments > 1 && (
                          <span className="ml-2">
                            • {transaction.remainingInstallments}/{transaction.installments} parcelas
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getTransactionBadge(transaction.type)}
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'credit' ? 'text-success' : 'text-error'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}R$ {parseFloat(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {transaction.category && (
                        <p className="text-sm text-gray-500">{transaction.category}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {transactions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma transação encontrada</h3>
                <p className="text-gray-600 mb-4">Adicione sua primeira transação para começar a controlar suas finanças.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Transação
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
