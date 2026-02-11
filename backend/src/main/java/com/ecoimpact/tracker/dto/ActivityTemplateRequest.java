package com.ecoimpact.tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityTemplateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Default unit is required")
    private String defaultUnit;

    @NotNull(message = "CO2 factor is required")
    @Positive(message = "CO2 factor must be positive")
    private Double co2Factor;

    private String source;

    @NotNull(message = "Activity type ID is required")
    private Long activityTypeId;
}
