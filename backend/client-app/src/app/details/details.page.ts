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
      this.isNew = true;  // Pokud je ID 'new', tak se jedná o nový záznam
    } else if (id) {
      this.loadEmployee(id);  // Pokud je ID, načteme existujícího zaměstnanca
    } else {
      console.error('No employee ID found in route');
    }
    this.loadDepartments();  // Načteme seznam oddělení
  }

  // Načtení detailu zaměstnanca pro editaci
  async loadEmployee(id: string) {
    try {
      const response = await axios.get(`http://localhost:3000/api/employees/${id}`);
      this.employee = response.data;
      this.selectedDepartmentId = this.employee.department._id; // Nastavíme vybrané oddělení
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
  async saveEmployee() {
    try {
      console.log("Ukládám zaměstnanca:", this.employee);

      if (this.isNew) {
        this.employee.department = this.selectedDepartmentId;  // Nastavíme vybrané oddělení
        await axios.post('http://localhost:3000/api/employees', this.employee);
      } else {
        this.employee.department = this.selectedDepartmentId;  // Nastavíme vybrané oddělení
        await axios.put(`http://localhost:3000/api/employees/${this.employee._id}`, this.employee);
      }
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Chyba při ukládání zaměstnanca:', error);
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
}
