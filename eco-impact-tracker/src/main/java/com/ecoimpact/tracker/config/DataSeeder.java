package com.ecoimpact.tracker.config;

import com.ecoimpact.tracker.domain.ActivityTemplate;
import com.ecoimpact.tracker.domain.ActivityType;
import com.ecoimpact.tracker.repository.ActivityTemplateRepository;
import com.ecoimpact.tracker.repository.ActivityTypeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final ActivityTypeRepository activityTypeRepository;
    private final ActivityTemplateRepository activityTemplateRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.seed.force:false}")
    private boolean forceReseed;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Force reseed: delete all data first
        if (forceReseed) {
            log.warn("========================================");
            log.warn("SEED_FORCE=true - Truncating all data...");
            log.warn("========================================");

            long templatesBefore = activityTemplateRepository.count();
            long typesBefore = activityTypeRepository.count();

            activityTemplateRepository.deleteAll();
            activityTypeRepository.deleteAll();

            log.info("Deleted {} templates and {} types", templatesBefore, typesBefore);
        }

        // Only seed if database is empty
        if (activityTypeRepository.count() > 0) {
            log.info("Database already contains {} types and {} templates, skipping seed",
                    activityTypeRepository.count(), activityTemplateRepository.count());
            return;
        }

        log.info("========================================");
        log.info("Seeding database with CO2 catalog...");
        log.info("========================================");

        try {
            ClassPathResource resource = new ClassPathResource("catalog-seed.json");
            InputStream inputStream = resource.getInputStream();
            JsonNode root = objectMapper.readTree(inputStream);

            // Seed Activity Types
            Map<String, ActivityType> typeMap = new HashMap<>();
            JsonNode typesNode = root.get("activityTypes");
            int typesLoaded = 0;

            if (typesNode != null && typesNode.isArray()) {
                typesLoaded = typesNode.size();
                log.info("Loaded {} activity types from catalog-seed.json", typesLoaded);

                for (JsonNode typeNode : typesNode) {
                    String typeName = typeNode.get("name").asText();

                    // Check if type already exists (for safety)
                    ActivityType existingType = activityTypeRepository.findByName(typeName).orElse(null);
                    if (existingType != null) {
                        typeMap.put(typeName, existingType);
                        log.debug("Activity type already exists: {}", typeName);
                        continue;
                    }

                    ActivityType type = new ActivityType();
                    type.setName(typeName);
                    type.setUnit(typeNode.get("unit").asText());
                    type.setDescription(typeNode.get("description").asText());

                    type = activityTypeRepository.save(type);
                    typeMap.put(type.getName(), type);
                    log.debug("Created activity type: {}", type.getName());
                }
            }

            log.info("Seeded {} activity types", typeMap.size());

            // Seed Activity Templates
            JsonNode templatesNode = root.get("templates");
            int templatesLoaded = 0;
            int templatesInserted = 0;
            int templatesSkipped = 0;

            if (templatesNode != null && templatesNode.isArray()) {
                templatesLoaded = templatesNode.size();
                log.info("Loaded {} templates from catalog-seed.json", templatesLoaded);

                for (JsonNode templateNode : templatesNode) {
                    String templateName = templateNode.get("name").asText();
                    String typeName = templateNode.get("activityType").asText();
                    ActivityType type = typeMap.get(typeName);

                    if (type == null) {
                        log.warn("Unknown activity type: '{}', skipping template: '{}'",
                                typeName, templateName);
                        templatesSkipped++;
                        continue;
                    }

                    // Check for duplicate (name + type)
                    boolean exists = activityTemplateRepository
                            .findByNameAndActivityTypeId(templateName, type.getId())
                            .isPresent();

                    if (exists) {
                        log.debug("Template already exists: {} (type: {})", templateName, typeName);
                        templatesSkipped++;
                        continue;
                    }

                    // Create NEW instance for each template (important!)
                    ActivityTemplate template = new ActivityTemplate();
                    template.setName(templateName);
                    template.setDefaultUnit(templateNode.get("defaultUnit").asText());
                    template.setCo2Factor(templateNode.get("co2Factor").asDouble());
                    template.setSource(templateNode.has("source") ? templateNode.get("source").asText() : null);
                    template.setActivityType(type);

                    activityTemplateRepository.save(template);
                    templatesInserted++;
                }
            }

            log.info("========================================");
            log.info("Database seeding completed!");
            log.info("  Types:     {} seeded", typeMap.size());
            log.info("  Templates: {} inserted, {} skipped", templatesInserted, templatesSkipped);
            log.info("========================================");

        } catch (Exception e) {
            log.error("Failed to seed database: {}", e.getMessage(), e);
            throw e;
        }
    }
}
