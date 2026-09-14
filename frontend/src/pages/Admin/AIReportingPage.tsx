import { useState } from "react";
import { Bot, FileText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiAssistantApi } from "@/api/ai.api";

export default function AIReportingPage() {
  const [prompt, setPrompt] = useState("" );
  const [context, setContext] = useState("Rôle: Super-administrateur / Administrateur\nObjectif: suivre les performances, les anomalies, les actions prioritaires et les recommandations de pilotage.");
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (mode: "chat" | "reporting") => {
    if (!prompt.trim()) {
      setError("Saisissez une demande ou un sujet de reporting.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result =
        mode === "chat"
          ? await aiAssistantApi.chat(prompt, context)
          : await aiAssistantApi.reporting(prompt, context);

      setAnswer(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de contacter l’assistant IA.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-900 p-6 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-200">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Assistant IA</p>
            <h1 className="text-3xl font-semibold">Reporting & aide décisionnelle</h1>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Demande IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question ou objectif</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={7}
                placeholder="Ex. : Donne-moi un tableau de bord synthétique sur les écarts de budget, les anomalies et les actions prioritaires."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contexte métier</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void handleSubmit("chat")} disabled={loading}>
                {loading ? "Traitement..." : "Demander à l’assistant"}
              </Button>
              <Button variant="outline" onClick={() => void handleSubmit("reporting")} disabled={loading}>
                <FileText className="mr-2 h-4 w-4" />
                Générer un rapport
              </Button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Réponse de l’assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[320px] rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
              {answer || "La réponse apparaîtra ici après votre première demande."}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
