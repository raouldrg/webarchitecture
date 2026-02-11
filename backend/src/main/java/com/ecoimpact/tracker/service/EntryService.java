package com.ecoimpact.tracker.service;

import com.ecoimpact.tracker.domain.ActivityTemplate;
import com.ecoimpact.tracker.domain.AppUser;
import com.ecoimpact.tracker.domain.Entry;
import com.ecoimpact.tracker.dto.EntryRequest;
import com.ecoimpact.tracker.repository.ActivityTemplateRepository;
import com.ecoimpact.tracker.repository.AppUserRepository;
import com.ecoimpact.tracker.repository.EntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EntryService {

    private final EntryRepository entryRepository;
    private final AppUserRepository userRepository;
    private final ActivityTemplateRepository templateRepository;

    private AppUser getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public Entry create(EntryRequest request) {
        AppUser currentUser = getCurrentUser();

        ActivityTemplate template = templateRepository.findById(request.getActivityTemplateId())
                .orElseThrow(() -> new RuntimeException("Activity template not found"));

        Entry entry = Entry.builder()
                .quantity(request.getQuantity())
                .date(request.getDate())
                .note(request.getNote())
                .user(currentUser)
                .activityTemplate(template)
                .build();

        return entryRepository.save(entry);
    }

    public List<Entry> findAll() {
        AppUser currentUser = getCurrentUser();
        return entryRepository.findByUserId(currentUser.getId());
    }

    public Entry findById(Long id) {
        AppUser currentUser = getCurrentUser();
        Entry entry = entryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entry not found"));

        if (!entry.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        return entry;
    }

    public List<Entry> findByDateRange(LocalDate startDate, LocalDate endDate) {
        AppUser currentUser = getCurrentUser();
        return entryRepository.findByUserIdAndDateBetween(currentUser.getId(), startDate, endDate);
    }

    @Transactional
    public Entry update(Long id, EntryRequest request) {
        Entry entry = findById(id);

        ActivityTemplate template = templateRepository.findById(request.getActivityTemplateId())
                .orElseThrow(() -> new RuntimeException("Activity template not found"));

        entry.setQuantity(request.getQuantity());
        entry.setDate(request.getDate());
        entry.setNote(request.getNote());
        entry.setActivityTemplate(template);

        return entryRepository.save(entry);
    }

    @Transactional
    public void delete(Long id) {
        Entry entry = findById(id);
        entryRepository.delete(entry);
    }
}
