package com.marco.Simba_CTD.service;

import com.marco.Simba_CTD.entity.Engagement;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.util.UUID;


@Service
@Transactional(readOnly = true)
public class EngagementPdfService {

    private final EngagementService engagementService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public EngagementPdfService(
            EngagementService engagementService) {
        this.engagementService = engagementService;
    }

    /**
     * Génère la fiche d'engagement au format PDF.
     *
     * Le document est construit à partir des données
     * récupérées depuis le backend.
     */
    public byte[] genererPdf(UUID engagementId) {

                Engagement engagement = engagementService.obtenirEngagement(engagementId);

        try (
                PDDocument document = new PDDocument();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {

                float margin = 50;
                float y = 800;

                // =========================
                // TITRE
                // =========================

                content.setFont(
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA_BOLD),
                        16);

                centrer(
                        content,
                        "REPUBLIQUE DU CAMEROUN",
                        y);

                y -= 25;

                content.setFont(
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA),
                        10);

                centrer(
                        content,
                        "Paix - Travail - Patrie",
                        y);

                y -= 45;

                content.setFont(
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA_BOLD),
                        15);

                centrer(
                        content,
                        "FICHE D'ENGAGEMENT",
                        y);

                y -= 40;

                // =========================
                // INFORMATIONS GENERALES
                // =========================

                y = ecrireSection(
                        content,
                        "1. INFORMATIONS GENERALES",
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Numero d'engagement",
                        engagement.getNumeroEngagement(),
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Date d'engagement",
                        formaterDate(
                                engagement.getDateEngagement() == null
                                        ? null
                                        : engagement.getDateEngagement().atStartOfDay()),
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Etat",
                        engagement.getEtat() != null
                                ? engagement.getEtat().name()
                                : "-",
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Type",
                        engagement.getTypeEngagement() != null
                                ? engagement.getTypeEngagement().name()
                                : "-",
                        y,
                        margin);

                y -= 15;

                // =========================
                // OBJET
                // =========================

                y = ecrireSection(
                        content,
                        "2. OBJET DE LA DEPENSE",
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Objet",
                        engagement.getObjet(),
                        y,
                        margin);

                y -= 15;

                // =========================
                // DOCUMENT M5
                // =========================

                y = ecrireSection(
                        content,
                        "3. DOCUMENT M5",
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Reference M5",
                        engagement.getDocumentM5Id() != null
                                ? engagement.getDocumentM5Id().toString()
                                : "-",
                        y,
                        margin);

                y -= 15;

                // =========================
                // IMPUTATION
                // =========================

                y = ecrireSection(
                        content,
                        "4. IMPUTATION BUDGETAIRE",
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Ligne budgetaire",
                        engagement.getLignebudgetaireId() != null
                                ? engagement.getLignebudgetaireId().toString()
                                : "-",
                        y,
                        margin);

                y -= 15;

                // =========================
                // MONTANTS
                // =========================

                y = ecrireSection(
                        content,
                        "5. MONTANTS",
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Montant HT",
                        montant(engagement.getMontantHT()),
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Taux TVA",
                        taux(engagement.getTauxTVA()),
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Montant TVA",
                        montant(engagement.getMontantTVA()),
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Montant TTC",
                        montant(engagement.getMontantTTC()),
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Taux impot",
                        taux(engagement.getTauxImpot()),
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Montant impot",
                        montant(engagement.getMontantImpot()),
                        y,
                        margin);

                y -= 15;

                // =========================
                // ACTEURS
                // =========================

                y = ecrireSection(
                        content,
                        "6. ACTEURS",
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Ordonnateur",
                        id(engagement.getOrdonnatorId()),
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Controleur financier",
                        id(engagement.getControllerFinancierVisaId()),
                        y,
                        margin);

                y -= 15;

                // =========================
                // VISA
                // =========================

                y = ecrireSection(
                        content,
                        "7. VISA DU CONTROLEUR FINANCIER",
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Date du visa",
                        formaterDate(engagement.getDateVisa()),
                        y,
                        margin);

                y = ecrireLigne(
                        content,
                        "Decision",
                        engagement.getEtat() != null
                                ? engagement.getEtat().name()
                                : "-",
                        y,
                        margin);

                if (engagement.getMotifRejet() != null) {
                    y = ecrireLigne(
                            content,
                            "Motif",
                            engagement.getMotifRejet(),
                            y,
                            margin);
                }

                // =========================
                // PIED DE PAGE
                // =========================

                content.setFont(
                        new PDType1Font(
                                Standard14Fonts.FontName.HELVETICA),
                        8);

                content.beginText();
                content.newLineAtOffset(
                        margin,
                        30);

                content.showText(
                        "Document genere automatiquement par Simba CTD");

                content.endText();
            }

            document.save(outputStream);

            return outputStream.toByteArray();

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Erreur lors de la generation du PDF "
                            + "de l'engagement.",
                    e);
        }
    }

    // =========================================================
    // METHODES UTILITAIRES
    // =========================================================

    private float ecrireSection(
            PDPageContentStream content,
            String titre,
            float y,
            float x) throws IOException {

        content.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA_BOLD),
                11);

        content.beginText();
        content.newLineAtOffset(x, y);
        content.showText(titre);
        content.endText();

        return y - 22;
    }

    private float ecrireLigne(
            PDPageContentStream content,
            String label,
            String valeur,
            float y,
            float x) throws IOException {

        content.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA_BOLD),
                9);

        content.beginText();
        content.newLineAtOffset(x, y);
        content.showText(label + " :");
        content.endText();

        content.setFont(
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA),
                9);

        content.beginText();
        content.newLineAtOffset(x + 160, y);
        content.showText(
                valeur != null ? nettoyer(valeur) : "-");
        content.endText();

        return y - 18;
    }

    private void centrer(
            PDPageContentStream content,
            String texte,
            float y) throws IOException {

        float largeur = new PDType1Font(
                Standard14Fonts.FontName.HELVETICA_BOLD).getStringWidth(texte) / 1000 * 12;

        float x = (PDRectangle.A4.getWidth() - largeur) / 2;

        content.beginText();
        content.newLineAtOffset(x, y);
        content.showText(texte);
        content.endText();
    }

    private String montant(BigDecimal montant) {
        if (montant == null) {
            return "-";
        }

        return montant.toPlainString() + " FCFA";
    }

    private String taux(BigDecimal taux) {
        if (taux == null) {
            return "-";
        }

        return taux.toPlainString() + " %";
    }

    private String id(UUID id) {
        return id != null ? id.toString() : "-";
    }

    private String formaterDate(LocalDateTime date) {
        return date != null
                ? date.format(DATE_FORMATTER)
                : "-";
    }

    private String nettoyer(String texte) {

        if (texte == null) {
            return "-";
        }

        return texte
                .replace("\n", " ")
                .replace("\r", " ");
    }
}
