const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Area = require('../models/Area');
const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const DutyAssignment = require('../models/DutyAssignment');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Seeding initial data...');

    // 1. Manager User
    await User.deleteMany({}); // Clear old users
    await User.create({
      name: 'Arundas',
      email: 'arundas@gmail.com',
      password: 'arundas1971',
      role: 'MANAGER',
      hotelName: 'Hotel Mumbai House',
    });
    console.log('Manager user created (arundas@gmail.com / arundas1971)');

    // 2. Default Areas
    const defaultAreas = [
      'Public Area',
      '1st Floor',
      '2nd Floor',
      '3rd Floor',
      '4th Floor',
      '5th Floor',
    ];

    for (const name of defaultAreas) {
      const exists = await Area.findOne({ name });
      if (!exists) {
        await Area.create({ name, description: `${name} Housekeeping & Service Area` });
      }
    }
    console.log('Default Areas verified/created');

    // 3. Default Shifts
    const defaultShifts = [
      { name: 'Morning', startTime: '07:00', endTime: '15:30' },
      { name: 'Second', startTime: '15:00', endTime: '23:30' },
      { name: 'Night', startTime: '23:00', endTime: '07:30' },
    ];

    for (const s of defaultShifts) {
      const exists = await Shift.findOne({ name: s.name });
      if (!exists) {
        await Shift.create(s);
      }
    }
    console.log('Default Shifts verified/created');

    // 4. Default Sample Employees
    const sampleEmployees = [
      { employeeCode: 'EMP001', name: 'Rajesh Kumar', mobileNumber: '+91 9876543210', designation: 'Housekeeping Attendant' },
      { employeeCode: 'EMP002', name: 'Sunil Sharma', mobileNumber: '+91 9876543211', designation: 'Senior Houseman' },
      { employeeCode: 'EMP003', name: 'Amit Patel', mobileNumber: '+91 9876543212', designation: 'Public Area Cleaner' },
      { employeeCode: 'EMP004', name: 'Priya Singh', mobileNumber: '+91 9876543213', designation: 'Floor Supervisor' },
      { employeeCode: 'EMP005', name: 'Deepak Verma', mobileNumber: '+91 9876543214', designation: 'Linen Runner' },
      { employeeCode: 'EMP006', name: 'Ramesh Yadav', mobileNumber: '+91 9876543215', designation: 'Room Attendant' },
      { employeeCode: 'EMP007', name: 'Vikas Gupta', mobileNumber: '+91 9876543216', designation: 'Public Area Supervisor' },
      { employeeCode: 'EMP008', name: 'Sanjay Mishra', mobileNumber: '+91 9876543217', designation: 'Floor Supervisor' },
    ];

    for (const emp of sampleEmployees) {
      const exists = await Employee.findOne({ employeeCode: emp.employeeCode });
      if (!exists) {
        await Employee.create(emp);
      }
    }
    console.log('Sample Employees verified/created');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
