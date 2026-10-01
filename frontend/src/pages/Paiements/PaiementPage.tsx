import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CreditCard, FileClock, Search, ShieldCheck } from "lucide-react";
import { cosignPayment, deferPayment, executePayment, listPaiements, startPayment, type PaiementRecord } from "@/api/finance.api";
import { useAuthorization } from "@/auth/useAuthorization";
import { useAuth } from "@/auth/AuthContext";
import { apiErrorMessage } from "@/api/api-error";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { TableCarousel } from "@/components/ui/table-carousel";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function PaiementPage() {
	const [paiements, setPaiements] = useState<PaiementRecord[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>();
	const { hasPermission } = useAuthorization();
	const { role } = useAuth();
	const navigate = useNavigate();
	const [executionTarget, setExecutionTarget] = useState<PaiementRecord>();
	const [deferTarget, setDeferTarget] = useState<PaiementRecord>();
	const [referenceBancaire, setReferenceBancaire] = useState("");
	const [referenceCheque, setReferenceCheque] = useState("");
	const [deferReason, setDeferReason] = useState("");
	const [saving, setSaving] = useState(false);

	async function transition(paiement: PaiementRecord, action: () => Promise<PaiementRecord>, label: string) {
		if (!window.confirm(`Confirmer l'action « ${label} » pour ${paiement.numeroPaiement} ?`)) return;
		try {
			const updated = await action();
			setPaiements((current) => current.map((item) => item.id === updated.id ? updated : item));
		} catch (error) {
			setError(apiErrorMessage(error, `L'action « ${label} » n'a pas pu être exécutée.`));
		}
	}

	async function saveExecution() {
		if (!executionTarget) return;
		if (executionTarget.modeReglement === "VIREMENT_BANCAIRE" && !referenceBancaire.trim()) {
			setError("La référence bancaire est obligatoire pour un virement.");
			return;
		}
		if (executionTarget.modeReglement === "CHEQUE" && !referenceCheque.trim()) {
			setError("La référence du chèque est obligatoire.");
			return;
		}
		setSaving(true);
		setError(undefined);
		try {
			const updated = await executePayment(executionTarget.id, {
				referenceBancaire: referenceBancaire.trim() || undefined,
				referenceCheque: referenceCheque.trim() || undefined,
			});
			setPaiements((current) => current.map((item) => item.id === updated.id ? updated : item));
			setExecutionTarget(undefined);
			setReferenceBancaire("");
			setReferenceCheque("");
		} catch (cause) {
			setError(apiErrorMessage(cause, "Le paiement n'a pas pu être exécuté."));
		} finally { setSaving(false); }
	}

	async function deferExecution() {
		if (!deferTarget || !deferReason.trim()) return;
		setSaving(true);
		setError(undefined);
		try {
			const updated = await deferPayment(deferTarget.id, deferReason.trim());
			setPaiements((current) => current.map((item) => item.id === updated.id ? updated : item));
			setDeferTarget(undefined);
			setDeferReason("");
		} catch (cause) {
			setError(apiErrorMessage(cause, "Le report du paiement n'a pas pu être enregistré."));
		} finally { setSaving(false); }
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
		<div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-muted-foreground">Exécution financière</p><h1 className="text-2xl font-semibold tracking-tight">Paiements</h1></div>{role === "RECEVEUR" && hasPermission("paiement:creer") && <Button onClick={() => navigate("/dashboard/paiements/nouveau")}>Nouveau paiement</Button>}</div>
		<Card>
			<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Suivi des règlements</CardTitle><div className="relative w-full sm:w-72"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un paiement..." className="pl-8" /></div></CardHeader>
			<CardContent>
				{error && <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
				{loading ? <p className="py-8 text-center text-muted-foreground">Chargement des paiements...</p> : <TableCarousel columns={["Numéro", "Mode", "Date prévue", "Retenues", "Net payé", "Statut", "Signatures", "Actions"]} rows={visiblePaiements} emptyMessage="Aucun paiement trouvé." renderRow={(paiement) => <TableRow key={paiement.id}><TableCell className="font-mono font-medium">{paiement.numeroPaiement}</TableCell><TableCell>{paiement.modeReglement}</TableCell><TableCell>{paiement.dateProgrammee ? new Date(paiement.dateProgrammee).toLocaleDateString("fr-FR") : "-"}</TableCell><TableCell className="text-right">{formatCurrency(paiement.montantRetenues)}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(paiement.montantNetPaye)}</TableCell><TableCell><Badge variant={paiement.statut === "ECHEC" ? "destructive" : paiement.statut === "DIFFERE" ? "outline" : "secondary"}>{paiement.statut}</Badge></TableCell><TableCell className="text-xs"><span className="block">{paiement.cachetVuBonAPayer ? "Receveur signé" : "À viser"}</span>{paiement.doubleSignatureRequise && <span className="block">{paiement.cosignataireSignatureId ? "Cosigné" : "Cosignature requise"}</span>}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => navigate(`/dashboard/paiements/${paiement.id}`)}>Détails</Button>
						{role === "RECEVEUR" && hasPermission("paiement:executer") && (paiement.statut === "PROGRAMME" || paiement.statut === "DIFFERE" || (paiement.statut === "EN_COURS" && !paiement.cachetVuBonAPayer)) && <Button size="sm" variant="outline" className="gap-1" onClick={() => void transition(paiement, () => startPayment(paiement.id), "apposer le cachet VU BON À PAYER")}>{paiement.statut === "DIFFERE" ? "Reprendre" : "VU BON À PAYER"}</Button>}
						{role === "COSIGNATAIRE" && hasPermission("paiement:cosigner") && paiement.statut === "EN_COURS" && paiement.doubleSignatureRequise && !paiement.cosignataireSignatureId && <Button size="sm" className="gap-1" onClick={() => void transition(paiement, () => cosignPayment(paiement.id), "cosigner le paiement")}><ShieldCheck className="h-4 w-4" />Cosigner</Button>}
						{role === "RECEVEUR" && paiement.statut === "EN_COURS" && paiement.cachetVuBonAPayer && (!paiement.doubleSignatureRequise || paiement.cosignataireSignatureId) && <Button size="sm" onClick={() => { setExecutionTarget(paiement); setError(undefined); }}>Exécuter</Button>}
						{role === "RECEVEUR" && (paiement.statut === "PROGRAMME" || paiement.statut === "EN_COURS") && <Button size="sm" variant="outline" className="gap-1" onClick={() => setDeferTarget(paiement)}><FileClock className="h-4 w-4" />Différer</Button>}
					</div></TableCell></TableRow>} />}
			</CardContent>
		</Card>
		<Dialog open={Boolean(executionTarget)} onOpenChange={(open) => { if (!open && !saving) setExecutionTarget(undefined); }}>
			<DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Exécuter le paiement</DialogTitle><DialogDescription>{executionTarget?.numeroPaiement} · Net à payer {formatCurrency(executionTarget?.montantNetPaye)}</DialogDescription></DialogHeader>
			<div className="space-y-4">{executionTarget?.modeReglement === "VIREMENT_BANCAIRE" && <label className="grid gap-2 text-sm font-medium" htmlFor="bank-reference">Référence bancaire<Input id="bank-reference" required value={referenceBancaire} onChange={(event) => setReferenceBancaire(event.target.value)} /></label>}{executionTarget?.modeReglement === "CHEQUE" && <label className="grid gap-2 text-sm font-medium" htmlFor="check-reference">Numéro de chèque<Input id="check-reference" required value={referenceCheque} onChange={(event) => setReferenceCheque(event.target.value)} /></label>}<p className="rounded-md bg-muted p-3 text-sm">Retenues calculées depuis la liasse : {formatCurrency(executionTarget?.montantRetenues)}. Net : {formatCurrency(executionTarget?.montantNetPaye)}.</p>{executionTarget?.doubleSignatureRequise && !executionTarget.cosignataireSignatureId && <p role="alert" className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">La cosignature est requise avant l’exécution.</p>}</div>
			<DialogFooter><Button variant="outline" onClick={() => setExecutionTarget(undefined)} disabled={saving}>Annuler</Button><Button onClick={() => void saveExecution()} disabled={saving || (executionTarget?.doubleSignatureRequise && !executionTarget.cosignataireSignatureId)}>{saving ? "Exécution…" : "Confirmer l’exécution"}</Button></DialogFooter></DialogContent>
		</Dialog>
		<Dialog open={Boolean(deferTarget)} onOpenChange={(open) => { if (!open && !saving) setDeferTarget(undefined); }}>
			<DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Différer le paiement</DialogTitle><DialogDescription>{deferTarget?.numeroPaiement} · Un motif sera communiqué à l’Ordonnateur.</DialogDescription></DialogHeader><label className="grid gap-2 text-sm font-medium" htmlFor="defer-reason">Motif du différé<Textarea id="defer-reason" required maxLength={1000} rows={4} value={deferReason} onChange={(event) => setDeferReason(event.target.value)} placeholder="Ex. disponibilités de caisse insuffisantes…" /></label><DialogFooter><Button variant="outline" onClick={() => setDeferTarget(undefined)} disabled={saving}>Annuler</Button><Button onClick={() => void deferExecution()} disabled={saving || !deferReason.trim()}>{saving ? "Enregistrement…" : "Enregistrer le différé"}</Button></DialogFooter></DialogContent>
		</Dialog>
	</div>;
}

function formatCurrency(value: number | undefined) {
	return `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FCFA`;
}
