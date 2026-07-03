package com.exemple.depenses.repository;

import com.exemple.depenses.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour l'entité Utilisateur.
 * 
 * JpaRepository<Utilisateur, Long> : interface de Spring Data JPA
 *  - Utilisateur : type d'entité
 *  - Long : type de l'ID
 * 
 * Fournit automatiquement les méthodes CRUD :
 *  - save() : ajouter/modifier
 *  - findById() : chercher par ID
 *  - findAll() : récupérer tous
 *  - delete() : supprimer
 *  - etc.
 * 
 * @Repository : indique que c'est un composant de gestion de données
 */
@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    /**
     * Recherche un utilisateur par son nom d'utilisateur.
     * 
     * Spring Data JPA génère automatiquement la requête SQL !
     * Par la signature de la méthode, il crée : SELECT * FROM utilisateurs WHERE username = ?
     * 
     * Optional<Utilisateur> : conteneur qui peut être vide ou contenir un utilisateur
     *  - isPresent() : true si l'utilisateur existe
     *  - get() : récupère l'utilisateur (attention à NullPointerException !)
     *  - orElse(null) : retourne null si absent
     *  - orElseThrow(() -> new Exception()) : lève une exception si absent
     * 
     * @param username le nom d'utilisateur à chercher
     * @return Optional contenant l'utilisateur si trouvé
     */
    Optional<Utilisateur> findByUsername(String username);

    /**
     * Recherche un utilisateur par son email.
     * 
     * @param email l'email à chercher
     * @return Optional contenant l'utilisateur si trouvé
     */
    Optional<Utilisateur> findByEmail(String email);

    /**
     * Vérifie si un nom d'utilisateur existe déjà.
     * 
     * Spring Data génère : SELECT COUNT(*) FROM utilisateurs WHERE username = ?
     * Retourne true si le count > 0, sinon false.
     * 
     * @param username le nom d'utilisateur
     * @return true si le username existe, false sinon
     */
    boolean existsByUsername(String username);

    /**
     * Vérifie si un email existe déjà.
     * 
     * @param email l'email
     * @return true si l'email existe, false sinon
     */
    boolean existsByEmail(String email);

    /**
     * Recherche un utilisateur par son username (version avec Optional avancée).
     * 
     * Cette méthode utilise @Query pour une requête personnalisée.
     * On pourrait aussi utiliser findByUsername() mais ici on montre la syntaxe @Query.
     * 
     * @Query : permet d'écrire une requête JPQL personnalisée
     *  - JPQL est une requête orientée objet (pas du SQL brut)
     *  - :username est un paramètre nommé
     * @Param : mappe le paramètre de la méthode au paramètre de la requête
     * 
     * @param username le nom d'utilisateur
     * @return Optional contenant l'utilisateur si trouvé
     */
    @Query("SELECT u FROM Utilisateur u WHERE u.username = :username AND u.actif = true")
    Optional<Utilisateur> rechercherUtilisateurActif(@Param("username") String username);
}
