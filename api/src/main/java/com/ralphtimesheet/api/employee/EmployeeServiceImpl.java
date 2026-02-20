package com.ralphtimesheet.api.employee;

import com.ralphtimesheet.api.employee.dto.EmployeeRequest;
import com.ralphtimesheet.api.employee.dto.EmployeeResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Override
    public List<EmployeeResponse> getEmployees() {
        return employeeRepository.findAll()
            .stream()
            .map(EmployeeMapper::toResponse)
            .toList();
    }

    @Override
    public EmployeeResponse getEmployee(Long id) {
        Employee employee = findEmployee(id);
        return EmployeeMapper.toResponse(employee);
    }

    @Override
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        Employee employee = EmployeeMapper.toEntity(request);
        Employee saved = employeeRepository.save(employee);
        return EmployeeMapper.toResponse(saved);
    }

    @Override
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = findEmployee(id);
        EmployeeMapper.updateEntity(request, employee);
        Employee saved = employeeRepository.save(employee);
        return EmployeeMapper.toResponse(saved);
    }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
            .orElseThrow(() -> new EmployeeNotFoundException(id));
    }
}
