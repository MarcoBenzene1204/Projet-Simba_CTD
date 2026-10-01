import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PageHeader } from "@/components/budget/PageHeader";
import { createEngagement, getExerciceCourant, listDocumentsM5, listFournisseurs, listLignesBudgetaires, type DocumentM5Reference } from "@/api/finance.api";
import { useAuthorization } from "@/auth/useAuthorization";
import { apiErrorMessage } from "@/api/api-error";

interface ReferenceOption {
  id: string;
  label: string;
  value: string;
}

export default function CreateEngagementPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthorization();
  const [type, setType] = useState("");
  const [exercice, setExercice] = useState<{ id: string; annee: number } | null>(null);
  const [fournisseurs, setFournisseurs] = useState<ReferenceOption[]>([]);
  const [lignesBudgetaires, setLignesBudgetaires] = useState<ReferenceOption[]>([]);
  const [documentsM5, setDocumentsM5] = useState<DocumentM5Reference[]>([]);
  const [form, setForm] = useState<{
    exerciceId: string;
    ligneBudgetaireId: string;
    tiersId: string;
    documentM5Id: string;
    objet: string;
    montantHT: string;
    tauxTVA: string;
    tauxImpot: string;
    referenceAvisDgi: string;
  }>({ exerciceId: "", ligneBudgetaireId: "", tiersId: "", documentM5Id: "", objet: "", montantHT: "", tauxTVA: "", tauxImpot: "", referenceAvisDgi: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function loadReferences() {
      try {
        const [currentExercice, fournisseurList, ligneBudgetaireList, documentM5List] = await Promise.all([
          getExerciceCourant(),
          listFournisseurs(),
          listLignesBudgetaires(),
          listDocumentsM5(),
        ]);

        setExercice({ id: currentExercice.id, annee: currentExercice.annee });
        setForm((current) => ({ ...current, exerciceId: currentExercice.id }));
        setFournisseurs(
          fournisseurList.map((item) => ({
            id: item.id,
            value: item.id,
            label: item.nom ?? "Fournisseur",
          }))
        );
        setLignesBudgetaires(ligneBudgetaireList.map((item) => ({ id: item.id, value: item.id, label: `${item.code} — ${item.libelle}` })));
        setDocumentsM5(documentM5List);
      } catch (_error) {
        setError("Les référentiels, dont les documents M5, sont indisponibles pour le moment.");
      } finally {
        setLoading(false);
      }
    }

    void loadReferences();
  }, []);

  const montantTTC = useMemo(() => {
    const ht = Number(form.montantHT) || 0;
    const tva = Number(form.tauxTVA) || 0;
    return ht + (ht * tva) / 100;
  }, [form.montantHT, form.tauxTVA]);
  const documentsM5DuType = documentsM5.filter((document) => document.typeDocument === type);
  const documentSelectionne = documentsM5.find((document) => document.id === form.documentM5Id);
  const champsVerrouillesParM5 = type === "BON_COMMANDE" || type === "MARCHE";

  if (!hasPermission("engagement:creer")) return <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Vous n’avez pas la permission de créer un engagement.</p>;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    if (!type || !form.exerciceId || !form.ligneBudgetaireId || !form.documentM5Id.trim() || !form.objet.trim() || Number(form.montantHT) <= 0) {
      setError("Renseignez le type, l'exercice, la ligne budgétaire, la référence M5, l'objet et un montant HT positif.");
      return;
    }
    if (!window.confirm("Confirmer l'enregistrement de cet engagement en brouillon ?")) return;
    try {
      setSaving(true);
      const created = await createEngagement({
        exerciceId: form.exerciceId.trim(),
        ligneBudgetaireId: form.ligneBudgetaireId.trim(),
        tiersId: form.tiersId.trim() || undefined,
        documentM5Id: form.documentM5Id.trim() || undefined,
        typeEngagement: type,
        objet: form.objet.trim(),
        montantHT: Number(form.montantHT),
        tauxTVA: Number(form.tauxTVA) || 0,
        tauxImpot: Number(form.tauxImpot) || 0,
        metadata: form.referenceAvisDgi.trim()
          ? { avisImpositionDgi: form.referenceAvisDgi.trim() }
          : {},
      });
      navigate(`/dashboard/gestion-ordonnateur/engagement/${created.id}`);
    } catch (error) {
      setError(apiErrorMessage(error, "L'engagement n'a pas pu être enregistré. Vérifiez les identifiants métier."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <PageHeader
        title="Nouvel engagement"
        description="Créer un nouvel engagement budgétaire"
        action={
          <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        }
      />

      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations principales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations de l'engagement</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Exercice budgétaire</Label>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium text-foreground">
                  {loading ? "Chargement..." : `Exercice budgétaire\n${exercice?.annee ?? 2026}`}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Type d'engagement</Label>

                <select
                  value={type}
                  onChange={(event) => {
                    setType(event.target.value);
                    setForm((current) => ({
                      ...current,
                      documentM5Id: "",
                      ligneBudgetaireId: "",
                      tiersId: "",
                      objet: "",
                      montantHT: "",
                      tauxTVA: "",
                      tauxImpot: "",
                    }));
                  }}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Sélectionner</option>

                  <option value="BON_COMMANDE">Bon de commande</option>

                  <option value="LETTRE_COMMANDE">Lettre de commande</option>

                  <option value="MARCHE">Marché</option>

                  <option value="PROVISIONNEL">Provisionnel</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Référence document M5</Label>
                <select
                  value={form.documentM5Id}
                  onChange={(event) => {
                    const selected = documentsM5.find((document) => document.id === event.target.value);
                    setForm((current) => ({
                      ...current,
                      documentM5Id: selected?.id ?? "",
                      ligneBudgetaireId: selected?.ligneBudgetaireId ?? "",
                      tiersId: selected?.tiersId ?? "",
                      objet: selected?.objet ?? "",
                      montantHT: selected?.montantHT?.toString() ?? "",
                      tauxTVA: selected?.montantHT && selected.montantTaxes !== undefined
                        ? ((selected.montantTaxes / selected.montantHT) * 100).toFixed(2)
                        : "",
                      tauxImpot: "",
                    }));
                  }}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!type || loading || documentsM5DuType.length === 0}
                  required
                >
                  <option value="">
                    {!type ? "Sélectionner d'abord le type d'engagement" : documentsM5DuType.length ? "Sélectionner un document M5" : "Aucun document M5 disponible pour ce type"}
                  </option>
                  {documentsM5DuType.map((document) => (
                    <option key={document.id} value={document.id}>
                      {document.reference}{document.objet ? ` — ${document.objet}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Référence de l'avis d'imposition DGI</Label>
              <Input
                value={form.referenceAvisDgi}
                onChange={(event) => setForm((current) => ({ ...current, referenceAvisDgi: event.target.value }))}
                placeholder="Requise avant la soumission au contrôleur financier"
              />
            </div>

            <div className="space-y-2">
              <Label>Objet de la dépense</Label>

                <Input required value={form.objet} onChange={(event) => setForm({ ...form, objet: event.target.value })} placeholder="Objet de l'engagement" readOnly={champsVerrouillesParM5 && Boolean(documentSelectionne)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Fournisseur / Prestataire</Label>
                <select
                  value={form.tiersId}
                  onChange={(event) => setForm((current) => ({ ...current, tiersId: event.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  disabled={champsVerrouillesParM5 && Boolean(documentSelectionne)}
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map((item) => (
                    <option key={item.id} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Ligne budgétaire</Label>
                <select
                  value={form.ligneBudgetaireId}
                  onChange={(event) => setForm((current) => ({ ...current, ligneBudgetaireId: event.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  required
                          disabled={Boolean(documentSelectionne)}
                >
                  <option value="">Sélectionner une ligne budgétaire</option>
                  {lignesBudgetaires.map((item) => (
                    <option key={item.id} value={item.value}>{item.label}</option>
                  ))}
                </select>
                {documentSelectionne && !documentSelectionne.ligneBudgetaireId && (
                  <p className="text-sm text-destructive">Ce document M5 ne contient pas d’imputation budgétaire. Demandez à l’administrateur de le compléter.</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Montant HT</Label>
                <Input required min="0.01" step="0.01" type="number" value={form.montantHT} onChange={(event) => setForm({ ...form, montantHT: event.target.value })} readOnly={champsVerrouillesParM5 && Boolean(documentSelectionne)} />
              </div>

              <div className="space-y-2">
                <Label>Taxes</Label>
                <Input type="number" min="0" step="0.01" value={form.tauxTVA} onChange={(event) => setForm({ ...form, tauxTVA: event.target.value })} placeholder="Taux TVA (%)" readOnly={champsVerrouillesParM5 && Boolean(documentSelectionne)} />
              </div>

              <div className="space-y-2">
                <Label>Montant TTC</Label>
                <Input value={`${montantTTC.toLocaleString("fr-FR")} FCFA`} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Résumé */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Résumé budgétaire</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Montant calculé</p>
            <p className="text-xl font-bold text-primary">{montantTTC.toLocaleString("fr-FR")} FCFA</p>
            <p className="text-xs text-muted-foreground">Le crédit disponible sera vérifié par le backend lors de la soumission.</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Annuler</Button>

        <Button type="submit" disabled={saving || loading} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
