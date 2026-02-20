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
