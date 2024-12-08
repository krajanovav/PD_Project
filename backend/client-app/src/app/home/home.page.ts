import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import axios from 'axios';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  employees: any[] = [];
  departments: any[] = []; // List of departments
  searchQuery: string = '';
  selectedDepartment: string = ''; // Selected department ID for filtering

  constructor(private modalController: ModalController, private router: Router) {}

  ngOnInit() {
    this.loadEmployees(); // Load employees
    this.loadDepartments(); // Load departments
  }

  // Load all employees
  async loadEmployees() {
    try {
      const response = await axios.get('http://localhost:3000/api/employees');
      this.employees = response.data;
      console.log(this.employees); // Debug log
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  }
  

  // Load all departments
  async loadDepartments() {
    try {
      const response = await axios.get('http://localhost:3000/api/departments');
      this.departments = response.data;
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  }

  // Search employees based on query
  async searchEmployees() {
    try {
      if (!this.searchQuery.trim()) {
        // Load all employees if search query is empty
        this.loadEmployees();
        return;
      }

      const response = await axios.get(`http://localhost:3000/api/employees/search/${this.searchQuery}`);
      this.employees = response.data;
    } catch (error) {
      console.error('Error searching employees:', error);
    }
  }

  // Filter employees by selected department
  async filterByDepartment() {
    try {
      if (!this.selectedDepartment) {
        // Load all employees if no department is selected
        this.loadEmployees();
        return;
      }

      // Filter employees by department
      const response = await axios.get(`http://localhost:3000/api/employees?department=${this.selectedDepartment}`);
      this.employees = response.data;
    } catch (error) {
      console.error('Error filtering employees:', error);
    }
  }

  // Delete an employee
  async deleteEmployee(employeeId: string) {
    try {
      await axios.delete(`http://localhost:3000/api/employees/${employeeId}`);
      this.loadEmployees(); // Reload employee list after deletion
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  }

  // Navigate to edit employee page
  async editEmployee(employee: any) {
    this.router.navigate(['/details', employee._id]);
  }
  
}
