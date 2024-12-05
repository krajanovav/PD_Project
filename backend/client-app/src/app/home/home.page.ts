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
  
  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.loadEmployees();
  }

  async loadEmployees() {
    try {
      const response = await axios.get('http://localhost:3000/api/employees');
      this.employees = response.data;
    } catch (error) {
      console.error('Error loading employees:', error);
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

  async deleteEmployee(employeeId: string) {
    try {
      await axios.delete(`http://localhost:3000/api/employees/${employeeId}`);
      console.log('Employee deleted');
      this.loadEmployees(); // Reload employee list
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  }

  async editEmployee(employee: any) {
    const modal = await this.modalController.create({
      component: AddEmployeeModalComponent,
      componentProps: { employee }, // Passing employee data for edit
    });
    return await modal.present();
  }
}
