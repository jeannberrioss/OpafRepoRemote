import { LightningElement, track, api, wire  } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import caseDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCaseData';
import productValues from "@salesforce/apex/PresciberWorkspaceLWCController.getAllProductValues";
export default class PrescriberReenrollmentInitial extends NavigationMixin(LightningElement) {
    @api caseId;
    @track patientId;
    @track prescriberId;
    @track facilityId;
    @track prescriptionId;
    @track caseData = {'sobjectType': 'Case'}
    @track section = true;
    @track patientName = '';
    @track patientAddress = '';
    @track icdCode = '';
    @track sameProvider = '';
    @track sameIcdCodes = '';
    @track sameAddress = '';
    @track prescriberLabel = 'Is the Patient still being prescribed ';
    @track options = [];
    @track selectedProduct = '';
    @track samePrescriber = '';
    @track notSamePrescriber = false;


    connectedCallback(){
        if(this.caseId != undefined && this.caseId != ''){
            this.caseDetails(this.caseId);
        }
    }

    caseDetails(caseId){
        caseDetails({
            caseId : caseId
        }).then(response => {
            this.caseData = response;
            this.patientName = response.Prescriber_First_Name2__c + ' ' + response.Prescriber_Last_Name2__c;
            this.icdCode = response.ICD_10_Diagnosis_Code__c;
            var localCareAddressLine2 = '';
            var patientAddressLine2 = '';
            if(response.Ship_Address_Line2__c != undefined){
                localCareAddressLine2  = response.Ship_Address_Line2__c;
            }else{
                localCareAddressLine2 = '';    
            }
            if(response.Patient_Address_Line_2__c != undefined){
                patientAddressLine2 = response.Patient_Address_Line_2__c;
            }else{
                patientAddressLine2 = '';    
            }
            if(response.Ship_Type__c == 'Local Care Center'){
                if(localCareAddressLine2 != ''){
                    this.patientAddress = response.Ship_Street_Address__c +', '+localCareAddressLine2+', ' + response.Ship_City__c + ', ' + response.Ship_State__c + ', ' + response.Ship_Zip__c;
                }else{
                    this.patientAddress = response.Ship_Street_Address__c +', ' + response.Ship_City__c + ', ' + response.Ship_State__c + ', ' + response.Ship_Zip__c;
                }
                
            }else if(response.Ship_Type__c == 'Patient'){
                if(patientAddressLine2 != ''){
                    this.patientAddress = response.Patient_Street_Address__c +', '+patientAddressLine2+ ', ' + response.Patient_City__c + ', ' + response.Patient_State__c + ', ' + response.Patient_Zip_Postal_Code__c;
                }else{
                    this.patientAddress = response.Patient_Street_Address__c +', ' + response.Patient_City__c + ', ' + response.Patient_State__c + ', ' + response.Patient_Zip_Postal_Code__c;
                }
                
            }else if(response.Ship_Type__c == 'Prescribing Provider'){
                this.patientAddress = '';
            }
            
            this.patientId = response.Patient__c;
            this.prescriberId = response.Prescriber__c;
            this.facilityId = response.Facility__c;
            this.prescriptionId = response.Prescription1__c;
            console.log('prod options===='+JSON.stringify(this.options));
            for(var i=0;i<this.options.length;i++){
                if(this.options[i].value == response.Product__c){
                    this.selectedProduct = this.options[i].label;
                    this.prescriberLabel += this.options[i].label + '?';
                }
            }
        }).catch(error => {

        });
    }

    @wire(productValues) getProductValues ({ error, data }) {
        if (data) {
            //data.sort(function(a, b){return a - b});
            this.options = data; 
            console.log('product options ----->'+JSON.stringify(this.options));
            console.log('selected producted ------> '+this.caseData.Product__c);
        } else if (error) {
        }
    }

    toggleSection(){
        this.section = !this.section;
    }

    get sectionClass(){
        return this.section ? 'slds-section slds-is-open' : 'slds-section';
    }

    get radioOptions() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
    }

    caseFieldsChangeHandler(event){
        this.caseData[event.currentTarget.dataset.name] = event.target.value;
        if(event.currentTarget.dataset.name == 'Patient_with_Same_Provider__c'){
            if(event.target.value == 'Yes'){
                this.caseData.Patient_with_Same_Provider__c = true;
            }else{
                this.caseData.Patient_with_Same_Provider__c = false;
            }
        }
        if(event.currentTarget.dataset.name == 'Same_ICD_10__c'){
            if(event.target.value == 'Yes'){
                this.caseData.Same_ICD_10__c = true;
            }else{
                this.caseData.Same_ICD_10__c = false;
            }
        }
        if(event.currentTarget.dataset.name == 'Same_Shipping_Address__c'){
            if(event.target.value == 'Yes'){
                this.caseData.Same_Shipping_Address__c = true;
            }else{
                this.caseData.Same_Shipping_Address__c = false;
            }
        }
        if(event.currentTarget.dataset.name == 'Same Prescriber'){
            if(event.target.value == 'Yes'){
                this.samePrescriber = 'Yes';
            }else{
                this.samePrescriber = 'No';
            }
        }
    }

    navigateToPreviousPage(){
        this.navigateToHomePage();
    }

    navigateTonextStep(){
        const isValid = [...this.template.querySelectorAll('lightning-radio-group')]
        .reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);
        if(isValid){
            if(this.samePrescriber == 'No'){
                this.notSamePrescriber = true;
                //this.navigateToHomePage();
            }else{
                const evt= new CustomEvent('nextstep', {
                    detail: {
                        isStepOne : true,
                        isCurrentStep : '0',
                        caseRecord : this.caseData,
                        caseRecordId : this.caseId,
                        patientRecord : this.patientId,
                        accountId : this.facilityId,
                        prescriberId : this.prescriberId,
                        prescriptionId : this.prescriptionId
                    }
                });   
                this.dispatchEvent(evt);
            }
        }else{
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Please provide the required information in all of the fields highlighted in red.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        } 
    }

    checkForValidFields(event){
        const isRadioInputsCorrect = [...this.template.querySelectorAll(`.${event.currentTarget.dataset.name}`)]
        .reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);
        return isRadioInputsCorrect;
    }

    navigateToHomePage(){
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: 'my-workspace'
            }
        });
    }
}