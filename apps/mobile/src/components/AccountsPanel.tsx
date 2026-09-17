import React,{useState} from 'react';
import {Text,View,TouchableOpacity} from 'react-native';
import {parseMoneyInput,type TransactionInput} from '@ai-money/shared';
import {useFinance} from '../context/FinanceContext';
import {Button,Choices,ErrorText,Field,Sheet,ui} from './FormUI';
import {TransactionItem} from './TransactionItem';

const types=[{value:'cash',label:'Efectivo / Billetera'},{value:'bank',label:'Cuenta bancaria'},{value:'savings',label:'Ahorros'},{value:'investment',label:'Inversión'},{value:'credit_card',label:'Tarjeta de crédito'}];
export function AccountsPanel({selectedId,onSelect,onTransfer,onTransaction}:{selectedId?:string;onSelect:(id?:string)=>void;onTransfer:(draft:Partial<TransactionInput>)=>void;onTransaction:(id:string)=>void}) {
  const {accounts,transactions,ledger,displayMoney,addAccount,updateAccount,adjustBalance,deleteAccount,showAmounts}=useFinance();
  const [mode,setMode]=useState<'new'|'edit'|'adjust'|'delete'|''>('');
  const [name,setName]=useState('');const [type,setType]=useState('cash');const [currency,setCurrency]=useState('PEN');const [balance,setBalance]=useState('');const [error,setError]=useState('');
  const account=accounts.find(a=>a.id===selectedId);
  const history=transactions.filter(t=>t.accountId===selectedId||t.destinationAccountId===selectedId);
  const hasHistory=ledger.transactions.some(t=>t.accountId===selectedId||t.destinationAccountId===selectedId);
  const open=(value:typeof mode)=>{setError('');setMode(value);setName(account?.name||'');setType(account?.type||'cash');setCurrency(account?.currency||'PEN');setBalance(value==='adjust'&&account?String(account.currentBalance):'0');};
  const readBalance=()=>{const s=balance.trim();if(s==='0'||s==='0.00'||s==='0,00')return 0;return s.startsWith('-')?-parseMoneyInput(s.slice(1)):parseMoneyInput(s);};
  const save=()=>{try{if(mode==='new')addAccount({name,type:type as any,currency,initialBalance:readBalance()});
    else if(mode==='edit'&&account)updateAccount(account.id,{name,type:type as any,currency});
    else if(mode==='adjust'&&account)adjustBalance(account.id,readBalance());
    else if(mode==='delete'&&account){deleteAccount(account.id);onSelect(undefined);}setMode('');
  }catch(e){setError(e instanceof Error?e.message:'No se pudo completar la operación.');}};
  let difference='';try{if(mode==='adjust'&&account)difference=displayMoney(Math.round((readBalance()-account.currentBalance)*100)/100,account.currency);}catch{}
  return <View style={{gap:20}}>
    <View style={ui.row}><Text style={ui.title}>{account?account.name:'Cuentas financieras'}</Text><Button onPress={()=>{setName('');setType('cash');setCurrency('PEN');setBalance('0');setError('');setMode('new');}}>Nueva cuenta</Button></View>
    {account?<>
      <Button secondary onPress={()=>onSelect(undefined)}>Ver todas las cuentas</Button>
      <View style={ui.card}><Text style={ui.muted}>{types.find(t=>t.value===account.type)?.label} · {account.currency}</Text><Text style={ui.title}>Saldo actual: {displayMoney(account.currentBalance,account.currency)}</Text>
      <View style={ui.wrap}><Button secondary onPress={()=>open('edit')}>Editar cuenta</Button><Button secondary onPress={()=>open('adjust')}>Ajustar saldo</Button><Button secondary onPress={()=>onTransfer({type:'transfer',accountId:account.id,merchant:'Transferencia entre cuentas'})}>Transferir</Button><Button secondary onPress={()=>open('delete')}>Eliminar cuenta</Button></View></View>
      <Text style={ui.title}>Movimientos asociados</Text>
      {history.length?history.map(tx=><TransactionItem key={tx.id} transaction={tx} onOpen={()=>onTransaction(tx.id)}/>):<Text style={ui.muted}>Esta cuenta aún no tiene movimientos.</Text>}
    </>:<>{accounts.length===0&&<Text style={ui.muted}>Crea tu primera cuenta con su saldo inicial para comenzar.</Text>}{accounts.map(a=><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Abrir cuenta ${a.name}`} key={a.id} style={ui.card} onPress={()=>onSelect(a.id)}><Text style={ui.title}>{a.name}</Text><Text style={ui.muted}>{types.find(t=>t.value===a.type)?.label} · {a.currency}</Text><Text style={ui.title}>{displayMoney(a.currentBalance,a.currency)}</Text></TouchableOpacity>)}</>}
    <Sheet visible={!!mode} title={mode==='new'?'Nueva cuenta':mode==='edit'?'Editar cuenta':mode==='adjust'?'Ajustar saldo':'Eliminar cuenta'} onClose={()=>setMode('')}>
      {(mode==='new'||mode==='edit')&&<><Field label="Nombre de la cuenta" value={name} onChangeText={setName}/><Choices label="Tipo de cuenta" value={type} onChange={setType} options={types}/>{mode==='edit'&&hasHistory?<Text style={ui.muted}>Moneda: {currency}. La moneda se conserva porque esta cuenta tiene historial.</Text>:<Choices label="Moneda" value={currency} onChange={setCurrency} options={['PEN','USD','EUR','COP','MXN','ARS','CLP','BRL','GBP'].map(value=>({value,label:value}))}/>}</>}
      {mode==='new'&&<Field label="Saldo inicial" value={balance} onChangeText={setBalance} keyboardType="decimal-pad" secureTextEntry={!showAmounts}/>}
      {mode==='adjust'&&account&&<><Text style={ui.muted}>Se registrará una operación AJUSTE con el saldo anterior, saldo nuevo y diferencia.</Text><Text style={ui.label}>Saldo anterior: {displayMoney(account.currentBalance,account.currency)}</Text><Field label="Saldo nuevo" value={balance} onChangeText={setBalance} keyboardType="decimal-pad" secureTextEntry={!showAmounts}/>{difference&&<Text style={ui.label}>Diferencia: {difference}</Text>}</>}
      {mode==='delete'&&<Text style={ui.muted}>{hasHistory?'Esta cuenta tiene movimientos asociados y no puede eliminarse. Se conserva todo el historial.':'Solo se puede eliminar una cuenta sin saldo ni movimientos. ¿Deseas continuar?'}</Text>}
      <ErrorText error={error}/><Button danger={mode==='delete'} disabled={mode==='delete'&&hasHistory} onPress={save}>{mode==='delete'?'Eliminar cuenta':mode==='adjust'?'Confirmar ajuste':'Guardar cuenta'}</Button>
    </Sheet>
  </View>;
}
