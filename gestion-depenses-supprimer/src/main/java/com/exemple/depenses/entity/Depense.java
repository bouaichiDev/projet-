package com.exemple.depenses.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entité Depense : représente une dépense enregistrée par un utilisateur.
 * 
 * Relationship :
 *  - Plusieurs dépenses appartiennent à un utilisateur (Many-to-One)
 *  - Plusieurs dépenses appartiennent à une catégorie (Many-to-One)
 */
@Entity
@Table(name = "depenses", indexes = {
    @Index(name = "idx_utilisateur_id", columnList = "utilisateur_id"),
    @Index(name = "idx_categorie_id", columnList = "categorie_id"),
    @Index(name = "idx_date_depense", columnList = "date_depense")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Depense {

    /**
     * Identifiant unique de la dépense.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Titre ou description courte de la dépense (ex: "Epicerie au Carrefour").
     */
    @Column(nullable = false)
    @NotBlank(message = "Le titre de la dépense ne peut pas être vide")
    private String titre;

    /**
     * Montant de la dépense.
     * 
     * @DecimalMin : valide que le montant est positif
     * columnDefinition = "DECIMAL(10, 2)" : définit la précision (10 chiffres, 2 décimales)
     *                    Permet de stocker des montants jusqu'à 99,999,999.99
     */
    @Column(nullable = false, columnDefinition = "DECIMAL(10, 2)")
    @NotNull(message = "Le montant ne peut pas être vide")
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    private BigDecimal montant;

    /**
     * Date de la dépense (sans l'heure).
     */
    @Column(nullable = false)
    @NotNull(message = "La date ne peut pas être vide")
    private LocalDate dateDepense;

    /**
     * Description détaillée de la dépense.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Date de création de l'enregistrement en base de données.
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    /**
     * Date de la dernière modification de la dépense.
     */
    private LocalDateTime dateModification;

    /**
     * Relation Many-to-One : plusieurs dépenses appartiennent à un utilisateur.
     * 
     * @ManyToOne : défini une relation plusieurs-à-un
     * fetch = FetchType.EAGER : charge l'utilisateur systématiquement (on en a souvent besoin)
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    /**
     * Relation Many-to-One : plusieurs dépenses appartiennent à une catégorie.
     * 
     * fetch = FetchType.EAGER : charge la catégorie systématiquement (on en a besoin pour l'affichage)
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categorie_id", nullable = false)
    private Categorie categorie;

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
     * Calcule le mois de la dépense (YYYY-MM).
     * Utile pour les statistiques mensuelles.
     * 
     * @return le mois au format "YYYY-MM" (ex: "2024-06")
     */
    public String obtenirMois() {
        return dateDepense.getYear() + "-" + 
               String.format("%02d", dateDepense.getMonthValue());
    }
}
