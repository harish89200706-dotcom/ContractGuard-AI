import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar, type PageId } from '@/components/Sidebar';
import { DashboardPage } from '@/pages/DashboardPage';
import { ContractsPage } from '@/pages/ContractsPage';
import { AnalysisPage } from '@/pages/AnalysisPage';
import { RisksPage } from '@/pages/RisksPage';
import { DeadlinesPage } from '@/pages/DeadlinesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { supabase } from '@/lib/supabase';
import { extractPdfText } from '@/lib/pdf';
import { analyzeContract } from '@/lib/analyze';
import { DEMO_CONTRACT_TEXT, getDemoContractFile } from '@/lib/demoContract';
import type { ContractRecord, ContractAnalysis, RiskSeverity } from '@/lib/types';

function App() {
  const [page, setPage] = useState<PageId>('dashboard');
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Load contracts from Supabase
  const loadContracts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load contracts:', error);
    } else if (data) {
      setContracts(data as ContractRecord[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // Navigate
  const navigate = (p: PageId) => {
    setPage(p);
    setMobileSidebarOpen(false);
    if (p !== 'analysis') {
      // keep selection so back button works, but don't force analysis page
    }
  };

  // Select a contract and go to analysis
  const selectContract = (id: string) => {
    setSelectedContractId(id);
    setPage('analysis');
  };

  // Upload and analyze a contract
  const handleFileSelected = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      setUploadStage(0);

      try {
        // Step 1: Extract text
        setUploadStage(0);
        let extractedText = '';
        let pageCount = 0;

        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          const extracted = await extractPdfText(file);
          extractedText = extracted.text;
          pageCount = extracted.pageCount;
        } else {
          // Text file (demo)
          extractedText = await file.text();
          pageCount = 1;
        }

        if (!extractedText || extractedText.trim().length < 50) {
          throw new Error(
            'Could not extract enough text from this document. The PDF may be scanned images without OCR, or the file may be empty.'
          );
        }

        // Step 2: Create contract record in DB
        setUploadStage(1);
        const { data: record, error: insertError } = await supabase
          .from('contracts')
          .insert({
            name: file.name,
            file_size: file.size,
            page_count: pageCount,
            raw_text: extractedText,
            status: 'analyzing',
            overall_risk: 'Low',
          })
          .select()
          .single();

        if (insertError || !record) {
          throw new Error('Failed to save contract to database.');
        }

        const contractId = record.id;

        // Update local state immediately
        setContracts((prev) => [record as ContractRecord, ...prev]);
        setSelectedContractId(contractId);
        setPage('analysis');

        // Step 3: AI analysis
        setUploadStage(2);
        const analysis: ContractAnalysis = await analyzeContract(extractedText, file.name);

        // Step 4: Done
        setUploadStage(4);

        // Update record in DB
        const { error: updateError } = await supabase
          .from('contracts')
          .update({
            analysis: analysis as unknown as Record<string, unknown>,
            overall_risk: analysis.overall_risk as RiskSeverity,
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', contractId);

        if (updateError) {
          console.error('Failed to update contract with analysis:', updateError);
        }

        // Update local state
        setContracts((prev) =>
          prev.map((c) =>
            c.id === contractId
              ? {
                  ...c,
                  analysis,
                  overall_risk: analysis.overall_risk as RiskSeverity,
                  status: 'completed',
                  updated_at: new Date().toISOString(),
                }
              : c
          )
        );
      } catch (err) {
        console.error('Upload/analysis error:', err);
        const msg =
          err instanceof Error ? err.message : 'An unexpected error occurred during analysis.';
        setError(msg);

        // Mark any in-progress contract as failed
        setContracts((prev) =>
          prev.map((c) =>
            c.status === 'analyzing' ? { ...c, status: 'failed' as const } : c
          )
        );
      } finally {
        setUploading(false);
        setUploadStage(0);
      }
    },
    []
  );

  // Demo contract
  const handleDemo = useCallback(() => {
    const file = getDemoContractFile();
    handleFileSelected(file);
  }, [handleFileSelected]);

  // Delete contract
  const handleDelete = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('contracts').delete().eq('id', id);
      if (error) {
        console.error('Delete failed:', error);
        return;
      }
      setContracts((prev) => prev.filter((c) => c.id !== id));
      if (selectedContractId === id) {
        setSelectedContractId(null);
        setPage('contracts');
      }
    },
    [selectedContractId]
  );

  // Compute aggregate counts for sidebar badges
  const completedContracts = contracts.filter((c) => c.status === 'completed' && c.analysis);
  const totalRisks = completedContracts.flatMap((c) => c.analysis!.compliance_risks).length;
  const totalDeadlines = completedContracts.flatMap((c) => c.analysis!.deadlines).length;

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-white">
            <ShieldIcon />
          </div>
          <span className="text-sm font-bold text-slate-900">ContractGuard AI</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-30 h-full transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
          current={page}
          onNavigate={navigate}
          riskCount={totalRisks}
          deadlineCount={totalDeadlines}
        />
      </div>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 pb-20 pt-16 lg:pt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm font-medium text-slate-500">Loading your contracts...</p>
            </div>
          ) : uploading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h2 className="mb-2 text-xl font-bold text-slate-900">Analyzing Contract</h2>
              <p className="mb-6 text-sm text-slate-500">
                AI is reading your contract and extracting insights
              </p>
              <AnalysisLoader stage={uploadStage} />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h2 className="text-base font-semibold text-red-800">Analysis Error</h2>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setPage('dashboard');
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Back to Dashboard
              </button>
            </div>
          ) : page === 'dashboard' ? (
            <DashboardPage
              contracts={contracts}
              onFileSelected={handleFileSelected}
              onDemo={handleDemo}
              onNavigate={navigate}
              onSelectContract={selectContract}
            />
          ) : page === 'contracts' ? (
            <ContractsPage
              contracts={contracts}
              onFileSelected={handleFileSelected}
              onDemo={handleDemo}
              onSelectContract={selectContract}
              onDeleteContract={handleDelete}
            />
          ) : page === 'analysis' ? (
            <AnalysisPage contract={selectedContract} onBack={navigate} />
          ) : page === 'risks' ? (
            <RisksPage contracts={contracts} onSelectContract={selectContract} />
          ) : page === 'deadlines' ? (
            <DeadlinesPage contracts={contracts} onSelectContract={selectContract} />
          ) : (
            <SettingsPage />
          )}
        </div>
      </main>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default App;
