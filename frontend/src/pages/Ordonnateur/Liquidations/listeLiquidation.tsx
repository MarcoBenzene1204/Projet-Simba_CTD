import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, ReceiptText } from "lucide-react";
import { attestServiceDone, listLiquidations, submitLiquidation, validateLiquidation, type LiquidationRecord } from "@/api/finance.api";
import { useAuthorization } from "@/auth/useAuthorization";
import { apiErrorMessage } from "@/api/api-error";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { TableCarousel } from "@/components/ui/table-carousel";

export default function ListeLiquidation() {
	const [liquidations, setLiquidations] = useState<LiquidationRecord[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>();
	const { hasPermission } = useAuthorization();
	const navigate = useNavigate();

	async function transition(liquidation: LiquidationRecord, action: () => Promise<LiquidationRecord>, label: string) {
		if (!window.confirm(`Confirmer l'action « ${label} » pour ${liquidation.numero} ?`)) return;
		try {
			const updated = await action();
			setLiquidations((current) => current.map((item) => item.id === updated.id ? updated : item));
		} catch (error) {
			setError(apiErrorMessage(error, `L'action « ${label} » n'a pas pu être exécutée.`));
		}
	}

	useEffect(() => {
		if (!hasPermission("liquidation:lire")) {
			setLoading(false);
			return;
		}
		void listLiquidations()
			.then(setLiquidations)
			.catch((error) => setError(apiErrorMessage(error, "Impossible de charger les liquidations.")))
			.finally(() => setLoading(false));
	}, [hasPermission]);

	const visibleLiquidations = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return liquidations;
		return liquidations.filter((liquidation) =>
			`${liquidation.numero} ${liquidation.numeroFacture} ${liquidation.etat} ${liquidation.engagement?.numeroEngagement ?? ""}`
				.toLowerCase()
				.includes(query),
		);
	}, [liquidations, search]);

	if (!hasPermission("liquidation:lire")) {
		return <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Vous n’avez pas la permission de consulter les liquidations.</p>;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-end justify-between">
				<div>
				<p className="text-sm text-muted-foreground">Gestion financière</p>
				<h1 className="text-2xl font-semibold tracking-tight">Liquidations</h1>
				</div>
				{hasPermission("liquidation:creer") && <Button onClick={() => navigate("/dashboard/gestion-ordonnateur/liquidations/nouveau")} >Nouvelle liquidation</Button>}
			</div>
			<Card>
				<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<CardTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5 text-primary" />Suivi des dossiers</CardTitle>
					<div className="relative w-full sm:w-72"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une liquidation..." className="pl-8" /></div>
				</CardHeader>
				<CardContent>
					{error && <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
					{loading ? <p className="py-8 text-center text-muted-foreground">Chargement des liquidations...</p> : <TableCarousel columns={["Numéro", "Engagement", "Facture", "Date", "Montant TTC", "État", "Actions"]} rows={visibleLiquidations} emptyMessage="Aucune liquidation trouvée." renderRow={(liquidation) => <TableRow key={liquidation.id}>
								<TableCell className="font-mono font-medium">{liquidation.numero}</TableCell>
								<TableCell>{liquidation.engagement?.numeroEngagement ?? "-"}</TableCell>
								<TableCell>{liquidation.numeroFacture}</TableCell>
								<TableCell>{new Date(liquidation.dateFacture).toLocaleDateString("fr-FR")}</TableCell>
								<TableCell className="text-right font-semibold">{formatCurrency(liquidation.montantTTC)}</TableCell>
								<TableCell><Badge variant="secondary">{liquidation.etat}</Badge></TableCell>
								<TableCell className="text-right"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => navigate(`/dashboard/gestion-ordonnateur/liquidations/${liquidation.id}`)}>Détails</Button>
									{liquidation.etat === "BROUILLON" && hasPermission("liquidation:attester_service_fait") && <Button size="sm" variant="outline" onClick={() => void transition(liquidation, () => attestServiceDone(liquidation.id), "attester le service fait")}>Service fait</Button>}
									{liquidation.etat === "BROUILLON" && liquidation.serviceFaitAt && hasPermission("liquidation:soumettre") && <Button size="sm" variant="outline" onClick={() => void transition(liquidation, () => submitLiquidation(liquidation.id), "soumettre")}>Soumettre</Button>}
									{liquidation.etat === "SOUMISE_CF" && hasPermission("liquidation:valider") && <Button size="sm" onClick={() => void transition(liquidation, () => validateLiquidation(liquidation.id), "valider")}>Valider</Button>}
								</div></TableCell>
							</TableRow>} />}
				</CardContent>
			</Card>
		</div>
	);
}

function formatCurrency(value: number | undefined) {
	return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`;
}
