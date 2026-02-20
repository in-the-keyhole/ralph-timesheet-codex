package com.ralphtimesheet.api.employee;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ralphtimesheet.api.employee.dto.EmployeeRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EmployeeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldReturnAllEmployees() throws Exception {
        mockMvc.perform(get("/api/v1/employees"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[*].email", containsInAnyOrder(
                "ava.stone@example.com",
                "noah.garcia@example.com",
                "liam.turner@example.com"
            )));
    }

    @Test
    void shouldReturnEmployeeById() throws Exception {
        mockMvc.perform(get("/api/v1/employees/{id}", 1L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.firstName").value("Ava"))
            .andExpect(jsonPath("$.lastName").value("Stone"))
            .andExpect(jsonPath("$.department").value("Engineering"));
    }

    @Test
    void shouldReturn404ForMissingEmployee() throws Exception {
        mockMvc.perform(get("/api/v1/employees/{id}", 9999L))
            .andExpect(status().isNotFound());
    }

    @Test
    void shouldCreateEmployee() throws Exception {
        EmployeeRequest request = EmployeeRequest.builder()
            .firstName("Ivy")
            .lastName("Ng")
            .email("ivy.ng@example.com")
            .department("Operations")
            .build();

        mockMvc.perform(post("/api/v1/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", containsString("/api/v1/employees/")))
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.email").value("ivy.ng@example.com"))
            .andExpect(jsonPath("$.department").value("Operations"));
    }

    @Test
    void shouldUpdateEmployee() throws Exception {
        EmployeeRequest request = EmployeeRequest.builder()
            .firstName("Ava")
            .lastName("Stone")
            .email("ava.updated@example.com")
            .department("Design")
            .build();

        mockMvc.perform(put("/api/v1/employees/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("ava.updated@example.com"))
            .andExpect(jsonPath("$.department").value("Design"));
    }

    @Test
    void shouldReturn404WhenUpdatingMissingEmployee() throws Exception {
        EmployeeRequest request = EmployeeRequest.builder()
            .firstName("Mia")
            .lastName("Patel")
            .email("mia.patel@example.com")
            .department("People")
            .build();

        mockMvc.perform(put("/api/v1/employees/{id}", 4242L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound());
    }
}
