package com.ecoimpact.tracker.dto;

import com.ecoimpact.tracker.domain.GoalPeriod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalRequest {

    @NotNull(message = "Period is required")
    private GoalPeriod period;

    @NotNull(message = "Target CO2 is required")
    @Positive(message = "Target CO2 must be positive")
    private Double targetCo2;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;
}
