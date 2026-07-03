package com.exemple.depenses.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité Utilisateur : représente un utilisateur de l'application.
 * 
 * @Entity : indique que cette classe est une entité JPA
 * @Table : définit le nom de la table dans la base de données
 * 
 * Relationship (Relation) :
 *  - Un utilisateur a plusieurs catégories (One-to-Many)
 *  - Un utilisateur a plusieurs dépenses (One-to-Many)
 *  - Un utilisateur a plusieurs budgets (One-to-Many)
 */
@Entity
@Table(name = "utilisateurs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur {

    /**
     * Identifiant unique de l'utilisateur.
     * 
     * @Id : indique que c'est la clé primaire
     * @GeneratedValue : génère automatiquement un ID
     *                   IDENTITY = la base de données génère l'ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nom d'utilisateur unique.
     * 
     * @Column(unique = true) : vérifie que la valeur est unique dans la base
     * @NotBlank : valide que le champ n'est pas vide
     * @Size : valide la taille de la chaîne de caractères
     */
    @Column(nullable = false, unique = true)
    @NotBlank(message = "Le nom d'utilisateur ne peut pas être vide")
    @Size(min = 3, max = 50, message = "Le nom d'utilisateur doit faire entre 3 et 50 caractères")
    private String username;

    /**
     * Adresse email unique de l'utilisateur.
     * 
     * @Email : valide que c'est une adresse email correcte
     */
    @Column(nullable = false, unique = true)
    @NotBlank(message = "L'email ne peut pas être vide")
    @Email(message = "L'email doit être valide")
    private String email;

    /**
     * Mot de passe chiffré avec BCrypt.
     * Important : le mot de passe ne doit JAMAIS être affiché ou loggé
     */
    @Column(nullable = false)
    @NotBlank(message = "Le mot de passe ne peut pas être vide")
    @Size(min = 8, message = "Le mot de passe doit faire au minimum 8 caractères")
    private String password;

    /**
     * Prénom de l'utilisateur.
     */
    @Column(nullable = false)
    @NotBlank(message = "Le prénom ne peut pas être vide")
    private String prenom;

    /**
     * Nom de famille de l'utilisateur.
     */
    @Column(nullable = false)
    @NotBlank(message = "Le nom de famille ne peut pas être vide")
    private String nom;

    /**
     * Date de création du compte.
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    /**
     * Date de la dernière connexion de l'utilisateur.
     */
    private LocalDateTime derniereConnexion;

    /**
     * Indique si l'utilisateur est actif ou non.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    /**
     * Relation One-to-Many : un utilisateur a plusieurs catégories.
     * 
     * @OneToMany : défini une relation un-à-plusieurs
     * mappedBy = "utilisateur" : la relation est gérée par l'entité Catégorie
     * cascade = CascadeType.ALL : si on supprime l'utilisateur, on supprime aussi ses catégories
     * orphanRemoval = true : supprime les catégories si on les retire de la liste
     * fetch = FetchType.LAZY : charge les catégories que si on y accède (optimise les requêtes)
     */
    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Categorie> categories = new HashSet<>();

    /**
     * Relation One-to-Many : un utilisateur a plusieurs dépenses.
     */
    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Depense> depenses = new HashSet<>();

    /**
     * Relation One-to-Many : un utilisateur a plusieurs budgets.
     */
    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Budget> budgets = new HashSet<>();

    /**
     * Initialise automatiquement la date de création lors de la création de l'entité.
     * 
     * @PrePersist : annotation JPA exécutée avant l'insertion en base de données
     */
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }

    /**
     * Met à jour la date de dernière connexion.
     * Cette méthode sera appelée lors de chaque connexion.
     */
    public void mettreAJourDerniereConnexion() {
        this.derniereConnexion = LocalDateTime.now();
    }
}
