import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@shared/schema";
import { 
  Youtube, 
  University, 
  TrendingUp, 
  CreditCard, 
  Wifi 
} from "lucide-react";

interface FixedExpensesProps {
  expenses: Transaction[];
}

export default function FixedExpenses({ expenses }: FixedExpensesProps) {
  const getExpenseIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('youtube')) return <Youtube className="h-5 w-5 text-red-500" />;
    if (desc.includes('viacredi') || desc.includes('taxa')) return <University className="h-5 w-5 text-blue-500" />;
    if (desc.includes('aplicacao') || desc.includes('investimento')) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (desc.includes('cotas')) return <CreditCard className="h-5 w-5 text-purple-500" />;
    if (desc.includes('internet')) return <Wifi className="h-5 w-5 text-indigo-500" />;
    return <CreditCard className="h-5 w-5 text-gray-500" />;
  };

  const totalFixed = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Despesas Fixas Mensais</CardTitle>
          <span className="text-sm text-gray-500">
            R$ {totalFixed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {getExpenseIcon(expense.description)}
                <span className="text-sm font-medium ml-3">{expense.description}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                R$ {parseFloat(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          
          {expenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma despesa fixa cadastrada</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
