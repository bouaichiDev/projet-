package com.exemple.depenses.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

/**
 * Configuration de la sécurité Spring Security.
 * 
 * Gère :
 *  - L'authentification des utilisateurs
 *  - L'autorisation (qui peut accéder à quoi)
 *  - La gestion des tokens JWT
 *  - La protection contre les attaques CSRF
 *  - CORS (Cross-Origin Resource Sharing)
 * 
 * @Configuration : indique que c'est une classe de configuration Spring
 * @EnableWebSecurity : active la sécurité web
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    /**
     * Filtre JWT personnalisé pour valider les tokens à chaque requête.
     */
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Encoder pour les mots de passe.
     * 
     * BCrypt : algorithme sécurisé qui :
     *  - Rend les mots de passe irréversibles
     *  - Ajoute du salt (données aléatoires)
     *  - Est intentionnellement lent (résiste aux attaques par force brute)
     * 
     * @return encodeur de mots de passe
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Gestionnaire d'authentification.
     * 
     * C'est le composant qui vérifie les identifiants de l'utilisateur.
     * 
     * @param authConfig configuration d'authentification
     * @return gestionnaire d'authentification
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * Configuration de la chaîne de filtres de sécurité.
     * 
     * Définit :
     *  - Les URLs protégées vs les URLs publiques
     *  - Le type d'authentification (stateless avec JWT)
     *  - La gestion du CORS
     *  - La protection CSRF
     * 
     * @param http configuration HTTP
     * @return chaîne de filtres configurée
     * @throws Exception si erreur de configuration
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Désactive CSRF car nous utilisons JWT (stateless)
            // CSRF protection est utile pour les sessions traditionnelles, pas pour JWT
            .csrf(csrf -> csrf.disable())

            // Configure CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Gestion des sessions : STATELESS signifie pas de sessions serveur
            // Chaque requête est indépendante, authentifiée par le JWT
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Configuration des autorisation d'accès
            .authorizeHttpRequests(auth -> auth
                // URLs PUBLIQUES (accessible sans authentification)
                .requestMatchers("/api/auth/inscription").permitAll()
                .requestMatchers("/api/auth/connexion").permitAll()
                .requestMatchers("/api/public/**").permitAll()

                // Toutes les autres requêtes DOIVENT être authentifiées
                .anyRequest().authenticated()
            )

            // Exceptionelle handling
            .exceptionHandling(ex -> ex
                // Point de redirection pour les 401 (non authentifié)
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write("""
                        {
                            "succes": false,
                            "message": "Authentification requise",
                            "codeErreur": "AUTHENTIFICATION_REQUISE",
                            "statusCode": 401
                        }
                        """);
                })
            );

        // Ajouter le filtre JWT avant UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configuration CORS (Cross-Origin Resource Sharing).
     * 
     * Permet au frontend (http://localhost:3000) de communiquer avec le backend (http://localhost:8080)
     * 
     * @return source de configuration CORS
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Origins autorisées (le frontend)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:4200"));

        // Méthodes HTTP autorisées
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Headers autorisés dans la requête
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Headers à exposer au client
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));

        // Permettre les cookies
        configuration.setAllowCredentials(true);

        // Durée du cache CORS preflight
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
