package com.ecoimpact.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsSummaryDTO {
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private Double totalCo2;
    private Integer entryCount;
}
