package com.exemple.depenses.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;

/**
 * Entité Budget : représente le budget mensuel défini par un utilisateur.
 * 
 * Un utilisateur peut définir un budget pour chaque mois.
 * Par exemple : "En juin 2024, je dois dépenser max 2000€".
 * 
 * Relationship :
 *  - Plusieurs budgets appartiennent à un utilisateur (Many-to-One)
 */
@Entity
@Table(name = "budgets", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"utilisateur_id", "annee", "mois"},
                      name = "uk_utilisateur_annee_mois")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    /**
     * Identifiant unique du budget.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Montant budgété pour le mois.
     * 
     * Par exemple : 2000 euros pour le mois de juin 2024.
     */
    @Column(nullable = false, columnDefinition = "DECIMAL(10, 2)")
    @NotNull(message = "Le montant du budget ne peut pas être vide")
    @DecimalMin(value = "0.01", message = "Le budget doit être supérieur à 0")
    private BigDecimal montantBudgete;

    /**
     * Année du budget (ex: 2024).
     */
    @Column(nullable = false)
    @NotNull(message = "L'année ne peut pas être vide")
    private Integer annee;

    /**
     * Mois du budget (1-12, ex: 6 pour juin).
     */
    @Column(nullable = false)
    @NotNull(message = "Le mois ne peut pas être vide")
    private Integer mois;

    /**
     * Date de création du budget.
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    /**
     * Date de la dernière modification du budget.
     */
    private LocalDateTime dateModification;

    /**
     * Relation Many-to-One : plusieurs budgets appartiennent à un utilisateur.
     * 
     * @ManyToOne : défini une relation plusieurs-à-un
     * fetch = FetchType.EAGER : charge l'utilisateur systématiquement
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    /**
     * Initialise automatiquement la date de création.
     */
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }

    /**
     * Met à jour la date de modification à chaque sauvegarde.
     */
    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }

    /**
     * Retourne le YearMonth (année-mois) du budget.
     * Utile pour comparer avec les dépenses.
     * 
     * @return YearMonth correspondant à ce budget
     */
    public YearMonth obtenirYearMonth() {
        return YearMonth.of(this.annee, this.mois);
    }

    /**
     * Retourne le mois au format "YYYY-MM".
     * 
     * @return le mois (ex: "2024-06")
     */
    public String obtenirMoisFormate() {
        return String.format("%04d-%02d", annee, mois);
    }
}
