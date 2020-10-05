USE employee_tracker_db;

INSERT INTO department (name)
VALUES ('Sales'), ('Engineering'), ('Finance');

INSERT INTO role (title, salary, department_id)
VALUES ('Sales Lead', 100000, 1), ('Salesperson', 80000, 1), ('Lead Engineer', 150000, 2), ('Software Engineer', 120000, 2), ('Accountant', 125000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES ('Laura', 'Lally', 1, null), ('Paul', 'Smith', 3, 1), ('Chris', 'Hemi', 4, null);