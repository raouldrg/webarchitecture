package com.ecoimpact.tracker.controller;

import com.ecoimpact.tracker.domain.ActivityType;
import com.ecoimpact.tracker.dto.ActivityTypeRequest;
import com.ecoimpact.tracker.service.ActivityTypeService;
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
@RequestMapping("/activity-types")
@RequiredArgsConstructor
@Tag(name = "Activity Types", description = "Activity type CRUD operations")
@SecurityRequirement(name = "Bearer Authentication")
public class ActivityTypeController {

    private final ActivityTypeService activityTypeService;

    @PostMapping
    @Operation(summary = "Create a new activity type")
    public ResponseEntity<ActivityType> create(@Valid @RequestBody ActivityTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(activityTypeService.create(request));
    }

    @GetMapping
    @Operation(summary = "Get all activity types")
    public ResponseEntity<List<ActivityType>> findAll() {
        return ResponseEntity.ok(activityTypeService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get activity type by ID")
    public ResponseEntity<ActivityType> findById(@PathVariable Long id) {
        return ResponseEntity.ok(activityTypeService.findById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update activity type")
    public ResponseEntity<ActivityType> update(@PathVariable Long id,
            @Valid @RequestBody ActivityTypeRequest request) {
        return ResponseEntity.ok(activityTypeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete activity type")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        activityTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
