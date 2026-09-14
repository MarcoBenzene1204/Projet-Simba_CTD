/**
 * Exemple de composant React pour le flux complet ELOP
 * 
 * Workflow:
 * 1. Créer un engagement
 * 2. Valider et réserver les crédits
 * 3. Soumettre au CF et appeler le visa
 * 4. Créer une liquidation
 * 5. Enregistrer la facture et soumettre
 * 6. Créer un mandat et transmettre
 * 7. Effectuer le paiement
 */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  engagementApi,
  liquidationApi,
  mandatApi,
  paiementApi
} from "@/api/budget.api";
import { TypeFacture } from "@/types/budget";
import type {
  Engagement,
} from "@/types/budget";

/**
 * Composant principal du flux ELOP
 * 
 * Fonctionnalités:
 * - Création d'engagement avec document M5
 * - Validation crédits et réservation (UPDLOCK)
 * - Soumission au Contrôleur Financier
 * - Visa avec 4 options (visa, observations, réserves, rejet)
 * - Confirmation et génération numéro unique
 * - Liquidation avec facture (6 types)
 * - Ordonnancement et mandatement
 * - Paiement avec double signature
 */
export const FluxELOPComponent: React.FC = () => {
  // États pour le formulaire d'engagement
  const [documentM5Id, setDocumentM5Id] = useState("");
  const [ordonnatorId, setOrdonnatorId] = useState("");
  const [engagementCurrentId, setEngagementCurrentId] = useState<string | null>(
    null
  );
  const [engagement, setEngagement] = useState<Engagement | null>(null);

  // États pour les étapes suivantes
  const [liquidationCurrentId, setLiquidationCurrentId] = useState<
    string | null
  >(null);
  const [mandatCurrentId, setMandatCurrentId] = useState<string | null>(null);

  // États pour les messages
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Étape 1: Créer un engagement budgétaire
   * Règle métier: RG-DEP-001 - Document M5 obligatoire (exception 470XX)
   *
   * Données pré-remplies automatiquement:
   * - Fournisseur/prestataire
   * - Montant HT, TVA, TTC
   * - Imputation budgétaire
   * - Objet de la dépense
   */
  const handleCreerEngagement = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!documentM5Id || !ordonnatorId) {
        throw new Error("Document M5 et Ordonnateur sont obligatoires");
      }

      // Appel API pour créer l'engagement
      const newEngagement = await engagementApi.creerEngagement(
        documentM5Id,
        ordonnatorId
      );

      setEngagementCurrentId(newEngagement.id);
      setEngagement(newEngagement);
      setSuccessMessage(
        "✅ Engagement créé avec succès. État: BROUILLON. Prêt pour validation."
      );
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Étape 2: Valider et réserver les crédits
   * Règle métier:
   * - RG-DEP-002: Crédits suffisants (BLOQUANT)
   * - Crédits réservés sous UPDLOCK du CF
   */
  const handleValiderCredit = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!engagementCurrentId) throw new Error("Engagement non défini");

      const updated = await engagementApi.validerEtRéserverCrédits(
        engagementCurrentId
      );
      setEngagement(updated);
      setSuccessMessage(
        "✅ Crédits vérifiés et réservés. État: SOUMIS_CF. Envoi au CF..."
      );
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Étape 3: Soumettre au Contrôleur Financier
   * Vérification: Avis d'imposition DGI obligatoire (RG-DEP-005)
   */
  const handleSoumettreAuCF = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!engagementCurrentId) throw new Error("Engagement non défini");

      // À adapter avec l'ID du CF
      const cfId = "cf-001";

      const updated = await engagementApi.soumettreAuControllerFinancier(
        engagementCurrentId,
        cfId
      );
      setEngagement(updated);
      setSuccessMessage("✅ Engagement soumis au Contrôleur Financier");
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Étape 4: Apposer le visa du CF
   * Conforme à RG-DEP-006: Refus levable uniquement par autorisation MINFI
   * 4 options: visa, observations, réserves, rejet
   */
  const handleApposeVisaCF = async (
    typeVisa: "VISA" | "OBSERVATIONS" | "RESERVES" | "REJET"
  ) => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!engagementCurrentId) throw new Error("Engagement non défini");

      const cfId = "cf-001";
      const motif = typeVisa === "REJET" ? "Engagement rejeté par le CF" : "";

      const updated = await engagementApi.apposeVisaCF(
        engagementCurrentId,
        cfId,
        typeVisa,
        motif
      );
      setEngagement(updated);

      if (typeVisa === "VISA") {
        setSuccessMessage("✅ Visa apposé. L'engagement peut être confirmé.");
      } else if (typeVisa === "REJET") {
        setErrorMessage(
          "⚠️ Engagement rejeté. Autorisation MINFI requise pour contourner."
        );
      }
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Étape 5: Confirmer l'engagement
   * Génère un numéro unique avec horodatage WAT UTC+1
   */
  const handleConfirmerEngagement = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!engagementCurrentId) throw new Error("Engagement non défini");

      const updated = await engagementApi.confirmerEngagement(
        engagementCurrentId
      );
      setEngagement(updated);
      setSuccessMessage(
        `✅ Engagement confirmé! Numéro: ${updated.numeroEngagement}`
      );
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Étape 6: Créer une liquidation (FC-DEP-002)
   * Règle métier: RG-DEP-008 - Service fait attesté obligatoire
   */
  const handleCreerLiquidation = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!engagementCurrentId) throw new Error("Engagement non défini");

      const liquidation = await liquidationApi.creerLiquidation(
        engagementCurrentId
      );
      setLiquidationCurrentId(liquidation.id);
      setSuccessMessage(
        "✅ Liquidation créée. Prêt pour attestation de service fait."
      );
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Étape 7: Attester le service fait
   * Attestation numérique obligatoire du service bénéficiaire
   */
  const handleAttesterServiceFait = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!liquidationCurrentId) throw new Error("Liquidation non définie");

      const agentId = "agent-001"; // À adapter

      await liquidationApi.attesterServiceFait(
        liquidationCurrentId,
        agentId
      );
      setSuccessMessage(
        "✅ Service fait attesté. Prêt pour enregistrement de facture."
      );
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Étape 8: Enregistrer la facture
   * Types de facture: COMPLETE, PARTIELLE, PRO_FORMA, AVOIR, RECTIFICATIVE, REGULARISATION
   * Calcul automatique des taxes
   */
  const handleEnregistrerFacture = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!liquidationCurrentId) throw new Error("Liquidation non définie");

      const updated = await liquidationApi.enregistrerFacture(
        liquidationCurrentId,
        {
          typeFacture: TypeFacture.COMPLETE,
          numeroFacture: "FAC-2024-001",
          dateFacture: new Date(),
          montantHT: 1000000,
          detailPrestations: "Facture pour prestations de service"
        }
      );

      setSuccessMessage(
        `✅ Facture enregistrée. Montant TTC: ${updated.montantTTCLiquide} FCFA`
      );
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Étape 9: Créer un mandat (FC-DEP-003)
   * Types de mandats: INDIVIDUEL, COLLECTIF, REGULARISATION, RETENUE, REGLEMENT_OFFICE
   */
  const handleCreerMandat = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!engagementCurrentId) throw new Error("Engagement non défini");

      const mandat = await mandatApi.creerMandat(
        engagementCurrentId,
        "INDIVIDUEL",
        ordonnatorId
      );
      setMandatCurrentId(mandat.id);
      setSuccessMessage(
        `✅ Mandat créé. Numéro: ${mandat.numeroMandat}. État: BROUILLON`
      );
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Étape 10: Apposer cachet "DEPENSE VALIDEE" du CF
   * Règle métier: RG-DEP-013 - Cachet obligatoire
   */
  const handleApposeCachetCF = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!mandatCurrentId) throw new Error("Mandat non défini");

      const cfId = "cf-001";

      await mandatApi.apposeVisaCFEtCachet(mandatCurrentId, cfId);
      setSuccessMessage(
        "✅ Cachet 'DEPENSE VALIDEE' apposé. Prêt pour transmission au Receveur."
      );
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Étape 11: Transmettre au Receveur (FC-DEP-004)
   * Conditions: Cachet "DEPENSE VALIDEE" présent (RG-DEP-013)
   * Clôture avant 31 décembre (RG-DEP-014)
   */
  const handleTransmettreReceveur = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!mandatCurrentId) throw new Error("Mandat non défini");

      const receveId = "receveur-001";

      await mandatApi.transmettreAuReceveur(
        mandatCurrentId,
        receveId
      );
      setSuccessMessage(
        "✅ Mandat transmis au Receveur. Prêt pour paiement."
      );
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Étape 12: Effectuer le paiement (FC-DEP-004)
   * Règles métier:
   * - RG-DEP-016: Seuil caisse/banque 100 000 FCFA
   * - RG-DEP-017: Double signature pour chèques >= 100 000 FCFA
   * - RG-DEP-019: Clôture au 31 janvier N+1
   */
  const handleEffectuerPaiement = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!mandatCurrentId) throw new Error("Mandat non défini");

      const receveId = "receveur-001";

      // Créer instruction de paiement
      const paiement = await paiementApi.creerInstructionPaiement(
        mandatCurrentId,
        receveId
      );
      // Effectuer vérifications
      await paiementApi.effectuerVerifications(paiement.id, {
        validiteCreance: true,
        prescriptionOK: true,
        pasOppositions: true,
        redevabiliteOK: true
      });

      // Déterminer mode de paiement
      await paiementApi.determinierModePaiementEtCachet(paiement.id, false);

      // Signatures
      await paiementApi.enregistrerSignatureReceveur(paiement.id);

      // Effectuer paiement
      const paiementEffectue = await paiementApi.effectuerPaiement(paiement.id);

      setSuccessMessage(
        `✅ Paiement effectué! Montant: ${paiementEffectue.montantNAPVerse} FCFA. Tiers notifié.`
      );
    } catch (error: any) {
      setErrorMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Flux Complet ELOP - Exécution Budgétaire des Dépenses</CardTitle>
          <CardDescription>
            Circuit ELOP: Engagement → Liquidation → Ordonnancement → Paiement
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Messages de statut */}
          {successMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* État actuel */}
          {engagement && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                Engagement actuel: <strong>{engagement.numeroEngagement}</strong> - État:{" "}
                <strong>{engagement.etat}</strong> - Montant TTC:{" "}
                <strong>{engagement.montantTTC} FCFA</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Onglets pour les différentes étapes */}
          <Tabs defaultValue="engagement">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="engagement">1. Engagement</TabsTrigger>
              <TabsTrigger value="liquidation">2. Liquidation</TabsTrigger>
              <TabsTrigger value="mandat">3. Mandat</TabsTrigger>
              <TabsTrigger value="paiement">4. Paiement</TabsTrigger>
            </TabsList>

            {/* Tab 1: Engagement (FC-DEP-001) */}
            <TabsContent value="engagement" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Document M5 ID
                  </label>
                  <Input
                    placeholder="Référence document (BC, marché, etc.)"
                    value={documentM5Id}
                    onChange={(e) => setDocumentM5Id(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ordonnateur ID
                  </label>
                  <Input
                    placeholder="ID du ordonnateur"
                    value={ordonnatorId}
                    onChange={(e) => setOrdonnatorId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleCreerEngagement}
                    disabled={loading || !documentM5Id || !ordonnatorId}
                    className="w-full"
                  >
                    1️⃣ Créer Engagement
                  </Button>

                  {engagement && (
                    <>
                      <Button
                        onClick={handleValiderCredit}
                        disabled={loading || engagement.etat !== "BROUILLON"}
                        className="w-full"
                      >
                        2️⃣ Valider & Réserver Crédits
                      </Button>

                      <Button
                        onClick={handleSoumettreAuCF}
                        disabled={
                          loading ||
                          engagement.etat !== "SOUMIS_CF"
                        }
                        className="w-full"
                      >
                        3️⃣ Soumettre au CF
                      </Button>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleApposeVisaCF("VISA")}
                          disabled={loading}
                          className="w-full bg-green-600"
                        >
                          ✅ Visa
                        </Button>
                        <Button
                          onClick={() => handleApposeVisaCF("REJET")}
                          disabled={loading}
                          className="w-full bg-red-600"
                        >
                          ❌ Rejet
                        </Button>
                      </div>

                      <Button
                        onClick={handleConfirmerEngagement}
                        disabled={
                          loading ||
                          engagement.etat !== "VISE"
                        }
                        className="w-full bg-purple-600"
                      >
                        4️⃣ Confirmer Engagement
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Liquidation (FC-DEP-002) */}
            <TabsContent value="liquidation" className="space-y-4">
              <div className="space-y-2">
                <Button
                  onClick={handleCreerLiquidation}
                  disabled={loading || !engagement}
                  className="w-full"
                >
                  1️⃣ Créer Liquidation
                </Button>

                {liquidationCurrentId && (
                  <>
                    <Button
                      onClick={handleAttesterServiceFait}
                      disabled={loading}
                      className="w-full"
                    >
                      2️⃣ Attester Service Fait
                    </Button>

                    <Button
                      onClick={handleEnregistrerFacture}
                      disabled={loading}
                      className="w-full"
                    >
                      3️⃣ Enregistrer Facture
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Tab 3: Mandat (FC-DEP-003) */}
            <TabsContent value="mandat" className="space-y-4">
              <div className="space-y-2">
                <Button
                  onClick={handleCreerMandat}
                  disabled={loading || !engagement}
                  className="w-full"
                >
                  1️⃣ Créer Mandat
                </Button>

                {mandatCurrentId && (
                  <>
                    <Button
                      onClick={handleApposeCachetCF}
                      disabled={loading}
                      className="w-full"
                    >
                      2️⃣ Apposer Cachet CF
                    </Button>

                    <Button
                      onClick={handleTransmettreReceveur}
                      disabled={loading}
                      className="w-full"
                    >
                      3️⃣ Transmettre Receveur
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Tab 4: Paiement (FC-DEP-004) */}
            <TabsContent value="paiement" className="space-y-4">
              <div className="space-y-2">
                <Button
                  onClick={handleEffectuerPaiement}
                  disabled={loading || !mandatCurrentId}
                  className="w-full bg-blue-600"
                >
                  💰 Effectuer Paiement Complet
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FluxELOPComponent;
