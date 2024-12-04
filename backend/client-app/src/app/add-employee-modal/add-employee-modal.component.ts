import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-employee-modal',
  templateUrl: './add-employee-modal.component.html',
  styleUrls: ['./add-employee-modal.component.scss'],
})
export class AddEmployeeModalComponent {
  newEmployee = {
    name: '',
    position: '',
    departmentId: ''
  };

  constructor(private modalController: ModalController) {}

  // Zavření modalu a vrácení dat do HomePage
  dismiss() {
    this.modalController.dismiss(this.newEmployee);  // Odesíláme data zpět do HomePage
  }

  // Metoda pro odeslání formuláře
  async addEmployee() {
    // Předpokládejme, že nějaká validace byla provedena
    this.dismiss();  // Zavře modal a odešle data zpět
  }
}
