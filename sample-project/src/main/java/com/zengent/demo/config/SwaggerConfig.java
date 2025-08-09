package com.zengent.demo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger/OpenAPI configuration for API documentation.
 * Demonstrates comprehensive API documentation setup.
 */
@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Zengent Demo API")
                        .version("1.0.0")
                        .description("Comprehensive demo API for Zengent AI analysis capabilities")
                        .contact(new Contact()
                                .name("Zengent Team")
                                .email("support@zengent.com")
                                .url("https://zengent.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}