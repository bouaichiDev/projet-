package com.exemple.depenses.service;

import com.exemple.depenses.entity.Categorie;
import com.exemple.depenses.entity.Depense;
import com.exemple.depenses.entity.Utilisateur;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service pour les statistiques des dépenses.
 * 
 * Fournit les données nécessaires pour :
 *  - Afficher des graphiques (camembert, histogramme, etc)
 *  - Faire des analyses (dépenses par catégorie, par mois, etc)
 *  - Faire des comparaisons (mois vs mois, année vs année)
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class StatistiqueService {

    private final DepenseService depenseService;
    private final CategorieService categorieService;
    private final BudgetService budgetService;

    /**
     * Calcule les statistiques totales d'un utilisateur.
     * 
     * Inclut :
     *  - Total des dépenses
     *  - Nombre de dépenses
     *  - Dépense moyenne
     *  - Plus grosse dépense
     * 
     * @param utilisateur l'utilisateur
     * @return map contenant les statistiques
     */
    public Map<String, Object> obtenirStatistiquesTotales(Utilisateur utilisateur) {
        List<Depense> depenses = depenseService.obtenirToutes(utilisateur);
        BigDecimal total = depenseService.calculerTotal(utilisateur);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalDepenses", total);
        stats.put("nombreDepenses", depenses.size());

        if (!depenses.isEmpty()) {
            BigDecimal moyenne = total.divide(
                BigDecimal.valueOf(depenses.size()),
                2,
                BigDecimal.ROUND_HALF_UP
            );
            stats.put("depenseMoyenne", moyenne);

            Optional<Depense> maxDépense = depenses.stream()
                .max(Comparator.comparing(Depense::getMontant));
            
            if (maxDépense.isPresent()) {
                stats.put("plusGrosseDepense", maxDépense.get().getMontant());
            }
        }

        return stats;
    }

    /**
     * Calcule les statistiques par catégorie.
     * 
     * Retourne, pour chaque catégorie :
     *  - Le total des dépenses
     *  - Le nombre de dépenses
     *  - Le pourcentage par rapport au total
     * 
     * Utile pour créer un graphique camembert.
     * 
     * @param utilisateur l'utilisateur
     * @return map : catégorie ID -> statistiques
     */
    public Map<Long, Map<String, Object>> obtenirStatistiquesParCategorie(Utilisateur utilisateur) {
        List<Depense> depenses = depenseService.obtenirToutes(utilisateur);
        BigDecimal totalGlobal = depenseService.calculerTotal(utilisateur);

        // Grouper les dépenses par catégorie
        Map<Categorie, List<Depense>> depensesParCategorie = depenses.stream()
            .collect(Collectors.groupingBy(Depense::getCategorie));

        Map<Long, Map<String, Object>> stats = new LinkedHashMap<>();

        for (Categorie categorie : depensesParCategorie.keySet()) {
            List<Depense> depensesCategorie = depensesParCategorie.get(categorie);

            BigDecimal totalCategorie = depensesCategorie.stream()
                .map(Depense::getMontant)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            Double pourcentage = 0.0;
            if (totalGlobal.compareTo(BigDecimal.ZERO) > 0) {
                pourcentage = (totalCategorie.doubleValue() / totalGlobal.doubleValue()) * 100;
            }

            Map<String, Object> statsCategorie = new LinkedHashMap<>();
            statsCategorie.put("nom", categorie.getNom());
            statsCategorie.put("couleur", categorie.getCouleur());
            statsCategorie.put("icone", categorie.getIcone());
            statsCategorie.put("total", totalCategorie);
            statsCategorie.put("nombre", depensesCategorie.size());
            statsCategorie.put("pourcentage", Math.round(pourcentage * 100.0) / 100.0);

            stats.put(categorie.getId(), statsCategorie);
        }

        return stats;
    }

    /**
     * Calcule les statistiques mensuelles.
     * 
     * Pour chaque mois avec des dépenses, retourne :
     *  - Le mois (YYYY-MM)
     *  - Le total des dépenses
     *  - Le nombre de dépenses
     *  - Le budget défini (si existant)
     * 
     * Utile pour créer un histogramme.
     * 
     * @param utilisateur l'utilisateur
     * @return liste des statistiques mensuelles (12 derniers mois)
     */
    public List<Map<String, Object>> obtenirStatistiquesmensuelles(Utilisateur utilisateur) {
        List<Depense> depenses = depenseService.obtenirToutes(utilisateur);

        // Grouper par mois (YYYY-MM)
        Map<String, List<Depense>> depenseParMois = depenses.stream()
            .collect(Collectors.groupingBy(
                d -> String.format("%04d-%02d", d.getDateDepense().getYear(), 
                                              d.getDateDepense().getMonthValue())
            ));

        List<Map<String, Object>> stats = new ArrayList<>();

        // Pour chaque mois, calculer les statistiques
        for (String mois : depenseParMois.keySet()) {
            List<Depense> depensesMois = depenseParMois.get(mois);

            BigDecimal totalMois = depensesMois.stream()
                .map(Depense::getMontant)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> statsMois = new LinkedHashMap<>();
            statsMois.put("mois", mois);
            statsMois.put("total", totalMois);
            statsMois.put("nombre", depensesMois.size());

            // Essayer de trouver le budget pour ce mois
            String[] parties = mois.split("-");
            Integer annee = Integer.parseInt(parties[0]);
            Integer moisInt = Integer.parseInt(parties[1]);

            try {
                BigDecimal budgetMois = budgetService.obtenirBudgetMois(utilisateur, annee, moisInt)
                    .getMontantBudgete();
                statsMois.put("budget", budgetMois);
                statsMois.put("pourcentageBudgetUtilise", 
                    (totalMois.doubleValue() / budgetMois.doubleValue()) * 100);
            } catch (Exception e) {
                // Pas de budget défini pour ce mois
                statsMois.put("budget", null);
                statsMois.put("pourcentageBudgetUtilise", null);
            }

            stats.add(statsMois);
        }

        // Trier par mois décroissant
        stats.sort((a, b) -> b.get("mois").toString().compareTo(a.get("mois").toString()));

        return stats;
    }

    /**
     * Calcule les statistiques pour une plage de dates.
     * 
     * @param utilisateur l'utilisateur
     * @param dateDebut date de début
     * @param dateFin date de fin
     * @return map contenant les statistiques
     */
    public Map<String, Object> obtenirStatistiquesIntervalle(
            Utilisateur utilisateur, LocalDate dateDebut, LocalDate dateFin) {

        List<Depense> depenses = depenseService.filtrerParDateRange(utilisateur, dateDebut, dateFin);
        BigDecimal total = depenseService.calculerTotalParIntervalle(utilisateur, dateDebut, dateFin);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("dateDebut", dateDebut);
        stats.put("dateFin", dateFin);
        stats.put("total", total);
        stats.put("nombre", depenses.size());

        if (!depenses.isEmpty()) {
            BigDecimal moyenne = total.divide(
                BigDecimal.valueOf(depenses.size()),
                2,
                BigDecimal.ROUND_HALF_UP
            );
            stats.put("moyenne", moyenne);
        }

        return stats;
    }

    /**
     * Obtient les 5 plus grosses dépenses.
     * 
     * @param utilisateur l'utilisateur
     * @return liste des 5 plus grosses dépenses
     */
    public List<Map<String, Object>> obtenirTop5Depenses(Utilisateur utilisateur) {
        return depenseService.obtenirToutes(utilisateur).stream()
            .sorted(Comparator.comparing(Depense::getMontant).reversed())
            .limit(5)
            .map(d -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", d.getId());
                map.put("titre", d.getTitre());
                map.put("montant", d.getMontant());
                map.put("categorie", d.getCategorie().getNom());
                map.put("date", d.getDateDepense());
                return map;
            })
            .collect(Collectors.toList());
    }

    /**
     * Comparaison mois vs mois.
     * 
     * Compare les dépenses du mois actuel avec le mois précédent.
     * 
     * @param utilisateur l'utilisateur
     * @return map avec les comparaisons
     */
    public Map<String, Object> obtenirComparaisonMois(Utilisateur utilisateur) {
        LocalDate aujourd_hui = LocalDate.now();
        
        // Mois courant
        Integer anneeActuelle = aujourd_hui.getYear();
        Integer moisActuel = aujourd_hui.getMonthValue();
        BigDecimal totalActuel = depenseService.calculerTotalMensuel(utilisateur, anneeActuelle, moisActuel);

        // Mois précédent
        LocalDate moisPrecedent = aujourd_hui.minusMonths(1);
        Integer anneePrecedente = moisPrecedent.getYear();
        Integer moisPrecedentInt = moisPrecedent.getMonthValue();
        BigDecimal totalPrecedent = depenseService.calculerTotalMensuel(utilisateur, anneePrecedente, moisPrecedentInt);

        // Calcul de la différence
        BigDecimal difference = totalActuel.subtract(totalPrecedent);
        Double pourcentageDifference = 0.0;
        if (totalPrecedent.compareTo(BigDecimal.ZERO) > 0) {
            pourcentageDifference = (difference.doubleValue() / totalPrecedent.doubleValue()) * 100;
        }

        Map<String, Object> comparaison = new LinkedHashMap<>();
        comparaison.put("totalMoisActuel", totalActuel);
        comparaison.put("totalMoisPrecedent", totalPrecedent);
        comparaison.put("difference", difference);
        comparaison.put("pourcentageDifference", pourcentageDifference);
        comparaison.put("tendance", difference.signum() > 0 ? "AUGMENTATION" : 
                                  difference.signum() < 0 ? "DIMINUTION" : "STABLE");

        return comparaison;
    }
}
