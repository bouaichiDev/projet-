package com.exemple.depenses.service;

import com.exemple.depenses.dto.BudgetDTO;
import com.exemple.depenses.entity.Budget;
import com.exemple.depenses.entity.Utilisateur;
import com.exemple.depenses.exception.EntiteNonTrouveeException;
import com.exemple.depenses.exception.RessourceDejaExistanteException;
import com.exemple.depenses.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des budgets mensuels.
 * 
 * Un budget mensuel permet à l'utilisateur de fixer une limite de dépenses
 * pour chaque mois et de suivre s'il l'a respectée.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final DepenseService depenseService;

    /**
     * Définit ou met à jour le budget mensuel d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @param annee l'année (ex: 2024)
     * @param mois le mois (1-12)
     * @param montantBudgete le montant budgété
     * @return le budget créé ou modifié
     */
    public Budget definirBudget(Utilisateur utilisateur, Integer annee, Integer mois, BigDecimal montantBudgete) {
        // Vérifier si un budget existe déjà
        Budget budget = budgetRepository.findByUtilisateurAndAnneeAndMois(utilisateur, annee, mois)
            .orElse(null);

        if (budget == null) {
            // Créer un nouveau budget
            budget = Budget.builder()
                .utilisateur(utilisateur)
                .annee(annee)
                .mois(mois)
                .montantBudgete(montantBudgete)
                .build();

            log.info("Budget créé pour {}-{} : {} euros", annee, mois, montantBudgete);
        } else {
            // Mettre à jour le budget existant
            budget.setMontantBudgete(montantBudgete);

            log.info("Budget modifié pour {}-{} : {} euros", annee, mois, montantBudgete);
        }

        return budgetRepository.save(budget);
    }

    /**
     * Récupère tous les budgets d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @return liste de tous ses budgets
     */
    public List<Budget> obtenirTous(Utilisateur utilisateur) {
        return budgetRepository.findByUtilisateur(utilisateur);
    }

    /**
     * Récupère le budget d'un utilisateur pour un mois spécifique.
     * 
     * @param utilisateur l'utilisateur
     * @param annee l'année
     * @param mois le mois
     * @return Optional contenant le budget (peut être absent s'il n'a pas été défini)
     */
    public Budget obtenirBudgetMois(Utilisateur utilisateur, Integer annee, Integer mois) {
        return budgetRepository.findByUtilisateurAndAnneeAndMois(utilisateur, annee, mois)
            .orElseThrow(() -> 
                new EntiteNonTrouveeException(
                    String.format("Budget pour %04d-%02d", annee, mois)
                )
            );
    }

    /**
     * Récupère les budgets d'une année entière.
     * 
     * @param utilisateur l'utilisateur
     * @param annee l'année
     * @return liste des budgets de l'année
     */
    public List<Budget> obtenirBudgetsAnnee(Utilisateur utilisateur, Integer annee) {
        return budgetRepository.findByUtilisateurAndAnneeOrderByMois(utilisateur, annee);
    }

    /**
     * Récupère le budget du mois courant.
     * 
     * @param utilisateur l'utilisateur
     * @return le budget du mois actuel (null s'il n'a pas été défini)
     */
    public Budget obtenirBudgetMoisCourant(Utilisateur utilisateur) {
        LocalDate aujourd_hui = LocalDate.now();
        return budgetRepository.findByUtilisateurAndAnneeAndMois(
                utilisateur,
                aujourd_hui.getYear(),
                aujourd_hui.getMonthValue()
            )
            .orElse(null);
    }

    /**
     * Supprime un budget.
     * 
     * @param id l'ID du budget
     * @param utilisateur l'utilisateur
     * @throws EntiteNonTrouveeException si le budget n'existe pas
     */
    public void supprimer(Long id, Utilisateur utilisateur) {
        Budget budget = budgetRepository.findByIdAndUtilisateur(id, utilisateur)
            .orElseThrow(() -> 
                new EntiteNonTrouveeException("Budget", id)
            );

        budgetRepository.delete(budget);

        log.info("Budget supprimé : {}", id);
    }

    /**
     * Calcule le total des dépenses pour un mois.
     * 
     * @param utilisateur l'utilisateur
     * @param annee l'année
     * @param mois le mois
     * @return le total des dépenses du mois
     */
    public BigDecimal calculerTotalMensuel(Utilisateur utilisateur, Integer annee, Integer mois) {
        return depenseService.calculerTotalMensuel(utilisateur, annee, mois);
    }

    /**
     * Calcule le budget restant pour un mois.
     * 
     * Formule : montantBudgete - totalDepenses
     * 
     * Peut être négatif si on a dépassé le budget !
     * 
     * @param budget le budget du mois
     * @return le montant restant
     */
    public BigDecimal calculerBudgetRestant(Budget budget) {
        BigDecimal totalDepenses = calculerTotalMensuel(
            budget.getUtilisateur(),
            budget.getAnnee(),
            budget.getMois()
        );

        return budget.getMontantBudgete().subtract(totalDepenses);
    }

    /**
     * Calcule le pourcentage du budget utilisé.
     * 
     * Formule : (totalDepenses / montantBudgete) * 100
     * 
     * @param budget le budget du mois
     * @return le pourcentage (0-100 ou plus si dépassement)
     */
    public Double calculerPourcentageUtilise(Budget budget) {
        BigDecimal totalDepenses = calculerTotalMensuel(
            budget.getUtilisateur(),
            budget.getAnnee(),
            budget.getMois()
        );

        if (budget.getMontantBudgete().equals(BigDecimal.ZERO)) {
            return 0.0;
        }

        return (totalDepenses.doubleValue() / budget.getMontantBudgete().doubleValue()) * 100;
    }

    /**
     * Vérifie si le budget est dépassé.
     * 
     * @param budget le budget du mois
     * @return true si le total des dépenses dépasse le budget
     */
    public Boolean estDepassé(Budget budget) {
        BigDecimal budgetRestant = calculerBudgetRestant(budget);
        return budgetRestant.signum() < 0; // signum() retourne -1 si négatif
    }

    /**
     * Détermine le type d'alerte pour un budget.
     * 
     * Les niveaux d'alerte :
     *  - OK : 0-75%
     *  - ATTENTION : 75-90%
     *  - ALERTE : 90-100%
     *  - DEPASSEMENT : plus de 100%
     * 
     * @param budget le budget du mois
     * @return le type d'alerte
     */
    public String obtenirTypeAlerte(Budget budget) {
        Double pourcentage = calculerPourcentageUtilise(budget);

        if (pourcentage > 100) {
            return "DEPASSEMENT";
        } else if (pourcentage >= 90) {
            return "ALERTE";
        } else if (pourcentage >= 75) {
            return "ATTENTION";
        } else {
            return "OK";
        }
    }

    /**
     * Convertit une entité Budget en DTO enrichi.
     * 
     * Le DTO inclut les calculs (budget restant, pourcentage, etc)
     * pour faciliter l'affichage côté client.
     * 
     * @param budget l'entité
     * @return le DTO
     */
    public BudgetDTO convertirEnDTO(Budget budget) {
        BigDecimal totalDepenses = calculerTotalMensuel(
            budget.getUtilisateur(),
            budget.getAnnee(),
            budget.getMois()
        );
        BigDecimal budgetRestant = calculerBudgetRestant(budget);
        Double pourcentage = calculerPourcentageUtilise(budget);
        Boolean depasse = estDepassé(budget);

        return BudgetDTO.builder()
            .id(budget.getId())
            .montantBudgete(budget.getMontantBudgete())
            .annee(budget.getAnnee())
            .mois(budget.getMois())
            .moisFormate(budget.obtenirMoisFormate())
            .totalDepenses(totalDepenses)
            .budgetRestant(budgetRestant)
            .pourcentageUtilise(pourcentage)
            .depasse(depasse)
            .dateCreation(budget.getDateCreation())
            .dateModification(budget.getDateModification())
            .build();
    }

    /**
     * Convertit une liste d'entités en DTOs.
     * 
     * @param budgets liste d'entités
     * @return liste de DTOs
     */
    public List<BudgetDTO> convertirEnDTOs(List<Budget> budgets) {
        return budgets.stream()
            .map(this::convertirEnDTO)
            .collect(Collectors.toList());
    }
}
