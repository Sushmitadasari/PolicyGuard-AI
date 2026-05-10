import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/common/PageHeader";

function PDFChatbotPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const context = location.state?.pdfContext;

  return (
    <DashboardLayout>
      <PageHeader
        title="Ask AI About This PDF"
        subtitle="PDF-aware follow-up chat entry point"
      />

      <section className="rounded-[3rem] border border-white/10 bg-white/3 backdrop-blur-3xl p-10">
        <h3 className="text-3xl font-black mb-4">PDF Context</h3>
        <p className="text-white/60 mb-8">
          This page receives the current PDF analysis so a chat experience can be built on top of it.
        </p>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-white/70 overflow-auto max-h-90">
          <pre className="whitespace-pre-wrap wrap-break-word">
            {JSON.stringify(context ?? {}, null, 2)}
          </pre>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/pdf-result", { state: location.state })}
            className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
          >
            Back to Result
          </button>
          <button
            onClick={() => navigate("/pdf-analyzer")}
            className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
          >
            Analyze Another PDF
          </button>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default PDFChatbotPage;