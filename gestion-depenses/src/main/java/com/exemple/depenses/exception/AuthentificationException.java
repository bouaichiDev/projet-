package com.exemple.depenses.exception;

/**
 * Exception levée quand l'authentification échoue.
 * 
 * Cas d'usage :
 *  - Identifiants incorrects (username/password)
 *  - Token JWT invalide ou expiré
 *  - Utilisateur désactivé
 * 
 * Sera convertie en réponse HTTP 401 Unauthorized.
 */
public class AuthentificationException extends RuntimeException {

    public AuthentificationException(String message) {
        super(message);
    }

    public AuthentificationException(String message, Throwable cause) {
        super(message, cause);
    }
}
