package com.ralphtimesheet.api.project;

import com.ralphtimesheet.api.project.dto.ProjectRequest;
import com.ralphtimesheet.api.project.dto.ProjectResponse;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Manage projects and their metadata")
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "List projects", description = "Retrieve all projects with optional active filter.")
    @ApiResponse(responseCode = "200", description = "Projects retrieved successfully.")
    @GetMapping
    public List<ProjectResponse> getProjects(@RequestParam(value = "active", required = false) Boolean active) {
        return projectService.getProjects(active);
    }

    @Operation(summary = "Get project", description = "Retrieve details for a single project.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project retrieved successfully."),
        @ApiResponse(responseCode = "404", description = "Project not found.")
    })
    @GetMapping("/{id}")
    public ProjectResponse getProject(@PathVariable Long id) {
        return projectService.getProject(id);
    }

    @Operation(summary = "Create project", description = "Add a new project to the catalog.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Project created successfully."),
        @ApiResponse(responseCode = "400", description = "Validation failed.")
    })
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse created = projectService.createProject(request);
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @Operation(summary = "Update project", description = "Update an existing project.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Project updated successfully."),
        @ApiResponse(responseCode = "400", description = "Validation failed."),
        @ApiResponse(responseCode = "404", description = "Project not found.")
    })
    @PutMapping("/{id}")
    public ProjectResponse updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return projectService.updateProject(id, request);
    }
}
