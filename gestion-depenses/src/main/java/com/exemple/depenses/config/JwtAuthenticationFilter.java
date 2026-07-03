package com.exemple.depenses.config;

import com.exemple.depenses.service.UtilisateurService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Filtre JWT pour authentifier les requêtes.
 * 
 * Ce filtre :
 *  1. Extrait le token JWT du header Authorization de la requête
 *  2. Valide le token
 *  3. Extrait le username du token
 *  4. Charge l'utilisateur depuis la base de données
 *  5. Crée une authentification Spring
 *  6. Met l'authentification dans le contexte de sécurité
 * 
 * OncePerRequestFilter : s'assure que ce filtre n'est exécuté qu'une fois par requête
 * 
 * @Component : enregistre ce filtre comme bean Spring
 * @Slf4j : génère un logger
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UtilisateurService utilisateurService;

    /**
     * Méthode appelée pour chaque requête HTTP.
     * 
     * @param request la requête HTTP
     * @param response la réponse HTTP
     * @param filterChain la chaîne de filtres
     * @throws ServletException si erreur servlet
     * @throws IOException si erreur d'I/O
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        try {
            // Extraire le JWT du header Authorization
            String jwt = extractJwtFromRequest(request);

            // Si un token est présent et valide
            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {

                // Extraire le username du token
                String username = jwtTokenProvider.getUsernameFromToken(jwt);

                // Charger l'utilisateur depuis la base de données
                var utilisateur = utilisateurService.obtenirParUsername(username);

                // Créer une authentification Spring
                // Liste vide pour les authorities (pas de rôles/permissions dans cette version simple)
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        utilisateur,
                        null,
                        java.util.Collections.emptyList() // Pas de rôles pour l'instant
                    );

                // Ajouter les détails de la requête
                authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Mettre l'authentification dans le contexte de sécurité
                // Cela indique à Spring que la requête est authentifiée
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("Authentification JWT réussie pour : {}", username);
            }

        } catch (JwtException ex) {
            log.warn("Impossible de valider le JWT : {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.warn("JWT vide ou null");
        } catch (Exception ex) {
            log.error("Erreur lors de la validation du JWT : {}", ex.getMessage());
        }

        // Continuer avec la chaîne de filtres (même si pas authentifié)
        filterChain.doFilter(request, response);
    }

    /**
     * Extrait le token JWT du header Authorization de la requête.
     * 
     * Format standard : Authorization: Bearer <token>
     * 
     * @param request la requête HTTP
     * @return le token, ou null s'il n'est pas présent
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        // Récupérer le header Authorization
        String bearerToken = request.getHeader("Authorization");

        // Vérifier que le header commence par "Bearer "
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // Extraire et retourner le token (supprimer "Bearer ")
            return bearerToken.substring(7); // "Bearer ".length() = 7
        }

        return null;
    }

    /**
     * Indique pour quelles URL ce filtre doit être appliqué.
     * 
     * Par défaut, il s'applique à toutes les URL sauf les URLs publiques.
     * Les configurations de SecurityConfig gérent cela.
     * 
     * @param request la requête
     * @return true pour appliquer le filtre, false sinon
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Ne pas appliquer le filtre aux URLs publiques
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/inscription") || 
               path.startsWith("/api/auth/connexion") ||
               path.startsWith("/api/public/");
    }
}
