package com.exemple.depenses.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO pour l'entité Budget.
 * 
 * Utilisé pour envoyer/recevoir les données des budgets mensuels.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetDTO {

    /**
     * Identifiant unique du budget.
     */
    private Long id;

    /**
     * Montant budgété pour le mois.
     */
    @NotNull(message = "Le montant du budget ne peut pas être vide")
    @DecimalMin(value = "0.01", message = "Le budget doit être supérieur à 0")
    private BigDecimal montantBudgete;

    /**
     * Année du budget (ex: 2024).
     */
    @NotNull(message = "L'année ne peut pas être vide")
    private Integer annee;

    /**
     * Mois du budget (1-12).
     */
    @NotNull(message = "Le mois ne peut pas être vide")
    private Integer mois;

    /**
     * Mois formaté (ex: "2024-06").
     */
    private String moisFormate;

    /**
     * Total réel des dépenses du mois.
     * Calculé au moment de la récupération.
     */
    private BigDecimal totalDepenses;

    /**
     * Budget restant (montantBudgete - totalDepenses).
     * Peut être négatif si dépassement.
     */
    private BigDecimal budgetRestant;

    /**
     * Pourcentage du budget utilisé (0-100%).
     */
    private Double pourcentageUtilise;

    /**
     * Indique si le budget est dépassé.
     */
    private Boolean depasse;

    /**
     * Date de création.
     */
    private LocalDateTime dateCreation;

    /**
     * Date de modification.
     */
    private LocalDateTime dateModification;
}

/**
 * DTO pour la réponse des alertes de budget.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class AlerteBudgetDTO {
    /**
     * Message d'alerte.
     */
    private String message;

    /**
     * Type d'alerte : "ATTENTION" (à 75%), "ALERTE" (à 90%), "DEPASSEMENT" (au-delà)
     */
    private String typeAlerte;

    /**
     * Pourcentage du budget utilisé.
     */
    private Double pourcentageUtilise;

    /**
     * Montant au-delà du budget (null si pas de dépassement).
     */
    private BigDecimal montantDepassement;

    /**
     * Budget du mois.
     */
    private BudgetDTO budget;
}
