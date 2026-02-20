package com.ralphtimesheet.api.project;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ralphtimesheet.api.project.dto.ProjectRequest;
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
class ProjectControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldReturnAllProjects() throws Exception {
        mockMvc.perform(get("/api/v1/projects"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[*].code", containsInAnyOrder(
                "PRJ-ENG-001",
                "PRJ-MOB-002",
                "PRJ-OPS-003"
            )));
    }

    @Test
    void shouldFilterActiveProjects() throws Exception {
        mockMvc.perform(get("/api/v1/projects").param("active", "true"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[*].active", everyItem(is(true))));
    }

    @Test
    void shouldReturnProjectById() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{id}", 1L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Apollo Redesign"))
            .andExpect(jsonPath("$.code").value("PRJ-ENG-001"))
            .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldReturn404ForMissingProject() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{id}", 9999L))
            .andExpect(status().isNotFound());
    }

    @Test
    void shouldCreateProject() throws Exception {
        ProjectRequest request = ProjectRequest.builder()
            .name("Data Warehouse")
            .code("PRJ-DWH-010")
            .description("Build the analytics foundation.")
            .active(true)
            .build();

        mockMvc.perform(post("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", containsString("/api/v1/projects/")))
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.code").value("PRJ-DWH-010"))
            .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldRejectInvalidProjectRequest() throws Exception {
        ProjectRequest request = ProjectRequest.builder()
            .code("PRJ-INVALID")
            .build();

        mockMvc.perform(post("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void shouldUpdateProject() throws Exception {
        ProjectRequest request = ProjectRequest.builder()
            .name("Apollo Revamp")
            .code("PRJ-ENG-001")
            .description("Updated scope and requirements.")
            .active(false)
            .build();

        mockMvc.perform(put("/api/v1/projects/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Apollo Revamp"))
            .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void shouldReturn404WhenUpdatingMissingProject() throws Exception {
        ProjectRequest request = ProjectRequest.builder()
            .name("Ghost Project")
            .code("PRJ-GHOST")
            .description("Does not exist")
            .active(true)
            .build();

        mockMvc.perform(put("/api/v1/projects/{id}", 7777L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound());
    }
}
