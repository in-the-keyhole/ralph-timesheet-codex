package com.ralphtimesheet.api.employee;

import com.ralphtimesheet.api.employee.dto.EmployeeRequest;
import com.ralphtimesheet.api.employee.dto.EmployeeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Manage employee records")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Operation(summary = "List employees", description = "Retrieve all employees.")
    @ApiResponse(responseCode = "200", description = "Employees retrieved successfully.")
    @GetMapping
    public List<EmployeeResponse> getEmployees() {
        return employeeService.getEmployees();
    }

    @Operation(summary = "Get employee", description = "Retrieve a single employee by id.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Employee retrieved successfully."),
        @ApiResponse(responseCode = "404", description = "Employee not found.")
    })
    @GetMapping("/{id}")
    public EmployeeResponse getEmployee(@PathVariable Long id) {
        return employeeService.getEmployee(id);
    }

    @Operation(summary = "Create employee", description = "Add a new employee.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Employee created successfully."),
        @ApiResponse(responseCode = "400", description = "Validation failed.")
    })
    @PostMapping
    public ResponseEntity<EmployeeResponse> createEmployee(@Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse created = employeeService.createEmployee(request);
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @Operation(summary = "Update employee", description = "Update an existing employee.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Employee updated successfully."),
        @ApiResponse(responseCode = "400", description = "Validation failed."),
        @ApiResponse(responseCode = "404", description = "Employee not found.")
    })
    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return employeeService.updateEmployee(id, request);
    }
}
