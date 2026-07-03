package com.exemple.depenses.repository;

import com.exemple.depenses.entity.Categorie;
import com.exemple.depenses.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité Catégorie.
 */
@Repository
public interface CategorieRepository extends JpaRepository<Categorie, Long> {

    /**
     * Récupère toutes les catégories d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @return liste des catégories de cet utilisateur
     */
    List<Categorie> findByUtilisateur(Utilisateur utilisateur);

    /**
     * Recherche une catégorie par son nom et son utilisateur.
     * 
     * Utile pour vérifier si une catégorie existe déjà pour cet utilisateur.
     * 
     * @param nom le nom de la catégorie
     * @param utilisateur l'utilisateur propriétaire
     * @return Optional contenant la catégorie si trouvée
     */
    Optional<Categorie> findByNomAndUtilisateur(String nom, Utilisateur utilisateur);

    /**
     * Vérifie si une catégorie avec ce nom existe pour cet utilisateur.
     * 
     * @param nom le nom de la catégorie
     * @param utilisateur l'utilisateur
     * @return true si la catégorie existe
     */
    boolean existsByNomAndUtilisateur(String nom, Utilisateur utilisateur);

    /**
     * Récupère une catégorie par ID et utilisateur.
     * 
     * Sécurité : vérifier que la catégorie appartient à l'utilisateur connecté
     * pour éviter qu'un utilisateur A accède aux catégories de l'utilisateur B.
     * 
     * @Query : requête personnalisée JPQL
     * 
     * @param id l'ID de la catégorie
     * @param utilisateur l'utilisateur propriétaire
     * @return Optional contenant la catégorie
     */
    @Query("SELECT c FROM Categorie c WHERE c.id = :id AND c.utilisateur = :utilisateur")
    Optional<Categorie> findByIdAndUtilisateur(@Param("id") Long id, @Param("utilisateur") Utilisateur utilisateur);

    /**
     * Compte le nombre de catégories d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @return le nombre de catégories
     */
    long countByUtilisateur(Utilisateur utilisateur);
}
