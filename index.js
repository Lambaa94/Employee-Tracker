require("dotenv").config();
require("console.table");
const inquirer = require("inquirer")
var mysql = require("mysql");
var figlet = require('figlet');

figlet(`
|EMPLOYEE|
|********|
|MANAGER |`, function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data)
});

var con = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: process.env.SQL_PASS,
    database: "employee_tracker_db"

});

con.connect(function (err) {
    if (err) throw err;
    mainMenu()
});


function mainMenu() {
    inquirer.prompt([{
        type: "list",
        name: "mainMenu",
        message: "What would you like to do?",
        choices: ["View All Employees", "View All Roles", "Add Employee", "Add Role", "Update Employee Role", "Add Department", "Exit"],

    }]).then(function ({ mainMenu }) {
        if (mainMenu === "View All Employees") {
            viewAllEmployees();
        };

        if (mainMenu === "View All Roles") {
            viewAllRoles();
        };

        if (mainMenu === "Add Employee") {
            addEmployee();
        };

        if (mainMenu === "Add Role") {
            addRole();
        };

        if (mainMenu === "Add Department") {
            addDepartment();
        };

        if (mainMenu === "Update Employee Role") {
            updateEmployeeRole();
        };

        if (mainMenu === "Exit") {
            con.end();
        }

    })
};

function viewAllEmployees() {
    // SELECT * FROM employee;
    let query = "SELECT employee.id AS Id, employee.first_name AS First_Name, employee.last_name AS Last_Name, role.title AS Role, department.name AS Department, role.salary AS Salary FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department on role.department_id = department.id;";
    con.query(query, function (err, data) {
        console.log("\nEmployees from database\n");
        console.table(data);
        mainMenu();
    });


};

function viewAllRoles() {
    // SELECT * FROM role;
    let query = "SELECT role.id AS Id, role.title AS Role, role.salary AS Salary, department.name AS Department FROM role LEFT JOIN department ON department_id = department.id";
    con.query(query, function (err, data) {
        console.log("\nRoles from database\n");
        console.table(data);
        mainMenu();
    });
};


function addEmployee() {
    con.query("SELECT * FROM employee", function (err, empData) {
        if (err) throw err;
        // const currentEmps = empData.map(item => "Id: " + item.id + " | " + item.first_name + " " + item.last_name)
        
        const currentEmps = empData.map(item => item.first_name + " " + item.last_name);
        // const employeeId = empData.map(item => item.id);
        currentEmps.push("Null")
      
        con.query("SELECT * FROM role", function (err, roleData) {
            if (err) throw err;
            // const roleNames = roleData.map(item => "Id: " + item.id + " | " + item.title)

            const roleNames = roleData.map(item => item.title)
            // const roleIds = roleData.map(item => item.id)

            if (roleNames.length > 0) {
                if (currentEmps.length <= 0) {
                    inquirer.prompt([
                        {
                            type: "input",
                            message: "What is the employee's first name?",
                            name: "first_name"
                        },
                        {
                            type: "input",
                            message: "What is the employee's last name?",
                            name: "last_name"
                        },
                        {
                            type: "list",
                            message: "What is the employee's role?",
                            name: "role",
                            choices: roleNames
                        },
                        {
                            type: "list",
                            message: "The first member in this database will not have a manager.",
                            name: "manager",
                            choices: ["None"]
                        }

                    ]).then(function (addEmployee) {
                        var first = addEmployee.first_name;
                        var last = addEmployee.last_name;
                        var role = addEmployee.role;
                        var query = "INSERT INTO employee SET ?";


                        con.query(query, { first_name: first, last_name: last, role_id: role }, function (err, res) {
                            if (err) throw err;
                            console.log(res.affectedRows + " employee inserted!\n");
                            mainMenu()
                        });
                        console.log(`Added ${first} ${last} to the database`);

                    });
                } else {
                    inquirer.prompt([
                        {
                            type: "input",
                            message: "What is the employee's first name?",
                            name: "first_name"
                        },
                        {
                            type: "input",
                            message: "What is the employee's last name?",
                            name: "last_name"
                        },
                        {
                            type: "list",
                            message: "What is the employee's role?",
                            name: "role",
                            choices: roleNames
                        },
                        {
                            type: "list",
                            message: "Who is the employee's manager?",
                            name: "manager",
                            choices: currentEmps
                        }

                    ]).then(function (addEmployee) {
                        console.log(addEmployee)
                        var first = addEmployee.first_name;
                        var last = addEmployee.last_name;
                        var role = addEmployee.role;
                        var manager = addEmployee.manager;
                        
                        con.query(
                            'INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES(?, ?, (SELECT id FROM role WHERE title = ? ),(SELECT id FROM (SELECT id FROM employee WHERE CONCAT(first_name, " ",last_name) = ?) AS temptable))',[first, last, role, manager], function (err, res) {
                            if (err) throw err;
                            console.log(res.affectedRows + " employee inserted!\n");
                            mainMenu()
                        });
                        console.log(`Added ${first} ${last} to the database`);

                    });
                }
            } else {
                console.log("I'm sorry! Please enter a role first.");
                mainMenu()
            };

        });

    });

};





