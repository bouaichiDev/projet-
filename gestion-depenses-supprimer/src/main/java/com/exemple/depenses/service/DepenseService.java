package com.exemple.depenses.service;

import com.exemple.depenses.dto.DepenseDTO;
import com.exemple.depenses.entity.Categorie;
import com.exemple.depenses.entity.Depense;
import com.exemple.depenses.entity.Utilisateur;
import com.exemple.depenses.exception.AutorisationException;
import com.exemple.depenses.exception.EntiteNonTrouveeException;
import com.exemple.depenses.repository.DepenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des dépenses.
 * 
 * Responsabilités :
 *  - CRUD des dépenses (Create, Read, Update, Delete)
 *  - Filtrage des dépenses
 *  - Statistiques des dépenses
 *  - Calcul des totaux
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class DepenseService {

    private final DepenseRepository depenseRepository;

    /**
     * Ajoute une nouvelle dépense.
     * 
     * @param utilisateur l'utilisateur propriétaire
     * @param titre titre de la dépense
     * @param montant montant de la dépense
     * @param dateDepense date de la dépense
     * @param description description optionnelle
     * @param categorie catégorie de la dépense
     * @return la dépense créée
     */
    public Depense ajouter(Utilisateur utilisateur, String titre, BigDecimal montant,
                          LocalDate dateDepense, String description, Categorie categorie) {
        // Créer la dépense
        Depense depense = Depense.builder()
            .titre(titre)
            .montant(montant)
            .dateDepense(dateDepense)
            .description(description)
            .utilisateur(utilisateur)
            .categorie(categorie)
            .build();

        // Sauvegarder
        Depense depenseSauvegardee = depenseRepository.save(depense);

        log.info("Dépense créée : {} euros par {}", montant, utilisateur.getUsername());

        return depenseSauvegardee;
    }

    /**
     * Récupère toutes les dépenses d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @return liste de toutes ses dépenses (triées par date décroissante)
     */
    public List<Depense> obtenirToutes(Utilisateur utilisateur) {
        return depenseRepository.findByUtilisateurOrderByDateDesc(utilisateur);
    }

    /**
     * Récupère une dépense par son ID.
     * 
     * Sécurité : vérifie que la dépense appartient à l'utilisateur.
     * 
     * @param id l'ID de la dépense
     * @param utilisateur l'utilisateur
     * @return la dépense
     * @throws EntiteNonTrouveeException si la dépense n'existe pas
     * @throws AutorisationException si elle n'appartient pas à l'utilisateur
     */
    public Depense obtenirParId(Long id, Utilisateur utilisateur) {
        return depenseRepository.findByIdAndUtilisateur(id, utilisateur)
            .orElseThrow(() -> 
                new EntiteNonTrouveeException("Dépense", id)
            );
    }

    /**
     * Modifie une dépense existante.
     * 
     * @param id l'ID de la dépense
     * @param utilisateur l'utilisateur
     * @param titre nouveau titre
     * @param montant nouveau montant
     * @param dateDepense nouvelle date
     * @param description nouvelle description
     * @param categorie nouvelle catégorie
     * @return la dépense modifiée
     * @throws EntiteNonTrouveeException si la dépense n'existe pas
     * @throws AutorisationException si elle n'appartient pas à l'utilisateur
     */
    public Depense modifier(Long id, Utilisateur utilisateur, String titre, BigDecimal montant,
                           LocalDate dateDepense, String description, Categorie categorie) {
        Depense depense = obtenirParId(id, utilisateur);

        // Modifier les champs
        depense.setTitre(titre);
        depense.setMontant(montant);
        depense.setDateDepense(dateDepense);
        depense.setDescription(description);
        depense.setCategorie(categorie);

        // Sauvegarder
        Depense depenseModifiee = depenseRepository.save(depense);

        log.info("Dépense modifiée : {}", id);

        return depenseModifiee;
    }

    /**
     * Supprime une dépense.
     * 
     * @param id l'ID de la dépense
     * @param utilisateur l'utilisateur
     * @throws EntiteNonTrouveeException si la dépense n'existe pas
     * @throws AutorisationException si elle n'appartient pas à l'utilisateur
     */
    public void supprimer(Long id, Utilisateur utilisateur) {
        Depense depense = obtenirParId(id, utilisateur);

        depenseRepository.delete(depense);

        log.info("Dépense supprimée : {}", id);
    }

    /**
     * Filtre les dépenses d'un utilisateur par catégorie.
     * 
     * @param utilisateur l'utilisateur
     * @param categorie la catégorie
     * @return list des dépenses pour cette catégorie
     */
    public List<Depense> filtrerParCategorie(Utilisateur utilisateur, Categorie categorie) {
        return depenseRepository.findByUtilisateurAndCategorie(utilisateur, categorie);
    }

    /**
     * Filtre les dépenses d'un utilisateur par intervalle de dates.
     * 
     * @param utilisateur l'utilisateur
     * @param dateDebut date de début (incluse)
     * @param dateFin date de fin (incluse)
     * @return liste des dépenses dans cet intervalle
     */
    public List<Depense> filtrerParDateRange(Utilisateur utilisateur, LocalDate dateDebut, LocalDate dateFin) {
        return depenseRepository.findByUtilisateurAndDateRange(utilisateur, dateDebut, dateFin);
    }

    /**
     * Récupère les dépenses d'un utilisateur pour un mois spécifique.
     * 
     * @param utilisateur l'utilisateur
     * @param annee l'année (ex: 2024)
     * @param mois le mois (1-12)
     * @return liste des dépenses du mois
     */
    public List<Depense> obtenirDepensesMois(Utilisateur utilisateur, Integer annee, Integer mois) {
        return depenseRepository.findByUtilisateurAndMois(utilisateur, annee, mois);
    }

    /**
     * Calcule le total des dépenses d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @return le total
     */
    public BigDecimal calculerTotal(Utilisateur utilisateur) {
        return depenseRepository.calculerTotalDepenses(utilisateur);
    }

    /**
     * Calcule le total des dépenses pour une catégorie.
     * 
     * @param utilisateur l'utilisateur
     * @param categorie la catégorie
     * @return le total
     */
    public BigDecimal calculerTotalParCategorie(Utilisateur utilisateur, Categorie categorie) {
        return depenseRepository.calculerTotalParCategorie(utilisateur, categorie);
    }

    /**
     * Calcule le total des dépenses pour un mois.
     * 
     * @param utilisateur l'utilisateur
     * @param annee l'année
     * @param mois le mois
     * @return le total du mois
     */
    public BigDecimal calculerTotalMensuel(Utilisateur utilisateur, Integer annee, Integer mois) {
        return depenseRepository.calculerTotalMensuel(utilisateur, annee, mois);
    }

    /**
     * Calcule le total des dépenses dans un intervalle de dates.
     * 
     * @param utilisateur l'utilisateur
     * @param dateDebut date de début
     * @param dateFin date de fin
     * @return le total
     */
    public BigDecimal calculerTotalParIntervalle(Utilisateur utilisateur, LocalDate dateDebut, LocalDate dateFin) {
        return depenseRepository.calculerTotalParIntervalle(utilisateur, dateDebut, dateFin);
    }

    /**
     * Compte le nombre de dépenses d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @return le nombre de dépenses
     */
    public long compterDepenses(Utilisateur utilisateur) {
        return depenseRepository.countByUtilisateur(utilisateur);
    }

    /**
     * Convertit une entité Depense en DTO.
     * 
     * @param depense l'entité
     * @return le DTO
     */
    public DepenseDTO convertirEnDTO(Depense depense) {
        return DepenseDTO.builder()
            .id(depense.getId())
            .titre(depense.getTitre())
            .montant(depense.getMontant())
            .dateDepense(depense.getDateDepense())
            .description(depense.getDescription())
            .categorieId(depense.getCategorie().getId())
            .categorieNom(depense.getCategorie().getNom())
            .dateCreation(depense.getDateCreation())
            .dateModification(depense.getDateModification())
            .build();
    }

    /**
     * Convertit une liste d'entités en DTOs.
     * 
     * @param depenses liste d'entités
     * @return liste de DTOs
     */
    public List<DepenseDTO> convertirEnDTOs(List<Depense> depenses) {
        return depenses.stream()
            .map(this::convertirEnDTO)
            .collect(Collectors.toList());
    }
}
