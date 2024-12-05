import { Component, Input, OnInit } from '@angular/core';
import axios from 'axios';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-employee-modal',
  templateUrl: './add-employee-modal.component.html',
  styleUrls: ['./add-employee-modal.component.scss'],
})
export class AddEmployeeModalComponent implements OnInit {
  @Input() employee: any = { name: '', position: '', departmentId: '' };
  isNew: boolean = true; // To track if it's a new or existing employee

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    if (this.employee._id) {
      this.isNew = false;
    }
  }

  async saveEmployee() {
    if (!this.employee.name || !this.employee.position || !this.employee.departmentId) {
      alert('All fields are required!');
      return;
    }

    try {
      if (this.isNew) {
        const response = await axios.post('http://localhost:3000/api/employees', this.employee);
        console.log('Employee added:', response.data);
      } else {
        const response = await axios.put(`http://localhost:3000/api/employees/${this.employee._id}`, this.employee);
        console.log('Employee updated:', response.data);
      }
      this.modalController.dismiss(); // Close modal after save
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  }

  async deleteEmployee() {
    try {
      await axios.delete(`http://localhost:3000/api/employees/${this.employee._id}`);
      console.log('Employee deleted');
      this.modalController.dismiss(); // Close modal after delete
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  }
}
