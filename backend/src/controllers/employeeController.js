const Employee = require('../models/Employee');

// @desc    Get all employees
// @route   GET /api/employees
const getEmployees = async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 });
  res.json(employees);
};

// @desc    Create new employee
// @route   POST /api/employees
const createEmployee = async (req, res) => {
  const { employeeCode, name, mobileNumber, designation, isActive } = req.body;

  const employeeExists = await Employee.findOne({ employeeCode });

  if (employeeExists) {
    return res.status(400).json({ message: 'Employee Code already exists' });
  }

  const employee = await Employee.create({
    employeeCode,
    name,
    mobileNumber,
    designation,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json(employee);
};

// @desc    Update employee
// @route   PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  const { employeeCode, name, mobileNumber, designation, isActive } = req.body;

  const employee = await Employee.findById(req.params.id);

  if (employee) {
    if (employeeCode && employeeCode !== employee.employeeCode) {
      const codeExist = await Employee.findOne({ employeeCode });
      if (codeExist) {
        return res.status(400).json({ message: 'Employee Code already in use by another employee' });
      }
      employee.employeeCode = employeeCode;
    }

    employee.name = name || employee.name;
    employee.mobileNumber = mobileNumber || employee.mobileNumber;
    employee.designation = designation || employee.designation;
    if (isActive !== undefined) {
      employee.isActive = isActive;
    }

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } else {
    res.status(404).json({ message: 'Employee not found' });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (employee) {
    await employee.deleteOne();
    res.json({ message: 'Employee removed successfully' });
  } else {
    res.status(404).json({ message: 'Employee not found' });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
