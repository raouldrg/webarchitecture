package com.ecoimpact.tracker.service;

import com.ecoimpact.tracker.domain.AppUser;
import com.ecoimpact.tracker.domain.Entry;
import com.ecoimpact.tracker.domain.Report;
import com.ecoimpact.tracker.dto.ReportRequest;
import com.ecoimpact.tracker.repository.AppUserRepository;
import com.ecoimpact.tracker.repository.EntryRepository;
import com.ecoimpact.tracker.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final AppUserRepository userRepository;
    private final EntryRepository entryRepository;

    private AppUser getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public Report create(ReportRequest request) {
        AppUser currentUser = getCurrentUser();

        List<Entry> entries = entryRepository.findByUserIdAndDateBetween(
                currentUser.getId(),
                request.getPeriodStart(),
                request.getPeriodEnd());

        double totalCo2 = entries.stream()
                .mapToDouble(entry -> entry.getQuantity() * entry.getActivityTemplate().getCo2Factor())
                .sum();

        Report report = Report.builder()
                .periodStart(request.getPeriodStart())
                .periodEnd(request.getPeriodEnd())
                .totalCo2(totalCo2)
                .createdAt(LocalDateTime.now())
                .user(currentUser)
                .build();

        return reportRepository.save(report);
    }

    public List<Report> findAll() {
        AppUser currentUser = getCurrentUser();
        return reportRepository.findByUserId(currentUser.getId());
    }

    public Report findById(Long id) {
        AppUser currentUser = getCurrentUser();
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        return report;
    }

    @Transactional
    public void delete(Long id) {
        Report report = findById(id);
        reportRepository.delete(report);
    }
}
