import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  employees: any[] = [];
  departments: any[] = [];
  searchQuery: string = '';
  selectedDepartment: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadDepartments();
  }

  ionViewWillEnter() {
    this.fetchEmployees(); // Zajistí aktualizaci seznamu při návratu na domovskou stránku
  }

  // Load all employees
  async loadEmployees() {
    try {
      const response = await axios.get('http://localhost:3000/api/employees');
      this.employees = response.data;
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

  // Fetch employees based on search query and department filter
  async fetchEmployees() {
    try {
      let url = 'http://localhost:3000/api/employees';
      const queryParams: string[] = [];
  
      if (this.searchQuery.trim()) {
        queryParams.push(`query=${this.searchQuery.trim()}`);
      }
      if (this.selectedDepartment) {
        queryParams.push(`department=${this.selectedDepartment}`);
      }
  
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
  
      const response = await axios.get(url);
      this.employees = response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }

  // Handle search input
  searchEmployees() {
    this.fetchEmployees();
  }

  // Handle department filter change
  filterByDepartment() {
    this.fetchEmployees();
  }

  // Delete an employee
  async deleteEmployee(employeeId: string) {
    try {
      await axios.delete(`http://localhost:3000/api/employees/${employeeId}`);
      this.fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  }

  // Navigate to edit employee page
  editEmployee(employee: any) {
    this.router.navigate(['/details', employee._id]);
  }
}
