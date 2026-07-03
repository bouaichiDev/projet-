package com.exemple.depenses.service;

import com.exemple.depenses.dto.UtilisateurDTO;
import com.exemple.depenses.entity.Utilisateur;
import com.exemple.depenses.exception.AuthentificationException;
import com.exemple.depenses.exception.EntiteNonTrouveeException;
import com.exemple.depenses.exception.RessourceDejaExistanteException;
import com.exemple.depenses.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service pour la gestion des utilisateurs.
 * 
 * @Service : indique que c'est une classe de logique métier (bean Spring)
 * @Transactional : gère automatiquement les transactions de base de données
 *                  - Si une exception est levée, la transaction est annulée (rollback)
 *                  - Si tout réussit, la transaction est validée (commit)
 * @Slf4j : génère automatiquement un logger (pour tracer les opérations)
 * @RequiredArgsConstructor : génère un constructeur avec les dépendances (@Autowired)
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class UtilisateurService {

    /**
     * Repository pour accéder à la base de données des utilisateurs.
     * 
     * @RequiredArgsConstructor génère automatiquement :
     * public UtilisateurService(UtilisateurRepository utilisateurRepository) {
     *     this.utilisateurRepository = utilisateurRepository;
     * }
     */
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Encodeur de mots de passe injecté automatiquement par Spring.
     * C'est le BCryptPasswordEncoder défini dans GestionDepensesApplication.
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Inscrit un nouvel utilisateur.
     * 
     * Étapes :
     *  1. Vérifier que le username n'existe pas déjà
     *  2. Vérifier que l'email n'existe pas déjà
     *  3. Créer un nouvel utilisateur
     *  4. Encoder le mot de passe avec BCrypt
     *  5. Sauvegarder en base de données
     *  6. Retourner l'utilisateur créé (sans le mot de passe)
     * 
     * @param username nom d'utilisateur unique
     * @param email adresse email unique
     * @param password mot de passe en clair (sera chiffré)
     * @param prenom prénom de l'utilisateur
     * @param nom nom de famille
     * @return l'utilisateur créé
     * @throws RessourceDejaExistanteException si username ou email existe déjà
     */
    public Utilisateur inscrire(String username, String email, String password, String prenom, String nom) {
        // Vérifier que le username n'existe pas
        if (utilisateurRepository.existsByUsername(username)) {
            throw new RessourceDejaExistanteException("Utilisateur", "username", username);
        }

        // Vérifier que l'email n'existe pas
        if (utilisateurRepository.existsByEmail(email)) {
            throw new RessourceDejaExistanteException("Utilisateur", "email", email);
        }

        // Créer un nouvel utilisateur
        Utilisateur utilisateur = Utilisateur.builder()
            .username(username)
            .email(email)
            .password(passwordEncoder.encode(password))  // Encoder le mot de passe !
            .prenom(prenom)
            .nom(nom)
            .actif(true)
            .build();

        // Sauvegarder en base de données
        Utilisateur utilisateurSauvegarde = utilisateurRepository.save(utilisateur);

        // Logger l'opération
        log.info("Nouvel utilisateur inscrit : {}", username);

        return utilisateurSauvegarde;
    }

    /**
     * Authentifie un utilisateur.
     * 
     * Étapes :
     *  1. Chercher l'utilisateur par son username
     *  2. Vérifier que l'utilisateur existe et est actif
     *  3. Vérifier que le mot de passe est correct
     *  4. Mettre à jour la date de dernière connexion
     *  5. Retourner l'utilisateur
     * 
     * @param username nom d'utilisateur
     * @param password mot de passe
     * @return l'utilisateur authentifié
     * @throws AuthentificationException si identifiants incorrects
     */
    public Utilisateur authentifier(String username, String password) {
        // Chercher l'utilisateur
        Utilisateur utilisateur = utilisateurRepository.findByUsername(username)
            .orElseThrow(() -> 
                new AuthentificationException("Username ou mot de passe incorrect")
            );

        // Vérifier que l'utilisateur est actif
        if (!utilisateur.getActif()) {
            throw new AuthentificationException("Votre compte a été désactivé");
        }

        // Vérifier le mot de passe
        // passwordEncoder.matches() compare le mot de passe en clair avec le mot de passe chiffré
        if (!passwordEncoder.matches(password, utilisateur.getPassword())) {
            log.warn("Tentative de connexion échouée pour l'utilisateur : {}", username);
            throw new AuthentificationException("Username ou mot de passe incorrect");
        }

        // Mettre à jour la date de dernière connexion
        utilisateur.mettreAJourDerniereConnexion();
        utilisateurRepository.save(utilisateur);

        log.info("Utilisateur connecté : {}", username);

        return utilisateur;
    }

    /**
     * Récupère un utilisateur par son ID.
     * 
     * @param id l'ID de l'utilisateur
     * @return l'utilisateur
     * @throws EntiteNonTrouveeException si l'utilisateur n'existe pas
     */
    public Utilisateur obtenirParId(Long id) {
        return utilisateurRepository.findById(id)
            .orElseThrow(() -> 
                new EntiteNonTrouveeException("Utilisateur", id)
            );
    }

    /**
     * Récupère un utilisateur par son username.
     * 
     * @param username le username
     * @return l'utilisateur
     * @throws EntiteNonTrouveeException si l'utilisateur n'existe pas
     */
    public Utilisateur obtenirParUsername(String username) {
        return utilisateurRepository.findByUsername(username)
            .orElseThrow(() -> 
                new EntiteNonTrouveeException("Utilisateur avec le username: " + username)
            );
    }

    /**
     * Modifie les informations d'un utilisateur.
     * 
     * @param id l'ID de l'utilisateur à modifier
     * @param prenom nouveau prénom
     * @param nom nouveau nom
     * @param email nouveau email
     * @return l'utilisateur modifié
     * @throws EntiteNonTrouveeException si l'utilisateur n'existe pas
     * @throws RessourceDejaExistanteException si l'email existe déjà
     */
    public Utilisateur modifier(Long id, String prenom, String nom, String email) {
        Utilisateur utilisateur = obtenirParId(id);

        // Vérifier que le nouvel email n'existe pas (si changement d'email)
        if (!utilisateur.getEmail().equals(email) && utilisateurRepository.existsByEmail(email)) {
            throw new RessourceDejaExistanteException("Utilisateur", "email", email);
        }

        // Modifier les champs
        utilisateur.setPrenom(prenom);
        utilisateur.setNom(nom);
        utilisateur.setEmail(email);

        // Sauvegarder
        Utilisateur utilisateurModifie = utilisateurRepository.save(utilisateur);

        log.info("Utilisateur modifié : {}", id);

        return utilisateurModifie;
    }

    /**
     * Change le mot de passe d'un utilisateur.
     * 
     * @param id l'ID de l'utilisateur
     * @param ancienPassword l'ancien mot de passe
     * @param nouveauPassword le nouveau mot de passe
     * @throws EntiteNonTrouveeException si l'utilisateur n'existe pas
     * @throws AuthentificationException si l'ancien mot de passe est incorrect
     */
    public void changerMotDePasse(Long id, String ancienPassword, String nouveauPassword) {
        Utilisateur utilisateur = obtenirParId(id);

        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(ancienPassword, utilisateur.getPassword())) {
            throw new AuthentificationException("L'ancien mot de passe est incorrect");
        }

        // Encoder et définir le nouveau mot de passe
        utilisateur.setPassword(passwordEncoder.encode(nouveauPassword));

        // Sauvegarder
        utilisateurRepository.save(utilisateur);

        log.info("Mot de passe changé pour l'utilisateur : {}", id);
    }

    /**
     * Désactive un utilisateur (suppression logique, pas suppression physique).
     * 
     * @param id l'ID de l'utilisateur
     * @throws EntiteNonTrouveeException si l'utilisateur n'existe pas
     */
    public void desactiver(Long id) {
        Utilisateur utilisateur = obtenirParId(id);

        utilisateur.setActif(false);
        utilisateurRepository.save(utilisateur);

        log.info("Utilisateur désactivé : {}", id);
    }

    /**
     * Convertit une entité Utilisateur en DTO.
     * 
     * Le DTO n'expose pas le mot de passe pour des raisons de sécurité.
     * 
     * @param utilisateur l'entité à convertir
     * @return le DTO
     */
    public UtilisateurDTO convertirEnDTO(Utilisateur utilisateur) {
        return UtilisateurDTO.builder()
            .id(utilisateur.getId())
            .username(utilisateur.getUsername())
            .email(utilisateur.getEmail())
            .prenom(utilisateur.getPrenom())
            .nom(utilisateur.getNom())
            .dateCreation(utilisateur.getDateCreation())
            .derniereConnexion(utilisateur.getDerniereConnexion())
            .actif(utilisateur.getActif())
            .build();
    }
}
