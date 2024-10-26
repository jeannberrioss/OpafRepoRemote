import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import caseDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCaseData';
import shipmentDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCaseShipments';
//import prescriptionDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCasePrescriptions';
import currentUserDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getPrimaryContact';
import primaryFacilityDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getPrimaryAccount';
import consentDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getConsentDetails';
import patientDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getContactDetails';
import { CurrentPageReference } from 'lightning/navigation';

export default class OpafPrescriberApplication extends NavigationMixin(LightningElement) {
    @api caseId;
    @track currentStepObj;
    @track currentStep;
    @track currentStepId;
    @track currentStepLabel;
    @track step1 = false;
    @track step2 = false;
    @track step3 = false;
    @track step4 = false;
    @track step5 = false;
    @track step6 = false;
    @track step7 = false;
    @track step8 = false;
    @track step9 = false;
    @track caseRecordId;
    @track caseRecord;
    @track patientRecordId;
    @track accountId;
    @track prescriberId;
    @track shipmentId;
    @track prescriptionId;
    @track isInitial;
    @track showRibbon = false;
    @track isConsentReceived = false;
    @track cssDisplay = 'slds-hide';

    steps = [
        { step: '1', id: 'PaitentInfo', label: 'Prescriber Application Step One'},
        { step: '2', id: 'EligibilityDocs', label: 'Prescriber Application Step Two'},
        { step: '3', id: 'PrescriberInfo', label: 'Prescriber Application Step Three'},
        { step: '4', id: 'Prescription', label: 'Prescriber Application Step Four'},
        { step: '5', id: 'Vitamins', label: 'Prescriber Application Step Five'},
        { step: '6', id: 'Sign', label: 'Prescriber Application Step Six'},
        { step: '7', id: 'Review', label: 'Prescriber Application Step Seven'},
        { step: '8', id: 'Submit', label: 'Prescriber Application Step Eight'},
        { step: '9', id: 'Confirmation', label: 'Prescriber Application Step Nine'}
    ];

    @wire(CurrentPageReference)
    currentPageReference;

    connectedCallback(){
        try {
            //this.stepOne = true;
            this.currentUserDetails();
            this.primaryFacilityDetails();
            console.log( 'Param ' + this.currentPageReference.state.caseId );
            console.log('case id -----> '+this.caseId);
            console.log('param 1 -----> '+this.currentPageReference.state.patientId);
            var selectedCaseId = this.currentPageReference.state.caseId;
            var selectedPatientId  = this.currentPageReference.state.patientId;
            if(selectedCaseId != undefined && selectedCaseId != ''){  
                this.caseRecordId = selectedCaseId;
                this.caseDetails(this.caseRecordId);
                this.shipmentDetails(this.caseRecordId);
                //this.prescriptionDetails(this.caseRecordId);
            }else if(selectedPatientId != undefined && selectedPatientId != ''){ 
                this.patientDetails(selectedPatientId);     
            }else{
                this.currentStep = '1';
                this.step1 = true;
            }
        } catch (err) {
            console.error('prescriber connected error', err)
        }
    }

    patientDetails(patientId){
        patientDetails({
            contactId : patientId
        }).then(response => {
            this.patientRecordId = response.Id;
            this.currentStep = '1';
            this.step1 = true;
        }).catch(error => {

        });
    }

    consentDetails(patientId){
        consentDetails({
            patientId : patientId
        }).then(response => {
            if(response != null ){
                if(response.Status__c == 'Received' || response.Status__c == 'Accepted'){
                    this.isConsentReceived = true;
                }else{
                    this.isConsentReceived = false;
                }
            }
        }).catch(error => {

        }); 
    }

    currentUserDetails(){
        currentUserDetails().then(response => {
            this.prescriberId = response;
            //this.accountId = response.AccountId;
            //alert('Preb id in home -------> '+this.prescriberId);
            //alert('Acc id in home -------> '+this.accountId);
        }).catch(error => {

        });
    }

    primaryFacilityDetails(){
        primaryFacilityDetails().then(response => {
            this.accountId = response;
        }).catch(error => {

        });
    }

