package com.ecoimpact.tracker.service;

import com.ecoimpact.tracker.domain.AppUser;
import com.ecoimpact.tracker.domain.Goal;
import com.ecoimpact.tracker.dto.GoalRequest;
import com.ecoimpact.tracker.repository.AppUserRepository;
import com.ecoimpact.tracker.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final AppUserRepository userRepository;

    private AppUser getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public Goal create(GoalRequest request) {
        AppUser currentUser = getCurrentUser();

        Goal goal = Goal.builder()
                .period(request.getPeriod())
                .targetCo2(request.getTargetCo2())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .user(currentUser)
                .build();

        return goalRepository.save(goal);
    }

    public List<Goal> findAll() {
        AppUser currentUser = getCurrentUser();
        return goalRepository.findByUserId(currentUser.getId());
    }

    public Goal findById(Long id) {
        AppUser currentUser = getCurrentUser();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        return goal;
    }

    @Transactional
    public Goal update(Long id, GoalRequest request) {
        Goal goal = findById(id);

        goal.setPeriod(request.getPeriod());
        goal.setTargetCo2(request.getTargetCo2());
        goal.setStartDate(request.getStartDate());
        goal.setEndDate(request.getEndDate());

        return goalRepository.save(goal);
    }

    @Transactional
    public void delete(Long id) {
        Goal goal = findById(id);
        goalRepository.delete(goal);
    }
}
