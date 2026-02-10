package com.ecoimpact.tracker.repository;

import com.ecoimpact.tracker.domain.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActivityTypeRepository extends JpaRepository<ActivityType, Long> {
    Optional<ActivityType> findByName(String name);

    boolean existsByName(String name);
}
