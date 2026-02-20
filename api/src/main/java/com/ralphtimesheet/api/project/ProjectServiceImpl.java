package com.ralphtimesheet.api.project;

import com.ralphtimesheet.api.project.dto.ProjectRequest;
import com.ralphtimesheet.api.project.dto.ProjectResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    @Override
    public List<ProjectResponse> getProjects(Boolean active) {
        List<Project> projects = active == null
            ? projectRepository.findAll()
            : projectRepository.findByActive(active);

        return projects.stream()
            .map(ProjectMapper::toResponse)
            .toList();
    }

    @Override
    public ProjectResponse getProject(Long id) {
        Project project = findProject(id);
        return ProjectMapper.toResponse(project);
    }

    @Override
    public ProjectResponse createProject(ProjectRequest request) {
        Project project = ProjectMapper.toEntity(request);
        Project saved = projectRepository.save(project);
        return ProjectMapper.toResponse(saved);
    }

    @Override
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = findProject(id);
        ProjectMapper.updateEntity(request, project);
        Project saved = projectRepository.save(project);
        return ProjectMapper.toResponse(saved);
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));
    }
}
