import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@shared/schema";
import { CreditCard, GraduationCap, Car, ShoppingBag } from "lucide-react";

interface InstallmentsProps {
  installments: Transaction[];
}

export default function Installments({ installments }: InstallmentsProps) {
  const getInstallmentIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('faculdade')) return <GraduationCap className="h-5 w-5 text-red-500" />;
    if (desc.includes('moto') || desc.includes('carro')) return <Car className="h-5 w-5 text-blue-500" />;
    if (desc.includes('tenis') || desc.includes('roupa')) return <ShoppingBag className="h-5 w-5 text-green-500" />;
    return <CreditCard className="h-5 w-5 text-purple-500" />;
  };

  const getInstallmentBadge = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('faculdade')) return 'bg-red-50 border-red-200';
    return 'bg-gray-50';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Parcelamentos Ativos</CardTitle>
          <span className="text-sm text-gray-500">{installments.length} ativos</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {installments.map((installment) => (
            <div 
              key={installment.id} 
              className={`flex items-center justify-between p-3 rounded-lg border ${
                getInstallmentBadge(installment.description)
              }`}
            >
              <div className="flex items-center">
                {getInstallmentIcon(installment.description)}
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">{installment.description}</span>
                  <p className="text-xs text-gray-500">
                    {installment.installments}x de R$ {parseFloat(installment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">
                  R$ {parseFloat(installment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-xs text-gray-500">
                  {installment.remainingInstallments} restantes
                </p>
              </div>
            </div>
          ))}
          
          {installments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum parcelamento ativo</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