    caseDetails(recordId){
        caseDetails({
            caseId : recordId
        }).then(response => {
            this.caseRecord = response;
            this.resetSteps();
            console.log('Patient id -------> '+response.Patient__c);
            console.log('Facility id -------> '+response.Facility__c);
            console.log('Prescriber id -------> '+response.Prescriber__c);
            if(response.Prescriber__c != undefined){
                this.prescriberId =  response.Prescriber__c;
            }
            if(response.Facility__c != undefined){
                this.accountId = response.Facility__c;
            }
            this.patientRecordId = response.Patient__c;
            this.prescriptionId = response.Prescription1__c;
            if(this.patientRecordId != undefined){
                this.consentDetails(this.patientRecordId);
            }
            const _step = this.steps.find(step => step.label === response.Saved_Location__c);
            console.log('Saved Location, step ', response.Saved_Location__c, _step, typeof this[`step${_step.step}`]);
            if (_step && typeof this[`step${_step.step}`] !== 'undefined') {
                this.setStep(_step);
                this.showRibbon = _step.step > 1;
            }

            // if(response.Saved_Location__c == 'Prescriber Application Step One'){
            //     this.step1 = true;
            //     this.currentStep = '1';
            //     this.showRibbon = false;
            // }else if(response.Saved_Location__c == 'Prescriber Application Step Two'){
            //     this.step2 = true;
            //     this.currentStep = '2'; 
            //     this.showRibbon = true;
            // }else if(response.Saved_Location__c == 'Prescriber Application Step Three'){
            //     this.step3 = true;
            //     this.currentStep = '3';
            //     this.showRibbon = true;
            // }else if(response.Saved_Location__c == 'Prescriber Application Step Four'){
            //     this.step4 = true;
            //     this.currentStep = '4';
            //     this.showRibbon = true;
            // }else if(response.Saved_Location__c == 'Prescriber Application Step Five'){
            //     this.step5 = true;
            //     this.currentStep = '5';
            //     this.showRibbon = true;
            // }else if(response.Saved_Location__c == 'Prescriber Application Step Six'){
            //     this.step6 = true;
            //     this.currentStep = '6'; 
            //     this.showRibbon = true;
            // }else if(response.Saved_Location__c == 'Prescriber Application Step Seven'){
            //     this.step7 = true;
            //     this.currentStep = '6'; 
            //     this.showRibbon = true;
            // }else if(response.Saved_Location__c == 'Prescriber Application Step Eight'){
            //     this.step8 = true;
            //     this.currentStep = '6'; 
            //     this.showRibbon = true;
            // }else if(response.Saved_Location__c == 'Prescriber Application Step Nine'){
            //     this.stepSix = true;
            //     this.currentStep = '6'; 
            //     this.showRibbon = true;
            // }
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });    
    }

    shipmentDetails(recordId){
        shipmentDetails({
            caseId : recordId
        }).then(response => {
            this.shipmentId = response.Id;    
        }).catch(error => {
            console.log('shipmentDetails error', error);
            this.cssDisplay = 'slds-hide';
        });    
    } 
    
    prescriptionDetails(recordId){
        prescriptionDetails({
            caseId : recordId
        }).then(response => {
            this.prescriptionId = response.Id;
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });    
    } 

    resetSteps(){
        this.steps.map(step => {
            this[`step${step.step}`] = false;
        });
        // this.stepOne = false;
        // this.stepTwo = false;
        // this.stepThree = false;
        // this.stepFive = false;
        // this.stepFour = false;
        // this.stepVitamins = false;
        // this.stepSix = false;
        // this.stepSeven = false;
    }

    setStep(_step) {
        this.currentStepObj = _step;
        this.currentStep = _step.step;
        this.currentStepId = _step.id;
        this.currentStepLabel = _step.label;
        this[`step${_step.step}`] = true;
    }

