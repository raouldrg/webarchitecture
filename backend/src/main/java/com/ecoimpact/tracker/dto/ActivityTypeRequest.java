package com.ecoimpact.tracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityTypeRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Unit is required")
    private String unit;

    private String description;
}
