package com.exemple.depenses.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO pour les réponses génériques de l'API.
 * 
 * Toutes les réponses de l'API utilisent ce format pour :
 *  - Envoyer le message au client
 *  - Envoyer les données
 *  - Envoyer le statut et le code d'erreur (si erreur)
 *  - Envoyer un timestamp pour tracer les requêtes
 * 
 * Exemple de réponse de succès :
 * {
 *   "succes": true,
 *   "message": "Dépense ajoutée avec succès",
 *   "donnees": {...},
 *   "timestamp": "2024-06-22T10:30:45"
 * }
 * 
 * Exemple de réponse d'erreur :
 * {
 *   "succes": false,
 *   "message": "Dépense non trouvée",
 *   "codeErreur": "RESSOURCE_NON_TROUVEE",
 *   "statusCode": 404,
 *   "timestamp": "2024-06-22T10:30:45"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReponseDTO {

    /**
     * Indique si la requête a réussi.
     */
    private boolean succes;

    /**
     * Message descriptif (succès ou erreur).
     */
    private String message;

    /**
     * Les données à envoyer au client (null si erreur ou si rien à retourner).
     */
    private Object donnees;

    /**
     * Code d'erreur spécifique (ex: "RESSOURCE_NON_TROUVEE", "AUTORISATION_REFUSEE").
     * null si succès.
     */
    private String codeErreur;

    /**
     * Code HTTP de la réponse (200, 201, 400, 401, 404, 500, etc).
     */
    private int statusCode;

    /**
     * Timestamp de la requête (à quelle heure la réponse a été générée).
     */
    private LocalDateTime timestamp;

    /**
     * Crée une réponse de succès.
     * 
     * @param message message de succès
     * @param donnees données à envoyer
     * @return ReponseDTO de succès
     */
    public static ReponseDTO succes(String message, Object donnees) {
        return ReponseDTO.builder()
            .succes(true)
            .message(message)
            .donnees(donnees)
            .statusCode(200)
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * Crée une réponse de succès avec un code HTTP personnalisé.
     * 
     * @param message message de succès
     * @param donnees données à envoyer
     * @param statusCode code HTTP (201 pour création, etc)
     * @return ReponseDTO de succès
     */
    public static ReponseDTO succes(String message, Object donnees, int statusCode) {
        return ReponseDTO.builder()
            .succes(true)
            .message(message)
            .donnees(donnees)
            .statusCode(statusCode)
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * Crée une réponse d'erreur.
     * 
     * @param message message d'erreur
     * @param codeErreur code d'erreur spécifique
     * @param statusCode code HTTP d'erreur
     * @return ReponseDTO d'erreur
     */
    public static ReponseDTO erreur(String message, String codeErreur, int statusCode) {
        return ReponseDTO.builder()
            .succes(false)
            .message(message)
            .codeErreur(codeErreur)
            .statusCode(statusCode)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
