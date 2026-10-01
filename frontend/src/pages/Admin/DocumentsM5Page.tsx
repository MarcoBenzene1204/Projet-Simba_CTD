import { useEffect, useState, type FormEvent } from "react";
import { FileText, Plus } from "lucide-react";

import { createDocumentM5, listDocumentsM5, listFournisseurs, listLignesBudgetaires, type DocumentM5Reference, type FournisseurReference, type LigneBudgetaireReference } from "@/api/finance.api";
import { apiErrorMessage } from "@/api/api-error";
import { useAuthorization } from "@/auth/useAuthorization";
import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTenant } from "@/tenant/TenantContext";

const documentTypes = ["BON_COMMANDE", "LETTRE_COMMANDE", "MARCHE", "PROVISIONNEL", "AUTRE", "REGULARISATION_470XX"];

const initialForm = {
  reference: "",
  typeDocument: "BON_COMMANDE",
  ligneBudgetaireId: "",
  tiersId: "",
  objet: "",
  montantHT: "",
  montantTaxes: "0",
};

export default function DocumentsM5Page() {
  const { role } = useAuth();
  const { hasPermission } = useAuthorization();
  const { tenants, currentTenant, setCurrentTenant } = useTenant();
  const [documents, setDocuments] = useState<DocumentM5Reference[]>([]);
  const [lignes, setLignes] = useState<LigneBudgetaireReference[]>([]);
  const [tiers, setTiers] = useState<FournisseurReference[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const canCreate = hasPermission("parametrage:creer");
  const isSuperAdmin = role === "SUPER_ADMINISTRATEUR";

  useEffect(() => {
    if (!currentTenant?.id) {
      setDocuments([]);
      return;
    }
    let active = true;
    setLoading(true);
    setError(undefined);
    void Promise.all([listDocumentsM5(), listLignesBudgetaires(), listFournisseurs()])
      .then(([documentItems, ligneItems, tierItems]) => {
        if (!active) return;
        setDocuments(documentItems);
        setLignes(ligneItems);
        setTiers(tierItems);
      })
      .catch((cause) => {
        if (active) setError(apiErrorMessage(cause, "Impossible de charger les données M5 de la commune sélectionnée."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [currentTenant?.id]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate || !currentTenant) return;
    setSaving(true);
    setError(undefined);
    const montantHT = Number(form.montantHT);
    const montantTaxes = Number(form.montantTaxes || 0);
    try {
      const created = await createDocumentM5({
        reference: form.reference.trim(),
        typeDocument: form.typeDocument,
        ligneBudgetaireId: form.ligneBudgetaireId,
        tiersId: form.tiersId || undefined,
        objet: form.objet.trim(),
        montantHT,
        montantTaxes,
      });
      setDocuments((current) => [created, ...current]);
      setForm(initialForm);
      setOpen(false);
    } catch (cause) {
      setError(apiErrorMessage(cause, "Le document M5 n'a pas pu être enregistré."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">Référentiel budgétaire</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Documents préparatoires M5</h1>
          <p className="mt-1 text-sm text-muted-foreground">Saisie et consultation par collectivité.</p>
        </div>
        {canCreate && currentTenant && <Button className="gap-2" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Nouveau document</Button>}
      </header>

      {isSuperAdmin && (
        <label className="grid max-w-xl gap-2 text-sm font-medium">
          Collectivité concernée
          <select className="h-10 min-w-0 rounded-md border bg-background px-3" value={currentTenant?.id ?? ""} onChange={(event) => {
            const selected = tenants.find((tenant) => tenant.id === event.target.value);
            if (selected) setCurrentTenant(selected);
          }}>
            <option value="" disabled>Sélectionner une collectivité</option>
            {tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name} · {tenant.code}</option>)}
          </select>
        </label>
      )}

      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {!currentTenant && <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">Sélectionnez une collectivité pour consulter ou saisir ses documents M5.</p>}

      {currentTenant && (
        <Card className="min-w-0 border-primary/15">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex min-w-0 items-center gap-2 text-base"><FileText className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{currentTenant.name}</span></CardTitle>
            <Badge variant="secondary">{documents.length} document{documents.length === 1 ? "" : "s"}</Badge>
          </CardHeader>
          <CardContent>
            {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Chargement des documents…</p> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead><tr className="border-b text-xs uppercase text-muted-foreground"><th className="px-3 py-3">Référence</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Objet</th><th className="px-3 py-3">Montant TTC</th><th className="px-3 py-3">Statut</th></tr></thead>
                  <tbody>
                    {documents.map((document) => <tr key={document.id} className="border-b last:border-0"><td className="px-3 py-3 font-mono">{document.reference}</td><td className="px-3 py-3">{document.typeDocument.replaceAll("_", " ")}</td><td className="max-w-sm truncate px-3 py-3">{document.objet || "-"}</td><td className="px-3 py-3 tabular-nums">{document.montantTTC === undefined ? "-" : `${new Intl.NumberFormat("fr-FR").format(document.montantTTC)} FCFA`}</td><td className="px-3 py-3"><Badge variant="outline">{document.statut ?? "-"}</Badge></td></tr>)}
                    {documents.length === 0 && <tr><td colSpan={5} className="px-3 py-10 text-center text-muted-foreground">Aucun document M5 enregistré pour cette commune.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <form onSubmit={(event) => void save(event)} className="mx-auto my-8 w-full max-w-2xl space-y-4 rounded-xl bg-background p-5 shadow-xl sm:p-6">
            <div><h2 className="text-xl font-semibold">Nouveau document M5</h2><p className="text-sm text-muted-foreground">{currentTenant?.name}</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm">Référence M5<Input required maxLength={100} value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} /></label>
              <label className="grid gap-1.5 text-sm">Type de document<select className="h-10 rounded-md border bg-background px-3" value={form.typeDocument} onChange={(event) => setForm({ ...form, typeDocument: event.target.value })}>{documentTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></label>
              <label className="grid gap-1.5 text-sm sm:col-span-2">Ligne budgétaire<select required className="h-10 min-w-0 rounded-md border bg-background px-3" value={form.ligneBudgetaireId} onChange={(event) => setForm({ ...form, ligneBudgetaireId: event.target.value })}><option value="">Sélectionner une ligne</option>{lignes.map((ligne) => <option key={ligne.id} value={ligne.id}>{ligne.code} · {ligne.libelle}</option>)}</select></label>
              <label className="grid gap-1.5 text-sm sm:col-span-2">Tiers associé (facultatif)<select className="h-10 min-w-0 rounded-md border bg-background px-3" value={form.tiersId} onChange={(event) => setForm({ ...form, tiersId: event.target.value })}><option value="">Aucun tiers</option>{tiers.map((tier) => <option key={tier.id} value={tier.id}>{tier.nom}</option>)}</select></label>
              <label className="grid gap-1.5 text-sm sm:col-span-2">Objet<Input required maxLength={1000} value={form.objet} onChange={(event) => setForm({ ...form, objet: event.target.value })} /></label>
              <label className="grid gap-1.5 text-sm">Montant HT<Input required min="0.01" step="0.01" type="number" value={form.montantHT} onChange={(event) => setForm({ ...form, montantHT: event.target.value })} /></label>
              <label className="grid gap-1.5 text-sm">Montant des taxes<Input min="0" step="0.01" type="number" value={form.montantTaxes} onChange={(event) => setForm({ ...form, montantTaxes: event.target.value })} /></label>
            </div>
            <p className="rounded-md bg-muted p-3 text-sm">Montant TTC calculé : {new Intl.NumberFormat("fr-FR").format((Number(form.montantHT) || 0) + (Number(form.montantTaxes) || 0))} FCFA</p>
            <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={saving || lignes.length === 0}>{saving ? "Enregistrement…" : "Enregistrer le document"}</Button></div>
          </form>
        </div>
      )}
    </div>
  );
}