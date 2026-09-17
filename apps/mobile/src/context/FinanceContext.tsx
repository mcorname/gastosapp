import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getBalances, enrichedTransactions, monthlyStats, localDate, money, cents, type Ledger, type TransactionInput } from '@ai-money/shared';
import { initDatabase } from '../db/database';
import { financeStore } from '../db/store';
import type { AccountInput } from '../db/financeStore';

function useFinanceState() {
  const [ledger,setLedger] = useState<Ledger>({accounts:[],categories:[],transactions:[],budgets:[],settings:{}});
  const [isLoading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [currentYearMonth,setCurrentYearMonth] = useState(localDate().slice(0,7));
  const [currency,setCurrency] = useState('PEN');
  const refreshData = useCallback(() => { setLedger(financeStore.read()); },[]);
  const initialize = useCallback(async () => {
    setLoading(true); setError('');
    try { await initDatabase(); refreshData(); }
    catch(e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar tus datos.'); }
    finally { setLoading(false); }
  },[refreshData]);
  useEffect(() => { void initialize(); },[initialize]);
  const run = <T,>(fn:()=>T):T => { const result=fn(); refreshData(); return result; };
  const accounts = useMemo(()=>getBalances(ledger),[ledger]);
  const categories = ledger.categories.filter(c=>!c.deletedAt);
  const transactions = useMemo(()=>enrichedTransactions(ledger),[ledger]);
  const stats = useMemo(()=>monthlyStats(ledger,currentYearMonth,currency),[ledger,currentYearMonth,currency]);
  const currencies = [...new Set(['PEN',...accounts.map(a=>a.currency)])];
  const totals = Object.fromEntries(currencies.map(code=>[code,accounts.filter(a=>a.currency===code).reduce((sum,a)=>sum+cents(a.currentBalance),0)/100]));
  const totalBalance = totals[currency] || 0;
  const showAmounts = ledger.settings.hideAmounts !== 'true';
  const displayMoney = (amount:number, code=currency) => showAmounts ? money(amount,code) : `${code === 'PEN' ? 'S/' : code} ••••••••`;
  return {ledger,isLoading,error,initialize,accounts,categories,transactions,stats,totalBalance,totals,currencies,currency,setCurrency,
    currentYearMonth,setCurrentYearMonth,refreshData,showAmounts,displayMoney,
    profileName:ledger.settings.profileName || 'Mario',
    setPreference:(key:string,value:string)=>run(()=>financeStore.setSetting(key,value)),
    toggleAmounts:()=>run(()=>financeStore.setSetting('hideAmounts',showAmounts ? 'true':'false')),
    addTransaction:(input:TransactionInput)=>run(()=>financeStore.createTransaction(input)),
    updateTransaction:(id:string,input:TransactionInput)=>run(()=>financeStore.updateTransaction(id,input)),
    deleteTransaction:(id:string)=>run(()=>financeStore.deleteTransaction(id)),
    addAccount:(input:AccountInput)=>run(()=>financeStore.createAccount(input)),
    updateAccount:(id:string,input:AccountInput)=>run(()=>financeStore.updateAccount(id,input)),
    adjustBalance:(id:string,value:number)=>run(()=>financeStore.adjustBalance(id,value)),
    deleteAccount:(id:string)=>run(()=>financeStore.deleteAccount(id)),
    addCategory:(input:Parameters<typeof financeStore.createCategory>[0])=>run(()=>financeStore.createCategory(input)),
  };
}
const FinanceContext = createContext<ReturnType<typeof useFinanceState> | undefined>(undefined);
export const FinanceProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const value=useFinanceState();
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
export function useFinance() {
  const context=useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
}
