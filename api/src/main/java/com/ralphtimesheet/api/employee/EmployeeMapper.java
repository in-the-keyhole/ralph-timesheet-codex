package com.ralphtimesheet.api.employee;

import com.ralphtimesheet.api.employee.dto.EmployeeRequest;
import com.ralphtimesheet.api.employee.dto.EmployeeResponse;

public final class EmployeeMapper {

    private EmployeeMapper() {
    }

    public static EmployeeResponse toResponse(Employee employee) {
        if (employee == null) {
            return null;
        }

        return EmployeeResponse.builder()
            .id(employee.getId())
            .firstName(employee.getFirstName())
            .lastName(employee.getLastName())
            .email(employee.getEmail())
            .department(employee.getDepartment())
            .build();
    }

    public static Employee toEntity(EmployeeRequest request) {
        if (request == null) {
            return null;
        }

        return Employee.builder()
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .email(request.getEmail())
            .department(request.getDepartment())
            .build();
    }

    public static void updateEntity(EmployeeRequest request, Employee employee) {
        if (request == null || employee == null) {
            return;
        }

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setDepartment(request.getDepartment());
    }
}
