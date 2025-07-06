import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, CreditCard, TrendingUp, TrendingDown, Edit, Trash2 } from "lucide-react";
import TransactionForm from "@/components/forms/transaction-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Transaction } from "@shared/schema";

export default function Transactions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Transação removida",
        description: "A transação foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover a transação.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
  };

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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transações</h2>
              <p className="text-gray-600 dark:text-gray-400">Histórico completo de receitas e despesas</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Transação
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTransaction ? "Editar Transação" : "Adicionar Nova Transação"}
                    </DialogTitle>
                  </DialogHeader>
                  <TransactionForm 
                    onSuccess={handleCloseDialog}
                    defaultValues={editingTransaction ? {
                      type: editingTransaction.type,
                      description: editingTransaction.description,
                      amount: editingTransaction.amount,
                      category: editingTransaction.category || '',
                      startDate: editingTransaction.startDate,
                      endDate: editingTransaction.endDate || undefined,
                      installments: editingTransaction.installments || 1,
                      remainingInstallments: editingTransaction.remainingInstallments || 1,
                      isActive: editingTransaction.isActive ?? true
                    } : undefined}
                    editMode={!!editingTransaction}
                    editId={editingTransaction?.id}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {(transactions as Transaction[]).map((transaction: Transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{transaction.description}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(transaction.startDate).toLocaleDateString('pt-BR')}
                        {(transaction.installments || 1) > 1 && (
                          <span className="ml-2">
                            • {transaction.remainingInstallments}/{transaction.installments || 1} parcelas
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a transação "{transaction.description}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(transaction.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
