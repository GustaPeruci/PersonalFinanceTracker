import { storage } from "./storage";

export async function seedDatabase() {
  try {
    // Add the WEG credit first
    await storage.createTransaction({
      type: "credit",
      description: "WEG",
      amount: "3858.61",
      category: "salary",
      startDate: "2025-07-01",
      endDate: null,
      installments: 1,
      remainingInstallments: 1,
      isActive: true,
      userId: 1,
    });

    // Add fixed monthly expenses
    const fixedExpenses = [
      { description: "YouTube Premium", amount: "24.90", category: "subscription" },
      { description: "Taxa de serviço Viacredi", amount: "16.90", category: "services" },
      { description: "Aplicação programada", amount: "20.00", category: "investment" },
      { description: "Cotas Viacredi", amount: "35.00", category: "investment" },
      { description: "Plano de internet", amount: "65.00", category: "utilities" },
    ];

    for (const expense of fixedExpenses) {
      await storage.createTransaction({
        type: "fixed_expense",
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        startDate: "2025-07-01",
        endDate: null,
        installments: 1,
        remainingInstallments: 1,
        isActive: true,
        userId: 1,
      });
    }

    // Add installment payments
    const installments = [
      { description: "Faculdade", amount: "1490.32", installments: 6, startDate: "2025-07-01", category: "education" },
      { description: "Tênis Vans", amount: "126.63", installments: 3, startDate: "2025-07-01", category: "clothing" },
      { description: "Cafeteira mãe", amount: "22.50", installments: 10, startDate: "2025-06-01", category: "appliances" },
      { description: "Troca de óleo carro pai", amount: "80.26", installments: 4, startDate: "2025-05-01", category: "transport" },
      { description: "Fluency (inglês)", amount: "97.00", installments: 12, startDate: "2025-04-01", category: "education" },
      { description: "Oralfun aparelho", amount: "129.00", installments: 6, startDate: "2025-04-01", category: "health" },
      { description: "Relógio", amount: "49.00", installments: 12, startDate: "2025-04-01", category: "accessories" },
      { description: "Controle Kabum", amount: "28.93", installments: 10, startDate: "2025-08-01", category: "electronics" },
      { description: "Empréstimo moto", amount: "222.21", installments: 19, startDate: "2025-03-01", category: "transport" },
      { description: "Extração de sisos", amount: "30.00", installments: 97, startDate: "2021-08-01", category: "health" },
    ];

    for (const installment of installments) {
      await storage.createTransaction({
        type: "installment",
        description: installment.description,
        amount: installment.amount,
        category: installment.category,
        startDate: installment.startDate,
        endDate: null,
        installments: installment.installments,
        remainingInstallments: installment.installments,
        isActive: true,
        userId: 1,
      });
    }

    // Add debtors
    const debtors = [
      {
        name: "Pai",
        totalAmount: "253.01", // 44.94 + 32.20 + 175.87
        description: "Carburador (12x 44.94), Masseira mãe (10x 32.20), Empréstimo (45x 175.87)",
        status: "active"
      },
      {
        name: "Mãe", 
        totalAmount: "322.00", // 32.20 * 10
        description: "Masseira (10x 32.20) - não pagou nenhuma parcela",
        status: "active"
      },
      {
        name: "Giovanna",
        totalAmount: "225.00", // 22.50 * 10
        description: "Cafeteira mãe (10x 22.50)",
        status: "active"
      }
    ];

    for (const debtor of debtors) {
      await storage.createDebtor({
        name: debtor.name,
        totalAmount: debtor.totalAmount,
        paidAmount: "0",
        description: debtor.description,
        status: debtor.status,
        dueDate: null,
        userId: 1,
      });
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log("Seeding completed");
    process.exit(0);
  });
}