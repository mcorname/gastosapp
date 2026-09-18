import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { parseMoneyInput, localDate, type TransactionInput, type Transaction } from '@ai-money/shared';
import { useFinance } from '../context/FinanceContext';
import { Button, Choices, ErrorText, Field, Sheet, ui } from './FormUI';
import { CategoryIcon, getCategoryMeta } from './CategoryIcon';
import { tokens } from '../theme/tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
  transaction?: Transaction;
  initial?: Partial<TransactionInput>;
}

function CategorySelector({
  label,
  value,
  categories,
  onChange,
}: {
  label: string;
  value: string;
  categories: { id: string; name: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <View style={ui.field}>
      <Text style={ui.label}>{label}</Text>
      <View style={catStyles.wrap}>
        {categories.map((cat) => {
          const meta = getCategoryMeta(cat.name);
          const isSelected = value === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${cat.name}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onChange(cat.id)}
              style={[
                catStyles.chip,
                isSelected
                  ? {
                      backgroundColor: meta.activeBg,
                      borderColor: meta.activeBorder,
                    }
                  : catStyles.chipDefault,
              ]}
              activeOpacity={0.7}
            >
              <CategoryIcon
                categoryName={cat.name}
                size={13}
                boxSize={22}
                borderRadius={5}
                customColor={isSelected ? meta.activeBorder : meta.color}
                customBg={isSelected ? '#FFFFFF' : meta.bg}
              />
              <Text
                style={[
                  catStyles.chipText,
                  isSelected
                    ? {
                        color: meta.activeText,
                        fontWeight: '600',
                      }
                    : catStyles.chipTextDefault,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const catStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1,
    minHeight: 38,
  },
  chipDefault: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.borderDefault,
  },
  chipText: {
    fontSize: 13,
  },
  chipTextDefault: {
    color: tokens.colors.textPrimary,
    fontWeight: '400',
  },
});

export const NewTransactionModal: React.FC<Props> = ({
  visible,
  onClose,
  transaction,
  initial,
}) => {
  const {
    accounts,
    categories,
    addTransaction,
    updateTransaction,
    setCurrentYearMonth,
    currentYearMonth,
  } = useFinance();

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [accountId, setAccountId] = useState('');
  const [destination, setDestination] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(localDate());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    if (!visible) return;
    const data = transaction || initial;
    setType(data?.type || 'expense');
    setAmount(data?.amount !== undefined ? String(data.amount) : '');
    setMerchant(data?.merchant || '');
    setAccountId(
      data?.accountId || (!initial && accounts.length === 1 ? accounts[0].id : '')
    );
    setDestination(data?.destinationAccountId || '');
    setCategoryId(data?.categoryId || '');
    setDate(
      data?.date?.slice(0, 10) ||
        (currentYearMonth === localDate().slice(0, 7)
          ? localDate()
          : `${currentYearMonth}-01`)
    );
    setNotes(data?.notes || '');
    setError('');
    setSaving(false);
    busy.current = false;
  }, [visible, transaction, initial]);

  const save = () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError('');
    try {
      const data: TransactionInput = {
        type: type as TransactionInput['type'],
        amount: parseMoneyInput(amount),
        merchant,
        accountId,
        categoryId,
        destinationAccountId: destination,
        date,
        notes,
        source: initial?.source || transaction?.source || 'manual',
      };
      if (transaction) updateTransaction(transaction.id, data);
      else addTransaction(data);
      setCurrentYearMonth(date.slice(0, 7));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el movimiento.');
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      title={
        transaction
          ? 'Editar movimiento'
          : initial?.source === 'ai_text'
          ? 'Confirmar movimiento detectado'
          : 'Nuevo movimiento'
      }
      onClose={onClose}
    >
      <Choices
        label="Tipo"
        value={type}
        onChange={(v) => {
          setType(v);
          setCategoryId('');
        }}
        options={[
          { value: 'expense', label: 'Gasto' },
          { value: 'income', label: 'Ingreso' },
          { value: 'transfer', label: 'Transferencia' },
        ]}
      />
      <Field
        label="Monto"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />
      <Field
        label="Descripción"
        value={merchant}
        onChangeText={setMerchant}
        placeholder={
          type === 'transfer'
            ? 'Transferencia entre cuentas'
            : '¿En qué consistió el movimiento?'
        }
      />
      {accounts.length === 0 ? (
        <Text style={ui.muted}>
          Crea una cuenta en Ajustes → Cuentas financieras antes de registrar un movimiento.
        </Text>
      ) : (
        <Choices
          label={type === 'transfer' ? 'Cuenta de origen' : 'Cuenta'}
          value={accountId}
          onChange={setAccountId}
          options={accounts.map((a) => ({
            value: a.id,
            label: `${a.name} (${a.currency})`,
          }))}
        />
      )}
      {type === 'transfer' ? (
        <>
          <Choices
            label="Cuenta de destino"
            value={destination}
            onChange={setDestination}
            options={accounts
              .filter((a) => a.id !== accountId)
              .map((a) => ({
                value: a.id,
                label: `${a.name} (${a.currency})`,
              }))}
          />
          <Text style={ui.muted}>
            La transferencia no cuenta como ingreso ni gasto. Ambas cuentas deben tener la misma moneda.
          </Text>
        </>
      ) : (
        <CategorySelector
          label="Categoría"
          value={categoryId}
          onChange={setCategoryId}
          categories={categories.filter((c) => c.type === type)}
        />
      )}
      <Field
        label="Fecha (AAAA-MM-DD)"
        value={date}
        onChangeText={setDate}
        placeholder="AAAA-MM-DD"
      />
      <Field label="Nota opcional" value={notes} onChangeText={setNotes} multiline />
      <ErrorText error={error} />
      <Button onPress={save} disabled={saving || accounts.length === 0}>
        {saving
          ? 'Guardando…'
          : transaction
          ? 'Guardar cambios'
          : initial?.source === 'ai_text'
          ? 'Confirmar y guardar'
          : 'Guardar movimiento'}
      </Button>
    </Sheet>
  );
};
