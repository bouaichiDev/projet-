package com.exemple.depenses.repository;

import com.exemple.depenses.entity.Categorie;
import com.exemple.depenses.entity.Depense;
import com.exemple.depenses.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité Dépense.
 */
@Repository
public interface DepenseRepository extends JpaRepository<Depense, Long> {

    /**
     * Récupère toutes les dépenses d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @return liste de toutes les dépenses de cet utilisateur
     */
    List<Depense> findByUtilisateur(Utilisateur utilisateur);

    /**
     * Récupère toutes les dépenses d'un utilisateur triées par date décroissante.
     * 
     * @param utilisateur l'utilisateur
     * @return liste des dépenses, les plus récentes en premier
     */
    @Query("SELECT d FROM Depense d WHERE d.utilisateur = :utilisateur ORDER BY d.dateDepense DESC")
    List<Depense> findByUtilisateurOrderByDateDesc(@Param("utilisateur") Utilisateur utilisateur);

    /**
     * Récupère les dépenses d'un utilisateur pour une catégorie spécifique.
     * 
     * Utile pour les statistiques par catégorie.
     * 
     * @param utilisateur l'utilisateur
     * @param categorie la catégorie
     * @return liste des dépenses pour cette catégorie
     */
    List<Depense> findByUtilisateurAndCategorie(Utilisateur utilisateur, Categorie categorie);

    /**
     * Récupère les dépenses d'un utilisateur entre deux dates.
     * 
     * Utile pour les statistiques mensuelles ou pour un intervalle personnalisé.
     * 
     * @param utilisateur l'utilisateur
     * @param dateDebut la date de début (incluse)
     * @param dateFin la date de fin (incluse)
     * @return liste des dépenses dans cet intervalle
     */
    @Query("SELECT d FROM Depense d WHERE d.utilisateur = :utilisateur " +
           "AND d.dateDepense >= :dateDebut AND d.dateDepense <= :dateFin " +
           "ORDER BY d.dateDepense DESC")
    List<Depense> findByUtilisateurAndDateRange(
        @Param("utilisateur") Utilisateur utilisateur,
        @Param("dateDebut") LocalDate dateDebut,
        @Param("dateFin") LocalDate dateFin
    );

    /**
     * Récupère les dépenses d'un utilisateur pour un mois spécifique.
     * 
     * @param utilisateur l'utilisateur
     * @param annee l'année (ex: 2024)
     * @param mois le mois (1-12)
     * @return liste des dépenses du mois spécifié
     */
    @Query("SELECT d FROM Depense d " +
           "WHERE d.utilisateur = :utilisateur " +
           "AND YEAR(d.dateDepense) = :annee " +
           "AND MONTH(d.dateDepense) = :mois " +
           "ORDER BY d.dateDepense DESC")
    List<Depense> findByUtilisateurAndMois(
        @Param("utilisateur") Utilisateur utilisateur,
        @Param("annee") Integer annee,
        @Param("mois") Integer mois
    );

    /**
     * Calcule le total des dépenses d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @return le total, ou 0 si pas de dépenses
     */
    @Query("SELECT COALESCE(SUM(d.montant), 0) FROM Depense d WHERE d.utilisateur = :utilisateur")
    BigDecimal calculerTotalDepenses(@Param("utilisateur") Utilisateur utilisateur);

    /**
     * Calcule le total des dépenses d'un utilisateur pour une catégorie.
     * 
     * @param utilisateur l'utilisateur
     * @param categorie la catégorie
     * @return le total pour cette catégorie
     */
    @Query("SELECT COALESCE(SUM(d.montant), 0) FROM Depense d " +
           "WHERE d.utilisateur = :utilisateur AND d.categorie = :categorie")
    BigDecimal calculerTotalParCategorie(
        @Param("utilisateur") Utilisateur utilisateur,
        @Param("categorie") Categorie categorie
    );

    /**
     * Calcule le total des dépenses d'un utilisateur pour un mois spécifique.
     * 
     * @param utilisateur l'utilisateur
     * @param annee l'année
     * @param mois le mois
     * @return le total du mois
     */
    @Query("SELECT COALESCE(SUM(d.montant), 0) FROM Depense d " +
           "WHERE d.utilisateur = :utilisateur " +
           "AND YEAR(d.dateDepense) = :annee " +
           "AND MONTH(d.dateDepense) = :mois")
    BigDecimal calculerTotalMensuel(
        @Param("utilisateur") Utilisateur utilisateur,
        @Param("annee") Integer annee,
        @Param("mois") Integer mois
    );

    /**
     * Calcule le total des dépenses dans un intervalle de dates.
     * 
     * @param utilisateur l'utilisateur
     * @param dateDebut date de début
     * @param dateFin date de fin
     * @return le total pour cet intervalle
     */
    @Query("SELECT COALESCE(SUM(d.montant), 0) FROM Depense d " +
           "WHERE d.utilisateur = :utilisateur " +
           "AND d.dateDepense >= :dateDebut AND d.dateDepense <= :dateFin")
    BigDecimal calculerTotalParIntervalle(
        @Param("utilisateur") Utilisateur utilisateur,
        @Param("dateDebut") LocalDate dateDebut,
        @Param("dateFin") LocalDate dateFin
    );

    /**
     * Récupère une dépense par ID et vérifie qu'elle appartient à l'utilisateur.
     * 
     * Sécurité : empêche un utilisateur d'accéder aux dépenses d'un autre.
     * 
     * @param id l'ID de la dépense
     * @param utilisateur l'utilisateur
     * @return Optional contenant la dépense
     */
    @Query("SELECT d FROM Depense d WHERE d.id = :id AND d.utilisateur = :utilisateur")
    Optional<Depense> findByIdAndUtilisateur(
        @Param("id") Long id,
        @Param("utilisateur") Utilisateur utilisateur
    );

    /**
     * Compte le nombre de dépenses d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @return le nombre de dépenses
     */
    long countByUtilisateur(Utilisateur utilisateur);
}
