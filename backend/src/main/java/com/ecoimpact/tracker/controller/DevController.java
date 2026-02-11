package com.ecoimpact.tracker.controller;

import com.ecoimpact.tracker.domain.AppUser;
import com.ecoimpact.tracker.dto.GenerateUserDataRequest;
import com.ecoimpact.tracker.dto.GenerateUserDataResponse;
import com.ecoimpact.tracker.repository.AppUserRepository;
import com.ecoimpact.tracker.service.DevDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dev")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.devTools.enabled", havingValue = "true")
@Tag(name = "Dev Tools", description = "Development-only endpoints for generating test data")
@SecurityRequirement(name = "Bearer Authentication")
public class DevController {

    private final DevDataService devDataService;
    private final AppUserRepository userRepository;

    @PostMapping("/generate-user-data")
    @Operation(summary = "Generate realistic entries and goals for the authenticated user")
    public ResponseEntity<GenerateUserDataResponse> generateUserData(
            @RequestBody(required = false) GenerateUserDataRequest request) {

        if (request == null) {
            request = new GenerateUserDataRequest();
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GenerateUserDataResponse response = devDataService.generate(user, request);
        return ResponseEntity.ok(response);
    }
}
