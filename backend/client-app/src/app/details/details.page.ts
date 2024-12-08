import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  employee: any = {};  // Objekt pro uložení dat zaměstnanca
  isNew: boolean = false;  // Indikátor pro nový nebo editovaný záznam
  departments: any[] = []; // Seznam oddělení pro výběr
  selectedDepartmentId: string = '';  // ID vybraného oddělení

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNew = true;
      console.log('Creating a new employee');
    } else if (id) {
      console.log('Editing employee with ID:', id);
      this.loadEmployee(id); // Načteme zaměstnance
    } else {
      console.error('No employee ID found in route');
    }
    this.loadDepartments(); // Načteme seznam oddělení
  }
  

  // Načtení detailu zaměstnanca pro editaci
  async loadEmployee(id: string) {
    try {
      console.log('Loading employee with ID:', id);
      const response = await axios.get(`http://localhost:3000/api/employees/${id}`);
      this.employee = response.data;
  
      // Nastavíme selectedDepartmentId podle načtených dat
      if (this.employee.departmentId && this.employee.departmentId._id) {
        this.selectedDepartmentId = this.employee.departmentId._id;
      }
  
      console.log('Loaded employee:', this.employee);
    } catch (error) {
      console.error('Error loading employee:', error);
    }
  }
  
  
  
    

  // Načtení seznamu oddělení pro výběr
  async loadDepartments() {
    try {
      const response = await axios.get('http://localhost:3000/api/departments');
      this.departments = response.data;
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  }

  // Uložení nového nebo upraveného zaměstnanca
  // Příklad při uložení nového zaměstnanca
  async saveEmployee() {
    try {
      console.log("Saving employee:", this.employee);
  
      // Přidání departmentId z vybraného oddělení
      this.employee.departmentId = this.selectedDepartmentId;
  
      if (this.isNew) {
        // Odesíláme POST pro nový záznam
        await axios.post('http://localhost:3000/api/employees', this.employee);
      } else {
        // Odesíláme PUT pro úpravu existujícího záznamu
        await axios.put(`http://localhost:3000/api/employees/${this.employee._id}`, this.employee);
      }
  
      // Přesměrování na domovskou stránku po úspěchu
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  }
  
  
  

  
  
  // Smazání zaměstnanca
  async deleteEmployee() {
    try {
      await axios.delete(`http://localhost:3000/api/employees/${this.employee._id}`);
      this.router.navigate(['/home']);  // Po smazání přejdeme zpět na Home
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  }
  
  goBack() {
    this.router.navigate(['/home']); // Přesměrování na domovskou stránku
  }
  
}


