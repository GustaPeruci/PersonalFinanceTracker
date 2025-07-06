import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface OverviewCardsProps {
  data?: {
    currentBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    amountToReceive: number;
  };
}

export default function OverviewCards({ data }: OverviewCardsProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo Atual</p>
              <p className={`text-2xl font-bold ${
                data.currentBalance >= 0 ? 'text-success' : 'text-error'
              }`}>
                R$ {data.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-success/10 p-3 rounded-full">
              <Wallet className="h-6 w-6 text-success" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <span className={`inline-flex items-center ${
              data.currentBalance >= 0 ? 'text-success' : 'text-error'
            }`}>
              {data.currentBalance >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {data.currentBalance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receitas Mensais</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {data.monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Entrada de recursos</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Despesas Mensais</p>
              <p className="text-2xl font-bold text-error">
                R$ {data.monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-error/10 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-error" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Fixas + Parceladas</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">A Receber</p>
              <p className="text-2xl font-bold text-warning">
                R$ {data.amountToReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-warning/10 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-warning" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">De devedores</p>
        </CardContent>
      </Card>
    </div>
  );
}
