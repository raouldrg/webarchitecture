package com.ecoimpact.tracker.service;

import com.ecoimpact.tracker.domain.ActivityTemplate;
import com.ecoimpact.tracker.domain.ActivityType;
import com.ecoimpact.tracker.dto.ActivityTemplateRequest;
import com.ecoimpact.tracker.repository.ActivityTemplateRepository;
import com.ecoimpact.tracker.repository.ActivityTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityTemplateService {

    private final ActivityTemplateRepository templateRepository;
    private final ActivityTypeRepository activityTypeRepository;

    @Transactional
    public ActivityTemplate create(ActivityTemplateRequest request) {
        ActivityType activityType = activityTypeRepository.findById(request.getActivityTypeId())
                .orElseThrow(() -> new RuntimeException("Activity type not found"));

        ActivityTemplate template = ActivityTemplate.builder()
                .name(request.getName())
                .defaultUnit(request.getDefaultUnit())
                .co2Factor(request.getCo2Factor())
                .source(request.getSource())
                .activityType(activityType)
                .build();

        return templateRepository.save(template);
    }

    public List<ActivityTemplate> findAll() {
        return templateRepository.findAll();
    }

    public ActivityTemplate findById(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity template not found"));
    }

    public List<ActivityTemplate> findByActivityTypeId(Long activityTypeId) {
        return templateRepository.findByActivityTypeId(activityTypeId);
    }

    @Transactional
    public ActivityTemplate update(Long id, ActivityTemplateRequest request) {
        ActivityTemplate template = findById(id);

        ActivityType activityType = activityTypeRepository.findById(request.getActivityTypeId())
                .orElseThrow(() -> new RuntimeException("Activity type not found"));

        template.setName(request.getName());
        template.setDefaultUnit(request.getDefaultUnit());
        template.setCo2Factor(request.getCo2Factor());
        template.setSource(request.getSource());
        template.setActivityType(activityType);

        return templateRepository.save(template);
    }

    @Transactional
    public void delete(Long id) {
        if (!templateRepository.existsById(id)) {
            throw new RuntimeException("Activity template not found");
        }
        templateRepository.deleteById(id);
    }
}
