import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, AlertTriangle, CheckCircle, Search, Filter, ArrowUpDown, DollarSign, Calendar, Edit, Trash2, X } from "lucide-react";
import { Debtor } from "@shared/schema";
import DebtorForm from "@/components/forms/debtor-form";
import { useToast } from "@/hooks/use-toast";

export default function Debtors() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDebtor, setEditingDebtor] = useState<Debtor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: debtors = [], isLoading } = useQuery({
    queryKey: ["/api/debtors"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/debtors/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete debtor');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/debtors"] });
      toast({
        title: "Devedor removido",
        description: "O devedor foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o devedor.",
        variant: "destructive",
      });
    },
  });

  // Filter and sort debtors
  const filteredDebtors = useMemo(() => {
    let filtered = [...debtors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((debtor: Debtor) =>
        debtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debtor.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((debtor: Debtor) => {
        const balance = getBalance(debtor);
        switch (statusFilter) {
          case "paid":
            return balance <= 0;
          case "partial":
            return balance > 0 && parseFloat(debtor.paidAmount) > 0;
          case "unpaid":
            return parseFloat(debtor.paidAmount) === 0;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a: Debtor, b: Debtor) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "totalAmount":
          aValue = parseFloat(a.totalAmount);
          bValue = parseFloat(b.totalAmount);
          break;
        case "balance":
          aValue = getBalance(a);
          bValue = getBalance(b);
          break;
        case "date":
          aValue = new Date(a.dueDate || a.createdAt);
          bValue = new Date(b.dueDate || b.createdAt);
          break;
        case "name":
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [debtors, searchTerm, statusFilter, sortBy, sortOrder]);

  const getBalance = (debtor: Debtor) => {
    return parseFloat(debtor.totalAmount) - parseFloat(debtor.paidAmount);
  };

  const getStatusBadge = (debtor: Debtor) => {
    const balance = getBalance(debtor);
    const paidAmount = parseFloat(debtor.paidAmount);
    
    if (balance <= 0) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Pago</Badge>;
    } else if (paidAmount === 0) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Não Pago</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pagamento Parcial</Badge>;
    }
  };

  const getStatusIcon = (debtor: Debtor) => {
    const balance = getBalance(debtor);
    const paidAmount = parseFloat(debtor.paidAmount);
    
    if (balance <= 0) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (paidAmount === 0) {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("name");
    setSortOrder("asc");
  };

  const handleEdit = (debtor: Debtor) => {
    setEditingDebtor(debtor);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDebtor(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Devedores</h1>
        </div>
        <div className="text-center py-8">Carregando devedores...</div>
      </div>
    );
  }

  const totalOwed = debtors.reduce((sum: number, debtor: Debtor) => sum + getBalance(debtor), 0);
  const totalPaid = debtors.reduce((sum: number, debtor: Debtor) => sum + parseFloat(debtor.paidAmount), 0);
  const totalAmount = debtors.reduce((sum: number, debtor: Debtor) => sum + parseFloat(debtor.totalAmount), 0);

  return (
    <div className="space-y-6 p-6 bg-background text-foreground min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Controle de Devedores</h1>
          <Badge variant="outline">{filteredDebtors.length} de {debtors.length}</Badge>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDebtor(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Devedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDebtor ? "Editar Devedor" : "Novo Devedor"}
              </DialogTitle>
            </DialogHeader>
            <DebtorForm onSuccess={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Emprestado</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Recebido</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">A Receber</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalOwed)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Devedores</p>
                <p className="text-2xl font-bold text-purple-600">
                  {debtors.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="partial">Pagamento Parcial</SelectItem>
                <SelectItem value="unpaid">Não Pagos</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debtors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Devedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Nome
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted text-right"
                    onClick={() => toggleSort("totalAmount")}
                  >
                    <div className="flex items-center gap-2 justify-end">
                      Valor Total
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Valor Pago</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted text-right"
                    onClick={() => toggleSort("balance")}
                  >
                    <div className="flex items-center gap-2 justify-end">
                      Saldo Devedor
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Vencimento
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDebtors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {debtors.length === 0 
                        ? "Nenhum devedor encontrado. Clique em 'Novo Devedor' para começar."
                        : "Nenhum devedor corresponde aos filtros aplicados."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDebtors.map((debtor: Debtor) => (
                    <TableRow key={debtor.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(debtor)}
                          {getStatusBadge(debtor)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {debtor.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {debtor.description || '-'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(debtor.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        {formatCurrency(debtor.paidAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={getBalance(debtor) <= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {formatCurrency(getBalance(debtor))}
                        </span>
                      </TableCell>
                      <TableCell>
                        {debtor.dueDate ? formatDate(debtor.dueDate) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(debtor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o devedor "{debtor.name}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(debtor.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}