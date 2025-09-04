'use server';
/**
 * @fileOverview A flow for generating QR codes.
 *
 * - generateQrCode - A function that generates a QR code for a given URL.
 * - GenerateQrCodeInput - The input type for the generateQrCode function.
 * - GenerateQrCodeOutput - The return type for the generateQrCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import QRCode from 'qrcode';

const GenerateQrCodeInputSchema = z.object({
  baseUrl: z.string().url().describe('The base URL for the transaction form.'),
});
export type GenerateQrCodeInput = z.infer<typeof GenerateQrCodeInputSchema>;

const GenerateQrCodeOutputSchema = z.object({
  qrCodeDataUrl: z
    .string()
    .describe('The generated QR code as a a data URI.'),
  transactionUrl: z.string().url().describe('The full URL for the transaction.'),
});
export type GenerateQrCodeOutput = z.infer<typeof GenerateQrCodeOutputSchema>;

export async function generateQrCode(
  input: GenerateQrCodeInput
): Promise<GenerateQrCodeOutput> {
  return generateQrCodeFlow(input);
}

function generateUniqueReference() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // As per requirement: LC-<OUTLET>-YYYYMMDD-HHMMSS-RAND
  // Using 'PST' as a placeholder for the outlet ID
  return `LC-PST-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

const generateQrCodeFlow = ai.defineFlow(
  {
    name: 'generateQrCodeFlow',
    inputSchema: GenerateQrCodeInputSchema,
    outputSchema: GenerateQrCodeOutputSchema,
  },
  async ({baseUrl}) => {
    try {
      const uniqueRef = generateUniqueReference();
      const transactionUrl = `${baseUrl}/transaction?ref=${uniqueRef}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(transactionUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/svg',
        width: 512,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
      });
      return {qrCodeDataUrl, transactionUrl};
    } catch (err) {
      console.error(err);
      throw new Error('Failed to generate QR code.');
    }
  }
);
