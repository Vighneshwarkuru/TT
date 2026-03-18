package com.verdictsphere.service;

import com.verdictsphere.dto.CriteriaRequest;
import com.verdictsphere.dto.CriteriaResponse;
import com.verdictsphere.entity.Criteria;
import com.verdictsphere.entity.Hackathon;
import com.verdictsphere.entity.User;
import com.verdictsphere.exception.EntityNotFoundException;
import com.verdictsphere.exception.WeightOutOfRangeException;
import com.verdictsphere.exception.WeightSumException;
import com.verdictsphere.repository.CriteriaRepository;
import com.verdictsphere.repository.HackathonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CriteriaService {

    private final CriteriaRepository criteriaRepository;
    private final HackathonRepository hackathonRepository;
    private final AuditService auditService;

    @Transactional
    public CriteriaResponse createCriteria(CriteriaRequest req, User admin) {
        validateWeight(req.getWeight());

        Hackathon hackathon = hackathonRepository.findById(req.getHackathonId())
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found with id: " + req.getHackathonId()));

        Criteria criteria = Criteria.builder()
                .hackathon(hackathon)
                .name(req.getName())
                .description(req.getDescription())
                .maxScore(req.getMaxScore())
                .weight(req.getWeight())
                .displayOrder(req.getDisplayOrder())
                .build();

        Criteria saved = criteriaRepository.save(criteria);
        return toResponse(saved);
    }

    @Transactional
    public CriteriaResponse updateCriteria(Long id, CriteriaRequest req, User admin) {
        validateWeight(req.getWeight());

        Criteria criteria = criteriaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Criteria not found with id: " + id));

        criteria.setName(req.getName());
        criteria.setDescription(req.getDescription());
        criteria.setMaxScore(req.getMaxScore());
        criteria.setWeight(req.getWeight());
        criteria.setDisplayOrder(req.getDisplayOrder());

        Criteria saved = criteriaRepository.save(criteria);

        auditService.log(admin.getId(), "UPDATE_CRITERIA", "CRITERIA", saved.getId(),
                "Updated criteria: " + saved.getName(), null);

        return toResponse(saved);
    }

    @Transactional
    public void deleteCriteria(Long id, User admin) {
        Criteria criteria = criteriaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Criteria not found with id: " + id));

        criteriaRepository.delete(criteria);

        auditService.log(admin.getId(), "DELETE_CRITERIA", "CRITERIA", id,
                "Deleted criteria: " + criteria.getName(), null);
    }

    public List<CriteriaResponse> getCriteriaByHackathon(Long hackathonId) {
        return criteriaRepository.findByHackathonId(hackathonId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void validateWeightSum(Long hackathonId) {
        List<Criteria> criteriaList = criteriaRepository.findByHackathonId(hackathonId);
        BigDecimal sum = criteriaList.stream()
                .map(Criteria::getWeight)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (sum.compareTo(new BigDecimal("100")) != 0) {
            throw new WeightSumException("Criteria weights must sum to 100, current sum: " + sum);
        }
    }

    private void validateWeight(BigDecimal weight) {
        if (weight == null || weight.compareTo(BigDecimal.ZERO) <= 0 || weight.compareTo(new BigDecimal("100")) > 0) {
            throw new WeightOutOfRangeException("Weight must be greater than 0 and at most 100");
        }
    }

    private CriteriaResponse toResponse(Criteria c) {
        return CriteriaResponse.builder()
                .id(c.getId())
                .hackathonId(c.getHackathon().getId())
                .name(c.getName())
                .description(c.getDescription())
                .maxScore(c.getMaxScore())
                .weight(c.getWeight())
                .displayOrder(c.getDisplayOrder())
                .build();
    }
}
