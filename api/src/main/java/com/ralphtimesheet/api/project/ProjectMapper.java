package com.ralphtimesheet.api.project;

import com.ralphtimesheet.api.project.dto.ProjectRequest;
import com.ralphtimesheet.api.project.dto.ProjectResponse;

public final class ProjectMapper {

    private ProjectMapper() {
    }

    public static ProjectResponse toResponse(Project project) {
        if (project == null) {
            return null;
        }

        return ProjectResponse.builder()
            .id(project.getId())
            .name(project.getName())
            .code(project.getCode())
            .description(project.getDescription())
            .active(project.isActive())
            .build();
    }

    public static Project toEntity(ProjectRequest request) {
        if (request == null) {
            return null;
        }

        return Project.builder()
            .name(request.getName())
            .code(request.getCode())
            .description(request.getDescription())
            .active(Boolean.TRUE.equals(request.getActive()))
            .build();
    }

    public static void updateEntity(ProjectRequest request, Project project) {
        if (request == null || project == null) {
            return;
        }

        project.setName(request.getName());
        project.setCode(request.getCode());
        project.setDescription(request.getDescription());
        project.setActive(Boolean.TRUE.equals(request.getActive()));
    }
}
