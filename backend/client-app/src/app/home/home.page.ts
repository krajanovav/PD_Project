import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import axios from 'axios';
import { AddEmployeeModalComponent } from '../add-employee-modal/add-employee-modal.component'; // Importuj novou komponentu

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  employees: any[] = [];
  searchQuery: string = '';
  
  // Přidejte definici pro newEmployee a showForm
  newEmployee = {
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

  // Otevře modal pro přidání nového zaměstnanca
  async showAddEmployeeForm() {
    const modal = await this.modalController.create({
      component: AddEmployeeModalComponent,  // Tato komponenta bude zobrazena jako modal
      cssClass: 'my-custom-class',  // Volitelný CSS třída
    });
    return await modal.present();
  }
  
  async addEmployee() {
    console.log('Data, která posílám na backend:', this.newEmployee);  // Debugging log pro kontrolu dat
    try {
      const response = await axios.post('http://localhost:3000/api/employees', this.newEmployee);
      console.log('Nový zaměstnanec přidán:', response.data);  // Log pro ověření odpovědi
      this.loadEmployees();  // Načítání zaměstnanců znovu
      this.showForm = false;  // Zavření formuláře
      this.newEmployee = { name: '', position: '', departmentId: '' };  // Resetování formuláře
    } catch (error) {
      console.error('Chyba při přidávání zaměstnanca:', error);
    }
  }
  
  
  
  
  
  
}
