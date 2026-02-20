package com.ralphtimesheet.api.timeentry;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ralphtimesheet.api.employee.Employee;
import com.ralphtimesheet.api.employee.EmployeeRepository;
import com.ralphtimesheet.api.project.Project;
import com.ralphtimesheet.api.project.ProjectRepository;
import com.ralphtimesheet.api.timeentry.dto.TimeEntryRequest;
import com.ralphtimesheet.api.timeentry.dto.TimeEntryResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TimeEntryServiceImplTest {

    @Mock
    private TimeEntryRepository timeEntryRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ProjectRepository projectRepository;

    private TimeEntryServiceImpl timeEntryService;

    private Employee employee;
    private Project project;

    @BeforeEach
    void setUp() {
        timeEntryService = new TimeEntryServiceImpl(timeEntryRepository, employeeRepository, projectRepository);

        employee = Employee.builder()
            .id(1L)
            .firstName("Ava")
            .lastName("Stone")
            .email("ava.stone@example.com")
            .department("Engineering")
            .build();

        project = Project.builder()
            .id(1L)
            .name("Apollo")
            .code("PRJ-ENG-001")
            .description("Apollo platform")
            .active(true)
            .build();
    }

    @Test
    void createTimeEntryShouldRejectWhenHoursNotInQuarterHourIncrement() {
        LocalDate date = LocalDate.of(2024, 6, 6);
        TimeEntryRequest request = baseRequest(new BigDecimal("1.10"), date);

        mockEmployeeAndProject();

        assertThatThrownBy(() -> timeEntryService.createTimeEntry(request))
            .isInstanceOf(TimeEntryValidationException.class)
            .hasMessage("Hours must be in 15-minute increments.");

        verify(timeEntryRepository, never()).save(any(TimeEntry.class));
    }

    @Test
    void createTimeEntryShouldRejectWhenDateInTheFuture() {
        LocalDate futureDate = LocalDate.now().plusDays(1);
        TimeEntryRequest request = baseRequest(new BigDecimal("2.00"), futureDate);

        mockEmployeeAndProject();

        assertThatThrownBy(() -> timeEntryService.createTimeEntry(request))
            .isInstanceOf(TimeEntryValidationException.class)
            .hasMessage("Date cannot be in the future.");

        verify(timeEntryRepository, never()).save(any(TimeEntry.class));
    }

    @Test
    void createTimeEntryShouldRejectWhenDailyHoursExceedLimit() {
        LocalDate date = LocalDate.of(2024, 6, 6);
        TimeEntryRequest request = baseRequest(new BigDecimal("2.00"), date);

        mockEmployeeAndProject();
        TimeEntry existing = TimeEntry.builder()
            .id(5L)
            .employee(employee)
            .project(project)
            .date(date)
            .hours(new BigDecimal("23.50"))
            .build();
        when(timeEntryRepository.findByEmployeeIdAndDateBetween(1L, date, date)).thenReturn(List.of(existing));

        assertThatThrownBy(() -> timeEntryService.createTimeEntry(request))
            .isInstanceOf(TimeEntryValidationException.class)
            .hasMessage("Total hours per day cannot exceed 24.");

        verify(timeEntryRepository, never()).save(any(TimeEntry.class));
    }

    @Test
    void updateTimeEntryShouldIgnoreExistingEntryWhenCheckingDailyLimit() {
        LocalDate date = LocalDate.of(2024, 6, 6);
        TimeEntry existingEntry = TimeEntry.builder()
            .id(10L)
            .employee(employee)
            .project(project)
            .date(date)
            .hours(new BigDecimal("8.00"))
            .description("Existing")
            .build();

        TimeEntryRequest request = baseRequest(new BigDecimal("14.00"), date);

        when(timeEntryRepository.findById(10L)).thenReturn(Optional.of(existingEntry));
        mockEmployeeAndProject();
        TimeEntry otherEntry = TimeEntry.builder()
            .id(11L)
            .employee(employee)
            .project(project)
            .date(date)
            .hours(new BigDecimal("10.00"))
            .build();
        when(timeEntryRepository.findByEmployeeIdAndDateBetween(1L, date, date))
            .thenReturn(List.of(existingEntry, otherEntry));
        when(timeEntryRepository.save(any(TimeEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TimeEntryResponse response = timeEntryService.updateTimeEntry(10L, request);

        assertThat(response.getHours()).isEqualByComparingTo(new BigDecimal("14.00"));
        verify(timeEntryRepository).save(any(TimeEntry.class));
    }

    private void mockEmployeeAndProject() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
    }

    private TimeEntryRequest baseRequest(BigDecimal hours, LocalDate date) {
        return TimeEntryRequest.builder()
            .employeeId(1L)
            .projectId(1L)
            .date(date)
            .hours(hours)
            .description("Working on Apollo")
            .build();
    }
}
