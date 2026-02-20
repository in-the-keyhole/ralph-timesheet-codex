DELETE FROM time_entries;
DELETE FROM projects;
DELETE FROM employees;

INSERT INTO employees (id, first_name, last_name, email, department) VALUES
  (1, 'Ava', 'Stone', 'ava.stone@example.com', 'Engineering'),
  (2, 'Noah', 'Garcia', 'noah.garcia@example.com', 'Product'),
  (3, 'Liam', 'Turner', 'liam.turner@example.com', 'Finance');

INSERT INTO projects (id, name, code, description, active) VALUES
  (1, 'Apollo Redesign', 'PRJ-ENG-001', 'Revamp the primary web experience for Q4 launch.', TRUE),
  (2, 'Mobile Launch', 'PRJ-MOB-002', 'Ship the mobile onboarding improvements.', TRUE),
  (3, 'ERP Migration', 'PRJ-OPS-003', 'Consolidate finance workflows into the ERP.', FALSE);

INSERT INTO time_entries (id, employee_id, project_id, date, hours, description) VALUES
  (1, 1, 1, '2024-06-03', 4.50, 'Wireframe review and planning'),
  (2, 1, 2, '2024-06-04', 3.75, 'Mobile onboarding QA session'),
  (3, 2, 2, '2024-06-03', 6.00, 'Sprint planning and coordination'),
  (4, 3, 3, '2024-06-05', 2.25, 'ERP vendor sync');
