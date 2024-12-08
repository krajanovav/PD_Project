// Import necessary libraries and setup Express and Mongoose
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoUri = 'mongodb://localhost:27017/mydatabase';
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Mongoose Schemas and Models
const DepartmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true },
  location: { type: String, required: true },
});

const Department = mongoose.model('Department', DepartmentSchema);

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  },
  {
    versionKey: false,
  }
);

const Employee = mongoose.model('Employee', EmployeeSchema);

// Routes

// Route for fetching employees (with optional department filtering)
app.get('/api/employees', (req, res) => {
  const { department } = req.query;

  const query = department ? { departmentId: department } : {};

  Employee.find(query)
    .populate('departmentId')
    .then((employees) => res.json(employees))
    .catch((err) => {
      console.error('Error fetching employees:', err);
      res.status(500).json({ message: 'Error fetching employees' });
    });
});

// Route for adding a new employee
app.post('/api/employees', async (req, res) => {
  const { name, position, departmentId } = req.body;

  if (!name || !position || !departmentId) {
    return res.status(400).json({ message: 'Name, position, and departmentId are required' });
  }

  try {
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }

    const newEmployee = new Employee({ name, position, departmentId });
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ message: 'Error adding employee' });
  }
});

// Route for deleting an employee
app.delete('/api/employees/:id', (req, res) => {
  const employeeId = req.params.id;

  Employee.findByIdAndDelete(employeeId)
    .then((result) => {
      if (!result) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.json({ message: 'Employee deleted successfully' });
    })
    .catch((err) => {
      console.error('Error deleting employee:', err);
      res.status(500).json({ message: 'Error deleting employee' });
    });
});

// Route for fetching all departments
app.get('/api/departments', (req, res) => {
  Department.find()
    .then((departments) => res.json(departments))
    .catch((err) => {
      console.error('Error fetching departments:', err);
      res.status(500).json({ message: 'Error fetching departments' });
    });
});

// Route for fetching a single employee by ID
app.get('/api/employees/:id', (req, res) => {
  const employeeId = req.params.id;

  Employee.findById(employeeId)
    .populate('departmentId')
    .then((employee) => {
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.json(employee);
    })
    .catch((err) => {
      console.error('Error fetching employee:', err);
      res.status(500).json({ message: 'Error fetching employee' });
    });
});

// Route for updating an employee
app.put('/api/employees/:id', async (req, res) => {
  const employeeId = req.params.id;
  const { name, position, departmentId } = req.body;

  if (!name || !position || !departmentId) {
    return res.status(400).json({ message: 'Name, position, and departmentId are required' });
  }

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { name, position, departmentId },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(updatedEmployee);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ message: 'Error updating employee' });
  }
});

// Route for searching employees
app.get('/api/employees/search/:query', (req, res) => {
  const query = req.params.query;

  Employee.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { position: { $regex: query, $options: 'i' } },
    ],
  })
    .populate('departmentId')
    .then((employees) => res.json(employees))
    .catch((err) => {
      console.error('Error searching employees:', err);
      res.status(500).json({ message: 'Error searching employees' });
    });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
