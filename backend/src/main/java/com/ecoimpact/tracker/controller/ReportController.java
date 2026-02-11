package com.ecoimpact.tracker.controller;

import com.ecoimpact.tracker.domain.Report;
import com.ecoimpact.tracker.dto.ReportRequest;
import com.ecoimpact.tracker.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "CO2 report CRUD operations")
@SecurityRequirement(name = "Bearer Authentication")
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @Operation(summary = "Create a new report")
    public ResponseEntity<Report> create(@Valid @RequestBody ReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.create(request));
    }

    @GetMapping
    @Operation(summary = "Get all reports for current user")
    public ResponseEntity<List<Report>> findAll() {
        return ResponseEntity.ok(reportService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report by ID")
    public ResponseEntity<Report> findById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.findById(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete report")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reportService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
