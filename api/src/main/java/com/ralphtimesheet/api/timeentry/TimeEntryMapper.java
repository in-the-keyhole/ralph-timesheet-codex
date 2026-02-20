package com.ralphtimesheet.api.timeentry;

import com.ralphtimesheet.api.employee.Employee;
import com.ralphtimesheet.api.project.Project;
import com.ralphtimesheet.api.timeentry.dto.TimeEntryResponse;

public final class TimeEntryMapper {

    private TimeEntryMapper() {
    }

    public static TimeEntryResponse toResponse(TimeEntry entry) {
        if (entry == null) {
            return null;
        }

        Employee employee = entry.getEmployee();
        Project project = entry.getProject();

        return TimeEntryResponse.builder()
            .id(entry.getId())
            .employeeId(employee != null ? employee.getId() : null)
            .employeeFirstName(employee != null ? employee.getFirstName() : null)
            .employeeLastName(employee != null ? employee.getLastName() : null)
            .employeeEmail(employee != null ? employee.getEmail() : null)
            .projectId(project != null ? project.getId() : null)
            .projectName(project != null ? project.getName() : null)
            .projectCode(project != null ? project.getCode() : null)
            .date(entry.getDate())
            .hours(entry.getHours())
            .description(entry.getDescription())
            .build();
    }
}
