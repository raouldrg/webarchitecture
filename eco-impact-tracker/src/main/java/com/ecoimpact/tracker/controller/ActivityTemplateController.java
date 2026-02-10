package com.ecoimpact.tracker.controller;

import com.ecoimpact.tracker.domain.ActivityTemplate;
import com.ecoimpact.tracker.dto.ActivityTemplateRequest;
import com.ecoimpact.tracker.service.ActivityTemplateService;
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
@RequestMapping("/activity-templates")
@RequiredArgsConstructor
@Tag(name = "Activity Templates", description = "Activity template CRUD operations")
@SecurityRequirement(name = "Bearer Authentication")
public class ActivityTemplateController {

    private final ActivityTemplateService templateService;

    @PostMapping
    @Operation(summary = "Create a new activity template")
    public ResponseEntity<ActivityTemplate> create(@Valid @RequestBody ActivityTemplateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(templateService.create(request));
    }

    @GetMapping
    @Operation(summary = "Get all activity templates")
    public ResponseEntity<List<ActivityTemplate>> findAll() {
        return ResponseEntity.ok(templateService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get activity template by ID")
    public ResponseEntity<ActivityTemplate> findById(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.findById(id));
    }

    @GetMapping("/by-type/{activityTypeId}")
    @Operation(summary = "Get activity templates by activity type")
    public ResponseEntity<List<ActivityTemplate>> findByActivityTypeId(@PathVariable Long activityTypeId) {
        return ResponseEntity.ok(templateService.findByActivityTypeId(activityTypeId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update activity template")
    public ResponseEntity<ActivityTemplate> update(@PathVariable Long id,
            @Valid @RequestBody ActivityTemplateRequest request) {
        return ResponseEntity.ok(templateService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete activity template")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        templateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
