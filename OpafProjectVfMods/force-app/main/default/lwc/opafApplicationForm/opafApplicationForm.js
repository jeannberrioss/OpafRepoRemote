import { LightningElement, track, wire, api } from 'lwc';
import productValues from "@salesforce/apex/OPAFApplicationFormController.getAllProductValues";
import contactDetails from "@salesforce/apex/OPAFApplicationFormController.getCurrentUserContact";
import caseDetail from "@salesforce/apex/OPAFApplicationFormController.getCaseDetails";
import cloneCaseRecord from "@salesforce/apex/OPAFApplicationFormController.cloneCase";
import prescriberDetails from "@salesforce/apex/OPAFApplicationFormController.getPrescriberContact";
import allDocuments from "@salesforce/apex/OPAFApplicationFormController.getAllDocuments";
import filesList from '@salesforce/apex/PresciberWorkspaceLWCController.getUploadedFiles';
import deleteDocuments from "@salesforce/apex/OPAFApplicationFormController.deleteFile";
import updateContactWithConsent from "@salesforce/apex/OPAFApplicationFormController.updateContact";
import updateNewCase from "@salesforce/apex/OPAFApplicationFormController.updateCase";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import createNewContact from "@salesforce/apex/OPAFApplicationFormController.createContact";
import allStateValues from "@salesforce/apex/OPAFApplicationFormController.getAllStateValues";
import currentFilesList from '@salesforce/apex/PresciberWorkspaceLWCController.getFiles';
import {loadStyle} from 'lightning/platformResourceLoader';
import cssResource from '@salesforce/resourceUrl/opafForm';
import { refreshApex } from "@salesforce/apex";
import { NavigationMixin } from 'lightning/navigation';
import errorMessage from '@salesforce/label/c.Patient_Age_Less_Than_18_Years';

var fileName = [];
export default class OpafApplicationForm extends NavigationMixin(LightningElement) {
    // section1 = true;
    // section2 = true;
    // section3 = true;
    // section4 = true;
    // section5 = true;
    // section6a = true;
    // section6b = true;
    // section6c = true;

    @api newCaseId = '';
    @api initiativeValue = '';
    @api stepValue = '';
    @api prescriber='';

    required = true;
    openPharmacyCard = true;

    requiredAbilifyMaintena = true;
    openMedicalCard = true;
    
    loaded = false;
    patientlive = '';
    finalPage = false;

    allow = true;
    saveAndCompletePopUp = false;

    currentStep = '1';
    options = [];
    stateOptions = [];
    
    getData={};
    contactDetail;

    getCaseData={};
    caseDetails;

    documentDetails = [];
    pharmacyCardDetails = [];
    medicalCardDetails = [];
    residencyDocumentsDetails = [];
    insuranceDenialDocumentsDetails = [];
    proofofIncomeDocumentsDetails = [];

    stepValueList = {
        'Prescriber Application Step Two' : '2', 
        'Prescriber Application Step Three' : '3', 
        'Prescriber Application Step Four' : '4', 
        'Prescriber Application Step Five' : '5', 
        'Prescriber Application Step Six' : '6', 
        'Prescriber Application Step Seven' : '7'
    };
 
    getNewContactData = {};
    prescriberDetails;
    isPharmaCard = false;
    isMedicalCard = false;
    isResidencyDocuments = false;
    isInsuranceDocuments = false;
    isIncomeDocuments = false;
    pharmacyCardDetailsChecking = false;
    medicalCardDetailsChecking = false;
    residencyDocumentsDetailsChecking = false;
    insuranceDenialDocumentsDetailsChecking = false;
    proofofIncomeDocumentsDetailsChecking = false;

