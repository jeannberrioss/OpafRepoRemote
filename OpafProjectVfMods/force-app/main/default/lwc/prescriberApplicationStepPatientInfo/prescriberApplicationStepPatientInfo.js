import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import createCase from '@salesforce/apex/PresciberWorkspaceLWCController.createCase';
import updateContact from '@salesforce/apex/PresciberWorkspaceLWCController.updateContact';
import inCommunity from '@salesforce/apex/PresciberWorkspaceLWCController.inCommunity';
import contactDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getContactDetails';
import caseDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCaseData';
import fetchPickListValue from '@salesforce/apex/PresciberWorkspaceLWCController.fetchPickListValue';
import consentDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getConsentDetails';
import errorMessage from '@salesforce/label/c.Patient_Age_Less_Than_18_Years';

export default class PrescriberApplicationStepOne extends NavigationMixin(LightningElement) {
    @track displaySavePopup = false;
    @track showContinue = false;
    @track contactData = {'sObjectType': 'Contact'};
    caseRecordId;
    @api caseId;
    @api patientRecord;
    @api accountRecordId;
    @api shipmentId;
    @api prescriptionId;
    @api prescriberId;
    genderOpts = [];
    stateOpts = [];
    @track cssDisplay = 'slds-hide';
    @track section = true;
    @track isInitial = false;
    navigateToNext = false;
    @track createNewConsent = false;
    @track isConsentReceived = false;
    @track isConsentRequested = false;
    @track selectedPatientName = '';
    @track isPatientCreated = false;

    connectedCallback(){
        //alert(this.caseId);
        if(this.patientRecord != undefined){
            this.patientDetails(this.patientRecord);
        }
        if(this.caseId != undefined){
            this.caseDetails(this.CaseId);
        }
        this.fetchPickListValues({'sobjectType' : 'Contact'}, 'HealthCloudGA__Gender__c');
        this.fetchPickListValues({'sobjectType' : 'Contact'}, 'State__c');
    }

    caseDetails(recordId){
        caseDetails({
            caseId : recordId
        }).then(response => {
            this.caseRecordId = response.Id;
        }).catch(error => {

        });
    }

    patientDetails(contactId){
        this.cssDisplay = 'slds-show';
        contactDetails({
            contactId : contactId
        }).then(response => {
            this.selectedPatientName = response.Name;
            this.contactData = response;
            this.cssDisplay = 'slds-hide';
        }).catch(error => {

        });
    }

    toggleSection(){
        this.section = !this.section;
    }

    patientLookupRecord(event){
        this.cssDisplay = 'slds-show';
        if(event.detail.selectedRecord != undefined){
            this.patientRecord = event.detail.selectedRecord.Id;
            this.selectedPatientName = event.detail.selectedRecord.Name;
            this.patientDetails(event.detail.selectedRecord.Id); 
            this.cssDisplay = 'slds-hide';   
        }else{
            this.patientRecord = undefined;
            this.selectedPatientName = '';
            this.contactData = {'sObjectType': 'Contact'};
            this.cssDisplay = 'slds-hide';
        }
    }

    clearSelectedValue(){
        this.patientRecord = undefined;
        this.selectedPatientName = '';
        this.contactData = {'sObjectType': 'Contact'};
    }

    fetchPickListValues(objInfo, fieldAPIName){
        fetchPickListValue({
            "objInfo" : objInfo,
            "picklistFieldApi" : fieldAPIName
        }).then(response => {
            var opts = [];
            for(var i=0;i<response.length;i++){
                opts.push({
                        label : response[i].label,
                        value : response[i].value,
                });
            } 
            if(fieldAPIName == 'State__c'){
                this.stateOpts = opts;
            } 
            else if(fieldAPIName == 'HealthCloudGA__Gender__c'){
                this.genderOpts = opts;
            } 
        }).catch(error => {

        });
    }

    get sectionClass(){
        return this.section ? 'slds-section slds-is-open' : 'slds-section';
    }

    get stateOptions(){
        return this.stateOpts;
    }

    get genderOptions(){
        return this.genderOpts;
    }

    contactFieldsChange(event){
        this.contactData[event.currentTarget.dataset.name] = event.target.value; 
    }

    navigateToHomePage(){
        inCommunity().then(response => {
            if(response == true){
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: 'my-workspace'
                    }
                });
            }else{
                this[NavigationMixin.Navigate]({
                    type: 'standard__navItemPage',
                    attributes: {
                        apiName: 'Prescriber_Workspace', 
                    },
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }

    checkForValidFields(){
        const isInputsCorrect = [...this.template.querySelectorAll('lightning-input')]
        .reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);
        const isTextInputsCorrect = [...this.template.querySelectorAll('lightning-combobox')]
        .reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);
        if(isInputsCorrect && isTextInputsCorrect){
            return true;
        }else{
            return false;
        }
    }

