import { AIService } from './dist/services/aiService.js';
import { WhatsAppService } from './dist/services/whatsappService.js';

console.log('--- Probando servicios del Backend ---');

async function runTests() {
  // 1. Probar extracción de texto con IA / Regex fallback
  const sample1 = 'Almuerzo 35.000 con tarjeta Nu';
  const extracted1 = await AIService.extractFromText(sample1);
  console.log(`✔ Extracción de texto: "${sample1}" ->`, {
    amount: extracted1.amount,
    type: extracted1.type,
    category: extracted1.category,
    merchant: extracted1.merchant,
  });

  if (extracted1.amount !== 35000 || extracted1.category !== 'Alimentación') {
    throw new Error(`Extracción inesperada: ${JSON.stringify(extracted1)}`);
  }

  // 2. Probar flujo de vinculación y mensajes de WhatsApp
  const testUserId = 'user-test-456';
  const otp = WhatsAppService.generatePairingCode(testUserId);
  console.log(`✔ Código OTP generado para WhatsApp: ${otp}`);

  // Mensaje de vinculación
  const testPhone = '573001234567';
  const pairReply = await WhatsAppService.processIncomingMessage(testPhone, `Vincular ${otp}`);
  console.log(`✔ Respuesta de vinculación:\n${pairReply}\n`);

  // Mensaje de registro de gasto
  const expenseReply = await WhatsAppService.processIncomingMessage(testPhone, 'Uber al aeropuerto 42.000');
  console.log(`✔ Respuesta a gasto por WhatsApp:\n${expenseReply}\n`);

  // Sincronización hacia la app móvil (pop pending)
  const pendingTxs = WhatsAppService.popPendingTransactions(testUserId);
  console.log(`✔ Transacciones en cola para sincronizar al móvil: ${pendingTxs.length}`);
  if (pendingTxs.length !== 1 || pendingTxs[0].amount !== 42000) {
    throw new Error('La transacción en cola no coincide');
  }

  // 3. Probar asesor Denis
  const denisReply = await AIService.chatWithDenis('¿Cuánto he gastado?', {
    totalBalance: 1250000,
    monthlyIncome: 2500000,
    monthlyExpense: 850000,
    topCategories: [{ name: 'Alimentación', total: 450000 }],
    recentTransactions: [],
  });
  console.log(`✔ Respuesta de Denis:\n${denisReply}\n`);

  console.log('TODAS LAS PRUEBAS DEL BACKEND PASARON CON ÉXITO');
}

runTests().catch((err) => {
  console.error('Error en pruebas de backend:', err);
  process.exit(1);
});