    checkReadOnly =  false;
    renderedCallback() {
        // console.log('wdfdfd'+JSON.stringify(this.prescriber));
        // console.log('initiativeValue:::'+JSON.stringify(this.initiativeValue));
        console.log('initiativeValue:::'+JSON.stringify(this.initiativeValue));
        console.log('newCaseId:::'+JSON.stringify(this.newCaseId));
        console.log('stepValue:::', this.stepValue);
        loadStyle(this, cssResource);     

        if (this.initiativeValue == 'finishIncompleteButton' && this.allow == true) {
            this.allow = false;
            try {
                refreshApex(this.refreshcontactDetails);
            } catch (err) {
                console.error('refreshcontactDetails', err);
            }
            if (this.stepValue != 'Prescriber Application Step One' && this.stepValue != null && this.stepValue != undefined) {
                this.currentStep = this.stepValueList[this.stepValue];
                
                const stepDiv = this.template.querySelector(`div.step${this.currentStep}`);
                if (stepDiv) {
                    stepDiv.classList.remove('slds-hide');
                    const stepOneDiv = this.template.querySelector('div.stepOne');
                    if (stepOneDiv){ 
                        stepOneDiv.classList.add('slds-hide');
                    }
                }
            }
            console.log('STEP initiativeValue:::'+JSON.stringify(this.initiativeValue));
        } 
        
        else if (this.initiativeValue == 'ReEnroll' && this.newCaseId == '' && this.allow == true) {
            this.allow = false;
            this.checkReadOnly = true;
            caseDetail({caseId:'',buttonType:'ReEnroll'})
            .then((result) => {
                console.log('initiativeValue::2:'+JSON.stringify(result[0]));
                this.getCaseData=Object.assign({'sobjectType': 'Case'}, result[0]);
            })
            .catch((error) => {
                console.log('initiativeValue:::'+JSON.stringify(this.initiativeValue));
                this.informationToast(JSON.stringify(error.body.message.split(',')[1]));
            });

            this.scrollToTop();
            
        } else if (this.allow == true) {
            console.log('initiativeValue:::3'+JSON.stringify(this.initiativeValue));
            this.scrollToTop();
            this.allow = false;
        }
    }

    deleteUploadedFile(event){
        let fileId = event.target.name;
        let fileName = event.currentTarget.dataset.label;
        this.loaded = true;
        deleteDocuments({recordId:fileId})
            .then((result) => {
            switch(fileName){
                case 'pharmacyCardDetails':
                this.pharmacyCardDetailsChecking = false;
                /*for(let i=0;i<=this.pharmacyCardDetails.length;i++){
                    if(this.pharmacyCardDetails[i].ContentDocument.Id == fileId){
                        this.pharmacyCardDetails.splice(i, 1);
                    }
                }*/
                for (var i = this.pharmacyCardDetails.length - 1; i >= 0; i--) {
                    if (this.pharmacyCardDetails[i].ContentDocument.Id === fileId) {
                        this.pharmacyCardDetails.splice(i, 1);
                    }
                }
                this.required = this.pharmacyCardDetails.length == 0?true:false;
                this.pharmacyCardDetailsChecking = this.pharmacyCardDetails.length > 0?true:false;
                break;
                case 'medicalCardDetails':
                this.medicalCardDetailsChecking = false;    
                /*for(let i=0;i<=this.medicalCardDetails.length;i++){
                    if(this.medicalCardDetails[i].ContentDocument.Id == fileId){
                        this.medicalCardDetails.splice(i, 1);
                    }
                }*/
                for (var i = this.medicalCardDetails.length - 1; i >= 0; i--) {
                    if (this.medicalCardDetails[i].ContentDocument.Id === fileId) {
                        this.medicalCardDetails.splice(i, 1);
                    }
                }
                this.requiredAbilifyMaintena = this.medicalCardDetails.length == 0?true:false;
                this.medicalCardDetailsChecking = this.medicalCardDetails.length > 0?true:false;
                break;
                case 'residencyDocumentsDetails':
                this.residencyDocumentsDetailsChecking = false;    
                /*for(let i=0;i<=this.residencyDocumentsDetails.length;i++){
                    if(this.residencyDocumentsDetails[i].ContentDocument.Id == fileId){
                        this.residencyDocumentsDetails.splice(i, 1);
                    }
                }*/
                for (var i = this.residencyDocumentsDetails.length - 1; i >= 0; i--) {
                    if (this.residencyDocumentsDetails[i].ContentDocument.Id === fileId) {
                        this.residencyDocumentsDetails.splice(i, 1);
                    }
                }
                if(this.residencyDocumentsDetails.length > 0){
                    this.residencyDocumentsDetailsChecking = true; 
                }else{
                    this.residencyDocumentsDetailsChecking = false;
                }
                break;
                case 'insuranceDenialDocumentsDetails':
                this.insuranceDenialDocumentsDetailsChecking = false;   
                /*for(let i=0;i<=this.insuranceDenialDocumentsDetails.length;i++){
                    if(this.insuranceDenialDocumentsDetails[i].ContentDocument.Id == fileId){
                        this.insuranceDenialDocumentsDetails.splice(i, 1);
                    }
                }*/
                for (var i = this.insuranceDenialDocumentsDetails.length - 1; i >= 0; i--) {
                    if (this.insuranceDenialDocumentsDetails[i].ContentDocument.Id === fileId) {
                        this.insuranceDenialDocumentsDetails.splice(i, 1);
                    }
                }
                if(this.insuranceDenialDocumentsDetails.length > 0){
                    this.insuranceDenialDocumentsDetailsChecking = true;
                }else{
                    this.insuranceDenialDocumentsDetailsChecking = false;
                }
                break;
                case 'proofofIncomeDocumentsDetails':
                this.proofofIncomeDocumentsDetailsChecking = false;    
                /*for(let i=0;i<=this.proofofIncomeDocumentsDetails.length;i++){
                    if(this.proofofIncomeDocumentsDetails[i].ContentDocument.Id == fileId){
                        this.proofofIncomeDocumentsDetails.splice(i, 1);
                    }
                }*/
                for (var i = this.proofofIncomeDocumentsDetails.length - 1; i >= 0; i--) {
                    if (this.proofofIncomeDocumentsDetails[i].ContentDocument.Id === fileId) {
                        this.proofofIncomeDocumentsDetails.splice(i, 1);
                    }
                }
                if(this.proofofIncomeDocumentsDetails.length > 0){
                    this.proofofIncomeDocumentsDetailsChecking = true;
                }else{
                    this.proofofIncomeDocumentsDetailsChecking = false;    
                }
                break;

            }
                this.loaded = false;
            })
            .catch((error) => {
                this.loaded = false;
                this.informationToast(JSON.stringify(error.body.message.split(',')[1]));
            });
    }
    
