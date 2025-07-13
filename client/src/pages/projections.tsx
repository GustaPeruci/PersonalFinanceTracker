import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, AlertTriangle, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { apiRequest } from "@/lib/queryClient";

interface MonthlyProjection {
  year: number;
  month: number;
  monthName: string;
  income: number;
  fixedExpenses: number;
  installments: number;
  totalExpenses: number;
  netBalance: number;
  accumulatedBalance: number;
}

interface ProjectionAnalysis {
  currentProjections: MonthlyProjection[];
  newProjections: MonthlyProjection[];
  impact: {
    monthlyImpact: number;
    totalImpact: number;
    criticalMonths: string[];
    recommendedAction: string;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export default function Projections() {
  const [newTransaction, setNewTransaction] = useState({
    type: 'fixed_expense',
    description: '',
    amount: '',
    category: 'other',
    startDate: new Date().toISOString().split('T')[0],
    installments: 1
  });
  
  const [showAnalysis, setShowAnalysis] = useState(false);

  const { data: projections, isLoading } = useQuery({
    queryKey: ['/api/projections'],
    queryFn: () => fetch('/api/projections?months=12').then(res => res.json())
  });

  const analyzeTransactionMutation = useMutation({
    mutationFn: (data: any) => apiRequest({
      url: '/api/projections/analyze',
      method: 'POST',
      body: data
    }),
    onSuccess: () => {
      setShowAnalysis(true);
    }
  });

  const handleAnalyze = () => {
    if (!newTransaction.description || !newTransaction.amount) {
      return;
    }
    
    analyzeTransactionMutation.mutate(newTransaction);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <TrendingDown className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Projeções Financeiras</h1>
        </div>
        <div className="text-center py-8">Carregando projeções...</div>
      </div>
    );
  }

  const analysis = analyzeTransactionMutation.data as ProjectionAnalysis;

  return (
    <div className="space-y-6 p-6 bg-background text-foreground min-h-screen">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Projeções Financeiras</h1>
      </div>

      {/* Transaction Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle>Simular Nova Transação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={newTransaction.type} 
                onValueChange={(value) => setNewTransaction(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Receita</SelectItem>
                  <SelectItem value="fixed_expense">Gasto Fixo</SelectItem>
                  <SelectItem value="installment">Parcelamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Novo empréstimo"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            {newTransaction.type === 'installment' && (
              <div className="space-y-2">
                <Label>Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  value={newTransaction.installments}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, installments: parseInt(e.target.value) }))}
                />
              </div>
            )}
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={!newTransaction.description || !newTransaction.amount || analyzeTransactionMutation.isPending}
            className="w-full"
          >
            {analyzeTransactionMutation.isPending ? 'Analisando...' : 'Analisar Impacto'}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {showAnalysis && analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Análise de Impacto
              <Badge className={getRiskColor(analysis.impact.riskLevel)}>
                {getRiskIcon(analysis.impact.riskLevel)}
                {analysis.impact.riskLevel === 'low' ? 'Baixo Risco' : 
                 analysis.impact.riskLevel === 'medium' ? 'Risco Médio' : 'Alto Risco'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                {analysis.impact.recommendedAction}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(analysis.impact.monthlyImpact)}
                    </div>
                    <div className="text-sm text-gray-500">Impacto Mensal</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(analysis.impact.totalImpact)}
                    </div>
                    <div className="text-sm text-gray-500">Impacto Total</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {analysis.impact.criticalMonths.length}
                    </div>
                    <div className="text-sm text-gray-500">Meses Críticos</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {analysis.impact.criticalMonths.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Meses com Possíveis Dificuldades:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.impact.criticalMonths.map((month, index) => (
                    <Badge key={index} variant="destructive">{month}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Projections Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Projeção dos Próximos 12 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          {projections && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value)]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="netBalance" 
                  stroke="#8884d8" 
                  name="Saldo Mensal"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="accumulatedBalance" 
                  stroke="#82ca9d" 
                  name="Saldo Acumulado"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      {showAnalysis && analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação: Antes vs Depois</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analysis.currentProjections.map((current, index) => ({
                month: current.monthName,
                antes: current.accumulatedBalance,
                depois: analysis.newProjections[index]?.accumulatedBalance || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value)]}
                />
                <Bar dataKey="antes" fill="#8884d8" name="Antes" />
                <Bar dataKey="depois" fill="#82ca9d" name="Depois" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Monthly Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Mês</th>
                  <th className="text-right py-2">Receitas</th>
                  <th className="text-right py-2">Gastos Fixos</th>
                  <th className="text-right py-2">Parcelas</th>
                  <th className="text-right py-2">Saldo Mensal</th>
                  <th className="text-right py-2">Saldo Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {projections?.map((projection: MonthlyProjection, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{projection.monthName}/{projection.year}</td>
                    <td className="text-right py-2 text-green-600">
                      {formatCurrency(projection.income)}
                    </td>
                    <td className="text-right py-2 text-red-600">
                      {formatCurrency(projection.fixedExpenses)}
                    </td>
                    <td className="text-right py-2 text-orange-600">
                      {formatCurrency(projection.installments)}
                    </td>
                    <td className={`text-right py-2 ${projection.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(projection.netBalance)}
                    </td>
                    <td className={`text-right py-2 ${projection.accumulatedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(projection.accumulatedBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}