package com.exemple.depenses.exception;

/**
 * Exception levée quand on essaie de créer une ressource qui existe déjà.
 * 
 * Cas d'usage :
 *  - Un utilisateur essaie de s'inscrire avec un username déjà utilisé
 *  - Un utilisateur essaie de créer une catégorie avec un nom déjà existant
 * 
 * Sera convertie en réponse HTTP 409 Conflict.
 */
public class RessourceDejaExistanteException extends RuntimeException {

    /**
     * Type de ressource qui existe déjà.
     */
    private String typeRessource;

    /**
     * Le champ qui provoque le conflit (ex: "username", "email").
     */
    private String champ;

    /**
     * La valeur qui provoque le conflit.
     */
    private Object valeur;

    /**
     * Constructeur avec message personnalisé.
     * 
     * @param message message d'erreur
     */
    public RessourceDejaExistanteException(String message) {
        super(message);
    }

    /**
     * Constructeur détaillé.
     * 
     * @param typeRessource type de ressource (ex: "Utilisateur")
     * @param champ le champ (ex: "username")
     * @param valeur la valeur (ex: "john_doe")
     */
    public RessourceDejaExistanteException(String typeRessource, String champ, Object valeur) {
        super(String.format("%s avec %s '%s' existe déjà", typeRessource, champ, valeur));
        this.typeRessource = typeRessource;
        this.champ = champ;
        this.valeur = valeur;
    }

    public String getTypeRessource() {
        return typeRessource;
    }

    public String getChamp() {
        return champ;
    }

    public Object getValeur() {
        return valeur;
    }
}
