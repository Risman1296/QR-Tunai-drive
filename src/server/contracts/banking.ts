import { z } from 'zod';

// Standar bank
export const BankSchema = z.enum(['BCA','BRI','BNI','MANDIRI','BSI','BTN','REALTIME']);
export type Bank = z.infer<typeof BankSchema>;

// Account ID: alnum + - _ : (6-32)
export const AccountIdSchema = z.string().regex(/^[A-Z0-9:_-]{6,32}$/i, 'Invalid account id');
export type AccountId = z.infer<typeof AccountIdSchema>;

// Money (IDR, integer rupiah)
export const MoneySchema = z.object({
  value: z.number().int().nonnegative(),
  currency: z.literal('IDR'),
}).strict();
export type Money = z.infer<typeof MoneySchema>;

// Query mutasi — date ISO + cursor OR limit
export const MutationQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
}).strict()
  .refine(q => !(q.cursor && q.limit), { message: 'Use either cursor or limit' })
  .refine(q => !q.from || !q.to || new Date(q.from) <= new Date(q.to), { message: '`from` must be <= `to`' });
export type MutationQuery = z.infer<typeof MutationQuerySchema>;

// Balance response
export const BalanceResponseSchema = z.object({
  accountId: AccountIdSchema,
  balance: z.number().int().nonnegative(), // integer rupiah
  currency: z.literal('IDR'),
  bank: BankSchema,
  fetchedAt: z.string().datetime(), // ISO string
}).strict();
export type BalanceResponse = z.infer<typeof BalanceResponseSchema>;

// Mutation record
export const MutationRecordSchema = z.object({
  id: z.string(),
  accountId: AccountIdSchema,
  type: z.enum(['credit','debit']),
  amount: z.number().int().nonnegative(),
  description: z.string().optional(),
  timestamp: z.string().datetime(),
  balanceAfter: z.number().int().nonnegative().optional(),
  bank: BankSchema,
  // raw: server-only (hindari expose ke client)
}).strict();
export type MutationRecord = z.infer<typeof MutationRecordSchema>;

// Status & jenis transaksi — selaraskan dengan UI: pending|confirmed|void
export const TransactionTypeSchema = z.enum(['withdraw','deposit','topup','payment','manual_confirm']);
export const TransactionStatusSchema = z.enum(['pending','confirmed','void']);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

// Transaction record untuk tabel admin
export const TransactionRecordSchema = z.object({
  id: z.string(),
  accountId: AccountIdSchema,
  type: TransactionTypeSchema,
  amount: z.number().int().nonnegative(),
  status: TransactionStatusSchema,
  occurredAt: z.string().datetime(),  // konsisten dengan UI
  updatedAt: z.string().datetime().optional(),
  outletName: z.string().optional(),
  cashier: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
}).strict();
export type TransactionRecord = z.infer<typeof TransactionRecordSchema>;

// Paginasi standar untuk list API
export const PageResultSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    nextCursor: z.string().optional(),
    total: z.number().int().nonnegative().optional(),
  }).strict();

// Error standar untuk semua API
export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    hint: z.string().optional(),
  }).strict(),
}).strict();
export type ApiError = z.infer<typeof ApiErrorSchema>;
