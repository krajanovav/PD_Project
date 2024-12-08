const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); // Povolení JSON těla pro POST požadavky

// Připojení k MongoDB
const mongoUri = 'mongodb://localhost:27017/mydatabase'; // Lokální MongoDB
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Připojeno k MongoDB'))
  .catch((err) => console.log('Chyba při připojování k MongoDB:', err));

// Model pro Department (oddělení)
const DepartmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true },
  location: { type: String, required: true },
});

const Department = mongoose.model('Department', DepartmentSchema);  // Definujeme model pro Department

// Model pro Employee (zaměstnanec) s vlastním ID
const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
}, {
  versionKey: false // Zakáže přidávání pole __v
});
const Employee = mongoose.model('Employee', EmployeeSchema);



// Route pro získání všech zaměstnanců
app.get('/api/employees', (req, res) => {
  Employee.find()
    .populate('departmentId')  // Změňte na správný název
    .sort({ seqId: 1 })
    .then((employees) => {
      res.json(employees);
    })
    .catch((err) => {
      console.error('Error during fetching employees:', err); // Přidá detailní výpis chyby
      res.status(500).json({ message: 'Chyba při získávání zaměstnanců', error: err.message });
    });
});


// Route pro přidání nového zaměstnance
app.post('/api/employees', async (req, res) => {
  const { name, position, departmentId } = req.body;

  if (!departmentId || !name || !position) {
    return res.status(400).json({ message: 'Name, position, and departmentId are required' });
  }

  try {
    // Převeďte `departmentId` na ObjectId
    const departmentObjectId = new mongoose.Types.ObjectId(departmentId);

    // Zkontrolujte, zda oddělení existuje
    const department = await Department.findById(departmentObjectId);
    if (!department) {
      return res.status(400).json({ message: 'Department does not exist' });
    }

    // Vytvořte nového zaměstnanca s departmentId
    const newEmployee = new Employee({
      name,
      position,
      departmentId: departmentObjectId,  // Používáme departmentId místo department
    });

    // Uložení do databáze
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ message: 'Error adding employee', error: err.message });
  }
});




app.delete('/api/employees/:id', (req, res) => {
  const employeeId = req.params.id;
  console.log(`Mazání zaměstnanca s ID: ${employeeId}`);

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ message: 'Neplatné ID' });
  }

  Employee.findByIdAndDelete(employeeId)
    .then((result) => {
      if (!result) {
        return res.status(404).json({ message: 'Zaměstnanec nenalezen' });
      }
      res.json({ message: 'Zaměstnanec byl smazán' });
    })
    .catch((err) => {
      console.error('Chyba při mazání:', err);
      res.status(500).json({ message: 'Chyba při mazání zaměstnanca' });
    });
});



// Route pro získání všech oddělení
app.get('/api/departments', (req, res) => {
  Department.find()
    .then((departments) => {
      res.json(departments);  // Odeslání seznamu oddělení
    })
    .catch((err) => {
      console.error('Chyba při získávání oddělení:', err);
      res.status(500).json({ message: 'Chyba při získávání oddělení' });
    });
});

app.get('/api/employees/:id', (req, res) => {
  const employeeId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  Employee.findById(employeeId)
    .populate('departmentId') // Načtěte detaily oddělení
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


app.put('/api/employees/:id', async (req, res) => {
  const employeeId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

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
    res.status(500).json({ message: 'Error updating employee', error: err.message });
  }
});

// Route pro vyhledávání zaměstnanců
app.get('/api/employees/search/:query', (req, res) => {
  const query = req.params.query;

  Employee.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { position: { $regex: query, $options: 'i' } },
      { 'departmentId.departmentName': { $regex: query, $options: 'i' } }
    ]
  })
    .populate('departmentId') // Načteme informace o oddělení
    .then((employees) => {
      res.json(employees);
    })
    .catch((err) => {
      console.error('Error during search:', err);
      res.status(500).json({ message: 'Error during search', error: err.message });
    });
});


// Spuštění serveru na portu 3000
app.listen(3000, () => {
  console.log('Server běží na http://localhost:3000');
});
