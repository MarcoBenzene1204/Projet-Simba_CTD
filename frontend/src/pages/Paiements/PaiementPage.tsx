import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CreditCard, Search } from "lucide-react";
import { executePayment, listPaiements, startPayment, type PaiementRecord } from "@/api/finance.api";
import { useAuthorization } from "@/auth/useAuthorization";
import { apiErrorMessage } from "@/api/api-error";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { TableCarousel } from "@/components/ui/table-carousel";

export default function PaiementPage() {
	const [paiements, setPaiements] = useState<PaiementRecord[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>();
	const { hasPermission } = useAuthorization();
	const navigate = useNavigate();

	async function transition(paiement: PaiementRecord, action: () => Promise<PaiementRecord>, label: string) {
		if (!window.confirm(`Confirmer l'action « ${label} » pour ${paiement.numeroPaiement} ?`)) return;
		try {
			const updated = await action();
			setPaiements((current) => current.map((item) => item.id === updated.id ? updated : item));
		} catch (error) {
			setError(apiErrorMessage(error, `L'action « ${label} » n'a pas pu être exécutée.`));
		}
	}

	useEffect(() => {
		if (!hasPermission("paiement:lire")) {
			setLoading(false);
			return;
		}
		void listPaiements().then(setPaiements).catch((error) => setError(apiErrorMessage(error, "Impossible de charger les paiements."))).finally(() => setLoading(false));
	}, [hasPermission]);

	const visiblePaiements = useMemo(() => {
		const query = search.trim().toLowerCase();
		return query ? paiements.filter((paiement) => `${paiement.numeroPaiement} ${paiement.modeReglement} ${paiement.statut}`.toLowerCase().includes(query)) : paiements;
	}, [paiements, search]);

	if (!hasPermission("paiement:lire")) {
		return <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Vous n’avez pas la permission de consulter les paiements.</p>;
	}

	return <div className="space-y-6">
		<div className="flex items-end justify-between"><div><p className="text-sm text-muted-foreground">Exécution financière</p><h1 className="text-2xl font-semibold tracking-tight">Paiements</h1></div>{hasPermission("paiement:creer") && <Button onClick={() => navigate("/dashboard/gestion-ordonnateur/paiements/nouveau")}>Nouveau paiement</Button>}</div>
		<Card>
			<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Suivi des règlements</CardTitle><div className="relative w-full sm:w-72"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un paiement..." className="pl-8" /></div></CardHeader>
			<CardContent>
				{error && <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
				{loading ? <p className="py-8 text-center text-muted-foreground">Chargement des paiements...</p> : <TableCarousel columns={["Numéro", "Mode", "Date prévue", "Net payé", "Statut", "Actions"]} rows={visiblePaiements} emptyMessage="Aucun paiement trouvé." renderRow={(paiement) => <TableRow key={paiement.id}><TableCell className="font-mono font-medium">{paiement.numeroPaiement}</TableCell><TableCell>{paiement.modeReglement}</TableCell><TableCell>{paiement.dateProgrammee ? new Date(paiement.dateProgrammee).toLocaleDateString("fr-FR") : "-"}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(paiement.montantNetPaye)}</TableCell><TableCell><Badge variant="secondary">{paiement.statut}</Badge></TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => navigate(`/dashboard/gestion-ordonnateur/paiements/${paiement.id}`)}>Détails</Button>
						{paiement.statut === "PROGRAMME" && hasPermission("paiement:executer") && <Button size="sm" variant="outline" onClick={() => void transition(paiement, () => startPayment(paiement.id), "démarrer l'exécution")}>Démarrer</Button>}
						{paiement.statut === "EN_COURS" && hasPermission("paiement:executer") && <Button size="sm" onClick={() => void transition(paiement, () => executePayment(paiement.id), "exécuter le paiement")}>Exécuter</Button>}
					</div></TableCell></TableRow>} />}
			</CardContent>
		</Card>
	</div>;
}

function formatCurrency(value: number | undefined) {
	return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`;
}
