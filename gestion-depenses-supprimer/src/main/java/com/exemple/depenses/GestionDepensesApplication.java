package com.exemple.depenses;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Classe principale de démarrage de l'application Spring Boot.
 * 
 * @SpringBootApplication : annotation qui regroupe :
 *  - @Configuration : permet à la classe d'être une source de configuration beans
 *  - @EnableAutoConfiguration : active la configuration automatique de Spring Boot
 *  - @ComponentScan : scanne les classes annotées (@Component, @Service, @Repository, etc.)
 *                    dans le package et les sous-packages
 */
@SpringBootApplication
public class GestionDepensesApplication {

    /**
     * Méthode main : point d'entrée de l'application.
     * 
     * @param args arguments de la ligne de commande
     */
    public static void main(String[] args) {
        SpringApplication.run(GestionDepensesApplication.class, args);
    }

    /**
     * Bean pour encoder les mots de passe avec BCrypt.
     * 
     * BCrypt : algorithme de hachage sécurisé qui :
     *  - Rend irréversible le mot de passe
     *  - Ajoute du "salt" automatiquement (données aléatoires)
     *  - Est très lent intentionnellement (résiste aux attaques)
     * 
     * @return instance de BCryptPasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
