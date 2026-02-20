package com.ralphtimesheet.api.employee;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class EmployeeRepositoryTest {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Test
    void shouldLoadSeedEmployees() {
        List<Employee> employees = employeeRepository.findAll();

        assertThat(employees)
            .hasSize(3)
            .extracting(Employee::getEmail)
            .containsExactlyInAnyOrder(
                "ava.stone@example.com",
                "noah.garcia@example.com",
                "liam.turner@example.com"
            );

        Employee firstEmployee = employeeRepository.findById(1L).orElseThrow();
        assertThat(firstEmployee.getFirstName()).isEqualTo("Ava");
        assertThat(firstEmployee.getDepartment()).isEqualTo("Engineering");
    }
}
