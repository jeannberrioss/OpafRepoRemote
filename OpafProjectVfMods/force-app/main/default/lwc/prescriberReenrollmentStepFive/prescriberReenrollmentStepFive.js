import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import inCommunity from '@salesforce/apex/PresciberWorkspaceLWCController.inCommunity';
import contactDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getContactDetails';
import caseDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCaseData';
import filesList from '@salesforce/apex/PresciberWorkspaceLWCController.getUploadedFiles';
import prescriptionDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getPrescriptionData';
import accountDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getAccountData';
import shipmentDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getShipmentData';
import updateCaseAndPrescriptions from '@salesforce/apex/PresciberWorkspaceLWCController.updateCaseAndPrescriptions';
import consentDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getConsentDetails'; 
import docusignGenaration from "@salesforce/apex/DS_OPAFController.sendPrescriberConsent";
export default class PrescriberApplicationStepFive extends NavigationMixin(LightningElement) {
    @api prescriberId;
    @api caseRecordId;
    @api accountRecordId;
    @api shipmentId;
    @api prescriptionId;
    @api patientId;
    @track prescriptionData = {'sObjectType' : 'Prescription__c'};
    @track caseData = {'sObjectType' : 'Case'};
    @track contactData = {'sObjectType' : 'Contact'};
    @track prescriberData = {'sObjectType' : 'Contact'};
    @track accountData = {'sObjectType' : 'Account'};
    @track shipmentData = {'sObjectType' : 'Shipment__c'};
    @track doNotChecked = false;
    @track required = false;
    @track isRequired = false;
    filesData = [];
    @track primaryCardFiles = [];
    @track medicardFiles = [];
    @track residencyFiles = [];
    @track incomeProofFiles = [];
    @track insuranceFiles = [];
    @track cssDisplay = 'slds-hide';
    @track displaySavePopup = false;
    openSectionOne = true;
    openSectionTwo = true;
    openSectionThree = true;
    openSectionFour = true;
    openSectionFive = true;
    openSectionSix = true;
    openSectionSeven = true;
    openSectionEight = true;
    openSectionNine = true;
    openSectionTen= true;
    openSectionEleven = true;
    isConsentReceived = false;
    @track isAbilify = false;
    @track isJYNARQUE = false;
    @track isSAMSCA = false;
    @track isREXULTI = false;
    @track isLoanCare = false;
    @track hideSection = false;

