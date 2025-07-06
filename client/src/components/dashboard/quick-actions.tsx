import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Download } from "lucide-react";
import TransactionForm from "@/components/forms/transaction-form";
import DebtorForm from "@/components/forms/debtor-form";
import { useState } from "react";

export default function QuickActions() {
  const [activeDialog, setActiveDialog] = useState<'income' | 'expense' | 'installment' | 'debtor' | null>(null);

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

  const getFormProps = (type: string) => {
    switch (type) {
      case 'income':
        return { type: 'credit', description: '', category: 'other' };
      case 'expense':
        return { type: 'fixed_expense', description: '', category: 'other' };
      case 'installment':
        return { type: 'installment', description: '', category: 'other' };
      default:
        return { type: 'credit', description: '', category: 'other' };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Dialog open={activeDialog === 'income'} onOpenChange={(open) => setActiveDialog(open ? 'income' : null)}>
        <DialogTrigger asChild>
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <Plus className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-semibold text-gray-900">Adicionar Receita</h4>
              <p className="text-sm text-gray-600">Registrar novo crédito</p>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Receita</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            defaultValues={{ type: 'credit' }}
            onSuccess={() => setActiveDialog(null)} 
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={activeDialog === 'expense'} onOpenChange={(open) => setActiveDialog(open ? 'expense' : null)}>
        <DialogTrigger asChild>
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <Plus className="h-6 w-6 text-error mb-2" />
              <h4 className="font-semibold text-gray-900">Adicionar Despesa</h4>
              <p className="text-sm text-gray-600">Registrar nova despesa</p>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Despesa</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            defaultValues={{ type: 'fixed_expense' }}
            onSuccess={() => setActiveDialog(null)} 
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={activeDialog === 'installment'} onOpenChange={(open) => setActiveDialog(open ? 'installment' : null)}>
        <DialogTrigger asChild>
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <Plus className="h-6 w-6 text-warning mb-2" />
              <h4 className="font-semibold text-gray-900">Novo Parcelamento</h4>
              <p className="text-sm text-gray-600">Registrar compra parcelada</p>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Parcelamento</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            defaultValues={{ type: 'installment' }}
            onSuccess={() => setActiveDialog(null)} 
          />
        </DialogContent>
      </Dialog>
      
      <Card className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleExportExcel}>
        <CardContent className="p-4">
          <Download className="h-6 w-6 text-success mb-2" />
          <h4 className="font-semibold text-gray-900">Exportar Dados</h4>
          <p className="text-sm text-gray-600">Gerar relatório Excel</p>
        </CardContent>
      </Card>
    </div>
  );
}