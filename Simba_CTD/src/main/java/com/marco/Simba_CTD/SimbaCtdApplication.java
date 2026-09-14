package com.marco.Simba_CTD;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.marco.Simba_CTD.repository")
public class SimbaCtdApplication {

	public static void main(String[] args) {
		SpringApplication.run(SimbaCtdApplication.class, args);
	}
}