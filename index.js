require("dotenv").config();
require("console.table");
const inquirer = require("inquirer")
var mysql = require("mysql");


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
// √
function viewAllEmployees() {
    // SELECT * FROM employee;
    let query = "SELECT * FROM employee";
    con.query(query, function (err, data) {
        console.log("\nEmployees from database\n");
        console.table(data);
        mainMenu();
    });


};
// √
function viewAllRoles() {
    // SELECT * FROM role;
    let query = "SELECT * FROM role";
    con.query(query, function (err, data) {
        console.log("\nRoles from database\n");
        console.table(data);
        mainMenu();
    });
};

function addEmployee() {
    con.query("SELECT * FROM employee", function (err, empData) {
        if (err) throw err;
        const currentEmps = empData.map(item => item.first_name + " " + item.last_name);
        const employeeId = empData.map(item => item.id);
        console.log(empData);
        con.query("SELECT * FROM role", function (err, roleData) {
            if (err) throw err;
            const roleNames = roleData.map(item => item.title)
            const roleIds = roleData.map(item => item.id)
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
                },

            ]).then(function (addEmployee) {
                var first = addEmployee.first_name;
                var last = addEmployee.last_name;
                var role = addEmployee.role //Need to match this up with role_id
                var manager = addEmployee.manager; //Need to match this up with manager_id
                var query = "INSERT INTO employee SET ?";
                con.query(query, { first_name: first, last_name: last, role_id: role, manager_id: manager }, function (err, res) {
                    if (err) throw err;
                    console.log(res.affectedRows + " employee inserted!\n");
                    mainMenu()
                });
                console.log(`Added ${first} ${last} to the database`);

            });
        });
    });
};

function addRole() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the title of the role you would like to add?",
            name: "title"
        },
        {
            type: "input",
            message: "What is the salary of this role?",
            name: "salary"
        },
        {
            type: "list",
            message: "What is the department id?",
            name: "department_id"
        },

    ]).then(function (addRole) {
        var title = addRole.title;
        var salary = addRole.salary;
        var depart = addRole.department_id
        var query = "INSERT INTO role SET ?";
        con.query(query, { title: title, salary: salary, department_id: depart }, function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " role inserted!\n");
            console.log(`Added ${title} to the database!`);
            mainMenu()
        });

    });
};

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
            console.log(res.affectedRows + " department inserted!\n");
            console.log(`Added ${department} to the database!`);
            mainMenu();
        });
    });
};


function updateEmployeeRole() {
    con.query("SELECT * FROM employee", function (err, empData) {
        if (err) throw err;
        const currentEmps = empData.map(item => item.first_name + " " + item.last_name);
        con.query("SELECT * FROM role", function (err, roleData) {
            if (err) throw err;
            const roleNames = roleData.map(item => item.title)
            const roleIds = roleData.map(item => item.id)
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
                var employee = updateRole.employee;
                var role = updateRole.role;
                var query = "UPDATE employee SET ? WHERE ?"
                con.query(query, [{ role_id: role }, { id: employee }]);

                console.log("Role Updated!");
                mainMenu();
            })
        });
    });
};
