package com.ecoimpact.tracker.service;

import com.ecoimpact.tracker.domain.ActivityType;
import com.ecoimpact.tracker.dto.ActivityTypeRequest;
import com.ecoimpact.tracker.repository.ActivityTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityTypeService {

    private final ActivityTypeRepository activityTypeRepository;

    @Transactional
    public ActivityType create(ActivityTypeRequest request) {
        if (activityTypeRepository.existsByName(request.getName())) {
            throw new RuntimeException("Activity type with name already exists");
        }

        ActivityType activityType = ActivityType.builder()
                .name(request.getName())
                .unit(request.getUnit())
                .description(request.getDescription())
                .build();

        return activityTypeRepository.save(activityType);
    }

    public List<ActivityType> findAll() {
        return activityTypeRepository.findAll();
    }

    public ActivityType findById(Long id) {
        return activityTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity type not found"));
    }

    @Transactional
    public ActivityType update(Long id, ActivityTypeRequest request) {
        ActivityType activityType = findById(id);

        if (!activityType.getName().equals(request.getName()) &&
                activityTypeRepository.existsByName(request.getName())) {
            throw new RuntimeException("Activity type with name already exists");
        }

        activityType.setName(request.getName());
        activityType.setUnit(request.getUnit());
        activityType.setDescription(request.getDescription());

        return activityTypeRepository.save(activityType);
    }

    @Transactional
    public void delete(Long id) {
        if (!activityTypeRepository.existsById(id)) {
            throw new RuntimeException("Activity type not found");
        }
        activityTypeRepository.deleteById(id);
    }
}
