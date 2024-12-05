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
  name: { type: String, required: true },
  location: { type: String, required: true },
});
const Department = mongoose.model('Department', DepartmentSchema);  // Tento řádek přidáme pro model Department

// Model pro Employee (zaměstnanec) s vlastním ID
const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // Odkaz na oddělení
  seqId: { type: mongoose.Schema.Types.ObjectId, unique: true }, // Sekvenční ID pro zaměstnanca
});
const Employee = mongoose.model('Employee', EmployeeSchema);

// Route pro získání všech zaměstnanců
app.get('/api/employees', (req, res) => {
  Employee.find().populate('department').sort({ seqId: 1 }) // Seřazení podle sekvenčního ID
    .then((employees) => {
      res.json(employees);
    })
    .catch((err) => {
      res.status(500).json({ message: 'Chyba při získávání zaměstnanců' });
    });
});

app.post('/api/employees', async (req, res) => {
  const { name, position, departmentId } = req.body;

  // Zkontroluj, zda je departmentId přítomno v těle požadavku
  if (!departmentId || !name || !position) {
    return res.status(400).json({ message: 'Name, position, and departmentId are required' });
  }

  try {
    // Ověření, že departmentId je platné ObjectId
    const departmentObjectId = mongoose.Types.ObjectId(departmentId);

    // Ověření, zda oddělení existuje v databázi
    const department = await Department.findById(departmentObjectId);
    if (!department) {
      return res.status(400).json({ message: 'Department does not exist' });
    }

    // Získání maximálního seqId pro nový záznam
    const maxEmployee = await Employee.findOne().sort({ seqId: -1 });
    const nextSeqId = maxEmployee ? maxEmployee.seqId + 1 : 1;

    // Vytvoření nového zaměstnanca
    const newEmployee = new Employee({
      
      name,
      position,
      department: departmentObjectId,  // Používáme departmentObjectId
      seqId: nextSeqId,
    });

    // Uložení nového zaměstnanca
    await newEmployee.save();
    res.status(201).json(newEmployee);  // Odeslání odpovědi s novým zaměstnancem
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({
      message: 'Error adding employee',
      error: err.message,
      stack: err.stack,  // Stack trace for more details
    });
  }
  
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

app.put('/api/employees/:id', (req, res) => {
  const { name, position, departmentId } = req.body;

  Employee.findByIdAndUpdate(req.params.id, { name, position, department: departmentId }, { new: true })
    .then((updatedEmployee) => {
      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Zaměstnanec nenalezen' });
      }
      res.json(updatedEmployee);
    })
    .catch((err) => {
      res.status(500).json({ message: 'Chyba při aktualizaci zaměstnanca' });
    });
});

// Spuštění serveru na portu 3000
app.listen(3000, () => {
  console.log('Server běží na http://localhost:3000');
});
