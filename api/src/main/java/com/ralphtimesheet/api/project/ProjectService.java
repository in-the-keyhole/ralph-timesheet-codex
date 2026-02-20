package com.ralphtimesheet.api.project;

import com.ralphtimesheet.api.project.dto.ProjectRequest;
import com.ralphtimesheet.api.project.dto.ProjectResponse;
import java.util.List;

public interface ProjectService {

    List<ProjectResponse> getProjects(Boolean active);

    ProjectResponse getProject(Long id);

    ProjectResponse createProject(ProjectRequest request);

    ProjectResponse updateProject(Long id, ProjectRequest request);
}
