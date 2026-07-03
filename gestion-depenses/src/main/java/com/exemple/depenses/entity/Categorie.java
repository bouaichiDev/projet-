package com.exemple.depenses.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité Catégorie : représente une catégorie de dépense (Alimentation, Transport, etc).
 * 
 * Relationship :
 *  - Plusieurs catégories appartiennent à un utilisateur (Many-to-One)
 *  - Une catégorie peut avoir plusieurs dépenses (One-to-Many)
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categorie {

    /**
     * Identifiant unique de la catégorie.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nom de la catégorie (ex: "Alimentation", "Transport", "Logement").
     */
    @Column(nullable = false)
    @NotBlank(message = "Le nom de la catégorie ne peut pas être vide")
    @Size(min = 2, max = 100, message = "Le nom doit faire entre 2 et 100 caractères")
    private String nom;

    /**
     * Description optionnelle de la catégorie.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Couleur associée à la catégorie (pour l'affichage, ex: "#FF5733").
     */
    @Column(length = 7)
    private String couleur;

    /**
     * Icône associée à la catégorie (ex: "🍔" pour alimentation).
     */
    @Column(length = 10)
    private String icone;

    /**
     * Date de création de la catégorie.
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    /**
     * Date de la dernière modification de la catégorie.
     */
    private LocalDateTime dateModification;

    /**
     * Relation Many-to-One : plusieurs catégories appartiennent à un utilisateur.
     * 
     * @ManyToOne : défini une relation plusieurs-à-un
     * @JoinColumn : définit la colonne de clé étrangère (utilisateur_id)
     * fetch = FetchType.LAZY : charge l'utilisateur que si on y accède
     * nullable = false : une catégorie doit toujours appartenir à un utilisateur
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    /**
     * Relation One-to-Many : une catégorie peut avoir plusieurs dépenses.
     * 
     * cascade = CascadeType.ALL : si on supprime la catégorie, on supprime aussi les dépenses
     * orphanRemoval = true : supprime les dépenses si on les retire de la liste
     */
    @OneToMany(mappedBy = "categorie", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Depense> depenses = new HashSet<>();

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
}
