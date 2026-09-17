import type { Category } from '@ai-money/shared';
import { financeStore } from '../store';
export class CategoryRepository {
  static getAll(type?:'income'|'expense') { return financeStore.read().categories.filter(c=>!c.deletedAt && (!type || c.type===type)).sort((a,b)=>a.name.localeCompare(b.name,'es')); }
  static getByName(name:string,type:'income'|'expense') { return this.getAll(type).find(c=>c.name.toLowerCase()===name.toLowerCase()) || null; }
  static create(data:Pick<Category,'name'|'type'|'icon'|'color'>) { return financeStore.createCategory(data); }
}
