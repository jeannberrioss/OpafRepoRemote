import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import submitApplication from '@salesforce/apex/PresciberWorkspaceLWCController.submitApplication';
import consentDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getConsentDetails';
import updateCase from '@salesforce/apex/PresciberWorkspaceLWCController.updateCase';
import caseDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCaseData';
import docusignGenaration from "@salesforce/apex/DS_OPAFController.sendPrescriberConsent";

export default class PrescriberApplicationStepSix extends LightningElement {
    @api prescriberId;
    @api caseRecordId;
    @api accountRecordId;
    @api shipmentId;
    @api prescriptionId;
    @api patientId;
    @track cssDisplay = 'slds-hide';
    isConsentReceived = false;
    @track displaySavePopup = false;
    @track isInitial = true;
    @track isSigned = false;
    @track isDisabled = true;
    @track hideSection = false;

    connectedCallback(){
        // this.cssDisplay = 'slds-show';
        var url = new URL(window.location.href);
        var caseId = url.searchParams.get("caseId");
        var envelopeId = url.searchParams.get("envelopeId");
        var status = url.searchParams.get("event");
        var isInitial = sessionStorage.getItem("isInitial");
        if(isInitial != null){
            if(status == 'signing_complete'){
                this.isInitial = true;
                this.isSigned = true;
                this.isDisabled = false;
            }else{
                this.isInitial = false;
                this.isSigned = false;
                this.isDisabled = true;
            }
        }else{
            this.isInitial = false;
        }
        sessionStorage.removeItem("isInitial");
        if(caseId != undefined && caseId != ''){
            if(envelopeId != null && status != null){
                this.updateCase(caseId, envelopeId, status);
            }
        }
        if(this.patientId != undefined){
            this.consentDetails(this.patientId);
        }
        if(this.caseRecordId != undefined){
            if(status == null){
                this.caseDetails(this.caseRecordId);
            }
        }
    }

    caseDetails(recordId){
        this.cssDisplay = 'slds-show';
        caseDetails({
            caseId: recordId
        }).then(response => {
            if(response.Consent_Status__c == 'signing_complete'){
                this.isSigned = true;
                this.isDisabled = false;
            }else{
                this.isSigned = false;
                this.isDisabled = true;
            }
            this.cssDisplay = 'slds-hide';
        }).catch(error => { 
            this.cssDisplay = 'slds-hide';
        });
    }

    updateCase(caseId, envelopeId, status){
        this.cssDisplay = 'slds-show';
        updateCase({
            caseId : caseId,
            envelopeId : envelopeId,
            status : status
        }).then(response =>{
            if(this.patientId == undefined){
                this.patientId = response.Patient__c;
            }
            if(this.accountRecordId == undefined){
                this.accountRecordId = response.Facility__c;
            }
            if(this.prescriberId == undefined){
                this.prescriberId = response.Prescriber__c;
            }
            if(this.prescriptionId == undefined){
                this.prescriptionId = response.Prescription1__c;
            }
            if(response.Consent_Status__c == 'signing_complete'){
                this.isSigned = true;
                this.isDisabled = false;
            }else{
                this.isSigned = false;
                this.isDisabled = true;
            }
            this.cssDisplay = 'slds-hide';    
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });    
    }

    consentDetails(patientId){
        this.cssDisplay = 'slds-show';
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
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        }); 
    }

    navigateToPreviousStep(){
        this.cssDisplay = 'slds-show';
        const evt= new CustomEvent('previousstep', {
            detail: {
                isStepFive : true,
                isCurrentStep : '6',
                caseRecordId : this.caseRecordId,
                patientRecord : this.patientId,
                accountId : this.accountRecordId,
                prescriberId : this.prescriberId,
                shipmentId : this.shipmentId,
                prescriptionId : this.prescriptionId,
                isConsentReceived : this.isConsentReceived
            }
        });
        this.dispatchEvent(evt);
        this.cssDisplay = 'slds-hide';
    }

    submitForm(){
        //this.cssDisplay = 'slds-show';
        this.displaySavePopup = true;
    }

    submitDetails(){
        submitApplication({
            caseId : this.caseRecordId
        }).then(response =>{
            if(response.status == 'Success'){
                const evt= new CustomEvent('nextstep', {
                    detail: {
                        isStepSeven : true,
                        isCurrentStep : '6',
                        caseRecordId : this.caseRecordId,
                        patientRecord : this.patientId,
                        accountId : this.accountRecordId,
                        prescriberId : this.prescriberId,
                        shipmentId : this.shipmentId,
                        prescriptionId : this.prescriptionId,
                        isConsentReceived : this.isConsentReceived
                    }
                });
                this.dispatchEvent(evt);
                this.cssDisplay = 'slds-hide';
                this.displaySavePopup = false;
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

        });
    }

    closeModel(){
        this.displaySavePopup = false;    
    }

    generateDocusign(){
        this.cssDisplay = 'slds-show';
        docusignGenaration({caseId:this.caseRecordId, returnComponent:'ReEnrollmentApp'})
        .then((result) => {  
            this.Docusign = result;
            console.log('docusignGenaration::'+JSON.stringify(this.Docusign));
            if(this.Docusign != '' && this.Docusign != null) {
                this.hideSection = true;
                const evt = new ShowToastEvent({
                    title: 'Please Wait while Docusign Opens',
                    variant: 'info',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt); 
                window.open(this.Docusign,'_Self');
                this.cssDisplay = 'slds-hide';
            }

            // refreshApex(this.refreshContactDetails);
            })
        .catch((error) => {
            console.log('docusignGenaration::'+JSON.stringify(error));
            this.cssDisplay = 'slds-hide';
        });
        
        sessionStorage.setItem("isInitial", true); 
    }
}