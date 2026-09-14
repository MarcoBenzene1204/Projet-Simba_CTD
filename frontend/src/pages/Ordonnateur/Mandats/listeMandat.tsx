import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { FileCheck, Search } from "lucide-react";
import { listMandats, submitMandat, transmitMandatToReceiver, validateMandat, type MandatRecord } from "@/api/finance.api";
import { useAuthorization } from "@/auth/useAuthorization";
import { apiErrorMessage } from "@/api/api-error";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { TableCarousel } from "@/components/ui/table-carousel";

export default function ListeMandat() {
	const [mandats, setMandats] = useState<MandatRecord[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>();
	const { hasPermission } = useAuthorization();
	const navigate = useNavigate();

	async function transition(mandat: MandatRecord, action: () => Promise<MandatRecord>, label: string) {
		if (!window.confirm(`Confirmer l'action « ${label} » pour ${mandat.numeroMandat} ?`)) return;
		try {
			const updated = await action();
			setMandats((current) => current.map((item) => item.id === updated.id ? updated : item));
		} catch (error) {
			setError(apiErrorMessage(error, `L'action « ${label} » n'a pas pu être exécutée.`));
		}
	}

	useEffect(() => {
		if (!hasPermission("mandat:lire")) {
			setLoading(false);
			return;
		}
		void listMandats().then(setMandats).catch((error) => setError(apiErrorMessage(error, "Impossible de charger les mandats."))).finally(() => setLoading(false));
	}, [hasPermission]);

	const visibleMandats = useMemo(() => {
		const query = search.trim().toLowerCase();
		return query ? mandats.filter((mandat) => `${mandat.numeroMandat} ${mandat.typeMandat} ${mandat.etat}`.toLowerCase().includes(query)) : mandats;
	}, [mandats, search]);

	if (!hasPermission("mandat:lire")) {
		return <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Vous n’avez pas la permission de consulter les mandats.</p>;
	}

	return <div className="space-y-6">
		<div className="flex items-end justify-between"><div><p className="text-sm text-muted-foreground">Chaîne de dépense</p><h1 className="text-2xl font-semibold tracking-tight">Mandats</h1></div>{hasPermission("mandat:creer") && <Button onClick={() => navigate("/dashboard/gestion-ordonnateur/mandats/nouveau")}>Nouveau mandat</Button>}</div>
		<Card>
			<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-primary" />Suivi des mandats</CardTitle><div className="relative w-full sm:w-72"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un mandat..." className="pl-8" /></div></CardHeader>
			<CardContent>
				{error && <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
				{loading ? <p className="py-8 text-center text-muted-foreground">Chargement des mandats...</p> : <TableCarousel columns={["Numéro", "Type", "Date", "Montant", "État", "Actions"]} rows={visibleMandats} emptyMessage="Aucun mandat trouvé." renderRow={(mandat) => <TableRow key={mandat.id}><TableCell className="font-mono font-medium">{mandat.numeroMandat}</TableCell><TableCell>{mandat.typeMandat}</TableCell><TableCell>{new Date(mandat.dateMandatement).toLocaleDateString("fr-FR")}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(mandat.montantTTCMandate)}</TableCell><TableCell><Badge variant="secondary">{mandat.etat}</Badge></TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => navigate(`/dashboard/gestion-ordonnateur/mandats/${mandat.id}`)}>Détails</Button>
						{mandat.etat === "BROUILLON" && hasPermission("mandat:soumettre") && <Button size="sm" variant="outline" onClick={() => void transition(mandat, () => submitMandat(mandat.id), "soumettre")}>Soumettre</Button>}
						{mandat.etat === "SOUMIS_CF" && hasPermission("mandat:valider") && <Button size="sm" variant="outline" onClick={() => void transition(mandat, () => validateMandat(mandat.id), "viser")}>Viser</Button>}
						{mandat.etat === "VISE_CF" && hasPermission("mandat:transmettre_receveur") && <Button size="sm" onClick={() => void transition(mandat, () => transmitMandatToReceiver(mandat.id), "transmettre au receveur")}>Transmettre</Button>}
					</div></TableCell></TableRow>} />}
			</CardContent>
		</Card>
	</div>;
}

function formatCurrency(value: number | undefined) {
	return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`;
}
