package com.ralphtimesheet.api.timeentry;

import com.ralphtimesheet.api.timeentry.dto.TimeEntryRequest;
import com.ralphtimesheet.api.timeentry.dto.TimeEntryResponse;
import java.time.LocalDate;
import java.util.List;

public interface TimeEntryService {

    List<TimeEntryResponse> getTimeEntries(Long employeeId, Long projectId, LocalDate startDate, LocalDate endDate);

    TimeEntryResponse getTimeEntry(Long id);

    TimeEntryResponse createTimeEntry(TimeEntryRequest request);

    TimeEntryResponse updateTimeEntry(Long id, TimeEntryRequest request);

    void deleteTimeEntry(Long id);
}
