package com.ralphtimesheet.api.timeentry.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeEntryResponse {

    private Long id;
    private Long employeeId;
    private String employeeFirstName;
    private String employeeLastName;
    private String employeeEmail;
    private Long projectId;
    private String projectName;
    private String projectCode;
    private LocalDate date;
    private BigDecimal hours;
    private String description;
}
