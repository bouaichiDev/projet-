package com.exemple.depenses.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour l'entité Catégorie.
 * 
 * Utilisé pour envoyer/recevoir les données des catégories.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorieDTO {

    /**
     * Identifiant unique de la catégorie.
     */
    private Long id;

    /**
     * Nom de la catégorie (ex: "Alimentation", "Transport").
     */
    @NotBlank(message = "Le nom de la catégorie ne peut pas être vide")
    @Size(min = 2, max = 100, message = "Le nom doit faire entre 2 et 100 caractères")
    private String nom;

    /**
     * Description optionnelle.
     */
    private String description;

    /**
     * Couleur associée à la catégorie (ex: "#FF5733" pour l'affichage graphique).
     */
    private String couleur;

    /**
     * Emoji ou icône associée (ex: "🍔" pour alimentation).
     */
    private String icone;

    /**
     * Date de création.
     */
    private LocalDateTime dateCreation;

    /**
     * Date de dernière modification.
     */
    private LocalDateTime dateModification;

    /**
     * Nombre de dépenses dans cette catégorie.
     * Calculé au moment de la récupération.
     */
    private Long nombreDepenses;
}
