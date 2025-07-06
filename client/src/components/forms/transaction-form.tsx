import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertTransactionSchema.extend({
  amount: z.string().min(1, "Valor é obrigatório"),
  startDate: z.string().min(1, "Data é obrigatória"),
});

type FormData = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onSuccess?: () => void;
}

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      installments: 1,
      remainingInstallments: 1,
      isActive: true,
    },
  });

  const transactionType = watch("type");

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount.replace(',', '.')),
        installments: parseInt(data.installments?.toString() || '1'),
        remainingInstallments: parseInt(data.remainingInstallments?.toString() || '1'),
      };
      
      return await apiRequest("POST", "/api/transactions", payload);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Transação criada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar transação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="type">Tipo</Label>
        <Select onValueChange={(value) => setValue("type", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit">Receita</SelectItem>
            <SelectItem value="fixed_expense">Despesa Fixa</SelectItem>
            <SelectItem value="installment">Despesa Parcelada</SelectItem>
            <SelectItem value="loan">Empréstimo</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          placeholder="Ex: Salário, Conta de luz..."
          {...register("description")}
        />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <Label htmlFor="amount">Valor</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0,00"
          {...register("amount")}
        />
        {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <Label htmlFor="category">Categoria</Label>
        <Select onValueChange={(value) => setValue("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="education">Educação</SelectItem>
            <SelectItem value="transport">Transporte</SelectItem>
            <SelectItem value="subscription">Assinatura</SelectItem>
            <SelectItem value="health">Saúde</SelectItem>
            <SelectItem value="food">Alimentação</SelectItem>
            <SelectItem value="entertainment">Entretenimento</SelectItem>
            <SelectItem value="utilities">Serviços</SelectItem>
            <SelectItem value="other">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(transactionType === "installment" || transactionType === "loan") && (
        <div>
          <Label htmlFor="installments">Número de Parcelas</Label>
          <Input
            id="installments"
            type="number"
            min="1"
            placeholder="1"
            {...register("installments")}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              setValue("installments", value);
              setValue("remainingInstallments", value);
            }}
          />
          {errors.installments && <p className="text-sm text-red-600 mt-1">{errors.installments.message}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="startDate">Data de Início</Label>
        <Input
          id="startDate"
          type="date"
          {...register("startDate")}
        />
        {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="submit" disabled={mutation.isPending} className="bg-primary hover:bg-primary/90">
          {mutation.isPending ? "Criando..." : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
