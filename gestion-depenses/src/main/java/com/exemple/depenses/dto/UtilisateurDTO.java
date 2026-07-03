package com.exemple.depenses.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO (Data Transfer Object) pour l'entité Utilisateur.
 * 
 * Les DTOs servent à :
 *  1. Transférer les données entre le serveur et le client (via JSON)
 *  2. Valider les données reçues du client
 *  3. Éviter d'exposer les détails internes de l'entité JPA
 *  4. Transformer les données avant envoi au client (ex: sans afficher le mot de passe)
 * 
 * @Data : Lombok génère les getters, setters, toString(), equals(), hashCode()
 * @Builder : permet de créer des objets avec le pattern Builder
 * @NoArgsConstructor : génère un constructeur sans arguments
 * @AllArgsConstructor : génère un constructeur avec tous les arguments
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilisateurDTO {

    /**
     * Identifiant de l'utilisateur (ne pas modifier).
     */
    private Long id;

    /**
     * Nom d'utilisateur unique.
     */
    @NotBlank(message = "Le nom d'utilisateur ne peut pas être vide")
    @Size(min = 3, max = 50, message = "Le nom d'utilisateur doit faire entre 3 et 50 caractères")
    private String username;

    /**
     * Email de l'utilisateur.
     */
    @NotBlank(message = "L'email ne peut pas être vide")
    @Email(message = "L'email doit être valide")
    private String email;

    /**
     * Prénom de l'utilisateur.
     */
    @NotBlank(message = "Le prénom ne peut pas être vide")
    private String prenom;

    /**
     * Nom de famille.
     */
    @NotBlank(message = "Le nom de famille ne peut pas être vide")
    private String nom;

    /**
     * Date de création du compte (fournie par le serveur).
     */
    private LocalDateTime dateCreation;

    /**
     * Date de dernière connexion (fournie par le serveur).
     */
    private LocalDateTime derniereConnexion;

    /**
     * Indique si le compte est actif.
     */
    private Boolean actif;
}

/**
 * DTO pour l'inscription d'un nouvel utilisateur.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class InscriptionDTO {
    @NotBlank(message = "Le nom d'utilisateur ne peut pas être vide")
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank(message = "L'email ne peut pas être vide")
    @Email
    private String email;

    @NotBlank(message = "Le mot de passe ne peut pas être vide")
    @Size(min = 8, message = "Le mot de passe doit faire au minimum 8 caractères")
    private String password;

    @NotBlank(message = "Le prénom ne peut pas être vide")
    private String prenom;

    @NotBlank(message = "Le nom de famille ne peut pas être vide")
    private String nom;
}

/**
 * DTO pour la connexion d'un utilisateur.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class ConnexionDTO {
    @NotBlank(message = "Le nom d'utilisateur ne peut pas être vide")
    private String username;

    @NotBlank(message = "Le mot de passe ne peut pas être vide")
    private String password;
}

/**
 * DTO pour la réponse de connexion (avec le token JWT).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class ReponseConnexionDTO {
    private String message;
    private String token;
    private UtilisateurDTO utilisateur;
    private Long expirationToken;
}
