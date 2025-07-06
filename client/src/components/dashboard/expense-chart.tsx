import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function ExpenseChart() {
  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const expenses = transactions.filter((t: any) => t.type !== 'credit');
  
  const expensesByCategory = expenses.reduce((acc: any, transaction: any) => {
    const category = transaction.category || 'Outros';
    acc[category] = (acc[category] || 0) + parseFloat(transaction.amount);
    return acc;
  }, {});

  const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount as number,
  }));

  const COLORS = [
    'hsl(0, 84.2%, 60.2%)',   // error
    'hsl(25, 95%, 53%)',      // warning
    'hsl(207, 90%, 54%)',     // primary
    'hsl(262, 83%, 58%)',     // purple
    'hsl(142, 76%, 36%)',     // success
    'hsl(346, 87%, 43%)',     // pink
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  'Valor'
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
