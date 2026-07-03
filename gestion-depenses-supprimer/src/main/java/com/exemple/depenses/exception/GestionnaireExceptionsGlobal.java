package com.exemple.depenses.exception;

import com.exemple.depenses.dto.ReponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Gestionnaire global des exceptions.
 * 
 * @RestControllerAdvice : annotation qui intercepte les exceptions levées dans tous les contrôleurs
 * et les transforme en réponses HTTP appropriées.
 * 
 * Avantages :
 *  - Centralise la gestion des erreurs
 *  - Évite de répéter le code try-catch dans tous les contrôleurs
 *  - Fournit des réponses cohérentes au client
 *  - Affiche les erreurs de validation de manière standardisée
 */
@RestControllerAdvice
public class GestionnaireExceptionsGlobal {

    /**
     * Gère les exceptions EntiteNonTrouveeException (404).
     * 
     * @ExceptionHandler : indique quelle exception cette méthode gère
     * 
     * @param exception l'exception levée
     * @param request le contexte de la requête
     * @return réponse avec code 404
     */
    @ExceptionHandler(EntiteNonTrouveeException.class)
    public ResponseEntity<ReponseDTO> gererEntiteNonTrouvee(
            EntiteNonTrouveeException exception,
            WebRequest request) {

        ReponseDTO reponse = ReponseDTO.erreur(
            exception.getMessage(),
            "RESSOURCE_NON_TROUVEE",
            HttpStatus.NOT_FOUND.value()
        );

        return new ResponseEntity<>(reponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Gère les exceptions RessourceDejaExistanteException (409).
     * 
     * @param exception l'exception levée
     * @param request le contexte de la requête
     * @return réponse avec code 409
     */
    @ExceptionHandler(RessourceDejaExistanteException.class)
    public ResponseEntity<ReponseDTO> gererRessourceDejaExistante(
            RessourceDejaExistanteException exception,
            WebRequest request) {

        ReponseDTO reponse = ReponseDTO.erreur(
            exception.getMessage(),
            "RESSOURCE_DEJA_EXISTANTE",
            HttpStatus.CONFLICT.value()
        );

        return new ResponseEntity<>(reponse, HttpStatus.CONFLICT);
    }

    /**
     * Gère les exceptions AuthentificationException (401).
     * 
     * Levée quand :
     *  - Les identifiants sont incorrects
     *  - Le token JWT est invalide
     *  - L'utilisateur est désactivé
     * 
     * @param exception l'exception levée
     * @param request le contexte de la requête
     * @return réponse avec code 401
     */
    @ExceptionHandler(AuthentificationException.class)
    public ResponseEntity<ReponseDTO> gererAuthentification(
            AuthentificationException exception,
            WebRequest request) {

        ReponseDTO reponse = ReponseDTO.erreur(
            exception.getMessage(),
            "AUTHENTIFICATION_ECHOUEE",
            HttpStatus.UNAUTHORIZED.value()
        );

        return new ResponseEntity<>(reponse, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Gère les exceptions AutorisationException (403).
     * 
     * Levée quand un utilisateur essaie d'accéder à une ressource qui ne lui appartient pas.
     * 
     * @param exception l'exception levée
     * @param request le contexte de la requête
     * @return réponse avec code 403
     */
    @ExceptionHandler(AutorisationException.class)
    public ResponseEntity<ReponseDTO> gererAutorisation(
            AutorisationException exception,
            WebRequest request) {

        ReponseDTO reponse = ReponseDTO.erreur(
            exception.getMessage(),
            "ACCES_REFUSE",
            HttpStatus.FORBIDDEN.value()
        );

        return new ResponseEntity<>(reponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Gère les exceptions de validation (400).
     * 
     * Levée automatiquement par Spring quand @Valid détecte des erreurs de validation.
     * Par exemple : champ vide, email invalide, taille de chaîne incorrecte, etc.
     * 
     * @param exception l'exception levée
     * @param request le contexte de la requête
     * @return réponse avec code 400 et liste des erreurs de validation
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ReponseDTO> gererErreurValidation(
            MethodArgumentNotValidException exception,
            WebRequest request) {

        // Construit un map des erreurs de validation
        // Format : {"champ": "message d'erreur"}
        Map<String, String> erreurs = new HashMap<>();

        exception.getBindingResult()
            .getFieldErrors()
            .forEach(erreur -> 
                erreurs.put(
                    erreur.getField(),
                    erreur.getDefaultMessage()
                )
            );

        ReponseDTO reponse = ReponseDTO.builder()
            .succes(false)
            .message("Erreurs de validation des données")
            .codeErreur("ERREUR_VALIDATION")
            .statusCode(HttpStatus.BAD_REQUEST.value())
            .donnees(erreurs)  // Envoie les erreurs détaillées
            .timestamp(LocalDateTime.now())
            .build();

        return new ResponseEntity<>(reponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Gère les exceptions d'accès refusé (403).
     * 
     * Levée par Spring Security quand l'utilisateur n'a pas les permissions nécessaires.
     * 
     * @param exception l'exception levée
     * @param request le contexte de la requête
     * @return réponse avec code 403
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ReponseDTO> gererAccesDenie(
            AccessDeniedException exception,
            WebRequest request) {

        ReponseDTO reponse = ReponseDTO.erreur(
            "Vous n'avez pas la permission d'accéder à cette ressource",
            "ACCES_REFUSE",
            HttpStatus.FORBIDDEN.value()
        );

        return new ResponseEntity<>(reponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Gère les exceptions non catégorisées (500).
     * 
     * C'est le gestionnaire par défaut pour toutes les exceptions non traitées.
     * Les erreurs serveur inattendues tombent ici.
     * 
     * IMPORTANT : En production, ne pas révéler les détails internes de l'erreur !
     * Afficher un message générique et logger l'erreur pour les administrateurs.
     * 
     * @param exception l'exception levée
     * @param request le contexte de la requête
     * @return réponse avec code 500
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ReponseDTO> gererExceptionGenerale(
            Exception exception,
            WebRequest request) {

        // Log l'erreur pour les administrateurs (en production, utiliser un logger)
        System.err.println("Erreur serveur non gérée : " + exception.getMessage());
        exception.printStackTrace();

        // Message générique au client (ne pas révéler les détails internes)
        ReponseDTO reponse = ReponseDTO.erreur(
            "Une erreur serveur s'est produite. Veuillez réessayer plus tard.",
            "ERREUR_SERVEUR",
            HttpStatus.INTERNAL_SERVER_ERROR.value()
        );

        return new ResponseEntity<>(reponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
