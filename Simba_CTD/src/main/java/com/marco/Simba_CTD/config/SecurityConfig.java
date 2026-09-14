package com.marco.Simba_CTD.config;

import com.marco.Simba_CTD.security.TenantFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;

import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final TenantFilter tenantFilter;

    private final KeycloakJwtAuthenticationConverter
            jwtAuthenticationConverter;


    public SecurityConfig(
            TenantFilter tenantFilter,
            KeycloakJwtAuthenticationConverter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      jwtAuthenticationConverter
    ) {
        this.tenantFilter = tenantFilter;
        this.jwtAuthenticationConverter = jwtAuthenticationConverter;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> {
                })

                .sessionManagement(session -> session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**")
                        .permitAll()

                        .requestMatchers(
                                "/api/public/**",
                                "/actuator/health")
                        .permitAll()

                        .requestMatchers(
                                "/api/super-admin/**")
                        .hasRole(
                                "SUPER_ADMINISTRATEUR")

                        .requestMatchers(
                                "/api/admin/**")
                        .hasAnyRole(
                                "SUPER_ADMINISTRATEUR",
                                "ADMINISTRATEUR")

                        .anyRequest()
                        .authenticated())

                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(
                        jwtAuthenticationConverter)))

                .addFilterAfter(
                        tenantFilter,
                        BearerTokenAuthenticationFilter.class);

        return http.build();
    }
}
