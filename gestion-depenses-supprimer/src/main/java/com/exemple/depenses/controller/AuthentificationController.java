package com.exemple.depenses.controller;

import com.exemple.depenses.config.JwtTokenProvider;
import com.exemple.depenses.dto.ReponseDTO;
import com.exemple.depenses.dto.UtilisateurDTO;
import com.exemple.depenses.entity.Utilisateur;
import com.exemple.depenses.exception.AuthentificationException;
import com.exemple.depenses.exception.RessourceDejaExistanteException;
import com.exemple.depenses.service.UtilisateurService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur pour l'authentification des utilisateurs.
 * 
 * Endpoints :
 *  - POST /api/auth/inscription : inscription d'un nouvel utilisateur
 *  - POST /api/auth/connexion : connexion d'un utilisateur
 * 
 * @RestController : indique que les méthodes retournent des réponses JSON
 * @RequestMapping : préfixe pour tous les endpoints (/api/auth)
 * @Slf4j : génère un logger
 * @RequiredArgsConstructor : génère un constructeur avec les dépendances
 */
@RestController
@RequestMapping("/api/auth")
@Slf4j
@RequiredArgsConstructor
public class AuthentificationController {

    private final UtilisateurService utilisateurService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Inscrit un nouvel utilisateur.
     * 
     * Endpoint : POST /api/auth/inscription
     * 
     * Corps de la requête :
     * {
     *   "username": "john_doe",
     *   "email": "john@example.com",
     *   "password": "motdepasse123",
     *   "prenom": "John",
     *   "nom": "Doe"
     * }
     * 
     * Réponse :
     * {
     *   "succes": true,
     *   "message": "Inscription réussie",
     *   "donnees": { utilisateur DTO },
     *   "statusCode": 201
     * }
     * 
     * @param demande objet contenant les données d'inscription
     * @return réponse avec le nouvel utilisateur créé
     * @throws RessourceDejaExistanteException si username ou email existe déjà
     */
    @PostMapping("/inscription")
    public ResponseEntity<ReponseDTO> inscrire(@Valid @RequestBody DemandeInscription demande) {
        try {
            // Appeler le service pour inscrire l'utilisateur
            Utilisateur utilisateur = utilisateurService.inscrire(
                demande.getUsername(),
                demande.getEmail(),
                demande.getPassword(),
                demande.getPrenom(),
                demande.getNom()
            );

            // Convertir en DTO (sans le mot de passe)
            UtilisateurDTO utilisateurDTO = utilisateurService.convertirEnDTO(utilisateur);

            // Retourner la réponse
            ReponseDTO reponse = ReponseDTO.succes(
                "Inscription réussie. Vous pouvez maintenant vous connecter.",
                utilisateurDTO,
                HttpStatus.CREATED.value()
            );

            log.info("Nouvel utilisateur inscrit : {}", demande.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED).body(reponse);

        } catch (RessourceDejaExistanteException e) {
            // Username ou email existe déjà
            ReponseDTO reponse = ReponseDTO.erreur(
                e.getMessage(),
                "RESSOURCE_DEJA_EXISTANTE",
                HttpStatus.CONFLICT.value()
            );
            return ResponseEntity.status(HttpStatus.CONFLICT).body(reponse);
        }
    }

    /**
     * Connecte un utilisateur.
     * 
     * Endpoint : POST /api/auth/connexion
     * 
     * Corps de la requête :
     * {
     *   "username": "john_doe",
     *   "password": "motdepasse123"
     * }
     * 
     * Réponse :
     * {
     *   "succes": true,
     *   "message": "Connexion réussie",
     *   "donnees": {
     *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *     "utilisateur": { utilisateur DTO },
     *     "expirationToken": 86400000
     *   },
     *   "statusCode": 200
     * }
     * 
     * @param demande objet contenant les identifiants
     * @return réponse avec le token JWT et l'utilisateur
     * @throws AuthentificationException si identifiants incorrects
     */
    @PostMapping("/connexion")
    public ResponseEntity<ReponseDTO> connecter(@Valid @RequestBody DemandeConnexion demande) {
        try {
            // Authentifier l'utilisateur
            Utilisateur utilisateur = utilisateurService.authentifier(
                demande.getUsername(),
                demande.getPassword()
            );

            // Générer un token JWT
            String token = jwtTokenProvider.generateToken(utilisateur);

            // Convertir en DTO
            UtilisateurDTO utilisateurDTO = utilisateurService.convertirEnDTO(utilisateur);

            // Construire la réponse avec le token
            ReponseConnexion reponseConnexion = new ReponseConnexion();
            reponseConnexion.setToken(token);
            reponseConnexion.setUtilisateur(utilisateurDTO);
            reponseConnexion.setExpirationToken(86400000L); // 24 heures en ms

            ReponseDTO reponse = ReponseDTO.succes(
                "Connexion réussie",
                reponseConnexion
            );

            log.info("Utilisateur connecté : {}", demande.getUsername());

            return ResponseEntity.ok(reponse);

        } catch (AuthentificationException e) {
            // Identifiants incorrects
            ReponseDTO reponse = ReponseDTO.erreur(
                e.getMessage(),
                "AUTHENTIFICATION_ECHOUEE",
                HttpStatus.UNAUTHORIZED.value()
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(reponse);
        }
    }

    /**
     * Obtient les informations de l'utilisateur connecté.
     * 
     * Endpoint : GET /api/auth/moi
     * 
     * Nécessite une authentification (token JWT).
     * 
     * @return les informations de l'utilisateur connecté
     */
    @GetMapping("/moi")
    public ResponseEntity<ReponseDTO> obtenirUtilisateurConnecte() {
        // L'utilisateur connecté est automatiquement injecté dans le contexte de sécurité
        // par le filtre JWT
        Object principal = org.springframework.security.core.context.SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getPrincipal();

        if (principal instanceof Utilisateur utilisateur) {
            UtilisateurDTO utilisateurDTO = utilisateurService.convertirEnDTO(utilisateur);

            ReponseDTO reponse = ReponseDTO.succes(
                "Informations de l'utilisateur",
                utilisateurDTO
            );

            return ResponseEntity.ok(reponse);
        }

        ReponseDTO reponse = ReponseDTO.erreur(
            "Utilisateur non trouvé",
            "UTILISATEUR_NON_TROUVE",
            HttpStatus.NOT_FOUND.value()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(reponse);
    }

    /**
     * DTO pour la demande d'inscription.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DemandeInscription {
        private String username;
        private String email;
        private String password;
        private String prenom;
        private String nom;
    }

    /**
     * DTO pour la demande de connexion.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DemandeConnexion {
        private String username;
        private String password;
    }

    /**
     * DTO pour la réponse de connexion.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReponseConnexion {
        private String token;
        private UtilisateurDTO utilisateur;
        private Long expirationToken;
    }
}
