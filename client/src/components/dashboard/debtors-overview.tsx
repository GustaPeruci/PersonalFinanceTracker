import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Plus, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { Debtor } from "@shared/schema";

interface DebtorsOverviewProps {
  debtors: Debtor[];
}

export default function DebtorsOverview({ debtors }: DebtorsOverviewProps) {
  const getStatusIcon = (debtor: Debtor) => {
    const totalAmount = parseFloat(debtor.totalAmount);
    const paidAmount = parseFloat(debtor.paidAmount);
    const balance = totalAmount - paidAmount;
    
    if (balance <= 0) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    } else if (paidAmount === 0) {
      return <AlertTriangle className="h-4 w-4 text-error" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (debtor: Debtor) => {
    const totalAmount = parseFloat(debtor.totalAmount);
    const paidAmount = parseFloat(debtor.paidAmount);
    const balance = totalAmount - paidAmount;
    
    if (balance <= 0) {
      return <Badge className="bg-success/10 text-success">Pago</Badge>;
    } else if (paidAmount === 0) {
      return <Badge className="bg-error/10 text-error">Atrasado</Badge>;
    } else {
      return <Badge className="bg-warning/10 text-warning">Parcial</Badge>;
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Controle de Devedores</CardTitle>
          <Link href="/debtors">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Devedor
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {debtors.slice(0, 3).map((debtor) => {
            const totalAmount = parseFloat(debtor.totalAmount);
            const paidAmount = parseFloat(debtor.paidAmount);
            const balance = totalAmount - paidAmount;
            
            return (
              <div key={debtor.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{debtor.name}</h4>
                  <span className="text-sm font-medium text-warning">
                    R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span>R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pago:</span>
                    <span>R$ {paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {debtor.description && (
                    <div className="text-xs text-gray-500 mt-2">
                      {debtor.description}
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(debtor)}
                      <span className="text-sm ml-2">Status:</span>
                    </div>
                    {getStatusBadge(debtor)}
                  </div>
                </div>
              </div>
            );
          })}
          
          {debtors.length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum devedor cadastrado</p>
              <Link href="/debtors">
                <Button className="mt-4 bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Devedor
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {debtors.length > 3 && (
          <div className="mt-6 text-center">
            <Link href="/debtors">
              <Button variant="outline">
                Ver Todos os Devedores ({debtors.length})
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
