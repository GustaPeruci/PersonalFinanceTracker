import { db } from './db';
import { users, transactions, debtors, debtorPayments, monthlyBalances } from '@shared/schema';

// Create tables manually using raw SQL for SQLite
async function initializeDatabase() {
  try {
    // Create users table
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);

    // Create transactions table
    await db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT,
        installments INTEGER DEFAULT 1,
        remaining_installments INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create debtors table
    await db.run(`
      CREATE TABLE IF NOT EXISTS debtors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        name TEXT NOT NULL,
        total_amount REAL NOT NULL,
        paid_amount REAL DEFAULT 0,
        description TEXT,
        due_date TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create debtor_payments table
    await db.run(`
      CREATE TABLE IF NOT EXISTS debtor_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        debtor_id INTEGER REFERENCES debtors(id),
        amount REAL NOT NULL,
        payment_date TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create monthly_balances table
    await db.run(`
      CREATE TABLE IF NOT EXISTS monthly_balances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        income REAL DEFAULT 0,
        expenses REAL DEFAULT 0,
        balance REAL DEFAULT 0,
        accumulated_balance REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initializeDatabase();