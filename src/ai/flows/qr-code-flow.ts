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
  url: z.string().url().describe('The URL to encode in the QR code.'),
});
export type GenerateQrCodeInput = z.infer<typeof GenerateQrCodeInputSchema>;

const GenerateQrCodeOutputSchema = z.object({
  qrCodeDataUrl: z
    .string()
    .describe('The generated QR code as a a data URI.'),
});
export type GenerateQrCodeOutput = z.infer<typeof GenerateQrCodeOutputSchema>;

export async function generateQrCode(
  input: GenerateQrCodeInput
): Promise<GenerateQrCodeOutput> {
  return generateQrCodeFlow(input);
}

const generateQrCodeFlow = ai.defineFlow(
  {
    name: 'generateQrCodeFlow',
    inputSchema: GenerateQrCodeInputSchema,
    outputSchema: GenerateQrCodeOutputSchema,
  },
  async ({url}) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/svg',
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
      });
      return {qrCodeDataUrl};
    } catch (err) {
      console.error(err);
      throw new Error('Failed to generate QR code.');
    }
  }
);