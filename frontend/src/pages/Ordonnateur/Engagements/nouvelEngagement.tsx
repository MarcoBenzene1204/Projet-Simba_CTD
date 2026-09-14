import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PageHeader } from "@/components/budget/PageHeader";
import { createEngagement, getExerciceCourant, listFournisseurs, listLignesBudgetaires } from "@/api/finance.api";
import { useAuthorization } from "@/auth/useAuthorization";
import { apiErrorMessage } from "@/api/api-error";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [form, setForm] = useState<{
    exerciceId: string;
    ligneBudgetaireId: string;
    tiersId: string;
    documentM5Id: string;
    objet: string;
    montantHT: string;
    tauxTVA: string;
    tauxImpot: string;
  }>({ exerciceId: "", ligneBudgetaireId: "", tiersId: "", documentM5Id: "", objet: "", montantHT: "", tauxTVA: "", tauxImpot: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function loadReferences() {
      try {
        const [currentExercice, fournisseurList, ligneBudgetaireList] = await Promise.all([
          getExerciceCourant().catch(() => ({ id: "00000000-0000-0000-0000-000000000001", annee: 2026, libelle: "2026" })),
          listFournisseurs().catch(() => [
            { id: "00000000-0000-0000-0000-000000000010", nom: "ABC SARL" },
            { id: "00000000-0000-0000-0000-000000000011", nom: "ETS Exemple" },
            { id: "00000000-0000-0000-0000-000000000012", nom: "Société XYZ" },
          ]),
          listLignesBudgetaires().catch(() => [
            { id: "00000000-0000-0000-0000-000000000020", code: "601100", libelle: "Fournitures de bureau" },
            { id: "00000000-0000-0000-0000-000000000021", code: "611200", libelle: "Entretien bâtiments" },
            { id: "00000000-0000-0000-0000-000000000022", code: "623100", libelle: "Communication" },
          ]),
        ]);

        setExercice({ id: currentExercice.id, annee: currentExercice.annee });
        setForm((current) => ({ ...current, exerciceId: currentExercice.id }));
        setFournisseurs(
          fournisseurList.map((item) => ({
            id: item.id,
            value: item.id,
            label: "raisonSociale" in item ? (item.raisonSociale ?? item.nom ?? "Fournisseur") : item.nom ?? "Fournisseur",
          }))
        );
        setLignesBudgetaires(ligneBudgetaireList.map((item) => ({ id: item.id, value: item.id, label: `${item.code} — ${item.libelle}` })));
      } catch (_error) {
        setError("Les référentiels de l'exercice, fournisseurs et lignes budgétaires sont indisponibles pour le moment.");
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
                  onChange={(event) => setType(event.target.value)}
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

                <Input value={form.documentM5Id} onChange={(event) => setForm({ ...form, documentM5Id: event.target.value })} placeholder="Référence M5 obligatoire" disabled={!type} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Objet de la dépense</Label>

              <Input required value={form.objet} onChange={(event) => setForm({ ...form, objet: event.target.value })} placeholder="Objet de l'engagement" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Fournisseur / Prestataire</Label>
                <Select value={form.tiersId || null} onValueChange={(value) => setForm({ ...form, tiersId: value ?? "" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    {fournisseurs.map((item) => (
                      <SelectItem key={item.id} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ligne budgétaire</Label>
                <Select value={form.ligneBudgetaireId || null} onValueChange={(value) => setForm({ ...form, ligneBudgetaireId: value ?? "" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une ligne budgétaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {lignesBudgetaires.map((item) => (
                      <SelectItem key={item.id} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Montant HT</Label>
                <Input required min="0.01" step="0.01" type="number" value={form.montantHT} onChange={(event) => setForm({ ...form, montantHT: event.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Taxes</Label>
                <Input type="number" min="0" step="0.01" value={form.tauxTVA} onChange={(event) => setForm({ ...form, tauxTVA: event.target.value })} placeholder="Taux TVA (%)" />
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
