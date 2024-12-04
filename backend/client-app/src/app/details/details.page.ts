import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  employee: any = {};
  isNew: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNew = true;
    } else if (id) { // Zkontrolujeme, že id není null
      this.loadEmployee(id);
    } else {
      console.error('No employee ID found in route');
    }
  }
  

  async loadEmployee(id: string) {
    try {
      const response = await axios.get(`http://localhost:3000/api/employees/${id}`);
      this.employee = response.data;
    } catch (error) {
      console.error('Error loading employee:', error);
    }
  }

  async saveEmployee() {
    try {
      if (this.isNew) {
        await axios.post('http://localhost:3000/api/employees', this.employee);
      } else {
        await axios.put(
          `http://localhost:3000/api/employees/${this.employee._id}`,
          this.employee
        );
      }
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  }

  async deleteEmployee() {
    try {
      await axios.delete(`http://localhost:3000/api/employees/${this.employee._id}`);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  }
}
