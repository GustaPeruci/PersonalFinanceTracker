import { storage } from "./storage";

async function seedCompleteData() {
  try {
    console.log("Starting to seed complete financial data...");

    // 0. Create a user first (required for foreign key)
    console.log("Creating default user...");
    try {
      await storage.createUser({
        username: "user",
        password: "password123",
      });
      console.log("✅ Default user created");
    } catch (error) {
      console.log("ℹ️  User might already exist, continuing...");
    }

    // 1. Add the WEG credit
    console.log("Adding WEG credit...");
    await storage.createTransaction({
      type: "credit",
      description: "WEG",
      amount: 3858.61,
      category: "salary",
      startDate: "2025-07-01",
      endDate: null,
      installments: 1,
      remainingInstallments: 1,
      isActive: true,
      userId: 1,
    });

    // 2. Add fixed monthly expenses
    console.log("Adding fixed monthly expenses...");
    const fixedExpenses = [
      { description: "YouTube Premium", amount: 24.90, category: "subscription" },
      { description: "Taxa de serviço Viacredi", amount: 16.90, category: "services" },
      { description: "Aplicação programada", amount: 20.00, category: "investment" },
      { description: "Cotas Viacredi", amount: 35.00, category: "investment" },
      { description: "Plano de internet", amount: 65.00, category: "utilities" },
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

    // 3. Add installment payments
    console.log("Adding installment payments...");
    const installments = [
      { description: "Faculdade", amount: 1490.32, installments: 6, startDate: "2025-07-01", category: "education" },
      { description: "Faculdade (Jan-Fev 2026)", amount: 900.00, installments: 2, startDate: "2026-01-01", category: "education" },
      { description: "Tênis Vans", amount: 126.63, installments: 3, startDate: "2025-07-01", category: "clothing" },
      { description: "Cafeteira mãe", amount: 22.50, installments: 10, startDate: "2025-06-01", category: "appliances" },
      { description: "Troca de óleo carro pai", amount: 80.26, installments: 4, startDate: "2025-05-01", category: "transport" },
      { description: "Fluency (inglês)", amount: 97.00, installments: 12, startDate: "2025-04-01", category: "education" },
      { description: "Oralfun aparelho", amount: 129.00, installments: 6, startDate: "2025-04-01", category: "health" },
      { description: "Relógio", amount: 49.00, installments: 12, startDate: "2025-04-01", category: "accessories" },
      { description: "Controle Kabum", amount: 28.93, installments: 10, startDate: "2025-08-01", category: "electronics" },
      { description: "Empréstimo moto", amount: 222.21, installments: 19, startDate: "2025-03-01", category: "transport" },
      { description: "Extração de sisos", amount: 30.00, installments: 97, startDate: "2021-08-01", category: "health" },
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

    // 4. Add debtors
    console.log("Adding debtors...");
    
    // Pai
    const pai = await storage.createDebtor({
      name: "Pai",
      totalAmount: 252.01, // Sum of all debts: 44.94 + 32.20 + 175.87
      paidAmount: 0,
      description: "Múltiplas dívidas: carburador, masseira, empréstimo",
      dueDate: "2026-12-31",
      status: "active",
      userId: 1,
    });

    // Mãe
    const mae = await storage.createDebtor({
      name: "Mãe",
      totalAmount: 32.20,
      paidAmount: 0,
      description: "Masseira (10 parcelas não pagas)",
      dueDate: "2025-12-31",
      status: "active",
      userId: 1,
    });

    // Giovanna
    const giovanna = await storage.createDebtor({
      name: "Giovanna",
      totalAmount: 22.50,
      paidAmount: 0,
      description: "Cafeteira mãe (10 parcelas)",
      dueDate: "2026-04-30",
      status: "active",
      userId: 1,
    });

    console.log("✅ Complete financial data seeded successfully!");
    console.log("📊 Summary:");
    console.log("- 1 credit added (WEG)");
    console.log("- 5 fixed expenses added");
    console.log("- 11 installment payments added");
    console.log("- 3 debtors added (Pai, Mãe, Giovanna)");
    
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
}

// Run the seeding
seedCompleteData();