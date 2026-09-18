import type { ContractAnalysis } from './types';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-contract`;

export async function analyzeContract(
  text: string,
  contractName: string,
  signal?: AbortSignal
): Promise<ContractAnalysis> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, contractName }),
    signal,
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(
      `Analysis failed (${response.status}). ${errBody.slice(0, 200)}`
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.analysis || !data.analysis.obligations) {
    throw new Error('Received invalid analysis from the server.');
  }

  return data.analysis as ContractAnalysis;
}
