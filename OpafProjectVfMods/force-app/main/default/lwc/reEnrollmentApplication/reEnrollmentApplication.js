import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import currentUserDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getPrimaryContact';
import primaryFacilityDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getPrimaryAccount';
import caseDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCaseData';
import consentDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getConsentDetails';

export default class OpafPrescriberApplication extends NavigationMixin(LightningElement) {
    @api caseId;
    @track currentStep;
    @track stepZero = false;
    @track stepOne = false;
    @track stepTwo = false;
    @track stepThree = false;
    @track stepFour = false;
    @track stepFive = false;
    @track stepSix = false;
    @track stepSeven = false;
    @track caseRecordId;
    @track patientRecordId;
    @track accountId;
    @track prescriberId;
    @track shipmentId;
    @track prescriptionId;
    @track caseRecord;
    @track isInitial;
    @track showRibbon = false;
    @track isConsentReceived = false;
    @track cssDisplay = 'slds-hide';

    @wire(CurrentPageReference)
    currentPageReference;

    connectedCallback(){
        this.currentUserDetails();
        this.primaryFacilityDetails();
        document.title = 'OPAF Re-Enrollment Application';
        console.log( 'Param ' + this.currentPageReference.state.caseId );
        var selectedCaseId = this.currentPageReference.state.caseId;
        var url = new URL(window.location.href);
        var envelopeId = url.searchParams.get("envelopeId");
        if(selectedCaseId != undefined && selectedCaseId != ''){  
            this.caseRecordId = selectedCaseId;
            if(envelopeId != null){
                this.stepSix = true;
                this.currentStep = '6';
            }else{
                this.caseDetails(this.caseRecordId);
                this.stepZero = true;  
            }
        }else{
            this.stepZero = true;
        }
    }

    caseDetails(recordId){
        caseDetails({
            caseId : recordId
        }).then(response => {
            this.steps();
            //alert('Patient id -------> '+response.Patient__c);
            //alert('Facility id -------> '+response.Facility__c);
            //alert('Prescriber id -------> '+response.Prescriber__c);
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
            if(response.Saved_Location__c == 'Prescriber Re-Enrollment Step One'){
                this.stepOne = true;
                this.currentStep = '1';
                this.showRibbon = false;
            }else if(response.Saved_Location__c == 'Prescriber Re-Enrollment Step Two'){
                this.stepTwo = true;
                this.currentStep = '2'; 
                this.showRibbon = true;
            }else if(response.Saved_Location__c == 'Prescriber Re-Enrollment Step Three'){
                this.stepThree = true;
                this.currentStep = '3';
                this.showRibbon = true;
            }else if(response.Saved_Location__c == 'Prescriber Re-Enrollment Step Four'){
                this.stepFour = true;
                this.currentStep = '4';
                this.showRibbon = true;
            }else if(response.Saved_Location__c == 'Prescriber Re-Enrollment Step Five'){
                this.stepFive = true;
                this.currentStep = '5';
                this.showRibbon = true;
            }else if(response.Saved_Location__c == 'Prescriber Re-Enrollment Step Six'){
                this.stepSix = true;
                this.currentStep = '6'; 
                this.showRibbon = true;
            }else{
                this.stepZero = true;     
            }
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
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

    steps(){
        this.stepZero = false;
        this.stepOne = false;
        this.stepTwo = false;
        this.stepThree = false;
        this.stepFive = false;
        this.stepFour = false;
        this.stepSix = false;
        this.stepSeven = false;
    }

    navigateToNextStep(event){
        this.steps();
        this.currentStep = event.detail.isCurrentStep;
        this.caseRecordId = event.detail.caseRecordId;
        this.patientRecordId = event.detail.patientRecord;
        this.accountId = event.detail.accountId;
        this.prescriberId = event.detail.prescriberId;
        this.shipmentId = event.detail.shipmentId;
        this.prescriptionId = event.detail.prescriptionId;
        this.isConsentReceived = event.detail.consentStatus;
        this.caseRecord = event.detail.caseRecord;
        if(this.currentStep == '0'){
            this.stepOne = true;
            this.currentStep = '1';
        }else if(this.currentStep == '1'){
            this.stepTwo = true;
            this.currentStep = '2';
            this.isInitial = event.detail.isInitial;
            this.showRibbon = true;
        }else if(this.currentStep == '2'){
            this.stepThree = true;
            this.currentStep = '3';
            this.showRibbon = true;
        }else if(this.currentStep == '3'){
            this.stepFour = true;
            this.currentStep = '4';
            this.showRibbon = true;
        }else if(this.currentStep == '4'){
            this.stepFive = true;
            this.currentStep = '5';
            this.showRibbon = true;
        }else if(this.currentStep == '5'){
            this.stepSix = true;
            this.currentStep = '6';
            this.showRibbon = true;
        }else if(this.currentStep == '6'){
            this.stepSeven = true;
            this.currentStep = '7';
            this.showRibbon = true;
        }
        this.scrollToTop();
    }

    navigateToPreviousStep(event){
        this.steps();
        this.currentStep = event.detail.isCurrentStep;
        this.caseRecordId = event.detail.caseRecordId;
        this.patientRecordId = event.detail.patientRecord;
        this.accountId = event.detail.accountId;
        this.prescriberId = event.detail.prescriberId;
        this.shipmentId = event.detail.shipmentId;
        this.prescriptionId = event.detail.prescriptionId;
        this.isConsentReceived = event.detail.consentStatus;
        this.caseRecord = event.detail.caseRecord;
        if(this.currentStep == '1'){
            this.stepZero = true;   
            this.currentStep = '0';
            this.showRibbon = false;
        }else if(this.currentStep == '2'){
            this.stepOne = true;   
            this.currentStep = '1';
            this.showRibbon = false;
        }else if(this.currentStep == '3'){
            this.stepTwo = true;
            this.currentStep = '2';
            this.showRibbon = true;
        }else if(this.currentStep == '4'){
            this.stepThree = true;
            this.currentStep = '3';
            this.showRibbon = true;
        }else if(this.currentStep == '5'){
            this.stepFour = true;
            this.currentStep = '4';
            this.showRibbon = true;
        }else if(this.currentStep == '6'){
            this.stepFive = true;
            this.currentStep = '5';
            this.showRibbon = true;
        }
        this.scrollToTop();
    }

    scrollToTop(){
        let scrollTopElement = this.template.querySelector('.pageTop');
        scrollTopElement.scrollIntoView();
    }
}