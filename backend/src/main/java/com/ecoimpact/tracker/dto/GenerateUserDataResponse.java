package com.ecoimpact.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateUserDataResponse {

    private int createdEntries;
    private int createdGoals;
    private String rangeStart;
    private String rangeEnd;
}
