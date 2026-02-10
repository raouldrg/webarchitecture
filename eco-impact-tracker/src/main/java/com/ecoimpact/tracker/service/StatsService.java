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
        AppUser currentUser = getCurrentUser();
        List<Entry> entries = entryRepository.findEntriesForStats(currentUser.getId(), from, to);

        double totalCo2 = entries.stream()
                .mapToDouble(entry -> entry.getQuantity() * entry.getActivityTemplate().getCo2Factor())
                .sum();

        return StatsSummaryDTO.builder()
                .periodStart(from)
                .periodEnd(to)
                .totalCo2(totalCo2)
                .entryCount(entries.size())
                .build();
    }

    public List<StatsByDayDTO> getByDay(LocalDate from, LocalDate to) {
        AppUser currentUser = getCurrentUser();
        List<Entry> entries = entryRepository.findEntriesForStats(currentUser.getId(), from, to);

        Map<LocalDate, Double> co2ByDay = entries.stream()
                .collect(Collectors.groupingBy(
                        Entry::getDate,
                        Collectors.summingDouble(
                                entry -> entry.getQuantity() * entry.getActivityTemplate().getCo2Factor())));

        return co2ByDay.entrySet().stream()
                .map(entry -> StatsByDayDTO.builder()
                        .date(entry.getKey())
                        .totalCo2(entry.getValue())
                        .build())
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .collect(Collectors.toList());
    }

    public List<StatsByTypeDTO> getByType(LocalDate from, LocalDate to) {
        AppUser currentUser = getCurrentUser();
        List<Entry> entries = entryRepository.findEntriesForStats(currentUser.getId(), from, to);

        Map<String, Double> co2ByType = entries.stream()
                .collect(Collectors.groupingBy(
                        entry -> entry.getActivityTemplate().getActivityType().getName(),
                        Collectors.summingDouble(
                                entry -> entry.getQuantity() * entry.getActivityTemplate().getCo2Factor())));

        return co2ByType.entrySet().stream()
                .map(entry -> StatsByTypeDTO.builder()
                        .activityTypeName(entry.getKey())
                        .totalCo2(entry.getValue())
                        .build())
                .sorted((a, b) -> Double.compare(b.getTotalCo2(), a.getTotalCo2()))
                .collect(Collectors.toList());
    }
}
