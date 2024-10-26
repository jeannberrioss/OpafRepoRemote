import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class PrescriberApplicationStepSign extends NavigationMixin(LightningElement) {

  @api step;

  navigateToNextStep(event){
    console.log('navigateToNextStep'); 
    const evt= new CustomEvent('nextstep', {
      detail: {
        isCurrentStep : this.step,
        caseRecordId : this.caseRecordId,
        patientRecord : this.patientId,
        // accountId : response.accountId,
        // prescriberId : response.prescriberId,
        // shipmentId : response.shipmentId,
        // prescriptionId : response.prescriptionId
        // isConsentReceived : this.isConsentReceived
      }
    });  
    this.dispatchEvent(evt);
  }

  navigateToPreviousStep(event){
    console.log('navigateToPreviousStep');
    const evt= new CustomEvent('previousstep', {
      detail: {
        isCurrentStep : this.step,
        caseRecordId : this.caseRecordId,
        patientRecord : this.patientId,
        // accountId : response.accountId,
        // prescriberId : response.prescriberId,
        // shipmentId : response.shipmentId,
        // prescriptionId : response.prescriptionId
        // isConsentReceived : this.isConsentReceived
      }
    });
    this.dispatchEvent(evt);
    
  }

  saveAndCompleteLater(event){
    console.log('saveAndCompleteLater');    
    
  }
}