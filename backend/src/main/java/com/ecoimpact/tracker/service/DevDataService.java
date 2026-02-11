package com.ecoimpact.tracker.service;

import com.ecoimpact.tracker.domain.*;
import com.ecoimpact.tracker.dto.GenerateUserDataRequest;
import com.ecoimpact.tracker.dto.GenerateUserDataResponse;
import com.ecoimpact.tracker.repository.ActivityTemplateRepository;
import com.ecoimpact.tracker.repository.EntryRepository;
import com.ecoimpact.tracker.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class DevDataService {

    private final ActivityTemplateRepository templateRepository;
    private final EntryRepository entryRepository;
    private final GoalRepository goalRepository;

    @Transactional
    public GenerateUserDataResponse generate(AppUser user, GenerateUserDataRequest request) {
        List<ActivityTemplate> templates = templateRepository.findAll();
        if (templates.isEmpty()) {
            throw new RuntimeException("No activity templates found in database. Run the catalogue seed first.");
        }

        LocalDate today = LocalDate.now();
        LocalDate rangeStart = today.minusDays(request.getDaysBack());
        LocalDate rangeEnd = today;

        // Overwrite: delete existing user data in range
        if (Boolean.TRUE.equals(request.getOverwriteInRange())) {
            entryRepository.deleteByUserIdAndDateBetween(user.getId(), rangeStart, rangeEnd);
            goalRepository.deleteByUserIdAndStartDateBetween(user.getId(), rangeStart, rangeEnd);
            log.info("Deleted existing entries and goals for user {} in range {} to {}", user.getEmail(), rangeStart,
                    rangeEnd);
        }

        // Generate entries
        List<Entry> entries = new ArrayList<>();
        ThreadLocalRandom rng = ThreadLocalRandom.current();
        int minPerDay = request.getEntriesPerDayMin() != null ? request.getEntriesPerDayMin() : 0;
        int maxPerDay = request.getEntriesPerDayMax() != null ? request.getEntriesPerDayMax() : 3;

        for (LocalDate date = rangeStart; !date.isAfter(rangeEnd); date = date.plusDays(1)) {
            int count = rng.nextInt(minPerDay, maxPerDay + 1);
            for (int i = 0; i < count; i++) {
                ActivityTemplate template = templates.get(rng.nextInt(templates.size()));
                double quantity = generateRealisticQuantity(template.getDefaultUnit(), rng);

                Entry entry = Entry.builder()
                        .quantity(quantity)
                        .date(date)
                        .note(generateNote(template))
                        .user(user)
                        .activityTemplate(template)
                        .build();
                entries.add(entry);
            }
        }
        entryRepository.saveAll(entries);
        log.info("Generated {} entries for user {}", entries.size(), user.getEmail());

        // Generate goals
        int goalCount = 0;
        if (Boolean.TRUE.equals(request.getIncludeGoals())) {
            goalCount = generateGoals(user, rangeStart, rangeEnd, rng);
            log.info("Generated {} goals for user {}", goalCount, user.getEmail());
        }

        return GenerateUserDataResponse.builder()
                .createdEntries(entries.size())
                .createdGoals(goalCount)
                .rangeStart(rangeStart.toString())
                .rangeEnd(rangeEnd.toString())
                .build();
    }

    private double generateRealisticQuantity(String unit, ThreadLocalRandom rng) {
        if (unit == null)
            return roundTo2(rng.nextDouble(1, 10));

        String u = unit.toLowerCase();
        if (u.contains("km")) {
            return roundTo2(rng.nextDouble(2, 80));
        } else if (u.contains("kwh")) {
            return roundTo2(rng.nextDouble(1, 25));
        } else if (u.contains("kg") || u.contains("portion")) {
            return roundTo2(rng.nextDouble(0.1, 3));
        } else if (u.contains("item") || u.contains("unit") || u.contains("pièce")) {
            return rng.nextInt(1, 6);
        } else if (u.contains("litre") || u.contains("l")) {
            return roundTo2(rng.nextDouble(1, 50));
        } else if (u.contains("heure") || u.contains("hour") || u.contains("h")) {
            return roundTo2(rng.nextDouble(0.5, 8));
        } else {
            return roundTo2(rng.nextDouble(1, 10));
        }
    }

    private String generateNote(ActivityTemplate template) {
        String[] prefixes = { "", "", "", "Auto-tracked", "Commute", "Daily routine", "Weekend activity" };
        String prefix = prefixes[ThreadLocalRandom.current().nextInt(prefixes.length)];
        return prefix.isEmpty() ? null : prefix + " — " + template.getName();
    }

    private int generateGoals(AppUser user, LocalDate rangeStart, LocalDate rangeEnd, ThreadLocalRandom rng) {
        List<Goal> goals = new ArrayList<>();
        int count = rng.nextInt(2, 5); // 2 to 4 goals

        GoalPeriod[] periods = { GoalPeriod.WEEK, GoalPeriod.MONTH };

        for (int i = 0; i < count; i++) {
            GoalPeriod period = periods[rng.nextInt(periods.length)];
            LocalDate start;
            LocalDate end;

            if (period == GoalPeriod.WEEK) {
                // Pick a random week within the range
                int offsetDays = rng.nextInt(0,
                        Math.max(1, (int) (rangeEnd.toEpochDay() - rangeStart.toEpochDay()) - 7));
                start = rangeStart.plusDays(offsetDays);
                end = start.plusDays(6);
                if (end.isAfter(rangeEnd))
                    end = rangeEnd;
            } else {
                // Monthly goal covering most of the range
                start = rangeStart.plusDays(rng.nextInt(0, 5));
                end = rangeEnd.minusDays(rng.nextInt(0, 3));
                if (end.isBefore(start))
                    end = start.plusDays(7);
            }

            double targetCo2 = roundTo2(rng.nextDouble(5, 100));

            Goal goal = Goal.builder()
                    .period(period)
                    .targetCo2(targetCo2)
                    .startDate(start)
                    .endDate(end)
                    .user(user)
                    .build();
            goals.add(goal);
        }

        goalRepository.saveAll(goals);
        return goals.size();
    }

    private double roundTo2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