    @wire(productValues) getProductValues ({ error, data }) {
        if (data) {
            this.options = data;
        } else if (error) {
            this.informationToast(JSON.stringify(error.body.message));
        }
    }

    @wire(allStateValues) getStateValues ({ error, data }) {
        if (data) {
            this.stateOptions = data;
        } else if (error) {
            this.informationToast(JSON.stringify(error.body.message));
        }
    }

    refreshcontactDetails;
    @wire(contactDetails) 
    wiredContacts (result) {
        this.loaded = true;
        this.refreshcontactDetails = result;
        console.log('wiredContacts', result.data, result.error);
        if (result.data) {
            this.contactDetail = result.data;
            this.getData=Object.assign({'sobjectType': 'Contact'}, this.contactDetail);
            this.loaded = false;
        } else if (result.error) {
            this.loaded = false;
            this.informationToast(JSON.stringify(result.error.body.message));
            this.error = result.error;
        }
    }

    refreshAllDocuments;
    @wire(allDocuments,{recordId:'$newCaseId'}) 
    wiredDocuments (result) {
        this.refreshAllDocuments = result;
        if (result.data) {
            this.documentDetails = result.data;
            this.pharmacyCardDetails = Object.assign([], this.documentDetails['PHARMACY CARD']);
            this.medicalCardDetails = Object.assign([], this.documentDetails['MEDICAL CARD']);
            this.residencyDocumentsDetails = Object.assign([], this.documentDetails['RESIDENTIAL DOCUMENT']);
            this.insuranceDenialDocumentsDetails = Object.assign([], this.documentDetails['INSURANCE DOCUMENT']);
            this.proofofIncomeDocumentsDetails = Object.assign([], this.documentDetails['INCOME DOCUMENT']);
            if(this.pharmacyCardDetails.length > 0){
                this.required = false;
                this.pharmacyCardDetailsChecking = true;
            }else{
                this.required = true;
                this.pharmacyCardDetailsChecking = false;   
            }
            if(this.medicalCardDetails.length > 0){
                this.requiredAbilifyMaintena = false;
                this.medicalCardDetailsChecking = true;
            }else{
                this.requiredAbilifyMaintena = true;
                this.medicalCardDetailsChecking = false;   
            } 
            this.residencyDocumentsDetailsChecking = this.residencyDocumentsDetails.length > 0?true:false;
            this.insuranceDenialDocumentsDetailsChecking = this.insuranceDenialDocumentsDetails.length > 0?true:false;
            this.proofofIncomeDocumentsDetailsChecking = this.proofofIncomeDocumentsDetails.length > 0?true:false;
            //this.required = this.pharmacyCardDetails.length == 0?true:false;
            //this.requiredAbilifyMaintena = this.medicalCardDetails.length == 0?true:false;
        } else if (result.error) {
            console.error('refreshAllDocuments', result.error);
            this.informationToast(JSON.stringify(result.error.body.message));
            this.error = result.error;
        }
    }

