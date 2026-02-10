package com.ecoimpact.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsByTypeDTO {
    private String activityTypeName;
    private Double totalCo2;
}
