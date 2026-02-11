package com.ecoimpact.tracker.repository;

import com.ecoimpact.tracker.domain.Entry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EntryRepository extends JpaRepository<Entry, Long> {

    List<Entry> findByUserId(Long userId);

    List<Entry> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    long countByUserId(Long userId);

    void deleteByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT e FROM Entry e WHERE e.user.id = :userId AND e.date BETWEEN :startDate AND :endDate")
    List<Entry> findEntriesForStats(@Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
