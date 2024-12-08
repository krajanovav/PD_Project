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
  selectedLocation: string = '';  // Location vybraného oddělení
  showError: boolean = false;  // Indikátor pro zobrazení chyb

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  
  await this.loadDepartments(); // Načteme seznam oddělení

  if (id === 'new') {
    this.isNew = true;
    console.log('Creating a new employee');
  } else if (id) {
    console.log('Editing employee with ID:', id);
    await this.loadEmployee(id); // Načteme zaměstnance
  } else {
    console.error('No employee ID found in route');
  }
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
  
        // Najdeme odpovídající department a nastavíme location
        const selectedDepartment = this.departments.find(
          (dept) => dept._id === this.selectedDepartmentId
        );
        if (selectedDepartment) {
          this.selectedLocation = selectedDepartment.location;
        }
      }
  
      console.log('Loaded employee:', this.employee);
      console.log('Selected location:', this.selectedLocation);
    } catch (error) {
      console.error('Error loading employee:', error);
    }
  }
  
  
  
  
    

  // Metoda pro načtení seznamu oddělení
  async loadDepartments() {
    try {
      const response = await axios.get('http://localhost:3000/api/departments');
      this.departments = response.data;
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  }
 // Metoda volaná při změně výběru departmentu
 onDepartmentChange() {
  const selectedDepartment = this.departments.find(
    (dept) => dept._id === this.selectedDepartmentId
  );
  if (selectedDepartment) {
    this.selectedLocation = selectedDepartment.location; // Nastavíme location vybraného oddělení
    console.log('Selected department location:', this.selectedLocation);
  } else {
    this.selectedLocation = ''; // Pokud není vybrán žádný department
    console.log('No department selected');
  }
}


  // Uložení nového nebo upraveného zaměstnanca
  // Příklad při uložení nového zaměstnanca
  async saveEmployee() {
    // Základní validace formuláře
    if (!this.employee.name || !this.employee.position || !this.selectedDepartmentId) {
      this.showError = true; // Zobrazit chybové zprávy
      return;
    }

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


