package com.ecoimpact.tracker.config;

import com.ecoimpact.tracker.domain.*;
import com.ecoimpact.tracker.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

/**
 * Idempotent seeder that creates a test user with realistic data.
 * Runs after DataSeeder to ensure templates/types exist first.
 * 
 * - Creates or updates test@gmail.com with password "test"
 * - Seeds entries and goals ONLY if user has no entries
 * - Does not modify other users or data
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(10) // Run after DataSeeder (default order)
public class TestUserSeeder implements CommandLineRunner {

    private static final String TEST_EMAIL = "test@gmail.com";
    private static final String TEST_PASSWORD = "test";
    private static final String TEST_NAME = "Test User";

    private final AppUserRepository userRepository;
    private final EntryRepository entryRepository;
    private final GoalRepository goalRepository;
    private final ActivityTemplateRepository templateRepository;
    private final ActivityTypeRepository typeRepository;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random();

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("========================================");
        log.info("TestUserSeeder: Checking test user...");
        log.info("========================================");

        // 1. Ensure test user exists with correct password
        AppUser testUser = ensureTestUserExists();

        // 2. Check if user already has data
        long entryCount = entryRepository.countByUserId(testUser.getId());
        if (entryCount > 0) {
            log.info("Test user already has {} entries, skipping data seed", entryCount);
            return;
        }

        // 3. Ensure we have templates to use
        List<ActivityTemplate> templates = templateRepository.findAll();
        if (templates.isEmpty()) {
            log.warn("No templates found, seeding minimal templates...");
            templates = seedMinimalTemplates();
        }

        // 4. Seed entries for the last 45 days
        log.info("Seeding entries for test user...");
        List<Entry> entries = generateEntries(testUser, templates);
        entryRepository.saveAll(entries);
        log.info("Created {} entries for test user", entries.size());

        // 5. Seed goals
        log.info("Seeding goals for test user...");
        List<Goal> goals = generateGoals(testUser);
        goalRepository.saveAll(goals);
        log.info("Created {} goals for test user", goals.size());

        log.info("========================================");
        log.info("TestUserSeeder: Complete!");
        log.info("  Email: {}", TEST_EMAIL);
        log.info("  Password: {}", TEST_PASSWORD);
        log.info("  Entries: {}", entries.size());
        log.info("  Goals: {}", goals.size());
        log.info("========================================");
    }

    /**
     * Creates test user if not exists, or updates password if exists.
     */
    private AppUser ensureTestUserExists() {
        Optional<AppUser> existingUser = userRepository.findByEmail(TEST_EMAIL);

        if (existingUser.isPresent()) {
            AppUser user = existingUser.get();
            // Update password hash to ensure it matches expected password
            user.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
            user = userRepository.save(user);
            log.info("Updated existing test user password (id={})", user.getId());
            return user;
        }

        // Create new test user
        AppUser newUser = AppUser.builder()
                .name(TEST_NAME)
                .email(TEST_EMAIL)
                .passwordHash(passwordEncoder.encode(TEST_PASSWORD))
                .build();
        newUser = userRepository.save(newUser);
        log.info("Created new test user (id={})", newUser.getId());
        return newUser;
    }

    /**
     * Creates minimal templates if none exist.
     */
    private List<ActivityTemplate> seedMinimalTemplates() {
        // First ensure types exist
        Map<String, ActivityType> types = ensureActivityTypesExist();

        List<ActivityTemplate> templates = new ArrayList<>();

        // Transport templates (~40%)
        templates.add(createTemplate("Car commute", "km", 0.21, "ADEME", types.get("Transport")));
        templates.add(createTemplate("Bus ride", "km", 0.089, "ADEME", types.get("Transport")));
        templates.add(createTemplate("Train journey", "km", 0.041, "ADEME", types.get("Transport")));
        templates.add(createTemplate("Flight (domestic)", "km", 0.255, "ADEME", types.get("Transport")));

        // Alimentation templates (~30%)
        templates.add(createTemplate("Red meat meal", "meal", 6.5, "ADEME", types.get("Alimentation")));
        templates.add(createTemplate("Vegetarian meal", "meal", 1.1, "ADEME", types.get("Alimentation")));
        templates.add(createTemplate("Fish meal", "meal", 3.2, "ADEME", types.get("Alimentation")));
        templates.add(createTemplate("Dairy products", "kg", 2.8, "ADEME", types.get("Alimentation")));

        // Énergie templates (~20%)
        templates.add(createTemplate("Electricity (grid)", "kWh", 0.057, "ADEME", types.get("Énergie")));
        templates.add(createTemplate("Natural gas heating", "m³", 2.0, "ADEME", types.get("Énergie")));
        templates.add(createTemplate("Hot water", "L", 0.015, "ADEME", types.get("Énergie")));

        // Autres templates (~10%)
        templates.add(createTemplate("Online order (small)", "order", 0.5, "Estimate", types.get("Achats")));
        templates.add(createTemplate("Clothing purchase", "item", 15.0, "ADEME", types.get("Achats")));

        return templateRepository.saveAll(templates);
    }

    private Map<String, ActivityType> ensureActivityTypesExist() {
        Map<String, ActivityType> types = new HashMap<>();

        String[][] typeData = {
                { "Transport", "km", "Transportation and mobility" },
                { "Alimentation", "meal", "Food and beverages" },
                { "Énergie", "kWh", "Home energy consumption" },
                { "Achats", "item", "Shopping and purchases" }
        };

        for (String[] data : typeData) {
            String name = data[0];
            ActivityType type = typeRepository.findByName(name)
                    .orElseGet(() -> {
                        ActivityType newType = new ActivityType();
                        newType.setName(data[0]);
                        newType.setUnit(data[1]);
                        newType.setDescription(data[2]);
                        return typeRepository.save(newType);
                    });
            types.put(name, type);
        }

        return types;
    }

    private ActivityTemplate createTemplate(String name, String unit, double co2Factor,
            String source, ActivityType type) {
        ActivityTemplate template = new ActivityTemplate();
        template.setName(name);
        template.setDefaultUnit(unit);
        template.setCo2Factor(co2Factor);
        template.setSource(source);
        template.setActivityType(type);
        return template;
    }

    /**
     * Generates realistic entries for the last 45 days.
     */
    private List<Entry> generateEntries(AppUser user, List<ActivityTemplate> allTemplates) {
        List<Entry> entries = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(45);

        // Group templates by type for weighted distribution
        Map<String, List<ActivityTemplate>> templatesByType = new HashMap<>();
        for (ActivityTemplate t : allTemplates) {
            String typeName = t.getActivityType() != null ? t.getActivityType().getName() : "Other";
            templatesByType.computeIfAbsent(typeName, k -> new ArrayList<>()).add(t);
        }

        // Define type weights for realistic distribution
        List<WeightedType> weightedTypes = new ArrayList<>();
        addTypeIfExists(weightedTypes, templatesByType, "Transport", 40);
        addTypeIfExists(weightedTypes, templatesByType, "Alimentation", 30);
        addTypeIfExists(weightedTypes, templatesByType, "Énergie", 20);
        addTypeIfExists(weightedTypes, templatesByType, "Achats", 10);

        // If no matching types, use all templates equally
        if (weightedTypes.isEmpty()) {
            weightedTypes.add(new WeightedType("All", allTemplates, 100));
        }

        // Generate 80-120 entries
        int targetEntries = 80 + random.nextInt(41);
        int entriesPerDay = targetEntries / 45;

        for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
            // Vary entries per day (1-4)
            int dailyEntries = Math.max(1, entriesPerDay + random.nextInt(3) - 1);

            for (int i = 0; i < dailyEntries && entries.size() < targetEntries; i++) {
                // Pick a type based on weights
                ActivityTemplate template = pickWeightedTemplate(weightedTypes);
                if (template == null)
                    continue;

                Entry entry = Entry.builder()
                        .user(user)
                        .date(date)
                        .activityTemplate(template)
                        .quantity(generateRealisticQuantity(template))
                        .note(generateNote(template, date))
                        .build();

                entries.add(entry);
            }
        }

        return entries;
    }

    private void addTypeIfExists(List<WeightedType> list,
            Map<String, List<ActivityTemplate>> templatesByType,
            String typeName, int weight) {
        List<ActivityTemplate> templates = templatesByType.get(typeName);
        if (templates != null && !templates.isEmpty()) {
            list.add(new WeightedType(typeName, templates, weight));
        }
    }

    private ActivityTemplate pickWeightedTemplate(List<WeightedType> weightedTypes) {
        int totalWeight = weightedTypes.stream().mapToInt(w -> w.weight).sum();
        int pick = random.nextInt(totalWeight);
        int cumulative = 0;

        for (WeightedType wt : weightedTypes) {
            cumulative += wt.weight;
            if (pick < cumulative) {
                List<ActivityTemplate> templates = wt.templates;
                return templates.get(random.nextInt(templates.size()));
            }
        }
        return null;
    }

    private double generateRealisticQuantity(ActivityTemplate template) {
        String unit = template.getDefaultUnit().toLowerCase();
        String name = template.getName().toLowerCase();

        // Generate realistic quantities based on unit/template type
        if (unit.contains("km")) {
            if (name.contains("flight"))
                return 200 + random.nextInt(800);
            if (name.contains("train"))
                return 20 + random.nextInt(180);
            return 5 + random.nextInt(45); // Car/bus
        }
        if (unit.contains("kwh"))
            return 5 + random.nextInt(25);
        if (unit.contains("m³") || unit.contains("m3"))
            return 1 + random.nextInt(5);
        if (unit.contains("l"))
            return 30 + random.nextInt(70);
        if (unit.contains("meal"))
            return 1 + random.nextInt(2);
        if (unit.contains("kg"))
            return 0.2 + random.nextDouble() * 1.8;
        if (unit.contains("item") || unit.contains("order"))
            return 1 + random.nextInt(3);

        // Default
        return 1 + random.nextDouble() * 10;
    }

    private String generateNote(ActivityTemplate template, LocalDate date) {
        // Only add notes sometimes (30% chance)
        if (random.nextInt(100) > 30)
            return null;

        String[] transportNotes = { "Commute", "Weekend trip", "Errand", "Meeting in town" };
        String[] foodNotes = { "Lunch", "Dinner", "Weekly groceries", "Restaurant" };
        String[] energyNotes = { "Heating", "Cooking", "Laundry", "Hot shower" };
        String[] shoppingNotes = { "Online order", "Gift", "Needed", "Sale" };

        String typeName = template.getActivityType() != null
                ? template.getActivityType().getName()
                : "";

        String[] notes = switch (typeName) {
            case "Transport" -> transportNotes;
            case "Alimentation" -> foodNotes;
            case "Énergie" -> energyNotes;
            default -> shoppingNotes;
        };

        return notes[random.nextInt(notes.length)];
    }

    /**
     * Generates realistic goals for current week and month.
     */
    private List<Goal> generateGoals(AppUser user) {
        List<Goal> goals = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Monthly goal
        LocalDate monthStart = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate monthEnd = today.with(TemporalAdjusters.lastDayOfMonth());
        Goal monthlyGoal = Goal.builder()
                .user(user)
                .period(GoalPeriod.MONTH)
                .targetCo2(250.0 + random.nextDouble() * 150) // 250-400 kg
                .startDate(monthStart)
                .endDate(monthEnd)
                .build();
        goals.add(monthlyGoal);

        // Weekly goal
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);
        Goal weeklyGoal = Goal.builder()
                .user(user)
                .period(GoalPeriod.WEEK)
                .targetCo2(60.0 + random.nextDouble() * 60) // 60-120 kg
                .startDate(weekStart)
                .endDate(weekEnd)
                .build();
        goals.add(weeklyGoal);

        return goals;
    }

    /**
     * Helper class for weighted template selection.
     */
    private record WeightedType(String name, List<ActivityTemplate> templates, int weight) {
    }
}
