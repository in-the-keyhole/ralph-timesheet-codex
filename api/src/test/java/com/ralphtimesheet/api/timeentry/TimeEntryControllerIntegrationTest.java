package com.ralphtimesheet.api.timeentry;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ralphtimesheet.api.timeentry.dto.TimeEntryRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
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
class TimeEntryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldReturnAllTimeEntries() throws Exception {
        mockMvc.perform(get("/api/v1/time-entries"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(4)))
            .andExpect(jsonPath("$[*].projectCode", containsInAnyOrder(
                "PRJ-ENG-001",
                "PRJ-MOB-002",
                "PRJ-MOB-002",
                "PRJ-OPS-003"
            )));
    }

    @Test
    void shouldFilterTimeEntriesByEmployee() throws Exception {
        mockMvc.perform(get("/api/v1/time-entries").param("employeeId", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[*].employeeEmail", containsInAnyOrder(
                "ava.stone@example.com",
                "ava.stone@example.com"
            )));
    }

    @Test
    void shouldFilterTimeEntriesByProject() throws Exception {
        mockMvc.perform(get("/api/v1/time-entries").param("projectId", "2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[*].projectCode", containsInAnyOrder(
                "PRJ-MOB-002",
                "PRJ-MOB-002"
            )));
    }

    @Test
    void shouldFilterTimeEntriesByDateRange() throws Exception {
        mockMvc.perform(get("/api/v1/time-entries")
                .param("startDate", "2024-06-03")
                .param("endDate", "2024-06-04"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[*].date", containsInAnyOrder(
                "2024-06-03",
                "2024-06-03",
                "2024-06-04"
            )));
    }

    @Test
    void shouldReturnTimeEntryById() throws Exception {
        mockMvc.perform(get("/api/v1/time-entries/{id}", 1L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.employeeEmail").value("ava.stone@example.com"))
            .andExpect(jsonPath("$.projectCode").value("PRJ-ENG-001"))
            .andExpect(jsonPath("$.hours", is(4.5)));
    }

    @Test
    void shouldReturn404ForMissingTimeEntry() throws Exception {
        mockMvc.perform(get("/api/v1/time-entries/{id}", 9999L))
            .andExpect(status().isNotFound());
    }

    @Test
    void shouldCreateTimeEntry() throws Exception {
        TimeEntryRequest request = TimeEntryRequest.builder()
            .employeeId(1L)
            .projectId(1L)
            .date(LocalDate.of(2024, 6, 6))
            .hours(new BigDecimal("2.50"))
            .description("Design sync")
            .build();

        mockMvc.perform(post("/api/v1/time-entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", containsString("/api/v1/time-entries/")))
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.hours", is(2.5)))
            .andExpect(jsonPath("$.description").value("Design sync"));
    }

    @Test
    void shouldRejectInvalidTimeEntryRequest() throws Exception {
        TimeEntryRequest request = TimeEntryRequest.builder()
            .projectId(1L)
            .date(LocalDate.of(2024, 6, 6))
            .hours(new BigDecimal("1.00"))
            .build();

        mockMvc.perform(post("/api/v1/time-entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void shouldUpdateTimeEntry() throws Exception {
        TimeEntryRequest request = TimeEntryRequest.builder()
            .employeeId(1L)
            .projectId(2L)
            .date(LocalDate.of(2024, 6, 7))
            .hours(new BigDecimal("5.25"))
            .description("Updated entry")
            .build();

        mockMvc.perform(put("/api/v1/time-entries/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.projectCode").value("PRJ-MOB-002"))
            .andExpect(jsonPath("$.hours", is(5.25)))
            .andExpect(jsonPath("$.description").value("Updated entry"));
    }

    @Test
    void shouldReturn404WhenUpdatingMissingTimeEntry() throws Exception {
        TimeEntryRequest request = TimeEntryRequest.builder()
            .employeeId(1L)
            .projectId(1L)
            .date(LocalDate.of(2024, 6, 7))
            .hours(new BigDecimal("4.00"))
            .description("Ghost entry")
            .build();

        mockMvc.perform(put("/api/v1/time-entries/{id}", 9999L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound());
    }

    @Test
    void shouldDeleteTimeEntry() throws Exception {
        mockMvc.perform(delete("/api/v1/time-entries/{id}", 4L))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/time-entries/{id}", 4L))
            .andExpect(status().isNotFound());
    }
}
