package com.ralphtimesheet.api.timeentry;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class TimeEntryRepositoryTest {

    @Autowired
    private TimeEntryRepository timeEntryRepository;

    @Test
    void shouldLoadSeedTimeEntries() {
        List<TimeEntry> entries = timeEntryRepository.findAll();

        assertThat(entries)
            .hasSize(4)
            .extracting(TimeEntry::getDescription)
            .contains("ERP vendor sync");

        TimeEntry entry = timeEntryRepository.findById(1L).orElseThrow();
        assertThat(entry.getEmployee().getId()).isEqualTo(1L);
        assertThat(entry.getProject().getId()).isEqualTo(1L);
        assertThat(entry.getDate()).isEqualTo(LocalDate.of(2024, 6, 3));
        assertThat(entry.getHours()).isEqualByComparingTo(new BigDecimal("4.50"));
    }

    @Test
    void shouldFindEntriesByEmployeeId() {
        List<TimeEntry> avaEntries = timeEntryRepository.findByEmployeeId(1L);

        assertThat(avaEntries)
            .hasSize(2)
            .extracting(entry -> entry.getProject().getCode())
            .containsExactlyInAnyOrder("PRJ-ENG-001", "PRJ-MOB-002");
    }

    @Test
    void shouldFindEntriesByProjectId() {
        List<TimeEntry> mobileEntries = timeEntryRepository.findByProjectId(2L);

        assertThat(mobileEntries)
            .hasSize(2)
            .extracting(entry -> entry.getEmployee().getEmail())
            .containsExactlyInAnyOrder("ava.stone@example.com", "noah.garcia@example.com");
    }

    @Test
    void shouldFindEntriesByEmployeeAndDateRange() {
        LocalDate start = LocalDate.of(2024, 6, 3);
        LocalDate end = LocalDate.of(2024, 6, 4);

        List<TimeEntry> entries = timeEntryRepository.findByEmployeeIdAndDateBetween(1L, start, end);

        assertThat(entries)
            .hasSize(2)
            .allMatch(entry -> !entry.getDate().isBefore(start) && !entry.getDate().isAfter(end));
    }
}
