import { LightningElement, api } from 'lwc';

export default class PrescriberApplicationVitaminStep extends LightningElement {

  @api caseRecord;
  @api patientRecord;
  @api accountRecordId;
  @api shipmentId;
  @api prescriptionId;
  @api prescriberId;
  @api getCaseData;

  vitaminChange(event) {
    console.log('vitaminChange', event.target.value, event.currentTarget.dataset.nam);
    // this.getData[event.currentTarget.dataset.name] = event.target.value;
  }
  
  // updateCaseRecord(actionType){
  //   var action = '';
  //   var actionStep = '';
  //   if(actionType == 'saveAndCompleteLater'){
  //       action = 'Save and Complete Later';
  //       actionStep = 'Prescriber Application Vitamins Step';
  //   }else if(actionType == 'nextStep'){
  //       action = 'next';
  //       actionStep = 'Prescriber Application Step Five';
  //   }
    
  //   saveVitamins({
  //     caseId : this.caseRecordId,
  //     vitaminA : this.vitaminA,
  //   }).then(response => {
  //     if(response.status == 'Success'){
  //       if(actionType == 'previousStep'){
  //           const evt= new CustomEvent('previousstep', {
  //               detail: {
  //                   isStepFour : true,
  //                   isCurrentStep : '4',
  //                   caseRecordId : this.caseRecordId,
  //                   patientRecord : this.patientId,
  //                   accountId : response.accountId,
  //                   prescriberId : response.prescriberId,
  //                   shipmentId : response.shipmentId,
  //                   prescriptionId : response.prescriptionId,
  //                   // isConsentReceived : this.isConsentReceived
  //               }
  //           });
  //           this.dispatchEvent(evt);
  //       }else if(actionType == 'saveAndCompleteLater'){
  //           // this.displaySavePopup = true;
  //       }else if(actionType == 'nextStep'){
  //           const evt= new CustomEvent('nextstep', {
  //               detail: {
  //                   isStep5 : true,
  //                   isCurrentStep : '5',
  //                   caseRecordId : this.caseRecordId,
  //                   patientRecord : this.patientId,
  //                   accountId : response.accountId,
  //                   prescriberId : response.prescriberId,
  //                   shipmentId : response.shipmentId,
  //                   prescriptionId : response.prescriptionId,
  //                   // isConsentReceived : this.isConsentReceived
  //               }
  //           });   
  //           this.dispatchEvent(evt); 
  //       }
  //       // this.cssDisplay = 'slds-hide';
  //   }else{
  //       // this.cssDisplay = 'slds-hide';
  //       const evt = new ShowToastEvent({
  //           title: response.status,
  //           message: response.message,
  //           variant: 'error',
  //       });
  //       this.dispatchEvent(evt);     
  //   }
  //   }).catch(error => {
  //     console.log('error', error);
  //   });
  
  updateCaseRecord(actionType){
    var action = '';
    var actionStep = '';
    if(actionType == 'saveAndCompleteLater'){
        action = 'Save and Complete Later';
        actionStep = 'Prescriber Application Vitamins Step';
    }else if(actionType == 'nextStep'){
        action = 'next';
        actionStep = 'Prescriber Application Step Five';
    }    
    
    if(actionType == 'previousStep'){
        const evt= new CustomEvent('previousstep', {
            detail: {
                isStepFour : true,
                isCurrentStep : 'Vitamins',
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
    }else if(actionType == 'saveAndCompleteLater'){
        // this.displaySavePopup = true;
    }else if(actionType == 'nextStep'){
        const evt= new CustomEvent('nextstep', {
            detail: {
                isStep5 : true,
                isCurrentStep : 'Vitamins',
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
  }
//     updateCaseDetails({
//         caseRecord : JSON.stringify(this.caseData),
//         actionType : action,
//         step : actionStep
        
//     }).then(response => {
//         if(response.status == 'Success'){
//             if(actionType == 'previousStep'){
//                 const evt= new CustomEvent('previousstep', {
//                     detail: {
//                         isStepFour : true,
//                         isCurrentStep : '4',
//                         caseRecordId : this.caseRecord,
//                         patientRecord : this.patientRecord,
//                         accountId : this.accountRecordId,
//                         prescriberId : this.prescriberId,
//                         shipmentId : this.shipmentId,
//                         prescriptionId : this.prescriptionId,
//                         consentStatus : this.isConsentReceived
//                     }
//                 });
//                 this.dispatchEvent(evt);
//             }else if(actionType == 'saveAndCompleteLater'){
//                 this.displaySavePopup = true;
//             }else if(actionType == 'nextStep'){
//                 const evt= new CustomEvent('nextstep', {
//                     detail: {
//                         isStepThree : true,
//                         isCurrentStep : 'Vitamins',
//                         caseRecordId : this.caseRecord,
//                         patientRecord : this.patientRecord,
//                         accountId : response.accountId,
//                         prescriberId : response.prescriberId,
//                         shipmentId : response.shipmentId,
//                         prescriptionId : response.prescriptionId,
//                         consentStatus : this.isConsentReceived
//                     }
//                 });   
//                 this.dispatchEvent(evt); 
//             }
//             this.cssDisplay = 'slds-hide';
//         }else{
//             const evt = new ShowToastEvent({
//                 title: response.status,
//                 message: response.message,
//                 variant: 'error',
//             });
//             this.dispatchEvent(evt);
//             this.cssDisplay = 'slds-hide';
//         }
//     }).catch(error => {

//     });
// }
  
  navigateToStepFive(event){
    console.log('navigateToStepFive');
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