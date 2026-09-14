import { useEffect, useMemo, useState } from "react";
import { Search, RefreshCcw } from "lucide-react";
import { listRegularisations, updateRegularisation, type RegularisationRecord } from "@/api/regularisations.api";
import { useAuthorization } from "@/auth/useAuthorization";
import { apiErrorMessage } from "@/api/api-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RegularisationPage() {
	const [items, setItems] = useState<RegularisationRecord[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>();
	const { hasPermission } = useAuthorization();

	async function load() {
		setLoading(true);
		setError(undefined);
		try { setItems(await listRegularisations()); }
		catch (error) { setError(apiErrorMessage(error, "Impossible de charger les régularisations 470XX.")); }
		finally { setLoading(false); }
	}

	useEffect(() => { if (hasPermission("regularisation:lire")) void load(); else setLoading(false); }, [hasPermission]);

	async function transition(item: RegularisationRecord, path: string, label: string, params?: Record<string, string>) {
		if (!window.confirm(`Confirmer l'action « ${label} » pour ${item.numero} ?`)) return;
		try {
			const updated = await updateRegularisation(`/regularisations/${item.id}/${path}`, params);
			setItems((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
		} catch (error) { setError(apiErrorMessage(error, `L'action « ${label} » n'a pas pu être exécutée.`)); }
	}

	const visible = useMemo(() => {
		const query = search.trim().toLowerCase();
		return query ? items.filter((item) => `${item.numero} ${item.referencePaiementDetecte} ${item.natureDepense} ${item.etat}`.toLowerCase().includes(query)) : items;
	}, [items, search]);

	if (!hasPermission("regularisation:lire")) return <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Vous n’avez pas la permission de consulter les régularisations.</p>;

	return <div className="space-y-6"><div className="flex items-end justify-between"><div><p className="text-sm text-muted-foreground">Dépenses sans ordonnancement préalable</p><h1 className="text-2xl font-semibold tracking-tight">Régularisations 470XX</h1></div><Button variant="outline" size="icon" aria-label="Actualiser" onClick={() => void load()}><RefreshCcw className="h-4 w-4" /></Button></div><Card><CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><CardTitle>Registre des anomalies</CardTitle><div className="relative w-full sm:w-80"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une régularisation..." className="pl-8" /></div></CardHeader><CardContent>{error && <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}{loading ? <p className="py-8 text-center text-muted-foreground">Chargement des régularisations...</p> : <Table><TableHeader><TableRow><TableHead>Numéro</TableHead><TableHead>Référence paiement</TableHead><TableHead>Nature</TableHead><TableHead className="text-right">Montant</TableHead><TableHead>Échéance</TableHead><TableHead>État</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{visible.map((item) => <TableRow key={item.id}><TableCell className="font-mono font-medium">{item.numero}</TableCell><TableCell>{item.referencePaiementDetecte}</TableCell><TableCell>{item.natureDepense}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(item.montantDetecte)}</TableCell><TableCell>{item.dateEcheanceRegularisation ? new Date(item.dateEcheanceRegularisation).toLocaleDateString("fr-FR") : "-"}</TableCell><TableCell><Badge variant="secondary">{item.etat}</Badge></TableCell><TableCell className="text-right"><div className="flex justify-end gap-1">{item.etat === "DETECTEE" && hasPermission("regularisation:notifier") && <Button size="sm" variant="outline" onClick={() => void transition(item, "notifier-ordonnateur", "notifier")}>Notifier</Button>}{item.etat === "NOTIFIEE" && hasPermission("regularisation:engager") && <Button size="sm" variant="outline" onClick={() => void transition(item, "engagement", "créer l'engagement")}>Engager</Button>}{item.etat === "ENGAGEMENT_CREE" && hasPermission("regularisation:soumettre") && <Button size="sm" variant="outline" onClick={() => void transition(item, "soumettre-cf", "soumettre au CF")}>Soumettre</Button>}{item.etat === "SOUMIS_CF" && hasPermission("regularisation:valider") && <Button size="sm" onClick={() => void transition(item, "viser-cf", "viser")}>Viser</Button>}{item.etat === "CONTREPASSEE" && hasPermission("regularisation:regulariser") && <Button size="sm" onClick={() => void transition(item, "regulariser", "régulariser")}>Régulariser</Button>}</div></TableCell></TableRow>)}{!visible.length && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Aucune régularisation trouvée.</TableCell></TableRow>}</TableBody></Table>}</CardContent></Card></div>;
}

function formatCurrency(value: number | undefined) { return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`; }
