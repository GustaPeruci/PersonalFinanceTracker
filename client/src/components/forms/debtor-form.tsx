import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertDebtorSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertDebtorSchema.extend({
  totalAmount: z.string().min(1, "Valor é obrigatório"),
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DebtorFormProps {
  onSuccess?: () => void;
}

export default function DebtorForm({ onSuccess }: DebtorFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paidAmount: "0",
      status: "active",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        totalAmount: parseFloat(data.totalAmount.replace(',', '.')),
        paidAmount: "0",
        dueDate: data.dueDate || undefined,
      };
      
      return await apiRequest("POST", "/api/debtors", payload);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Devedor cadastrado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/debtors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar devedor. Tente novamente.",
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
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          placeholder="Nome do devedor"
          {...register("name")}
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="totalAmount">Valor Total</Label>
        <Input
          id="totalAmount"
          type="number"
          step="0.01"
          placeholder="0,00"
          {...register("totalAmount")}
        />
        {errors.totalAmount && <p className="text-sm text-red-600 mt-1">{errors.totalAmount.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Descrição da dívida..."
          {...register("description")}
        />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <Label htmlFor="dueDate">Data de Vencimento (opcional)</Label>
        <Input
          id="dueDate"
          type="date"
          {...register("dueDate")}
        />
        {errors.dueDate && <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="submit" disabled={mutation.isPending} className="bg-primary hover:bg-primary/90">
          {mutation.isPending ? "Cadastrando..." : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
