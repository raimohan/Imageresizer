'use server';

/**
 * @fileOverview A file size estimation AI agent.
 *
 * - estimateFileSize - A function that estimates the final file size based on given parameters.
 * - EstimateFileSizeInput - The input type for the estimateFileSize function.
 * - EstimateFileSizeOutput - The return type for the estimateFileSize function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateFileSizeInputSchema = z.object({
  originalWidth: z.number().describe('The original width of the image in pixels.'),
  originalHeight: z.number().describe('The original height of the image in pixels.'),
  percentage: z.number().min(10).max(200).describe('The resizing percentage (10-200).'),
  targetFileSizeKB: z.number().min(10).max(500).describe('The target file size in KB.'),
  format: z.enum(['JPEG', 'PNG', 'WebP']).describe('The image format.'),
  quality: z.number().min(0).max(1).describe('The image quality (0-1).'),
});
export type EstimateFileSizeInput = z.infer<typeof EstimateFileSizeInputSchema>;

const EstimateFileSizeOutputSchema = z.object({
  estimatedFileSizeKB: z
    .number()
    .describe('The estimated file size in KB based on the input parameters.'),
  reasoning: z
    .string()
    .optional()
    .describe('The reasoning behind the file size estimation.'),
});
export type EstimateFileSizeOutput = z.infer<typeof EstimateFileSizeOutputSchema>;

export async function estimateFileSize(input: EstimateFileSizeInput): Promise<EstimateFileSizeOutput> {
  return estimateFileSizeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateFileSizePrompt',
  input: {schema: EstimateFileSizeInputSchema},
  output: {schema: EstimateFileSizeOutputSchema},
  prompt: `You are an AI expert in image compression and file size estimation.

You will receive the following parameters about an image:
- Original Width: {{originalWidth}} pixels
- Original Height: {{originalHeight}} pixels
- Resizing Percentage: {{percentage}}%
- Target File Size: {{targetFileSizeKB}} KB
- Format: {{format}}
- Quality: {{quality}}

Based on these parameters, estimate the final file size in KB.

Consider the following factors:
- Resizing: Decreasing the dimensions will reduce the file size.
- Format: WebP is generally more efficient than JPEG and PNG.
- Quality: Lowering the quality will reduce the file size but may also reduce image quality.

Provide an estimated file size in KB, and explain your reasoning.
`,
});

const estimateFileSizeFlow = ai.defineFlow(
  {
    name: 'estimateFileSizeFlow',
    inputSchema: EstimateFileSizeInputSchema,
    outputSchema: EstimateFileSizeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