    navigateToNextStep(event){
        console.log('navigateToNextStep');
        this.resetSteps();
        this.currentStep = event.detail.isCurrentStep;
        
        this.caseRecordId = event.detail.caseRecordId || this.caseRecordId;
        this.patientRecordId = event.detail.patientRecord || this.patientRecordId;
        this.accountId = event.detail.accountId || this.accountId;
        this.prescriberId = event.detail.prescriberId || this.prescriberId;
        this.shipmentId = event.detail.shipmentId || this.shipmentId;
        this.prescriptionId = event.detail.prescriptionId || this.prescriptionId;
        this.isConsentReceived = event.detail.consentStatus || this.isConsentReceived;

        // this.caseRecordId = event.detail.caseRecordId;
        // this.patientRecordId = event.detail.patientRecord;
        // this.accountId = event.detail.accountId;
        // this.prescriberId = event.detail.prescriberId;
        // this.shipmentId = event.detail.shipmentId;
        // this.prescriptionId = event.detail.prescriptionId;
        // this.isConsentReceived = event.detail.consentStatus;
        const _nextStepNum = parseInt(this.currentStep) + 1;
        const _next = this.steps.find(step => step.step === _nextStepNum.toString());


        if (_next) {
            this.setStep(_next);

            this.showRibbon = _next > 1;
            if (_next == 2) {
                this.isInitial = event.detail.isInitial;
            }
        }


        // if(this.currentStep == '1'){
        //     this.stepTwo = true;
        //     this.currentStep = '2';
        //     this.isInitial = event.detail.isInitial;
        //     this.showRibbon = true;
        // }else if(this.currentStep == '2'){
        //     this.stepThree = true;
        //     this.currentStep = '3';
        //     this.showRibbon = true;
        // }else if(this.currentStep == '3'){
        //     this.stepFour = true;
        //     this.currentStep = '4';
        //     this.showRibbon = true;
        // }else if(this.currentStep == '4'){
        //     this.stepVitamins = true;
        //     this.currentStep = 'Vitmains';
        //     this.showRibbon = true;
        // }else if(this.currentStep == 'Vitamins'){
        //     this.stepFive = true;
        //     this.currentStep = '5';
        //     this.showRibbon = true;
        // }else if(this.currentStep == '5'){
        //     this.stepSix = true;
        //     this.currentStep = '6';
        //     this.showRibbon = true;
        // }else if(this.currentStep == '6'){
        //     this.stepSeven = true;
        //     this.currentStep = '7';
        //     this.showRibbon = true;
        // }
        this.scrollToTop();
    }

    navigateToPreviousStep(event){
        console.log('navigateToPreviousStep');
        this.resetSteps();
        this.currentStep = event.detail.isCurrentStep;
        
        this.caseRecordId = event.detail.caseRecordId || this.caseRecordId;
        this.patientRecordId = event.detail.patientRecord || this.patientRecordId;
        this.accountId = event.detail.accountId || this.accountId;
        this.prescriberId = event.detail.prescriberId || this.prescriberId;
        this.shipmentId = event.detail.shipmentId || this.shipmentId;
        this.prescriptionId = event.detail.prescriptionId || this.prescriptionId;
        this.isConsentReceived = event.detail.consentStatus || this.isConsentReceived;


        const _prevNum = parseInt(this.currentStep) - 1;
        const _prev = this.steps.find(step => step.step === _prevNum.toString());

        if (_prev) {
            this.setStep(_prev);

            this.showRibbon = _next > 1;
            if (_next == 2) {
                this.isInitial = event.detail.isInitial;
            }
        }
        // if(this.currentStep == '2'){
        //     this.stepOne = true;   
        //     this.currentStep = '1';
        //     this.showRibbon = false;
        // }else if(this.currentStep == '3'){
        //     this.stepTwo = true;
        //     this.currentStep = '2';
        //     this.showRibbon = true;
        // }else if(this.currentStep == '4'){
        //     this.stepThree = true;
        //     this.currentStep = '3';
        //     this.showRibbon = true;
        // }else if(this.currentStep == 'Vitamins'){
        //     this.stepFour = true;
        //     this.currentStep = '4';
        //     this.showRibbon = true;
        // }else if(this.currentStep == '5'){
        //     this.stepVitamins = true;
        //     this.currentStep = 'Vitmains';
        //     this.showRibbon = true;
        // }else if(this.currentStep == '6'){
        //     this.stepFive = true;
        //     this.currentStep = '5';
        //     this.showRibbon = true;
        // }
        this.scrollToTop();
    }

    scrollToTop(){
        let scrollTopElement = this.template.querySelector('.pageTop');
        scrollTopElement.scrollIntoView();
    }
}