    saveAndCompleteLater(){
        const isInputsCorrect = this.checkForValidFields();
        if(isInputsCorrect) {
            if(this.getAge(this.getData.Birthdate) >= 18){
                this.createContact('onSaveAndComplete'); 
            }else{
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: errorMessage,
                    variant: 'error',
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

    navigateToNextPage(){
        const isInputsCorrect = this.checkForValidFields();
        if(isInputsCorrect) {
            if(this.getAge(this.contactData.Birthdate) >= 18){
                if(this.isPatientCreated == true){
                    this.updateContact();
                    this.consentDetails(this.patientRecord);
                }else{
                    this.createContact('onNext'); 
                }
            }else{
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: errorMessage,
                    variant: 'error',
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

    updateContact(){
        updateContact({
            contactRecord : JSON.stringify(this.contactData)
        }).then(response =>{

        }).catch(error =>{

        });
    }

    consentDetails(patientId){ 
        this.showContinue = true;
        consentDetails({
            patientId : patientId
        }).then(response => {
            if(response != null ){
                this.navigateToNext = true;
                if(response.Status__c == 'Received' || response.Status__c == 'Accepted'){
                    this.isConsentReceived = true;
                    this.isConsentRequested = false;
                    this.createNewConsent = false;
                }else{
                    this.isConsentRequested = true;
                    this.isConsentReceived = false;
                    this.createNewConsent = false;
                }
            }else{
                this.navigateToNext = false;
                this.createNewConsent = true;
                this.isConsentRequested = false;
                this.isConsentReceived = false;
            }
        }).catch(error => {

        }); 
    }

    saveAndClose(){
        this.displaySavePopup = false;    
    }

    onContinue(){
        if(this.navigateToNext){
            const evt= new CustomEvent('nextstep', {
                detail: {
                    isStepTwo : true,
                    isCurrentStep : '1',
                    caseRecordId : this.caseId,
                    patientRecord : this.patientRecord,
                    accountId : this.accountRecordId,
                    prescriberId : this.prescriberId,
                    shipmentId : this.shipmentId,
                    prescriptionId : this.prescriptionId,
                    isInitial : this.isInitial,
                    consentStatus : this.isConsentReceived
                }
            });   
            this.dispatchEvent(evt); 
            this.showContinue = false; 
        }else{
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    pageName: 'patientconsent'
                },
                state: {
                    'patientId': this.patientRecord
                }
            });
        }
    }

    submitDetails(){
        this.navigateToHomePage();
    }

    closeModel(){
        this.displaySavePopup = false;   
    }

    closeContinueModel(){
        this.showContinue = false;
    }

    createContact(actionType){
        this.cssDisplay = 'slds-show';
        var action = '';
        var actionStep = ''
        if(actionType == 'onSaveAndComplete'){
            action = 'Save and Complete Later';
            actionStep = 'Prescriber Application Step One';
        }else if(actionType == 'onNext'){
            if(this.navigateToNext == true){
                action = 'next';
                actionStep = 'Prescriber Application Step Two';
            }else{
                action = 'Save and Complete Later';
                actionStep = 'Prescriber Application Step One';    
            }
        }
        createCase({
            contactRecord : JSON.stringify(this.contactData),
            caseId : this.caseId,
            actionType : action,
            step : actionStep,
            applicationType : 'New Enrollment'
        }).then(response => {
            console.log(response);
            if(response.status == 'Success'){
                if(actionType == 'onSaveAndComplete'){
                    this.displaySavePopup = true;
                    this.caseId = response.recordId;
                    this.patientRecord = response.patientId;
                    this.isInitial = response.isInitial;
                }else if(actionType == 'onNext'){
                    //this.showContinue = true;
                    this.isPatientCreated = true;
                    this.caseId = response.recordId;
                    this.patientRecord = response.patientId;
                    this.isInitial = response.isInitial;
                    this.consentDetails(this.patientRecord);
                }
                this.cssDisplay = 'slds-hide';
            }else{
                const evt = new ShowToastEvent({
                    title: response.status,
                    message: response.message,
                    variant: 'error',
                });
                this.dispatchEvent(evt);
                this.cssDisplay = 'slds-hide';
            }
        }).catch(error => {
            console.log(error);
        }); 
    }

    getAge(DOB) {
        var today = new Date();
        var birthDate = new Date(DOB);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }    
        return age;
    }
}