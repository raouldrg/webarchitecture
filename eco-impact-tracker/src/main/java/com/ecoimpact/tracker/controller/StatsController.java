package com.ecoimpact.tracker.controller;

import com.ecoimpact.tracker.dto.StatsByDayDTO;
import com.ecoimpact.tracker.dto.StatsSummaryDTO;
import com.ecoimpact.tracker.dto.StatsByTypeDTO;
import com.ecoimpact.tracker.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
@Tag(name = "Statistics", description = "CO2 statistics endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/summary")
    @Operation(summary = "Get CO2 summary for a period")
    public ResponseEntity<StatsSummaryDTO> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(statsService.getSummary(from, to));
    }

    @GetMapping("/by-day")
    @Operation(summary = "Get CO2 emissions grouped by day")
    public ResponseEntity<List<StatsByDayDTO>> getByDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(statsService.getByDay(from, to));
    }

    @GetMapping("/by-type")
    @Operation(summary = "Get CO2 emissions grouped by activity type")
    public ResponseEntity<List<StatsByTypeDTO>> getByType(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(statsService.getByType(from, to));
    }
}
