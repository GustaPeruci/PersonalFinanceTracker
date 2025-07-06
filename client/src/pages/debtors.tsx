import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, AlertTriangle, CheckCircle } from "lucide-react";
import DebtorForm from "@/components/forms/debtor-form";
import { useState } from "react";
import { Debtor } from "@shared/schema";

export default function Debtors() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: debtors = [], isLoading } = useQuery({
    queryKey: ["/api/debtors"],
  });

  const getStatusBadge = (debtor: Debtor) => {
    const totalAmount = parseFloat(debtor.totalAmount);
    const paidAmount = parseFloat(debtor.paidAmount);
    const balance = totalAmount - paidAmount;
    
    if (balance <= 0) {
      return <Badge className="bg-success/10 text-success">Pago</Badge>;
    } else if (paidAmount === 0) {
      return <Badge className="bg-error/10 text-error">Não Pago</Badge>;
    } else {
      return <Badge className="bg-warning/10 text-warning">Pagamento Parcial</Badge>;
    }
  };

  const getStatusIcon = (debtor: Debtor) => {
    const totalAmount = parseFloat(debtor.totalAmount);
    const paidAmount = parseFloat(debtor.paidAmount);
    const balance = totalAmount - paidAmount;
    
    if (balance <= 0) {
      return <CheckCircle className="h-5 w-5 text-success" />;
    } else if (paidAmount === 0) {
      return <AlertTriangle className="h-5 w-5 text-error" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-warning" />;
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
        <h1 className="text-lg font-semibold text-gray-900">Devedores</h1>
      </div>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Controle de Devedores</h2>
              <p className="text-gray-600">Acompanhe quem deve dinheiro para você</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Devedor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Devedor</DialogTitle>
                </DialogHeader>
                <DebtorForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6">
          {debtors.map((debtor: Debtor) => {
            const totalAmount = parseFloat(debtor.totalAmount);
            const paidAmount = parseFloat(debtor.paidAmount);
            const balance = totalAmount - paidAmount;
            
            return (
              <Card key={debtor.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(debtor)}
                      <div>
                        <CardTitle className="text-lg">{debtor.name}</CardTitle>
                        {debtor.description && (
                          <p className="text-sm text-gray-600">{debtor.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {getStatusBadge(debtor)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="font-semibold">R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor Pago</p>
                      <p className="font-semibold text-success">R$ {paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  
                  {debtor.dueDate && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Vencimento:</span>
                        <span className="font-medium">
                          {new Date(debtor.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {debtors.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum devedor cadastrado</h3>
                <p className="text-gray-600 mb-4">Adicione pessoas que devem dinheiro para você e acompanhe os pagamentos.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Devedor
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
