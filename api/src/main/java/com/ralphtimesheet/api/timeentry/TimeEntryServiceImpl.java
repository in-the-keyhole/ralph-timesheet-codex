package com.ralphtimesheet.api.timeentry;

import com.ralphtimesheet.api.employee.Employee;
import com.ralphtimesheet.api.employee.EmployeeNotFoundException;
import com.ralphtimesheet.api.employee.EmployeeRepository;
import com.ralphtimesheet.api.project.Project;
import com.ralphtimesheet.api.project.ProjectNotFoundException;
import com.ralphtimesheet.api.project.ProjectRepository;
import com.ralphtimesheet.api.timeentry.dto.TimeEntryRequest;
import com.ralphtimesheet.api.timeentry.dto.TimeEntryResponse;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TimeEntryServiceImpl implements TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TimeEntryResponse> getTimeEntries(Long employeeId, Long projectId, LocalDate startDate, LocalDate endDate) {
        List<TimeEntry> entries;

        if (employeeId != null && startDate != null && endDate != null) {
            entries = timeEntryRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate);
        } else if (employeeId != null) {
            entries = timeEntryRepository.findByEmployeeId(employeeId);
        } else if (projectId != null) {
            entries = timeEntryRepository.findByProjectId(projectId);
        } else {
            entries = timeEntryRepository.findAll();
        }

        return entries.stream()
            .filter(entry -> projectId == null || entry.getProject().getId().equals(projectId))
            .filter(entry -> startDate == null || !entry.getDate().isBefore(startDate))
            .filter(entry -> endDate == null || !entry.getDate().isAfter(endDate))
            .sorted(Comparator.comparing(TimeEntry::getDate).thenComparing(TimeEntry::getId))
            .map(TimeEntryMapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TimeEntryResponse getTimeEntry(Long id) {
        TimeEntry timeEntry = findTimeEntry(id);
        return TimeEntryMapper.toResponse(timeEntry);
    }

    @Override
    public TimeEntryResponse createTimeEntry(TimeEntryRequest request) {
        Employee employee = findEmployee(request.getEmployeeId());
        Project project = findProject(request.getProjectId());

        TimeEntry timeEntry = TimeEntry.builder()
            .employee(employee)
            .project(project)
            .date(request.getDate())
            .hours(request.getHours())
            .description(request.getDescription())
            .build();

        TimeEntry saved = timeEntryRepository.save(timeEntry);
        return TimeEntryMapper.toResponse(saved);
    }

    @Override
    public TimeEntryResponse updateTimeEntry(Long id, TimeEntryRequest request) {
        TimeEntry timeEntry = findTimeEntry(id);
        Employee employee = findEmployee(request.getEmployeeId());
        Project project = findProject(request.getProjectId());

        timeEntry.setEmployee(employee);
        timeEntry.setProject(project);
        timeEntry.setDate(request.getDate());
        timeEntry.setHours(request.getHours());
        timeEntry.setDescription(request.getDescription());

        TimeEntry saved = timeEntryRepository.save(timeEntry);
        return TimeEntryMapper.toResponse(saved);
    }

    @Override
    public void deleteTimeEntry(Long id) {
        TimeEntry timeEntry = findTimeEntry(id);
        timeEntryRepository.delete(timeEntry);
    }

    private TimeEntry findTimeEntry(Long id) {
        return timeEntryRepository.findById(id)
            .orElseThrow(() -> new TimeEntryNotFoundException(id));
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
            .orElseThrow(() -> new EmployeeNotFoundException(id));
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));
    }
}
