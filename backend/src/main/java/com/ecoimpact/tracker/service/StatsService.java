package com.ecoimpact.tracker.service;

import com.ecoimpact.tracker.domain.AppUser;
import com.ecoimpact.tracker.domain.Entry;
import com.ecoimpact.tracker.dto.StatsByDayDTO;
import com.ecoimpact.tracker.dto.StatsSummaryDTO;
import com.ecoimpact.tracker.dto.StatsByTypeDTO;
import com.ecoimpact.tracker.repository.AppUserRepository;
import com.ecoimpact.tracker.repository.EntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

        private final EntryRepository entryRepository;
        private final AppUserRepository userRepository;

        private AppUser getCurrentUser() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        }

        public StatsSummaryDTO getSummary(LocalDate from, LocalDate to) {
                List<Entry> entries = getEntries(from, to);
                double totalCo2 = calculateTotalCo2(entries);

                return StatsSummaryDTO.builder()
                                .periodStart(from)
                                .periodEnd(to)
                                .totalCo2(totalCo2)
                                .entryCount(entries.size())
                                .build();
        }

        public List<StatsByDayDTO> getByDay(LocalDate from, LocalDate to) {
                List<Entry> entries = getEntries(from, to);

                Map<LocalDate, Double> co2ByDay = entries.stream()
                                .collect(Collectors.groupingBy(
                                                Entry::getDate,
                                                Collectors.summingDouble(e -> calculateEntryCo2(e))));

                return co2ByDay.entrySet().stream()
                                .sorted(Map.Entry.comparingByKey())
                                .map(entry -> StatsByDayDTO.builder()
                                                .date(entry.getKey())
                                                .totalCo2(entry.getValue())
                                                .build())
                                .collect(Collectors.toList());
        }

        public List<StatsByTypeDTO> getByType(LocalDate from, LocalDate to) {
                List<Entry> entries = getEntries(from, to);

                Map<String, Double> co2ByType = entries.stream()
                                .collect(Collectors.groupingBy(
                                                entry -> entry.getActivityTemplate().getActivityType().getName(),
                                                Collectors.summingDouble(e -> calculateEntryCo2(e))));

                return co2ByType.entrySet().stream()
                                .map(entry -> StatsByTypeDTO.builder()
                                                .activityTypeName(entry.getKey())
                                                .totalCo2(entry.getValue())
                                                .build())
                                .sorted((a, b) -> Double.compare(b.getTotalCo2(), a.getTotalCo2()))
                                .collect(Collectors.toList());
        }

        private List<Entry> getEntries(LocalDate from, LocalDate to) {
                AppUser currentUser = getCurrentUser();
                return entryRepository.findEntriesForStats(currentUser.getId(), from, to);
        }

        private double calculateTotalCo2(List<Entry> entries) {
                return entries.stream().mapToDouble(e -> calculateEntryCo2(e)).sum();
        }

        private double calculateEntryCo2(Entry entry) {
                return entry.getQuantity() * entry.getActivityTemplate().getCo2Factor();
        }
}
