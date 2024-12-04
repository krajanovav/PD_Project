const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Povolení CORS pro komunikaci mezi frontendem a backendem
app.use(cors());
app.use(express.json()); // Povolení JSON těla pro POST požadavky

// Připojení k MongoDB
const mongoUri = 'mongodb://localhost:27017/mydatabase'; // Lokální MongoDB
// Pokud používáš MongoDB Atlas:
// const mongoUri = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydatabase';

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Připojeno k MongoDB'))
  .catch((err) => console.log('Chyba při připojování k MongoDB:', err));

// Model pro Product (produkty)
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});
const Product = mongoose.model('Product', ProductSchema);

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // Odkaz na oddělení
});
const Employee = mongoose.model('Employee', EmployeeSchema);


// Model pro Department (oddělení)
const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
});
const Department = mongoose.model('Department', DepartmentSchema);

// Route pro získání všech produktů
app.get('/api/products', (req, res) => {
  Product.find({}, (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Chyba při načítání produktů' });
    }
    res.json(products); // Odeslání seznamu produktů jako JSON
  });
});

// Route pro přidání nového produktu
app.post('/api/products', (req, res) => {
  const newProduct = new Product(req.body);
  newProduct.save((err, product) => {
    if (err) {
      return res.status(500).json({ message: 'Chyba při ukládání produktu' });
    }
    res.status(201).json(product); // Odeslání nového produktu jako JSON
  });
});

// **Tato část je pro získání všech zaměstnanců**
// Route pro získání všech zaměstnanců
app.get('/api/employees', (req, res) => {
  Employee.find().populate('department') // Získání zaměstnanců a jejich oddělení
    .then((employees) => {
      res.json(employees); // Odeslání seznamu zaměstnanců jako JSON
    })
    .catch((err) => {
      res.status(500).json({ message: 'Chyba při získávání zaměstnanců' });
    });
});

// Route pro přidání nového zaměstnanca
app.post('/api/employees', (req, res) => {
  const { name, position, departmentId } = req.body;
  console.log('Data přijatá na serveru:', req.body); // Přidali jsme log pro ladění

  const newEmployee = new Employee({
    name,
    position,
    department: departmentId, // Odkaz na oddělení
  });

  newEmployee.save()
    .then((employee) => {
      console.log('Zaměstnanec přidán:', employee);  // Log pro úspěšné uložení
      res.status(201).json(employee);  // Odeslání odpovědi
    })
    .catch((err) => {
      console.error('Chyba při přidávání zaměstnanca:', err);
      res.status(500).json({ message: 'Chyba při přidávání zaměstnanca' });
    });
});










// Route pro získání konkrétního zaměstnanca podle ID
app.get('/api/employees/:id', (req, res) => {
  Employee.findById(req.params.id).populate('department')
    .then((employee) => {
      if (!employee) {
        return res.status(404).json({ message: 'Zaměstnanec nenalezen' });
      }
      res.json(employee); // Odeslání dat o konkrétním zaměstnanci jako JSON
    })
    .catch((err) => {
      res.status(500).json({ message: 'Chyba při získávání zaměstnanca' });
    });
});

// Spuštění serveru na portu 3000
app.listen(3000, () => {
  console.log('Server běží na http://localhost:3000');
});
