package com.verdictsphere.repository;

import com.verdictsphere.entity.Criteria;
import com.verdictsphere.entity.Hackathon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CriteriaRepository extends JpaRepository<Criteria, Long> {
    List<Criteria> findByHackathon(Hackathon hackathon);
    List<Criteria> findByHackathonId(Long hackathonId);
}
