package com.ralphtimesheet.api.timeentry;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {

    List<TimeEntry> findByEmployeeId(Long employeeId);

    List<TimeEntry> findByProjectId(Long projectId);

    List<TimeEntry> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);
}
