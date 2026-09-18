/*
# Create contracts table for ContractGuard AI

1. New Tables
- `contracts`
  - `id` (uuid, primary key)
  - `name` (text, not null) — the contract file name / title
  - `file_size` (integer) — size of uploaded file in bytes
  - `page_count` (integer) — number of pages extracted from the PDF
  - `raw_text` (text) — full extracted text from the contract
  - `analysis` (jsonb) — the structured AI analysis result (obligations, deadlines, risks, etc.)
  - `overall_risk` (text) — overall risk level: Low / Medium / High
  - `status` (text, default 'pending') — pending | analyzing | completed | failed
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `contracts`.
- Allow anon + authenticated full CRUD — this is a single-tenant demo app with no sign-in screen.
- All data is intentionally shared/public for the purpose of this application.

3. Indexes
- `idx_contracts_created_at` — for sorting by most recent.
*/

CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_size integer DEFAULT 0,
  page_count integer DEFAULT 0,
  raw_text text,
  analysis jsonb,
  overall_risk text DEFAULT 'Low',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contracts" ON contracts;
CREATE POLICY "anon_select_contracts" ON contracts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contracts" ON contracts;
CREATE POLICY "anon_insert_contracts" ON contracts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_contracts" ON contracts;
CREATE POLICY "anon_update_contracts" ON contracts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contracts" ON contracts;
CREATE POLICY "anon_delete_contracts" ON contracts FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts (created_at DESC);