    refreshPrescriberData;
    @wire(prescriberDetails,{prescriberId:'$prescriber'}) 
    wiredPrescriber (result) {
        this.refreshPrescriberData = result;
        if (result.data) {
            this.prescriberDetails = result.data;
            this.getNewContactData=Object.assign({'sobjectType': 'Contact'}, this.prescriberDetails[0]);
        } else if (result.error) {
            console.error('refreshPrescriberData', result.error);
            this.informationToast(JSON.stringify(result.error.body.message));
            this.error = result.error;
        }
    }

    downloadAttachment(event){
        event.preventDefault();
        var versionId = event.currentTarget.dataset.id;
        console.log('aaaaaaa'+versionId);
        let urlString = window.location.href;
        let baseURL = urlString.substring(0, urlString.indexOf("/s"));
        console.log(baseURL);
        //window.open('/sfc/servlet.shepherd/version/download/'+versionId);
        this[NavigationMixin.Navigate]({
            type : 'standard__webPage',
            attributes: {
                url : baseURL+'/sfc/servlet.shepherd/version/download/'+versionId
            }
        });   
    }

    refreshCaseData;
    @wire(caseDetail,{caseId:'$newCaseId',buttonType:'Finish'}) 
    wiredCases (result) {
        this.refreshCaseData = result;
        if (result.data) {
            
            this.caseDetails = result.data;
            console.log('this.caseDetails', result.data);
            if(this.newCaseId!= ''){
            this.getCaseData=Object.assign({'sobjectType': 'Case'}, this.caseDetails[0]);
                this.openPharmacyCard = this.getCaseData.Has_No_Insurance__c == true ? false : true;
                this.openMedicalCard = (!this.getCaseData.Has_No_Insurance__c) && (this.getCaseData.Product__c == 'ABILIFY MAINTENA' || this.getCaseData.Product__c == 'ABILIFY ASIMTUFII')
                this.getCaseData.Has_No_Insurance__c == false ? true : false;
                this.prescriber = this.getCaseData.Prescriber__c;
            }
        } else if (result.error) {
            console.error('refreshCaseData', result.error);
            this.informationToast(JSON.stringify(result.error.body.message));
            this.error = result.error;
        }
    }

    vitaminChange(event) {
        this.getData[event.currentTarget.dataset.name] = event.target.value;
    }

    fieldTracking(event) {
        this.getData[event.currentTarget.dataset.name] = event.target.value;
    }

    fieldTrackingNewContact(event) {
        this.getNewContactData[event.currentTarget.dataset.name] = event.target.value;
    }

    insuranceCaseTracking(event){
        if (event.target.checked == false) {
            this.required = this.pharmacyCardDetails.length > 0?false:true;
            this.openPharmacyCard = true;
            if(this.getCaseData.Product__c  == 'ABILIFY MAINTENA' || this.getCaseData.Product__c  == 'ABILIFY ASIMTUFII'){
                this.requiredAbilifyMaintena = this.medicalCardDetails.length > 0?false:true;
                this.openMedicalCard =  true; 
            }
        } else{
            this.required = false;
            this.openMedicalCard = false; 
            this.openPharmacyCard = false;
            if(this.getCaseData.Product__c  == 'ABILIFY MAINTENA' || this.getCaseData.Product__c  == 'ABILIFY ASIMTUFII'){
                this.requiredAbilifyMaintena = false;
                this.openMedicalCard = false; 
            }
        }
        this.getCaseData[event.currentTarget.dataset.name] = event.target.checked;
    }

    fieldCaseTracking(event) {
        this.getCaseData[event.currentTarget.dataset.name] = event.target.value;
    }

