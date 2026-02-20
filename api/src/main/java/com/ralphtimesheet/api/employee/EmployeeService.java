package com.ralphtimesheet.api.employee;

import com.ralphtimesheet.api.employee.dto.EmployeeRequest;
import com.ralphtimesheet.api.employee.dto.EmployeeResponse;
import java.util.List;

public interface EmployeeService {

    List<EmployeeResponse> getEmployees();

    EmployeeResponse getEmployee(Long id);

    EmployeeResponse createEmployee(EmployeeRequest request);

    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);
}
