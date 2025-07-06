export async function exportToExcel() {
  try {
    const response = await fetch('/api/export/excel');
    
    if (!response.ok) {
      throw new Error('Failed to export Excel file');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro_${new Date().getFullYear()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
}

export async function exportToCsv() {
  try {
    const response = await fetch('/api/export/csv');
    
    if (!response.ok) {
      throw new Error('Failed to export CSV file');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transacoes.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
}

export function generateTransactionsCsv(transactions: any[]): string {
  const headers = ['ID', 'Tipo', 'Descrição', 'Valor', 'Categoria', 'Data Início', 'Parcelas', 'Status'];
  
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => [
      t.id,
      t.type,
      `"${t.description}"`,
      t.amount,
      t.category || '',
      t.startDate,
      t.installments || 1,
      t.isActive ? 'Ativo' : 'Inativo'
    ].join(','))
  ].join('\n');
  
  return csvContent;
}

export function generateDebtorsCsv(debtors: any[]): string {
  const headers = ['ID', 'Nome', 'Valor Total', 'Valor Pago', 'Saldo Devedor', 'Status'];
  
  const csvContent = [
    headers.join(','),
    ...debtors.map(d => [
      d.id,
      `"${d.name}"`,
      d.totalAmount,
      d.paidAmount,
      parseFloat(d.totalAmount) - parseFloat(d.paidAmount),
      d.status
    ].join(','))
  ].join('\n');
  
  return csvContent;
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
