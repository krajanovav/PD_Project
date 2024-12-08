import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import axios from 'axios';
import { Router } from '@angular/router'; // Nezapomeň importovat Router pro navigaci

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  employees: any[] = [];
  searchQuery: string = '';

  constructor(private modalController: ModalController, private router: Router) {}

  ngOnInit() {
    this.loadEmployees();  // Načteme seznam zaměstnanců při startu
  }

  // Načtení zaměstnanců
  async loadEmployees() {
    try {
      const response = await axios.get('http://localhost:3000/api/employees');
      console.log('Loaded employees:', response.data);  // Log to check response
      this.employees = response.data;
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  }

  // Při návratu na stránku Home z detailu zaměstnanca (po přidání nebo úpravě)
  ionViewWillEnter() {
    this.loadEmployees();  // Načteme zaměstnanci znovu při každém návratu na tuto stránku
  }

  // Vyhledávání zaměstnanců podle dotazu
  async searchEmployees() {
    try {
      if (!this.searchQuery.trim()) {
        // Pokud není zadaný žádný dotaz, načteme všechny zaměstnance
        this.loadEmployees();
        return;
      }
  
      const response = await axios.get(`http://localhost:3000/api/employees/search/${this.searchQuery}`);
      this.employees = response.data; // Aktualizujeme seznam zaměstnanců
    } catch (error) {
      console.error('Error searching employees:', error);
    }
  }
  

  // Zobrazení formuláře pro přidání nového zaměstnanca
  async showAddEmployeeForm() {
    this.router.navigate(['/details', 'new']);
  }

  // Mazání zaměstnanca
  async deleteEmployee(employeeId: string) {
    try {
      await axios.delete(`http://localhost:3000/api/employees/${employeeId}`);
      console.log('Employee deleted');
      this.loadEmployees(); // Reload employee list
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  }

  // Úprava zaměstnanca
  async editEmployee(employee: any) {
    this.router.navigate(['/details', employee._id]);
  }
}
