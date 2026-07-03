package com.exemple.depenses.config;

import com.exemple.depenses.entity.Utilisateur;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Fournisseur de tokens JWT.
 * 
 * JWT (JSON Web Token) est un standard pour créer des tokens sécurisés.
 * 
 * Structure d'un JWT : header.payload.signature
 *  - header : type de token (JWT) et algorithme de signature
 *  - payload : données (claims) - identifiant, rôle, etc
 *  - signature : garantit que le token n'a pas été modifié
 * 
 * Avantages :
 *  - Stateless : pas besoin de stocker les sessions serveur
 *  - Sécurisé : signé et peut être chiffré
 *  - Scalable : fonctionne bien avec les microservices
 * 
 * @Component : indique que c'est un bean Spring
 * @Slf4j : génère un logger
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class JwtTokenProvider {

    /**
     * Clé secrète pour signer les tokens.
     * 
     * @Value : injecte la valeur depuis application.properties
     * ${jwt.secret} = valeur de la propriété jwt.secret
     */
    @Value("${jwt.secret}")
    private String jwtSecret;

    /**
     * Durée d'expiration du token en millisecondes.
     * 
     * @Value : injecte la valeur depuis application.properties
     * ${jwt.expiration} = valeur de la propriété jwt.expiration
     */
    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    /**
     * Génère un token JWT pour un utilisateur.
     * 
     * Étapes :
     *  1. Créer la clé secrète
     *  2. Ajouter les données (claims) du payload
     *  3. Définir le sujet (username)
     *  4. Définir les dates d'émission et d'expiration
     *  5. Signer le token avec la clé secrète
     *  6. Compresser et retourner le token
     * 
     * @param utilisateur l'utilisateur pour qui générer le token
     * @return le token JWT
     */
    public String generateToken(Utilisateur utilisateur) {
        // Créer la clé secrète à partir de la chaîne jwtSecret
        // Keys.hmacShaKeyFor() génère une clé de 256 bits (32 octets) pour HS256
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        // Date d'émission (maintenant)
        Date now = new Date();
        // Date d'expiration (maintenant + jwtExpirationMs)
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        // Construire le token
        String token = Jwts.builder()
            // Ajouter les données (claims) du payload
            // claim(clé, valeur) pour ajouter des données personnalisées
            .claim("id", utilisateur.getId())
            .claim("username", utilisateur.getUsername())
            .claim("email", utilisateur.getEmail())
            .claim("prenom", utilisateur.getPrenom())
            .claim("nom", utilisateur.getNom())

            // Définir le sujet (par convention : l'identifiant unique de l'utilisateur)
            .subject(utilisateur.getId().toString())

            // Définir la date d'émission
            .issuedAt(now)

            // Définir la date d'expiration
            .expiration(expiryDate)

            // Signer le token avec la clé secrète
            // signWith(key, algorithm)
            .signWith(key, SignatureAlgorithm.HS256)

            // Compresser et retourner le token en String
            .compact();

        log.info("Token JWT généré pour l'utilisateur : {}", utilisateur.getUsername());

        return token;
    }

    /**
     * Valide un token JWT et extrait le username.
     * 
     * @param token le token à valider
     * @return le username extrait du token
     * @throws JwtException si le token est invalide ou expiré
     */
    public String getUsernameFromToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

            // Parser et valider le token
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

            // Extraire le claim "username"
            return claims.get("username", String.class);
        } catch (ExpiredJwtException ex) {
            // Le token a expiré
            throw new JwtException("Token JWT expiré");
        } catch (UnsupportedJwtException ex) {
            // Format du token invalide
            throw new JwtException("Token JWT non supporté");
        } catch (MalformedJwtException ex) {
            // Token malformé
            throw new JwtException("Token JWT malformé");
        } catch (SignatureException ex) {
            // Signature invalide
            throw new JwtException("Signature JWT invalide");
        } catch (IllegalArgumentException ex) {
            // Token vide ou null
            throw new JwtException("Token JWT vide ou null");
        }
    }

    /**
     * Valide un token JWT.
     * 
     * Retourne true si le token est :
     *  - Bien signé
     *  - Pas expiré
     *  - Valide
     * 
     * @param token le token à valider
     * @return true si valide, false sinon
     */
    public boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);

            return true;
        } catch (JwtException ex) {
            log.warn("Token JWT invalide : {}", ex.getMessage());
            return false;
        } catch (IllegalArgumentException ex) {
            log.warn("Token JWT vide ou null");
            return false;
        }
    }

    /**
     * Extrait l'ID de l'utilisateur depuis le token.
     * 
     * @param token le token
     * @return l'ID utilisateur
     */
    public Long getIdFromToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

            return claims.get("id", Long.class);
        } catch (JwtException ex) {
            throw new JwtException("Impossible d'extraire l'ID du token");
        }
    }

    /**
     * Extrait tous les claims (données) du token.
     * 
     * @param token le token
     * @return tous les claims
     */
    public Claims getAllClaimsFromToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

            return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        } catch (JwtException ex) {
            throw new JwtException("Impossible d'extraire les claims du token");
        }
    }
}