function addRole() {
    con.query("SELECT * FROM department", function (err, departData) {
        if (err) throw err;
        const departments = departData.map(item => "Id: " + item.id + " | " + item.name)
        if (departments.length > 0) {
            inquirer.prompt([
                {
                    type: "input",
                    message: "What is the title of the role you would like to add?",
                    name: "title"
                },
                {//If salary is NaN how do I kick it back? //
                    type: "input",
                    message: "What is the salary of this role?",
                    name: "salary"
                },
                {
                    type: "list",
                    message: "In which Department is this role?",
                    name: "department_id",
                    choices: departments
                },

            ]).then(function (addRole) {
                var title = addRole.title;
                var salary = parseFloat(addRole.salary)
                var depart = addRole.department_id.charAt(4)
                var query = "INSERT INTO role SET ?";
                con.query(query, { title: title, salary: salary, department_id: depart }, function (err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + " role inserted!\n");
                    console.log(`Added ${title} to the database!`);
                    mainMenu()
                });

            })
        } else {
            console.log("I'm sorry! You must enter a Department first.")
            mainMenu()
        };
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            message: "What would you like this new department to be called?",
            name: "departmentName"
        }
    ]).then(function (addDepartment) {
        var department = addDepartment.departmentName;
        var query = "INSERT INTO department SET ?";
        con.query(query, { name: department }, function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " Department inserted!\n");
            console.log(`Added ${department} to the database!`);
            mainMenu();
        });
    });
};


function updateEmployeeRole() {
    con.query("SELECT * FROM employee", function (err, empData) {
        if (err) throw err;
        const currentEmps = empData.map(item => "Id: " + item.id + " | " + item.first_name + " " + item.last_name);
        con.query("SELECT * FROM role", function (err, roleData) {
            if (err) throw err;
            const roleNames = roleData.map(item => "Id: " + item.id + " | " + item.title);
            if (roleNames.length > 0) {
                inquirer.prompt([
                    {
                        type: "list",
                        message: "Which employee would you like to update their role?",
                        name: "employee",
                        choices: currentEmps
                    },
                    {
                        type: "list",
                        message: "Which role would you like this employee to have?",
                        name: "role",
                        choices: roleNames
                    }
                ]).then(function (updateRole) {
                    var employee = updateRole.employee.charAt(4);
                    var role = updateRole.role.charAt(4);
                    var query = "UPDATE employee SET ? WHERE ?"
                    con.query(query, [{ role_id: role }, { id: employee }]);

                    console.log("Role Updated!");
                    mainMenu();
                })
            } else {
                console.log("I'm sorry! You must enter a Role to update one!");
                mainMenu();
            }
        });

    });
};
