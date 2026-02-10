package com.ecoimpact.tracker.repository;

import com.ecoimpact.tracker.domain.ActivityTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityTemplateRepository extends JpaRepository<ActivityTemplate, Long> {
    List<ActivityTemplate> findByActivityTypeId(Long activityTypeId);

    Optional<ActivityTemplate> findByNameAndActivityTypeId(String name, Long activityTypeId);
}
