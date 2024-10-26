import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import caseDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCaseData';
import updateVitamins from "@salesforce/apex/PresciberWorkspaceLWCController.updateVitamins";
import { NavigationMixin } from 'lightning/navigation';

export default class PrescriberApplicationVitaminStep extends NavigationMixin(LightningElement) {

  @track caseRecord;
  @api patientRecord;
  @api accountRecordId;
  @api shipmentId;
  @api prescriptionId;
  @api prescriberId;
  @api caseRecordId;
  @api step;

  connectedCallback(){
    //currentDate
    // this.cssDisplay = 'slds-show';
    console.log('this.case', this.caseRecordId);
    if(this.caseRecordId != undefined){
        this.caseDetails(this.caseRecordId);
    }
    
  }

  get debug() {
    console.log('debugthis.caseRecord', this.caseRecord, JSON.stringify(this.caseRecord, null, 2));
    return JSON.stringify(this.caseRecord, null, 2);
  }

  caseDetails(recordId){
    caseDetails({
        caseId : recordId
    }).then(response => {
        this.caseRecord = response;
        // this.cssDisplay = 'slds-hide';
    }).catch(error => {
        // this.cssDisplay = 'slds-hide';
    });  
  } 


  vitaminChange(event) {
    console.log('vitaminChange', event.detail.value, event.detail.checked, this.caseRecord);
    this.caseRecord[event.detail.value] = event.detail.checked;
    console.log('vitaminChange', event.detail.value, event.detail.checked, this.caseRecord);
  }
  
  
  updateCaseRecord(actionType){
    var action = '';
    var actionStep = '';
    if(actionType == 'saveAndCompleteLater'){
        action = 'Save and Complete Later';
        actionStep = 'Prescriber Application Step Five';
    }else if(actionType == 'nextStep'){
        action = 'next';
        actionStep = 'Prescriber Application Step Six';
    }    
    console.log('updateCaseRecord', actionType, this.caseRecord, JSON.stringify(this.caseRecord));

    updateVitamins({
      caseRecord : JSON.stringify(this.caseRecord),
      actionType : action,
      step : actionStep
    }).then(response => {
      if(response.status == 'Success'){
    
        if (actionType == 'previousStep') {
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
        } else if (actionType == 'saveAndCompleteLater'){
            // this.displaySavePopup = true;
        } else if (actionType == 'nextStep'){
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
        this.cssDisplay = 'slds-hide';
        } else {
        const evt = new ShowToastEvent({
            title: response.status,
            message: response.message,
            variant: 'error',
        });
        this.dispatchEvent(evt);
        this.cssDisplay = 'slds-hide';
      } 
    }).catch(error => {
      console.log('error', error);
      const evt = new ShowToastEvent({
          title: 'Error',
          message: errorMessage,
          variant: 'error',
      });
      this.dispatchEvent(evt);

    });
  }


  
  navigateToNextStep(event){
    console.log('navigateToNextStep');
    this.updateCaseRecord('nextStep');
  }

  navigateToPreviousStep(event){
    console.log('navigateToPreviousStep');
    this.updateCaseRecord('previousStep');
    
  }

  saveAndCompleteLater(event){
    console.log('saveAndCompleteLater');
    this.updateCaseRecord('saveAndCompleteLater');
  }
}