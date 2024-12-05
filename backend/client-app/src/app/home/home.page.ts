import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import axios from 'axios';
import { AddEmployeeModalComponent } from '../add-employee-modal/add-employee-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  employees: any[] = [];
  searchQuery: string = '';
  
  // Přidání _id do typu
  newEmployee = {
    _id: '', // Přidání _id
    name: '',
    position: '',
    departmentId: ''
  };

  showForm: boolean = false;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.loadEmployees();
  }

  async loadEmployees() {
    try {
      const response = await axios.get('http://localhost:3000/api/employees');
      this.employees = response.data;
    } catch (error) {
      console.error('Chyba při načítání zaměstnanců:', error);
    }
  }

  async searchEmployees() {
    try {
      const response = await axios.get(`http://localhost:3000/api/employees/search/${this.searchQuery}`);
      this.employees = response.data;
    } catch (error) {
      console.error('Error searching employees:', error);
    }
  }

  async showAddEmployeeForm() {
    const modal = await this.modalController.create({
      component: AddEmployeeModalComponent,
      cssClass: 'my-custom-class',
    });
    return await modal.present();
  }

  async addEmployee() {
    if (!this.newEmployee.name || !this.newEmployee.position || !this.newEmployee.departmentId) {
      alert('Všechna pole musí být vyplněna!');
      return;
    }

    try {
      if (this.newEmployee._id) {
        // Pokud má nový zaměstnanec _id, provádí se aktualizace
        const response = await axios.put(`http://localhost:3000/api/employees/${this.newEmployee._id}`, this.newEmployee);
        console.log('Zaměstnanec upraven:', response.data);
      } else {
        // Pokud nemá _id, provádí se přidání
        const response = await axios.post('http://localhost:3000/api/employees', this.newEmployee);
        console.log('Nový zaměstnanec přidán:', response.data);
      }
      this.loadEmployees();
      this.showForm = false;
      this.newEmployee = { _id: '', name: '', position: '', departmentId: '' }; // Resetování formuláře
    } catch (error) {
      console.error('Chyba při přidávání/aktualizaci zaměstnanca:', error);
    }
  }

  async deleteEmployee(employeeId: string) {
    try {
      // Zkontroluj správnost URL v konzoli
      console.log("Mazání zaměstnanca s ID:", employeeId);
      console.log("Mazání URL:", `http://localhost:3000/api/employees/${employeeId}`);
  
      await axios.delete(`http://localhost:3000/api/employees/${employeeId}`);
      console.log('Zaměstnanec smazán');
      this.loadEmployees(); // Načítání seznamu zaměstnanců po smazání
    } catch (error) {
      console.error('Chyba při mazání zaměstnanca:', error);
    }
  }
  
  
  

  async editEmployee(employee: any) {
    this.newEmployee = { ...employee }; // Naplnění formuláře daty zaměstnanca, včetně _id
    this.showForm = true; // Otevření formuláře pro úpravu
  }
}
