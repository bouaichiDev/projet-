package com.exemple.depenses.exception;

/**
 * Exception levée quand l'autorisation est refusée.
 * 
 * Cas d'usage :
 *  - Un utilisateur essaie d'accéder aux dépenses d'un autre utilisateur
 *  - Un utilisateur essaie de modifier une dépense qui n'est pas sienne
 * 
 * Sera convertie en réponse HTTP 403 Forbidden.
 */
public class AutorisationException extends RuntimeException {

    public AutorisationException(String message) {
        super(message);
    }

    public AutorisationException(String message, Throwable cause) {
        super(message, cause);
    }
}
