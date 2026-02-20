package com.ralphtimesheet.api.project;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class ProjectRepositoryTest {

    @Autowired
    private ProjectRepository projectRepository;

    @Test
    void shouldLoadSeedProjects() {
        List<Project> projects = projectRepository.findAll();

        assertThat(projects)
            .hasSize(3)
            .extracting(Project::getCode)
            .containsExactlyInAnyOrder(
                "PRJ-ENG-001",
                "PRJ-MOB-002",
                "PRJ-OPS-003"
            );

        Project apollo = projectRepository.findById(1L).orElseThrow();
        assertThat(apollo.getName()).isEqualTo("Apollo Redesign");
        assertThat(apollo.isActive()).isTrue();
    }
}