    changeProduct(event) {
        console.log('pevent.detail.valueroddd::'+event.detail.value);
        if(event.detail.value == 'ABILIFY MAINTENA' || event.detail.value == 'ABILIFY ASIMTUFII'){
            this.openMedicalCard = true;
        } else {
            this.openMedicalCard = false;
        }
        console.log('pevent.detail.valueroddd::1'+event.currentTarget.dataset.name);
        console.log('proddd::'+JSON.stringify(this.getCaseData));
        this.getCaseData[event.currentTarget.dataset.name] = event.target.value;
        console.log('proddd::'+JSON.stringify(this.getCaseData));
    }

    get productoptions() {
        return this.options;
    }

    dateValidation(event){
        let searchCmp = this.template.querySelector('[data-name="Birthdate"]');
          let date = event.target.value;
          if(new Date(date) > new Date()){
                searchCmp.setCustomValidity("Date should not be greater than Today.");
            } else {
                searchCmp.setCustomValidity(""); 
            }
            searchCmp.reportValidity();
    }

    get prescriberSalutationoptions() {
        return [            
            { label: 'DO', value: 'DO' },
            { label: 'MD', value: 'MD' },
            { label: 'PA', value: 'PA' },
            { label: 'NP', value: 'NP' },
            { label: 'OTHER', value: 'OTHER' }
        ];
    }

    get genderOptions(){
        return [
            { label: 'Female', value: 'Female' },
            { label: 'Male', value: 'Male' },
            { label: 'Decline to Specify', value: 'Decline to Specify' },
            { label: 'Other', value: 'Other' }
        ];
    }

