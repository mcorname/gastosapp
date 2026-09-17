import { AIService } from './aiService.js';
import { ExtractedTransaction } from '@ai-money/shared';

interface LinkedUser {
  userId: string;
  phoneNumber: string;
}

export class WhatsAppService {
  // Almacenamiento en memoria para MVP (en prod: Redis o tabla Supabase)
  private static pairingCodes = new Map<string, { userId: string; expiresAt: number }>();
  private static linkedNumbers = new Map<string, string>(); // phoneNumber -> userId
  private static pendingTransactions = new Map<string, ExtractedTransaction[]>(); // userId -> pending transactions

  /**
   * Genera un código OTP de 6 dígitos para vincular la app móvil
   */
  static generatePairingCode(userId: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.pairingCodes.set(code, {
      userId,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutos
    });
    return code;
  }

  /**
   * Procesa un mensaje entrante de WhatsApp (texto, audio o imagen)
   */
  static async processIncomingMessage(fromNumber: string, messageText: string): Promise<string> {
    const cleanText = messageText.trim();

    // 1. Caso: Intento de vinculación con código
    const linkMatch = cleanText.match(/(?:vincular|link|codigo)\s*(\d{6})/i) || cleanText.match(/^(\d{6})$/);
    if (linkMatch) {
      const code = linkMatch[1];
      const entry = this.pairingCodes.get(code);

      if (!entry || entry.expiresAt < Date.now()) {
        return '❌ Código de vinculación inválido o expirado. Genera uno nuevo desde la app AI Money.';
      }

      this.linkedNumbers.set(fromNumber, entry.userId);
      this.pairingCodes.delete(code);
      return `🎉 ¡Cuenta vinculada exitosamente con AI Money!\n\nAhora puedes registrar tus gastos directamente enviando mensajes como:\n• "Almuerzo 25.000 con tarjeta Nu"\n• "Uber al trabajo 14k"\n• "Sueldo 3.500.000"`;
    }

    // 2. Verificar si el número está vinculado
    const userId = this.linkedNumbers.get(fromNumber);
    if (!userId) {
      return `👋 Hola. Para registrar tus gastos aquí, primero debes vincular tu cuenta.\n\nAbre la app AI Money en tu teléfono, ve a Ajustes > WhatsApp y genera tu código de 6 dígitos, luego envíalo aquí.`;
    }

    // 3. Procesar como transacción financiera vía IA
    const extracted = await AIService.extractFromText(cleanText);

    // Guardar en cola de sincronización para que la app móvil lo descargue
    const userPending = this.pendingTransactions.get(userId) || [];
    userPending.push(extracted);
    this.pendingTransactions.set(userId, userPending);

    const emoji = extracted.type === 'income' ? '💰' : '💸';
    const typeLabel = extracted.type === 'income' ? 'Ingreso' : 'Gasto';

    return `${emoji} *${typeLabel} registrado con éxito!*\n\n• *Monto:* $${extracted.amount.toLocaleString()} ${extracted.currency}\n• *Categoría:* ${extracted.category}\n• *Detalle:* ${extracted.merchant}\n\n_Se sincronizará con tu app automáticamente._`;
  }

  /**
   * Obtiene transacciones pendientes generadas por WhatsApp para sincronizarlas con el móvil
   */
  static popPendingTransactions(userId: string): ExtractedTransaction[] {
    const list = this.pendingTransactions.get(userId) || [];
    this.pendingTransactions.delete(userId);
    return list;
  }
}
