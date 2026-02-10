package com.ecoimpact.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerateUserDataRequest {

    private Integer daysBack = 30;
    private Integer entriesPerDayMin = 0;
    private Integer entriesPerDayMax = 3;
    private Boolean includeGoals = true;
    private Boolean overwriteInRange = true;
}