    get radioOptions() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
    }

    /*get pharmacyCardDetailsChecking(){
        return this.pharmacyCardDetails == '' ? false : true;
    }*/

    /*get medicalCardDetailsChecking(){
        return this.medicalCardDetails == '' ? false : true;
    }

    get residencyDocumentsDetailsChecking(){
        return this.residencyDocumentsDetails == '' ? false : true;
    }

    get insuranceDenialDocumentsDetailsChecking(){
        return this.insuranceDenialDocumentsDetails == '' ? false : true;
    }*/

    get proofofIncomeDocumentsDetailsChecking(){
        return this.proofofIncomeDocumentsDetails == '' ? false : true;
    }

    createUpdateCase(uploadFileData, caseLocation) {
       
        return updateNewCase({caseDetails:this.getCaseData, fileDatas:uploadFileData, 
            locationStage:caseLocation, patientId:this.getData.Id})
            .then((result) => {
                 this.newCaseId = result;
                 this.fileData = [];
                 fileName = [];
                 return result;
            })
            .catch((error) => {
                this.loaded = false;
                this.informationToast(JSON.stringify(error.body.message.split(',')[1]));
            });
    }

    createNewCloneCase() {
        return cloneCaseRecord({caseDetails:this.getCaseData})
            .then((result) => {
                 this.newCaseId = result;
                 return result;
            })
            .catch((error) => {
                this.loaded = false;
                this.informationToast(JSON.stringify(error.body.message.split(',')[1]));
            });
    }

    updateContactFields() {
        console.log('updateContactFields', JSON.stringify(this.getData))
        updateContactWithConsent({contactDetails:JSON.stringify(this.getData)})
            .then((result) => {
                   let stringData = result;
            })
            .catch((error) => {
                this.loaded = false;
                this.informationToast(JSON.stringify(error.body.message.split(',')[1]));
            });
    }

    closeForm(){
        const selectEvent = new CustomEvent('closeopafapplication', {
            detail: {
                closeScreen2: true
            } 
        });
        this.dispatchEvent(selectEvent);
    }

    goToScreen1(){
        this.saveAndCompletePopUp = false;
        this.closeForm();
    }

    showPopup=false;
    @track fileData=[];
    async goToNextStep(event){
        const allValid = [...this.template.querySelectorAll(`.${event.currentTarget.dataset.name}`)]
        .reduce((validSoFar, inputCmp) => {
                    inputCmp.reportValidity();
                    const valid = inputCmp.checkValidity()
                    console.log('validate', event.currentTarget.dataset.name);
                    console.log('input', inputCmp, valid)
                    return validSoFar && valid;
        }, true);
    console.log('allValid', allValid);

    if (allValid) {
        let stepName = event.currentTarget.dataset.location;
        let labelName = event.target.label;
        switch(event.currentTarget.dataset.name){
            case 'screen1':
               this.loaded = true;
               if(this.getAge(this.getData.Birthdate) >= 18){
                    this.updateContactFields();
                    if(this.initiativeValue == 'ReEnroll' && this.newCaseId == ''){
                        const clonescreen1 = await this.createNewCloneCase(); 
                    } else {
                        const screen1 = await this.createUpdateCase('', stepName);
                    }
                    if (labelName == 'NEXT') {
                        this.currentStep = '2';
    
                        this.template.querySelector('div.stepOne').classList.add('slds-hide');
                        this.template.querySelector('div.stepTwo').classList.remove('slds-hide');    
                   } else {
                        this.saveAndCompletePopUp = true;                  
                   }   
                    refreshApex(this.refreshCaseData);
                    refreshApex(this.refreshcontactDetails);
                    this.loaded = false; 
               }else{
                console.error('goToNextStep', result.error);
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: errorMessage,
                    variant: 'error',
                });
                this.dispatchEvent(evt);
               }
                break;

            case 'screen2':
                this.loaded = true;
                this.fileData = fileName;

                const screen2 = await this.createUpdateCase(this.fileData, stepName);
                
                if (labelName == 'NEXT') {
                    this.currentStep = '3';
                    
                    this.refreshData();
                    this.template.querySelector('div.stepTwo').classList.add('slds-hide');
                    this.template.querySelector('div.stepThree').classList.remove('slds-hide');

                } else {
                    this.saveAndCompletePopUp = true;
                }
                refreshApex(this.refreshAllDocuments);
                refreshApex(this.refreshCaseData);
                this.loaded = false;
              
                break;

            case 'screen3':
                console.log('zxcfghjk'+this.getCaseData.Does_the_patient_live_in_United_States__c);
                if(this.getCaseData.Does_the_patient_live_in_United_States__c == "No"){
                    this.showPopup = true;

                } else {
                    this.fileData = fileName;
                    this.loaded = true;

                    const screen3 = await this.createUpdateCase(this.fileData, stepName);
                    refreshApex(this.refreshCaseData);
                    if (labelName == 'NEXT') {
                        this.currentStep = '4';
                        this.refreshData();
                        this.template.querySelector('div.stepThree').classList.add('slds-hide');
                        this.template.querySelector('div.stepFour').classList.remove('slds-hide');
                    } else {
                        this.saveAndCompletePopUp = true;
                    }
                    refreshApex(this.refreshAllDocuments);
                    
                    this.loaded = false;
                }
                    
               
                break;

            case 'screen4':
                this.loaded = true;
                console.log('dxdcxd'+stepName);
                const pContact = await createNewContact({caseId:this.newCaseId, 
                                contactDetails:JSON.stringify(this.getNewContactData),
                                locationStage:stepName})
                .then((result) => {
                    if (labelName == 'NEXT') {
                        this.currentStep = '5';

                        this.template.querySelector('div.stepFour').classList.add('slds-hide');
                        this.template.querySelector('div.stepFive').classList.remove('slds-hide');
                    } else {
                        this.saveAndCompletePopUp = true;
                    }

                    refreshApex(this.refreshPrescriberData);
                    refreshApex(this.refreshCaseData);
                this.loaded = false;
            })
            .catch((error) => {
                this.loaded = false;
                this.informationToast(JSON.stringify(error.body.message.split(',')[1]));
            });
                break;

            case 'screen5':

                if (labelName == 'SUBMIT APPLICATION'){
                    this.finalPage = true;
                } else if (labelName == 'YES') {
                    this.createUpdateCase('', labelName);
                    this.currentStep = '6';
    
                    this.template.querySelector('div.stepFive').classList.add('slds-hide');
                    this.template.querySelector('div.stepSix').classList.remove('slds-hide');
                } else {
                    this.finalPage = false; 
                }
                
                break;

            case 'screen6':
    
                const selectEvent = new CustomEvent('closeopafapplication', {
                    detail: {
                        closeScreen2: true
                    } 
                });
                this.dispatchEvent(selectEvent);
                break;
        }
    }
    else {
        if(event.currentTarget.dataset.name != 'screen2'){
            this.informationToast('Please provide the required information in all of the fields highlighted in red');
        } else {
        this.informationToast('Please Upload a Document OR provide the below required fields information.');
        }
     }
        this.scrollToTop();
    }

    navigateToHomePage(){
        const selectEvent = new CustomEvent('closeopafapplication', {
            detail: {
                closeScreen2: true
            } 
        });
        this.dispatchEvent(selectEvent);
    }

    goToPreviousStep(event){
        
        switch(event.currentTarget.dataset.name){
            case 'screen1':
                this.template.querySelector('div.stepOne').classList.add('slds-hide');
                const selectEvent = new CustomEvent('closeopafapplication', {
                    detail: {
                        closeScreen2: true
                    } 
                });
                this.dispatchEvent(selectEvent);
                break;
            case 'screen2':
                this.currentStep = '1';
                this.template.querySelector('div.stepTwo').classList.add('slds-hide');
                this.template.querySelector('div.stepOne').classList.remove('slds-hide');
                break;
            case 'screen3':
                this.currentStep = '2';
                this.template.querySelector('div.stepThree').classList.add('slds-hide');
                this.template.querySelector('div.stepTwo').classList.remove('slds-hide');
                break;  
            case 'screen4':
                
                this.currentStep = '3';
                this.template.querySelector('div.stepFour').classList.add('slds-hide');
                this.template.querySelector('div.stepThree').classList.remove('slds-hide');
                break;
            case 'screen5':
                this.currentStep = '4';
                this.template.querySelector('div.stepFive').classList.add('slds-hide');
                this.template.querySelector('div.stepFour').classList.remove('slds-hide');
                break; 
            case 'screen6':
                this.currentStep = '5';
                this.template.querySelector('div.stepSix').classList.add('slds-hide');
                this.template.querySelector('div.stepFive').classList.remove('slds-hide');
                break;       
        }
        refreshApex(this.refreshCaseData);
        this.scrollToTop();
    }


    scrollToTop(){
        let scrollTopElement = this.template.querySelector('.pageTop');
        scrollTopElement.scrollIntoView();
    }

    @track pharmacyCard = '';
    @track medicalCard = '';
    @track residencyDocuments = '';
    @track insuranceDenialDocuments = '';
    @track proofofIncomeDocuments = '';


    refreshData() {
        this.fileData=[];
        fileName=[];
        this.pharmacyCard = '';
        this.medicalCard = '';
        this.residencyDocuments = '';
        this.insuranceDenialDocuments = '';
        this.proofofIncomeDocuments = '';
    }


    openfileUpload(event) {
    let files = event.target.files;
        const typeName = event.currentTarget.dataset.name;
                 
            for (let i = 0; i < files.length; i++) {   
              let file = files[i];
              switch(typeName){
                  case 'PHARMACY CARD':
                    this.pharmacyCard =  this.pharmacyCard == ''?file.name:this.pharmacyCard +','+file.name;
                    break;
                  case 'MEDICAL CARD':
                    this.medicalCard = this.medicalCard == ''?file.name:this.medicalCard +','+file.name;
                    break;
                case 'Residency Documents':
                    this.residencyDocuments = this.residencyDocuments == ''?file.name:this.residencyDocuments +','+file.name;
                    break;
                case 'Insurance Denial Documents':
                    this.insuranceDenialDocuments = this.insuranceDenialDocuments == ''?file.name:this.insuranceDenialDocuments +','+file.name;
                    break;
                case 'Proof of Income Documents':
                    this.proofofIncomeDocuments = this.proofofIncomeDocuments == ''?file.name:this.proofofIncomeDocuments +','+file.name;
                    break;
              }
            
            var reader = new FileReader();
            reader.onload = (function(theFile){
                return function(e){
                    var base64 = e.target.result.split(",")[1];
    
                    fileName.push({
                        Title: file.name,
                        VersionData: base64,
                        DocumentType:typeName
                      });    
                };
            })(file);   
            reader.readAsDataURL(file);
           } 

           if(event.currentTarget.dataset.name == 'PHARMACY CARD'){
            this.required = false;
        } else {
            this.requiredAbilifyMaintena = false;
        }
    }

    informationToast(title) {
        console.error('informationToast', title);
        const toastEvent = new ShowToastEvent({
          title,
          variant: "ERROR",
          duration:'500'
        });
        this.dispatchEvent(toastEvent);
      }

      handleUploadFinished(event){
        this.cssDisplay = 'slds-show';
        var fileType = event.currentTarget.dataset.name;
        const uploadedFiles = event.detail.files;
        console.log('uploadedFiles -----> '+JSON.stringify(uploadedFiles));
        var documentIds = [];
        for(var i=0;i<uploadedFiles.length;i++){
            documentIds.push(uploadedFiles[i].documentId);
        }
        console.log('documentIds -------> '+JSON.stringify(documentIds));
        this.currentFilesList(documentIds, fileType);
        this.cssDisplay = 'slds-hide';
    }
	currentFilesList(documentIds, fileType){
        currentFilesList({
            contentDocumentIds : documentIds,
            fileType : fileType
        }).then(response => {
            console.log('response -----> '+JSON.stringify(response));
            if(fileType == 'PHARMACY CARD'){
                this.pharmacyCardDetailsChecking = false;
                this.pharmacyCardDetails = [];
                this.isPharmaCard = true;
				this.isMedicalCard = false;
				this.isResidencyDocuments = false;
				this.isInsuranceDocuments = false;
				this.isIncomeDocuments = false;
            }else if(fileType == 'MEDICAL CARD'){
                this.medicalCardDetails = [];
                this.medicalCardDetailsChecking = false;
                this.isPharmaCard = false;
				this.isMedicalCard = true;
				this.isResidencyDocuments = false;
				this.isInsuranceDocuments = false;
				this.isIncomeDocuments = false;
            }else if(fileType == 'RESIDENTIAL DOCUMENT'){
				this.residencyDocumentsDetails = [];
                this.residencyDocumentsDetailsChecking = false;
                this.isPharmaCard = false;
				this.isMedicalCard = false;
				this.isResidencyDocuments = true;
				this.isInsuranceDocuments = false;
				this.isIncomeDocuments = false;
            }else if(fileType == 'INSURANCE DOCUMENT'){
                this.insuranceDenialDocumentsDetailsChecking = false;
                this.insuranceDenialDocumentsDetails = [];
                this.isPharmaCard = false;
				this.isMedicalCard = false;
				this.isResidencyDocuments = false;
				this.isInsuranceDocuments = true;
				this.isIncomeDocuments = false;
            }else if(fileType == 'INCOME DOCUMENT'){
                this.proofofIncomeDocumentsDetailsChecking = false;
                this.proofofIncomeDocumentsDetails = [];
                this.isPharmaCard = false;
				this.isMedicalCard = false;
				this.isResidencyDocuments = false;
				this.isInsuranceDocuments = false;
				this.isIncomeDocuments = true;
            }
            for(var i=0;i<response.length;i++){
                if(response[i].Document_Type__c == 'PHARMACY CARD'){
                    if(this.isPharmaCard == true){
                        this.pharmacyCardDetails.push(response[i]);    
                    }
                    this.required = false;
                    this.pharmacyCardDetailsChecking = true;
                }else if(response[i].Document_Type__c == 'MEDICAL CARD'){
                    if(this.isMedicalCard == true){
                        this.medicalCardDetails.push(response[i]);
                    }
                    this.requiredAbilifyMaintena = false;
                    this.medicalCardDetailsChecking = true;
                }else if(response[i].Document_Type__c == 'RESIDENTIAL DOCUMENT'){
                    if(this.isResidencyDocuments == true){
                        this.residencyDocumentsDetails.push(response[i]);
                    }
                    this.residencyDocumentsDetailsChecking = true;
                }else if(response[i].Document_Type__c == 'INSURANCE DOCUMENT'){
                    if(this.isInsuranceDocuments == true){
                        this.insuranceDenialDocumentsDetails.push(response[i]);
                    }
                    this.insuranceDenialDocumentsDetailsChecking = true;
                }else if(response[i].Document_Type__c == 'INCOME DOCUMENT'){
                    if(this.isIncomeDocuments == true){
                        this.proofofIncomeDocumentsDetails.push(response[i]);
                    }
                    this.proofofIncomeDocumentsDetailsChecking = true;
                }
            }
        }).catch(error => {
            this.informationToast(JSON.stringify(error.body.message.split(',')[1]));
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