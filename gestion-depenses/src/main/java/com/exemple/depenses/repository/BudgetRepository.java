package com.exemple.depenses.repository;

import com.exemple.depenses.entity.Budget;
import com.exemple.depenses.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité Budget.
 */
@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    /**
     * Récupère tous les budgets d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @return liste de tous les budgets
     */
    List<Budget> findByUtilisateur(Utilisateur utilisateur);

    /**
     * Récupère le budget d'un utilisateur pour une année et un mois spécifique.
     * 
     * @param utilisateur l'utilisateur
     * @param annee l'année
     * @param mois le mois (1-12)
     * @return Optional contenant le budget si défini pour ce mois
     */
    Optional<Budget> findByUtilisateurAndAnneeAndMois(
        Utilisateur utilisateur,
        Integer annee,
        Integer mois
    );

    /**
     * Vérifie si un budget existe pour cet utilisateur ce mois.
     * 
     * @param utilisateur l'utilisateur
     * @param annee l'année
     * @param mois le mois
     * @return true si le budget existe
     */
    boolean existsByUtilisateurAndAnneeAndMois(
        Utilisateur utilisateur,
        Integer annee,
        Integer mois
    );

    /**
     * Récupère les budgets d'un utilisateur pour une année donnée.
     * 
     * Utile pour voir tous les budgets de l'année.
     * 
     * @Query : requête personnalisée pour trier par mois
     * 
     * @param utilisateur l'utilisateur
     * @param annee l'année
     * @return liste des budgets de cette année, triés par mois
     */
    @Query("SELECT b FROM Budget b WHERE b.utilisateur = :utilisateur AND b.annee = :annee ORDER BY b.mois")
    List<Budget> findByUtilisateurAndAnneeOrderByMois(
        @Param("utilisateur") Utilisateur utilisateur,
        @Param("annee") Integer annee
    );

    /**
     * Récupère un budget en vérifiant qu'il appartient à l'utilisateur.
     * 
     * Sécurité : empêche un utilisateur d'accéder aux budgets d'un autre.
     * 
     * @param id l'ID du budget
     * @param utilisateur l'utilisateur
     * @return Optional contenant le budget
     */
    @Query("SELECT b FROM Budget b WHERE b.id = :id AND b.utilisateur = :utilisateur")
    Optional<Budget> findByIdAndUtilisateur(
        @Param("id") Long id,
        @Param("utilisateur") Utilisateur utilisateur
    );

    /**
     * Compte le nombre de budgets d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @return le nombre de budgets définis
     */
    long countByUtilisateur(Utilisateur utilisateur);
}