    connectedCallback(){
        this.cssDisplay = 'slds-show';
        if(this.caseRecordId != undefined){
            this.caseDetails(this.caseRecordId);
            this.filesList(this.caseRecordId);
        }
        if(this.patientId != undefined){
            this.patientDetails(this.patientId); 
            this.consentDetails(this.patientId);   
        }
        if(this.prescriptionId != undefined){
            this.prescriptionDetails(this.prescriptionId);
        }
        if(this.prescriberId != undefined){
            this.prescriberDetails(this.prescriberId);    
        }

        if(this.accountRecordId != undefined){
            this.accountDetails(this.accountRecordId);     
        }

        if(this.shipmentId != undefined){
            this.shipmentDetails(this.shipmentId);
        }
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

    caseDetails(recordId){
        caseDetails({
            caseId : recordId
        }).then(response => {
            this.caseData = response;
            if(response.Has_No_Insurance__c == true){
                this.doNotChecked = true;  
                this.required = false; 
                this.isRequired = false;
            }else{
                this.doNotChecked = false; 
                this.required = true;
                this.isRequired = true;
            }
            if(response.Ship_Type__c == 'Local Care Center'){
                this.isLoanCare = true;
            }
            /*if(response.ABILIFY_MAINTENA_First_Administration__c == true){
                this.caseData.ABILIFY_MAINTENA_First_Administration__c = 'Yes';
            }else{
                this.caseData.ABILIFY_MAINTENA_First_Administration__c = 'No';
            }
            if(response.Temportary_Patient_Assistance__c == true){
                this.caseData.Temportary_Patient_Assistance__c = 'Yes';
            }else{
                this.caseData.Temportary_Patient_Assistance__c = 'No';
            }
            if(response.JYNARQUE_Starter_Kit__c == true){
                this.caseData.JYNARQUE_Starter_Kit__c = 'Yes';
            }else{
                this.caseData.JYNARQUE_Starter_Kit__c = 'No';
            }*/
            if(response.Product__c == 'ABILIFY MAINTENA'){
                this.isAbilify = true;
                this.isJYNARQUE = false;
                this.isSAMSCA = false;
                this.isREXULTI = false;
            }else if(response.Product__c == 'SAMSCA'){
                this.isSAMSCA = true;
                this.isAbilify = false;
                this.isJYNARQUE = false;
                this.isREXULTI = false;
            }else if(response.Product__c == 'JYNARQUE'){
                this.isJYNARQUE = true;
                this.isSAMSCA = false;
                this.isAbilify = false;
                this.isREXULTI = false;
            }else{
                this.isJYNARQUE = false;
                this.isSAMSCA = false;
                this.isAbilify = false; 
                this.isREXULTI = true;   
            }
            if(response.Rx_Send_Method__c == 'eScribe'){
                this.isEScribe = true;
                this.isDownload = false;
                this.isUpload = false;
            }else if(response.Rx_Send_Method__c == 'Download and Upload OPAF provided Rx Template'){
                this.isEScribe = false;
                this.isDownload = true;
                this.isUpload = false;
            }else if(response.Rx_Send_Method__c == 'Upload your Rx'){
                this.isEScribe = false;
                this.isDownload = false;
                this.isUpload = true;
            }
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });    
    }

    filesList(recordId){
        this.cssDisplay = 'slds-show';
        filesList({
            caseId : recordId
        }).then(response => {
            //this.filesData = response;  
            for(var i=0;i<response.length;i++){
                if(response[i].Document_Type__c == 'PHARMACY CARD'){
                    this.primaryCardFiles.push(response[i]);
                }else if(response[i].Document_Type__c == 'MEDICAL CARD'){
                    this.medicardFiles.push(response[i]);
                }else if(response[i].Document_Type__c == 'RESIDENTIAL DOCUMENT'){
                    this.residencyFiles.push(response[i]);
                }else if(response[i].Document_Type__c == 'INSURANCE DOCUMENT'){
                    this.insuranceFiles.push(response[i]);
                }else if(response[i].Document_Type__c == 'INCOME DOCUMENT'){
                    this.incomeProofFiles.push(response[i]);
                }
            } 
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });
    }

    patientDetails(contactId){
        contactDetails({
            contactId : contactId
        }).then(response => {
            this.contactData = response;
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });
    }

    prescriptionDetails(prescriptionId){
        prescriptionDetails({
            prescriptionId : prescriptionId
        }).then(response => {
            this.prescriptionData = response;
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });
    }

    prescriberDetails(contactId){
        contactDetails({
            contactId : contactId
        }).then(response => {
            this.prescriberData = response;
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });
    }

    accountDetails(accountId){
        accountDetails({
            accountId : accountId
        }).then(response => {
            this.accountData = response;
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });
    }

    shipmentDetails(shipmentId){
        shipmentDetails({
            shipmentId : shipmentId
        }).then(response => {
            this.shipmentData = response;
            if(response.Shipping_Type__c == 'Local Care Center'){
                this.isLoanCare = true;
            }else{
                this.isLoanCare = false;
            }
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });
    }

    caseFieldsChangeHandler(event){
        this.caseData[event.currentTarget.dataset.name] = event.target.value;
    }

    contactDataTracking(event){
        this.contactData[event.currentTarget.dataset.name] = event.target.value;
    }

    prescriptionDataTracking(event){
        this.prescriptionData[event.currentTarget.dataset.name] = event.target.value;
    }

    toggleSection(event){
        var section = event.currentTarget.dataset.name;
        if(section == 'section1'){
            this.openSectionOne = !this.openSectionOne;
        }else if(section == 'section2'){
            this.openSectionTwo = !this.openSectionTwo;
        }else if(section == 'section3'){
            this.openSectionThree = !this.openSectionThree;
        }else if(section == 'section4'){
            this.openSectionFour = !this.openSectionFour;
        }else if(section == 'section5'){
            this.openSectionFive = !this.openSectionFive;
        }else if(section == 'section7'){
            this.openSectionSeven = !this.openSectionSeven;
        }else if(section == 'section8'){
            this.openSectionEight = !this.openSectionEight;
        }else if(section == 'section9'){
            this.openSectionNine = !this.openSectionNine;
        }else if(section == 'section10'){
            this.openSectionTen = !this.openSectionTen;
        }else if(section == 'section11'){
            this.openSectionEleven = !this.openSectionEleven;
        }
    }

    get sectionOne(){
        return this.openSectionOne ? 'slds-section slds-is-open' : 'slds-section';
    }

    get sectionTwo(){
        return this.openSectionTwo ? 'slds-section slds-is-open' : 'slds-section';
    }

    get sectionThree(){
        return this.openSectionThree ? 'slds-section slds-is-open' : 'slds-section';
    }

    get sectionFour(){
        return this.openSectionFour ? 'slds-section slds-is-open' : 'slds-section';
    }

    get sectionFive(){
        return this.openSectionFive ? 'slds-section slds-is-open' : 'slds-section';
    }

    get sectionSeven(){
        return this.openSectionSeven ? 'slds-section slds-is-open' : 'slds-section';
    }

    get sectionEight(){
        return this.openSectionEight ? 'slds-section slds-is-open' : 'slds-section';
    }

    get sectionTen(){
        return this.openSectionTen ? 'slds-section slds-is-open' : 'slds-section';
    }

    get sectionNine(){
        return this.openSectionNine ? 'slds-section slds-is-open' : 'slds-section';
    }

    get sectionEleven(){
        return this.openSectionEleven ? 'slds-section slds-is-open' : 'slds-section';
    }

    navigateToPreviousStep(){
        const isInputsCorrect = this.checkForValidFields();
        if(isInputsCorrect){
            this.updateCaseAndPrescriptions('previousStep');
        }else{
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Please provide the required information in all of the fields highlighted in red.',
                variant: 'error',
            });
            this.dispatchEvent(evt);    
        }
    }

    saveAndCompleteLater(){
        const isInputsCorrect = this.checkForValidFields();
        if(isInputsCorrect){
            this.updateCaseAndPrescriptions('saveAndCompleteLater');
        }else{
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Please provide the required information in all of the fields highlighted in red.',
                variant: 'error',
            });
            this.dispatchEvent(evt);    
        }
    }

    navigateToNextStep(){
        const isInputsCorrect = this.checkForValidFields();
        if(isInputsCorrect){
            this.updateCaseAndPrescriptions('nextStep');
        }else{
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Please provide the required information in all of the fields highlighted in red.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }

    checkForValidFields(){
        const isInputsCorrect = [...this.template.querySelectorAll('lightning-input')]
        .reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);
        const isTextAreaInputsCorrect = [...this.template.querySelectorAll('lightning-textarea')]
        .reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);
        if(isInputsCorrect == true && isTextAreaInputsCorrect == true){
            return true;
        }else{
            return false;
        }
    }

    closeModel(){
        this.displaySavePopup = false;
    }

    submitDetails(){
        this.inCommunity();
    }

    updateCaseAndPrescriptions(actionType){
        this.cssDisplay = 'slds-show';
        var action = '';
        var actionStep = '';
        if(actionType == 'saveAndCompleteLater'){
            action = 'Save and Complete Later';
            actionStep = 'Prescriber Re-Enrollment Step Five';
        }else if(actionType == 'nextStep'){
            action = 'next';
            actionStep = 'Prescriber Re-Enrollment Step Six';
        }
        var filesDataString = '';

        if(this.filesData.length > 0){
            filesDataString = JSON.stringify(this.filesData);
        }else {
            filesDataString = '';    
        }
        updateCaseAndPrescriptions({
            caseRecord : JSON.stringify(this.caseData),
            patientRecord : JSON.stringify(this.contactData),
            prescriptionRecord : JSON.stringify(this.prescriptionData),
            attachments : filesDataString,
            actionType : action,
            step : actionStep
        }).then(response => {
            if(response.status == 'Success'){
                if(actionType == 'previousStep'){
                    const evt= new CustomEvent('previousstep', {
                        detail: {
                            isStepFour : true,
                            isCurrentStep : '5',
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
                }else if(actionType == 'saveAndCompleteLater'){
                    this.displaySavePopup = true;
                    this.cssDisplay = 'slds-hide';
                }else if(actionType == 'nextStep'){
                    if(this.caseData.Consent_Status__c == 'signing_complete'){
                        const evt= new CustomEvent('nextstep', {
                            detail: {
                                isStepSix : true,
                                isCurrentStep : '5',
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
                    }else{
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
                    
                    /*const evt= new CustomEvent('nextstep', {
                        detail: {
                            isStepSix : true,
                            isCurrentStep : '5',
                            caseRecordId : this.caseRecordId,
                            patientRecord : this.patientId,
                            accountId : this.accountRecordId,
                            prescriberId : this.prescriberId,
                            shipmentId : this.shipmentId,
                            prescriptionId : this.prescriptionId,
                            isConsentReceived : this.isConsentReceived
                        }
                    });   
                    this.dispatchEvent(evt); */
                }
                
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
            this.cssDisplay = 'slds-hide';
        });
    }

    inCommunity(){
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
}