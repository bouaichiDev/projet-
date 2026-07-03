package com.exemple.depenses.service;

import com.exemple.depenses.dto.CategorieDTO;
import com.exemple.depenses.entity.Categorie;
import com.exemple.depenses.entity.Utilisateur;
import com.exemple.depenses.exception.AutorisationException;
import com.exemple.depenses.exception.EntiteNonTrouveeException;
import com.exemple.depenses.exception.RessourceDejaExistanteException;
import com.exemple.depenses.repository.CategorieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des catégories.
 * 
 * Une catégorie permet de classifier les dépenses
 * (Alimentation, Transport, Logement, Loisirs, etc.).
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class CategorieService {

    private final CategorieRepository categorieRepository;

    /**
     * Ajoute une nouvelle catégorie.
     * 
     * @param utilisateur l'utilisateur propriétaire
     * @param nom le nom de la catégorie
     * @param description description optionnelle
     * @param couleur couleur associée (ex: "#FF5733")
     * @param icone emoji ou icône (ex: "🍔")
     * @return la catégorie créée
     * @throws RessourceDejaExistanteException si une catégorie avec ce nom existe déjà
     */
    public Categorie ajouter(Utilisateur utilisateur, String nom, String description, 
                             String couleur, String icone) {
        // Vérifier que le nom n'existe pas déjà pour cet utilisateur
        if (categorieRepository.existsByNomAndUtilisateur(nom, utilisateur)) {
            throw new RessourceDejaExistanteException("Catégorie", "nom", nom);
        }

        // Créer la catégorie
        Categorie categorie = Categorie.builder()
            .nom(nom)
            .description(description)
            .couleur(couleur)
            .icone(icone)
            .utilisateur(utilisateur)
            .build();

        // Sauvegarder
        Categorie categorieSauvegardee = categorieRepository.save(categorie);

        log.info("Catégorie créée : {} pour l'utilisateur {}", nom, utilisateur.getUsername());

        return categorieSauvegardee;
    }

    /**
     * Récupère toutes les catégories d'un utilisateur.
     * 
     * @param utilisateur l'utilisateur
     * @return liste de toutes ses catégories
     */
    public List<Categorie> obtenirToutes(Utilisateur utilisateur) {
        return categorieRepository.findByUtilisateur(utilisateur);
    }

    /**
     * Récupère une catégorie par son ID.
     * 
     * Sécurité : vérifie que la catégorie appartient à l'utilisateur.
     * 
     * @param id l'ID de la catégorie
     * @param utilisateur l'utilisateur
     * @return la catégorie
     * @throws EntiteNonTrouveeException si la catégorie n'existe pas
     * @throws AutorisationException si la catégorie n'appartient pas à l'utilisateur
     */
    public Categorie obtenirParId(Long id, Utilisateur utilisateur) {
        return categorieRepository.findByIdAndUtilisateur(id, utilisateur)
            .orElseThrow(() -> 
                new EntiteNonTrouveeException("Catégorie", id)
            );
    }

    /**
     * Modifie une catégorie existante.
     * 
     * @param id l'ID de la catégorie
     * @param utilisateur l'utilisateur
     * @param nom nouveau nom
     * @param description nouvelle description
     * @param couleur nouvelle couleur
     * @param icone nouvelle icône
     * @return la catégorie modifiée
     * @throws EntiteNonTrouveeException si la catégorie n'existe pas
     * @throws AutorisationException si elle n'appartient pas à l'utilisateur
     * @throws RessourceDejaExistanteException si le nouveau nom existe déjà
     */
    public Categorie modifier(Long id, Utilisateur utilisateur, String nom, String description,
                              String couleur, String icone) {
        Categorie categorie = obtenirParId(id, utilisateur);

        // Vérifier que le nouveau nom n'existe pas (si changement de nom)
        if (!categorie.getNom().equals(nom) && 
            categorieRepository.existsByNomAndUtilisateur(nom, utilisateur)) {
            throw new RessourceDejaExistanteException("Catégorie", "nom", nom);
        }

        // Modifier les champs
        categorie.setNom(nom);
        categorie.setDescription(description);
        categorie.setCouleur(couleur);
        categorie.setIcone(icone);

        // Sauvegarder
        Categorie categorieModifiee = categorieRepository.save(categorie);

        log.info("Catégorie modifiée : {}", id);

        return categorieModifiee;
    }

    /**
     * Supprime une catégorie.
     * 
     * IMPORTANT : quand on supprime une catégorie, on supprime aussi toutes ses dépenses !
     * Voir entité Catégorie : cascade = CascadeType.ALL
     * 
     * @param id l'ID de la catégorie
     * @param utilisateur l'utilisateur
     * @throws EntiteNonTrouveeException si la catégorie n'existe pas
     * @throws AutorisationException si elle n'appartient pas à l'utilisateur
     */
    public void supprimer(Long id, Utilisateur utilisateur) {
        Categorie categorie = obtenirParId(id, utilisateur);

        categorieRepository.delete(categorie);

        log.info("Catégorie supprimée : {}", id);
    }

    /**
     * Convertit une entité Catégorie en DTO.
     * 
     * @param categorie l'entité
     * @return le DTO
     */
    public CategorieDTO convertirEnDTO(Categorie categorie) {
        return CategorieDTO.builder()
            .id(categorie.getId())
            .nom(categorie.getNom())
            .description(categorie.getDescription())
            .couleur(categorie.getCouleur())
            .icone(categorie.getIcone())
            .dateCreation(categorie.getDateCreation())
            .dateModification(categorie.getDateModification())
            .nombreDepenses((long) categorie.getDepenses().size())
            .build();
    }

    /**
     * Convertit une liste d'entités en DTOs.
     * 
     * @param categories liste d'entités
     * @return liste de DTOs
     */
    public List<CategorieDTO> convertirEnDTOs(List<Categorie> categories) {
        return categories.stream()
            .map(this::convertirEnDTO)
            .collect(Collectors.toList());
    }
}
