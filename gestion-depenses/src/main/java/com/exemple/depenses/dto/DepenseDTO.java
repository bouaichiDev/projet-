package com.exemple.depenses.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO pour l'entité Dépense.
 * 
 * Utilisé pour envoyer/recevoir les données des dépenses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepenseDTO {

    /**
     * Identifiant unique de la dépense.
     */
    private Long id;

    /**
     * Titre ou description courte de la dépense.
     */
    @NotBlank(message = "Le titre ne peut pas être vide")
    private String titre;

    /**
     * Montant de la dépense.
     */
    @NotNull(message = "Le montant ne peut pas être vide")
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    private BigDecimal montant;

    /**
     * Date de la dépense.
     */
    @NotNull(message = "La date ne peut pas être vide")
    private LocalDate dateDepense;

    /**
     * Description détaillée.
     */
    private String description;

    /**
     * ID de la catégorie de la dépense.
     */
    @NotNull(message = "La catégorie ne peut pas être vide")
    private Long categorieId;

    /**
     * Nom de la catégorie (pour l'affichage).
     */
    private String categorieNom;

    /**
     * Date de création.
     */
    private LocalDateTime dateCreation;

    /**
     * Date de dernière modification.
     */
    private LocalDateTime dateModification;
}

/**
 * DTO pour la statistique par catégorie.
 * 
 * Affiche le total des dépenses par catégorie.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class StatistiqueCategorieDTO {
    /**
     * Nom de la catégorie.
     */
    private String categorieNom;

    /**
     * ID de la catégorie.
     */
    private Long categorieId;

    /**
     * Total des dépenses pour cette catégorie.
     */
    private BigDecimal total;

    /**
     * Nombre de dépenses dans cette catégorie.
     */
    private Long nombre;

    /**
     * Pourcentage par rapport au total de toutes les dépenses.
     */
    private Double pourcentage;

    /**
     * Couleur de la catégorie (pour les graphiques).
     */
    private String couleur;

    /**
     * Icône de la catégorie.
     */
    private String icone;
}

/**
 * DTO pour les statistiques mensuelles.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class StatistiqueMensueleDTO {
    /**
     * Mois au format "YYYY-MM" (ex: "2024-06").
     */
    private String mois;

    /**
     * Total des dépenses du mois.
     */
    private BigDecimal total;

    /**
     * Nombre de dépenses du mois.
     */
    private Long nombre;

    /**
     * Budget défini pour ce mois (si existant).
     */
    private BigDecimal budget;

    /**
     * Différence : budget - total (peut être négatif si dépassement).
     */
    private BigDecimal difference;

    /**
     * Pourcentage du budget utilisé (0-100%).
     */
    private Double pourcentageUtilise;
}
