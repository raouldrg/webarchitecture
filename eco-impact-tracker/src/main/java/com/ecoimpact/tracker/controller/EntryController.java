package com.ecoimpact.tracker.controller;

import com.ecoimpact.tracker.domain.Entry;
import com.ecoimpact.tracker.dto.EntryRequest;
import com.ecoimpact.tracker.service.EntryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/entries")
@RequiredArgsConstructor
@Tag(name = "Entries", description = "User activity entry CRUD operations")
@SecurityRequirement(name = "Bearer Authentication")
public class EntryController {

    private final EntryService entryService;

    @PostMapping
    @Operation(summary = "Create a new entry")
    public ResponseEntity<Entry> create(@Valid @RequestBody EntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(entryService.create(request));
    }

    @GetMapping
    @Operation(summary = "Get all entries for current user")
    public ResponseEntity<List<Entry>> findAll() {
        return ResponseEntity.ok(entryService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get entry by ID")
    public ResponseEntity<Entry> findById(@PathVariable Long id) {
        return ResponseEntity.ok(entryService.findById(id));
    }

    @GetMapping("/range")
    @Operation(summary = "Get entries by date range")
    public ResponseEntity<List<Entry>> findByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(entryService.findByDateRange(from, to));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update entry")
    public ResponseEntity<Entry> update(@PathVariable Long id,
            @Valid @RequestBody EntryRequest request) {
        return ResponseEntity.ok(entryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete entry")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        entryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
