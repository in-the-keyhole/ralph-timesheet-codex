package com.ralphtimesheet.api.timeentry.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class TimeEntryRequest {

    @NotNull
    private Long employeeId;

    @NotNull
    private Long projectId;

    @NotNull
    private LocalDate date;

    @NotNull
    @DecimalMin(value = "0.25")
    @DecimalMax(value = "24.00")
    @Digits(integer = 2, fraction = 2)
    private BigDecimal hours;

    @Size(max = 500)
    private String description;
}
