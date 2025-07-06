import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BalanceChart() {
  const currentYear = new Date().getFullYear();
  
  const { data: balances = [] } = useQuery({
    queryKey: [`/api/monthly-balances/${currentYear}`],
  });

  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const chartData = months.map((month, index) => {
    const monthData = balances.find((b: any) => b.month === index + 1);
    return {
      month,
      balance: monthData ? parseFloat(monthData.balance) : 0,
      accumulated: monthData ? parseFloat(monthData.accumulatedBalance) : 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saldo Mensal - {currentYear}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Tooltip 
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  'Saldo'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="hsl(207, 90%, 54%)" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
