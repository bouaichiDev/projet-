package com.exemple.depenses.exception;

/**
 * Exception levée quand une entité n'est pas trouvée dans la base de données.
 * 
 * Exemple d'usage :
 *  throw new EntiteNonTrouveeException("Utilisateur", 1L);
 * 
 * Sera convertie en réponse HTTP 404 Not Found par le gestionnaire d'exceptions global.
 */
public class EntiteNonTrouveeException extends RuntimeException {

    /**
     * Type d'entité non trouvée (ex: "Utilisateur", "Dépense").
     */
    private String typeEntite;

    /**
     * Identifiant de l'entité non trouvée.
     */
    private Object id;

    /**
     * Constructeur avec type et ID.
     * 
     * @param typeEntite type d'entité (ex: "Utilisateur")
     * @param id identifiant de l'entité
     */
    public EntiteNonTrouveeException(String typeEntite, Object id) {
        super(String.format("%s avec l'ID %s n'a pas été trouvé(e)", typeEntite, id));
        this.typeEntite = typeEntite;
        this.id = id;
    }

    /**
     * Constructeur avec message personnalisé.
     * 
     * @param message message d'erreur personnalisé
     */
    public EntiteNonTrouveeException(String message) {
        super(message);
    }

    public String getTypeEntite() {
        return typeEntite;
    }

    public Object getId() {
        return id;
    }
}
