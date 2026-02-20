package com.ralphtimesheet.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ralphTimesheetOpenApi() {
        return new OpenAPI()
            .info(new Info()
                .title("Ralph Timesheet API")
                .description("REST API for managing employees, projects, and time entries.")
                .version("v1"));
    }
}
