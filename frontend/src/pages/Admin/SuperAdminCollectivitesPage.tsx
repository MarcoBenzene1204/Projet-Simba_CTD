import { useEffect, useState, type FormEvent } from "react";
import { Building2, Pencil, Plus, RefreshCcw } from "lucide-react";

import { createCollectivite, listCollectivites, updateCollectivite, updateCollectiviteStatus, type Collectivite, type CollectivitePayload } from "@/api/collectivites.api";
import { apiErrorMessage } from "@/api/api-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const emptyForm: CollectivitePayload = {
  code: "", nom: "", type: "COMMUNE", region: "", departement: "", arrondissement: "", adresse: "", telephone: "", email: "", logoUrl: "",
  statut: "ACTIVE", fuseauHoraire: "Africa/Douala", devise: "XAF", couleurPrincipale: "#14532D", couleurAccent: "#D9A441",
};

const types = ["COMMUNE", "COMMUNAUTE_URBAINE", "REGION"];
const statuts = ["ACTIVE", "SUSPENDUE", "ARCHIVEE"];

export default function SuperAdminCollectivitesPage() {
  const [collectivites, setCollectivites] = useState<Collectivite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Collectivite | null>(null);
  const [form, setForm] = useState<CollectivitePayload>(emptyForm);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setCollectivites(await listCollectivites());
    } catch (cause) {
      setError(apiErrorMessage(cause, "Impossible de charger les collectivités."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const toggleStatus = async (collectivite: Collectivite) => {
    const statut = collectivite.statut === "SUSPENDUE" ? "ACTIVE" : "SUSPENDUE";
    try {
      const updated = await updateCollectiviteStatus(collectivite.id, statut);
      setCollectivites((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (cause) {
      setError(apiErrorMessage(cause, "Impossible de modifier le statut de la collectivité."));
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (collectivite: Collectivite) => {
    setEditing(collectivite);
    setForm({ ...emptyForm, ...collectivite, statut: collectivite.statut ?? "ACTIVE" });
    setFormOpen(true);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); setError(null);
    try {
      const saved = editing ? await updateCollectivite(editing.id, form) : await createCollectivite(form);
      setCollectivites((current) => editing ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
      setFormOpen(false);
    } catch (cause) {
      setError(apiErrorMessage(cause, `Impossible d${editing ? "’enregistrer les modifications" : "’ajouter la collectivité"}.`));
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Collectivités territoriales</h1>
          <p className="text-sm text-muted-foreground">Vue dédiée de supervision et de gestion des CTD.</p>
        </div>
        <div className="flex gap-2"><Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Ajouter une CTD</Button><Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}><RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualiser</Button></div>
      </div>

      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {collectivites.map((collectivite) => (
          <Card key={collectivite.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4 text-emerald-600" />{collectivite.nom}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{collectivite.code} · {collectivite.type}</p>
              </div>
              <Badge variant={collectivite.statut === "SUSPENDUE" ? "destructive" : "secondary"}>{collectivite.statut ?? "ACTIVE"}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{[collectivite.arrondissement, collectivite.departement, collectivite.region].filter(Boolean).join(", ") || "Localisation non renseignée"}</p>
              <div className="flex items-center justify-between gap-3">
                <span>{collectivite.email ?? "Aucun contact"}</span>
                <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(collectivite)} aria-label={`Modifier ${collectivite.nom}`}><Pencil className="h-4 w-4" /></Button><Button size="sm" variant="outline" onClick={() => void toggleStatus(collectivite)}>{collectivite.statut === "SUSPENDUE" ? "Réactiver" : "Suspendre"}</Button></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && collectivites.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Aucune collectivité enregistrée.</p>}

      {formOpen && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 p-4"><form onSubmit={(event) => void save(event)} className="mx-auto my-8 w-full max-w-3xl space-y-4 rounded-xl bg-white p-6 shadow-xl"><div><h2 className="text-xl font-semibold">{editing ? "Modifier la collectivité" : "Ajouter une collectivité"}</h2><p className="text-sm text-muted-foreground">Les champs marqués d’un astérisque sont obligatoires.</p></div><div className="grid gap-3 sm:grid-cols-2"><Input required placeholder="Code *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /><Input required placeholder="Nom *" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /><select required className="h-10 rounded-md border bg-white px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{types.map((type) => <option key={type}>{type}</option>)}</select><select className="h-10 rounded-md border bg-white px-3 text-sm" value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>{statuts.map((statut) => <option key={statut}>{statut}</option>)}</select><Input placeholder="Région" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /><Input placeholder="Département" value={form.departement} onChange={(e) => setForm({ ...form, departement: e.target.value })} /><Input placeholder="Arrondissement" value={form.arrondissement} onChange={(e) => setForm({ ...form, arrondissement: e.target.value })} /><Input placeholder="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /><Input type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><Input placeholder="Adresse" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /><Input placeholder="URL du logo" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} /><Input placeholder="Devise" value={form.devise} onChange={(e) => setForm({ ...form, devise: e.target.value })} /><label className="flex items-center gap-2 text-sm">Couleur principale <input type="color" value={form.couleurPrincipale} onChange={(e) => setForm({ ...form, couleurPrincipale: e.target.value })} /></label><label className="flex items-center gap-2 text-sm">Couleur d’accent <input type="color" value={form.couleurAccent} onChange={(e) => setForm({ ...form, couleurAccent: e.target.value })} /></label></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Annuler</Button><Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : editing ? "Enregistrer" : "Créer la CTD"}</Button></div></form></div>}
    </div>
  );
}
