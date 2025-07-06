import { Link, useLocation } from "wouter";
import { Home, Plus, Users, BarChart3, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Adicionar Transação", href: "/transactions", icon: Plus },
  { name: "Devedores", href: "/debtors", icon: Users },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex w-64 flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">
                <span className="text-primary mr-2">💰</span>
                FinanceControl
              </h1>
            </div>
            <nav className="mt-8 flex-1 space-y-1 bg-white px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Sistema Financeiro</p>
                <p className="text-xs text-gray-500">Última atualização: hoje</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
