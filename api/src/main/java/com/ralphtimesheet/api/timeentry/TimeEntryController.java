package com.ralphtimesheet.api.timeentry;

import com.ralphtimesheet.api.timeentry.dto.TimeEntryRequest;
import com.ralphtimesheet.api.timeentry.dto.TimeEntryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/time-entries")
@RequiredArgsConstructor
@Tag(name = "Time Entries", description = "Manage employee time tracking records")
public class TimeEntryController {

    private final TimeEntryService timeEntryService;

    @Operation(summary = "List time entries", description = "Retrieve time entries with optional filters")
    @ApiResponse(responseCode = "200", description = "Time entries retrieved successfully.")
    @GetMapping
    public List<TimeEntryResponse> getTimeEntries(
        @RequestParam(required = false) Long employeeId,
        @RequestParam(required = false) Long projectId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return timeEntryService.getTimeEntries(employeeId, projectId, startDate, endDate);
    }

    @Operation(summary = "Get time entry", description = "Retrieve a time entry by id.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Time entry retrieved successfully."),
        @ApiResponse(responseCode = "404", description = "Time entry not found.")
    })
    @GetMapping("/{id}")
    public TimeEntryResponse getTimeEntry(@PathVariable Long id) {
        return timeEntryService.getTimeEntry(id);
    }

    @Operation(summary = "Create time entry", description = "Log hours against a project and employee.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Time entry created successfully."),
        @ApiResponse(responseCode = "400", description = "Validation failed.")
    })
    @PostMapping
    public ResponseEntity<TimeEntryResponse> createTimeEntry(@Valid @RequestBody TimeEntryRequest request) {
        TimeEntryResponse created = timeEntryService.createTimeEntry(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @Operation(summary = "Update time entry", description = "Update an existing time entry.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Time entry updated successfully."),
        @ApiResponse(responseCode = "400", description = "Validation failed."),
        @ApiResponse(responseCode = "404", description = "Time entry not found.")
    })
    @PutMapping("/{id}")
    public TimeEntryResponse updateTimeEntry(@PathVariable Long id, @Valid @RequestBody TimeEntryRequest request) {
        return timeEntryService.updateTimeEntry(id, request);
    }

    @Operation(summary = "Delete time entry", description = "Remove a time entry.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Time entry deleted successfully."),
        @ApiResponse(responseCode = "404", description = "Time entry not found.")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimeEntry(@PathVariable Long id) {
        timeEntryService.deleteTimeEntry(id);
        return ResponseEntity.noContent().build();
    }
}
