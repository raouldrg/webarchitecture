package com.ecoimpact.tracker.repository;

import com.ecoimpact.tracker.domain.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserId(Long userId);

    void deleteByUserIdAndStartDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
