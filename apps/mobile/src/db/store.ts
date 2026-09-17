import { readLedger, writeLedger } from './database';
import { FinanceStore } from './financeStore';
export const financeStore = new FinanceStore({read:readLedger,write:writeLedger});
