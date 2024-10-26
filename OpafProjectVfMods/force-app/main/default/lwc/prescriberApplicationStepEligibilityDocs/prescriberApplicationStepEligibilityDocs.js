import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import productValues from "@salesforce/apex/PresciberWorkspaceLWCController.getAllProductValues";
import updateCaseDetails from "@salesforce/apex/PresciberWorkspaceLWCController.updateCaseDetails";
import inCommunity from '@salesforce/apex/PresciberWorkspaceLWCController.inCommunity';
import caseDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCaseData';
import filesList from '@salesforce/apex/PresciberWorkspaceLWCController.getUploadedFiles';
import currentFilesList from '@salesforce/apex/PresciberWorkspaceLWCController.getFiles';
import deleteDocuments from "@salesforce/apex/PresciberWorkspaceLWCController.deleteFile";
import consentDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getConsentDetails';
import UnitedStatesVerbiage from '@salesforce/label/c.UnitedStatesVerbiage';

export default class PrescriberApplicationStepTwo extends NavigationMixin(LightningElement) {
    label = {
        UnitedStatesVerbiage
    };
    @track options = [];
    @api caseRecord;
    @api patientRecord;
    @api accountRecordId;
    @api shipmentId;
    @api prescriptionId;
    @api prescriberId;
    @api isInitial;
    @track isAbilify = false;
    @track isJynrque = false;
    @track isRequired = true;
    @track doNotChecked = false;
    @track required = true;
    @track displaySavePopup =  false;
    @track caseData = {'sObjectType' : 'Case'};
    fileData;
    primaryCardFiles = [];
    existingPrimaryCardFiles = [];
    medicalCardFiles = [];
    existingMedicalCardFiles = [];
    residentialFiles = [];
    existingResidentialFiles = [];
    insuranceFiles = [];
    existingInsuranceFiles = [];
    proofOfIncomeFiles = [];
    existingProofOfIncomeFiles = [];
    @track abilifyAdministration;
    @track cssDisplay = 'slds-hide';
    openSectionOne = true;
    openSectionTwo = true;
    openSectionThree = true;
    openSectionFour = true;
    tempValue = '';
    starterKit = '';
    value = '';
    abilifyValue = '';
    liveInUnitedSates = '';
    pharmacyCardDetails = false;
    medicalCardDetails = false;
    residentialCardDetails = false;
    insuranceCardDetails = false;
    incomeProofDetails = false
    isPharmacyRequired = true;
    incomeFileName = [];
    insuranceFileName = [];
    residentialFileName = [];
    medicalCardFileName = [];
    primaryCardFileName = [];
    hideInsuranceSection = true;
    @track isConsentReceived = false;
    @track isPrimary = false;
    @track isMedical = false;
    @track showPopup = false;
    showInsuranceSection = true;

    connectedCallback(){
        this.cssDisplay = 'slds-show';
        if(this.caseRecord != undefined){
            this.caseDetails(this.caseRecord);
            this.filesList(this.caseRecord);
        }
        if(this.patientRecord != undefined){
            this.consentDetails(this.patientRecord);
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
            this.cssDisplay = 'slds-hide';
        }).catch(error => {

        }); 
    }

    caseDetails(recordId){
        caseDetails({
            caseId : recordId
        }).then(response => {
            this.caseData = response;
            if(response.Product__c == 'ABILIFY MAINTENA'){
                this.isAbilify = true;
                this.isJynrque = false;
                this.showInsuranceSection = true;
            }else if(response.Product__c == 'JYNARQUE'){
                this.isJynrque = true;
                this.isAbilify = false;
                this.showInsuranceSection = true;
            }else{
                this.isJynrque = false;
                this.isJynrque = false;
                this.showInsuranceSection = false;
            }
            if(response.Has_No_Insurance__c == true){
                this.doNotChecked = true;  
                this.required = false; 
            }else{
                this.doNotChecked = false; 
                this.required = true
            }
            /*if(response.ABILIFY_MAINTENA_First_Administration__c == true){
                this.abilifyValue = 'Yes';
            }else{
                if(this.isInitial == true){
                    this.abilifyValue = '';
                }else{
                    if(response.Enrollment_Status__c == 'Saved to Complete Later' && 
                            response.Saved_Location__c == 'Prescriber Application Step Two'){
                        this.abilifyValue = '';
                    }else{
                        this.abilifyValue = 'No';
                    }
                }
            }*/
            /*if(response.Temportary_Patient_Assistance__c == true){
                this.tempValue = 'Yes';
            }else{
                if(this.isInitial == true){
                    this.tempValue = '';    
                }else{
                    if(response.Enrollment_Status__c == 'Saved to Complete Later' && 
                            response.Saved_Location__c == 'Prescriber Application Step Two'){
                        this.tempValue = '';
                    }else{
                        this.tempValue = 'No';
                    }
                }
            }*/
            /*if(response.JYNARQUE_Starter_Kit__c == true){
                this.starterKit = 'Yes';
            }else{
                if(this.isInitial == true){
                    this.starterKit = '';
                }else{
                    if(response.Enrollment_Status__c == 'Saved to Complete Later' && 
                            response.Saved_Location__c == 'Prescriber Application Step Two'){
                        this.starterKit = '';
                    }else{
                        this.starterKit = 'No';
                    }
                    
                }
            }*/
            /*if(response.Does_the_patient_live_in_United_States__c == 'true'){
                this.liveInUnitedSates = 'Yes';
            }else{
                if(this.isInitial == true){
                    this.liveInUnitedSates = '';
                }else{
                    if(response.Enrollment_Status__c == 'Saved to Complete Later' && 
                            response.Saved_Location__c == 'Prescriber Application Step Two'){
                        this.liveInUnitedSates = '';
                    }else{
                        this.liveInUnitedSates = 'No';
                    }
                }
            }*/
            this.cssDisplay = 'slds-hide';
        }).catch(error => {

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
                    this.existingPrimaryCardFiles.push(response[i]);
                    this.pharmacyCardDetails = true;
                    this.isPharmacyRequired = false;
                }else if(response[i].Document_Type__c == 'MEDICAL CARD'){
                    this.existingMedicalCardFiles.push(response[i]);
                    this.medicalCardDetails = true;
                    this.isRequired = false;
                }else if(response[i].Document_Type__c == 'RESIDENTIAL DOCUMENT'){
                    this.existingResidentialFiles.push(response[i]);
                    this.residentialCardDetails = true;
                }else if(response[i].Document_Type__c == 'INSURANCE DOCUMENT'){
                    this.existingInsuranceFiles.push(response[i]);
                    this.insuranceCardDetails = true;
                }else if(response[i].Document_Type__c == 'INCOME DOCUMENT'){
                    this.existingProofOfIncomeFiles.push(response[i]);
                    this.incomeProofDetails = true;
                }
            } 
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });
    }

    @wire(productValues) getProductValues ({ error, data }) {
        if (data) {
            //data.sort(function(a, b){return a - b});
            console.log('getProductValues', data);
            this.options = data; 
        } else if (error) {
        }
    }

    toggleSection(event){
        var dataSection = event.currentTarget.dataset.name;
        if(dataSection == 'section1'){
            this.openSectionOne = !this.openSectionOne;
        }else if(dataSection == 'section2'){
            this.openSectionTwo = !this.openSectionTwo;
        }else if(dataSection == 'section3'){
            this.openSectionThree = !this.openSectionThree;
        }else if(dataSection == 'section4'){
            this.openSectionFour = !this.openSectionFour;
        }
    }
    get acceptedFormats() {
        return ['.pdf', '.png', '.jpeg', '.jpg'];
    }

    get productoptions() {
        return this.options;
    }


    get radioOptions() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
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

    productChangeHandler(event){
        if (event.detail.value == 'ABILIFY MAINTENA' || event.detail.value == 'ABILIFY ASIMTUFII') {
            this.isAbilify = true;
        }
    }

    primaryCardUpload(event){
        this.primaryCardFileName = [];
        const files = event.target.files;
        if(files.length > 0){
            this.isPharmacyRequired = false;
            for(var i = 0; i < files.length; i++){
                this.readFiles(files[i], 'PHARMACY CARD'); 
                this.primaryCardFileName.push(files[i].name);  
            }
        }else{
            this.isPharmacyRequired = true;
        }
    }

    medicalCardUpload(event){
        this.medicalCardFileName = [];
        const files = event.target.files;
        if(files.length > 0){
            this.isRequired = false;
            for(var i = 0; i < files.length; i++){
                this.readFiles(files[i], 'MEDICAL CARD');   
                this.medicalCardFileName.push(files[i].name); 
            }
        }else{
            this.isRequired = true;
        }
    }

    residentialDocumentsUpload(event){
        this.residentialFileName = [];
        const files = event.target.files;
        for(var i = 0; i < files.length; i++){
            this.readFiles(files[i], 'RESIDENTIAL DOCUMENT'); 
            this.residentialFileName.push(files[i].name);   
        }    
    }

    insuranceDocumentsUpload(event){
        this.insuranceFileName = [];
        const files = event.target.files;
        for(var i = 0; i < files.length; i++){
            this.readFiles(files[i], 'INSURANCE DOCUMENT');
            this.insuranceFileName.push(files[i].name);     
        } 
    }

    incomeDocumentsUpload(event){
        this.incomeFileName = [];
        const files = event.target.files;
        for(var i = 0; i < files.length; i++){
            this.readFiles(files[i], 'INCOME DOCUMENT'); 
            this.incomeFileName.push(files[i].name);     
        }     
    }

    readFiles(file, fileType){
        var reader = new FileReader();  
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'fileName': file.name,
                'fileContent': base64,
                'fileType': fileType,
                'fileExtension': file.name.split('.').pop()
            }
            if(fileType == 'PHARMACY CARD'){
                this.primaryCardFiles.push(this.fileData);
            }else if(fileType == 'MEDICAL CARD'){
                this.medicalCardFiles.push(this.fileData);
            }else if(fileType == 'RESIDENTIAL DOCUMENT'){
                this.residentialFiles.push(this.fileData);
            }else if(fileType == 'INSURANCE DOCUMENT'){
                this.insuranceFiles.push(this.fileData);
            }else if(fileType == 'INCOME DOCUMENT'){
                this.proofOfIncomeFiles.push(this.fileData);
            }
            
            console.log(this.fileData);
        }
        reader.readAsDataURL(file);
        
    }

    caseFieldsChangeHandler(event){
        this.caseData[event.currentTarget.dataset.name] = event.target.value;
        if (event.currentTarget.dataset.name == 'Has_No_Insurance__c' && event.target.checked) {
            this.caseData[event.currentTarget.dataset.name] = true;
            this.isRequired = false;
            this.doNotChecked = true;
            this.required = false;
            this.isPharmacyRequired = false;
        }else if(event.currentTarget.dataset.name == 'Has_No_Insurance__c' && !event.target.checked){
            this.caseData[event.currentTarget.dataset.name] = false;
            this.isPharmacyRequired = true;
            this.isRequired = true;
            this.doNotChecked = false;
            this.required = true;
        }
        if(event.currentTarget.dataset.name == 'Product__c'){
            if(event.detail.value == 'ABILIFY MAINTENA') {
                this.isAbilify = true;
                this.isJynrque = false;
                this.showInsuranceSection = true;
            }else if(event.detail.value == 'ABILIFY ASIMTUFII') {
                this.isAbilify = true;
                this.isJynrque = false;
                this.showInsuranceSection = true;
            }else if(event.detail.value == 'JYNARQUE'){
                this.isJynrque = true;
                this.isAbilify = false;
                this.showInsuranceSection = true;
            }else{
                this.isJynrque = false;
                this.isAbilify = false;
                this.showInsuranceSection = false;    
            }
        }
        
        /*if(event.currentTarget.dataset.name == 'ABILIFY_MAINTENA_First_Administration__c'){
            if(event.target.value == 'Yes'){
                this.caseData[event.currentTarget.dataset.name] = true;
            }else{
                this.caseData[event.currentTarget.dataset.name] = false;
            }
        }
        if(event.currentTarget.dataset.name == 'Temportary_Patient_Assistance__c'){
            if(event.target.value == 'Yes'){
                this.caseData[event.currentTarget.dataset.name] = true;
            }else{
                this.caseData[event.currentTarget.dataset.name] = false;
            }
        }
        if(event.currentTarget.dataset.name == 'Does_the_patient_live_in_United_States__c'){
            alert(event.target.value);
            if(event.target.value == 'Yes'){
                this.caseData.Does_the_patient_live_in_United_States__c = 'Yes';
            }else{
                this.caseData.Does_the_patient_live_in_United_States__c = 'No';
            }
        }*/
        
    }

    navigateToStepThree(event){
        const isInputsCorrect = this.checkForValidFields();
        if(isInputsCorrect){
            this.updateCaseRecord('nextStep');
        }else{           
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Please provide the required information in all of the fields highlighted in red.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
            
        }
        // if(isInputsCorrect && this.caseData.Does_the_patient_live_in_United_States__c == 'Yes'){
        //     this.updateCaseRecord('nextStep');
        // }else{
        //     if(this.caseData.Does_the_patient_live_in_United_States__c == 'No'){
        //         this.showPopup = true;    
        //     }else{
        //         const evt = new ShowToastEvent({
        //             title: 'Error',
        //             message: 'Please provide the required information in all of the fields highlighted in red.',
        //             variant: 'error',
        //         });
        //         this.dispatchEvent(evt);
        //     }
            
        // }
    }

    navigateToPreviousStep(event){
        const isInputsCorrect = this.checkForValidFields();
        if(isInputsCorrect){
            this.updateCaseRecord('previousStep');
        }else{
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Please provide the required information in all of the fields highlighted in red.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }

    saveAndCompleteLater(event){
        const isInputsCorrect = this.checkForValidFields();
        if(isInputsCorrect){
            this.updateCaseRecord('saveAndCompleteLater');
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
        const isTextInputsCorrect = [...this.template.querySelectorAll('lightning-combobox')]
        .reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);
        const isRadioInputsCorrect = [...this.template.querySelectorAll('lightning-radio-group')]
        .reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);
        if(isInputsCorrect && isTextInputsCorrect && isRadioInputsCorrect){
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

    updateCaseRecord(actionType){
        this.cssDisplay = 'slds-show';
        var action = '';
        var actionStep = '';
        if(actionType == 'saveAndCompleteLater'){
            action = 'Save and Complete Later';
            actionStep = 'Prescriber Application Step Two';
        }else if(actionType == 'nextStep'){
            action = 'next';
            actionStep = 'Prescriber Application Step Three';
        }
        var primardCardFilesString;
        var medicalCardFilesString;
        var residentialFilesString;
        var insuranceFilesString;
        var proofOfIncomeFilesString;
        if(this.primaryCardFiles.length > 0){
            primardCardFilesString = JSON.stringify(this.primaryCardFiles);
        }else{
            primardCardFilesString = '';
        }
        if(this.medicalCardFiles.length > 0){
            medicalCardFilesString = JSON.stringify(this.medicalCardFiles);
        }else {
            medicalCardFilesString = '';    
        }
        if(this.residentialFiles.length > 0){
            residentialFilesString = JSON.stringify(this.residentialFiles);
        }else {
            residentialFilesString = '';    
        }
        if(this.insuranceFiles.length > 0){
            insuranceFilesString = JSON.stringify(this.insuranceFiles);
        }else {
            insuranceFilesString = '';    
        }
        if(this.proofOfIncomeFiles.length > 0){
            proofOfIncomeFilesString = JSON.stringify(this.proofOfIncomeFiles);
        }else {
            proofOfIncomeFilesString = '';    
        }
        updateCaseDetails({
            caseRecord : JSON.stringify(this.caseData),
            actionType : action,
            step : actionStep,
            primaryCardFile : primardCardFilesString,
            medicalCardFile : medicalCardFilesString,
            residentialFile : residentialFilesString,
            insuranceFile : insuranceFilesString,
            incomeFile : proofOfIncomeFilesString
        }).then(response => {
            if(response.status == 'Success'){
                if(actionType == 'previousStep'){
                    const evt= new CustomEvent('previousstep', {
                        detail: {
                            isStepOne : true,
                            isCurrentStep : '2',
                            caseRecordId : this.caseRecord,
                            patientRecord : this.patientRecord,
                            accountId : this.accountRecordId,
                            prescriberId : this.prescriberId,
                            shipmentId : this.shipmentId,
                            prescriptionId : this.prescriptionId,
                            consentStatus : this.isConsentReceived
                        }
                    });
                    this.dispatchEvent(evt);
                }else if(actionType == 'saveAndCompleteLater'){
                    this.displaySavePopup = true;
                }else if(actionType == 'nextStep'){
                    const evt= new CustomEvent('nextstep', {
                        detail: {
                            isStepThree : true,
                            isCurrentStep : '2',
                            caseRecordId : this.caseRecord,
                            patientRecord : this.patientRecord,
                            accountId : response.accountId,
                            prescriberId : response.prescriberId,
                            shipmentId : response.shipmentId,
                            prescriptionId : response.prescriptionId,
                            consentStatus : this.isConsentReceived
                        }
                    });   
                    this.dispatchEvent(evt); 
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

    downloadAttachment(event){
        event.preventDefault();
        var versionId = event.currentTarget.dataset.id;
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

    deleteUploadedFile(event){
        this.cssDisplay = 'slds-show';
        let fileId = event.target.name;
        let fileName = event.currentTarget.dataset.label;
        deleteDocuments({
            documentId : fileId
        })
            .then((result) => {
                if(result == 'Success'){
                    switch(fileName){
                        case 'pharmacyCardDetails':
                        this.pharmacyCardDetails = false;
                        for (var i = this.existingPrimaryCardFiles.length - 1; i >= 0; i--) {
                            if (this.existingPrimaryCardFiles[i].ContentDocument.Id === fileId) {
                                this.existingPrimaryCardFiles.splice(i, 1);
                            }
                        }
                        /*for(let i=0;i<=this.existingPrimaryCardFiles.length;i++){
                            if(this.existingPrimaryCardFiles[i].ContentDocument.Id == fileId){
                                this.existingPrimaryCardFiles.splice(i, 1);
                            }
                        }*/
                        if(this.existingPrimaryCardFiles.length > 0){
                            this.isPharmacyRequired = false;
                            this.pharmacyCardDetails = true;
                        }else{
                            this.isPharmacyRequired = true;
                            this.pharmacyCardDetails = false;    
                        }
                        break;
                        case 'medicalCardDetails':
                        this.medicalCardDetails = false;  
                        for(var i = this.existingMedicalCardFiles.length - 1; i >= 0; i--){
                            if(this.existingMedicalCardFiles[i].ContentDocument.Id == fileId){
                                this.existingMedicalCardFiles.splice(i, 1);
                            }
                        }
                        /*for(let i=0;i<=this.existingMedicalCardFiles.length;i++){
                            if(this.existingMedicalCardFiles[i].ContentDocument.Id == fileId){
                                this.existingMedicalCardFiles.splice(i, 1);
                            }
                        }*/
                        if(this.existingMedicalCardFiles.length > 0){
                            this.isRequired = false;
                            this.medicalCardDetails = true;
                        }else{
                            this.isRequired = true;
                            this.medicalCardDetails = false;    
                        }
                        break;
                        case 'residencyDocumentsDetails':
                        this.residentialCardDetails = false; 
                        for(var i = this.existingResidentialFiles.length - 1; i >= 0; i--){
                            if(this.existingResidentialFiles[i].ContentDocument.Id == fileId){
                                this.existingResidentialFiles.splice(i, 1);
                            }
                        }   
                        /*for(let i=0;i<=this.existingResidentialFiles.length;i++){
                            if(this.existingResidentialFiles[i].ContentDocument.Id == fileId){
                                this.existingResidentialFiles.splice(i, 1);
                            }
                        }*/
                        if(this.existingResidentialFiles.length > 0){
                            this.residentialCardDetails = true;   
                        }else{
                            this.residentialCardDetails = false;      
                        }
                        break;
                        case 'insuranceDenialDocumentsDetails':
                        this.insuranceCardDetails = false;    
                        for(var i = this.existingInsuranceFiles.length - 1; i >= 0; i--){
                            if(this.existingInsuranceFiles[i].ContentDocument.Id == fileId){
                                this.existingInsuranceFiles.splice(i, 1);
                            }
                        } 
                        /*for(let i=0;i<=this.existingInsuranceFiles.length;i++){
                            if(this.existingInsuranceFiles[i].ContentDocument.Id == fileId){
                                this.existingInsuranceFiles.splice(i, 1);
                            }
                        }*/
                        if(this.existingInsuranceFiles.length > 0){
                            this.insuranceCardDetails = true;   
                        }else{
                            this.insuranceCardDetails = false;      
                        }
                        break;
                        case 'proofofIncomeDocumentsDetails':
                        this.incomeProofDetails = false; 
                        for(var i = this.existingProofOfIncomeFiles.length - 1; i >= 0; i--){
                            if(this.existingProofOfIncomeFiles[i].ContentDocument.Id == fileId){
                                this.existingProofOfIncomeFiles.splice(i, 1);
                            }
                        } 
                        /*for(let i=0;i<=this.existingProofOfIncomeFiles.length;i++){
                            if(this.existingProofOfIncomeFiles[i].ContentDocument.Id == fileId){
                                this.existingProofOfIncomeFiles.splice(i, 1);
                            }
                        }*/
                        if(this.existingProofOfIncomeFiles.length > 0){
                            this.incomeProofDetails = true;   
                        }else{
                            this.incomeProofDetails = false;      
                        }
                        break;
        
                    }
                }else{
                    //alert('error');
                }
                this.cssDisplay = 'slds-hide';
            })
            .catch((error) => {
            });
    }

    handleUploadFinished(event){
        this.cssDisplay = 'slds-show';
        var fileType = event.currentTarget.dataset.type;
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
        this.cssDisplay = 'slds-show';
        currentFilesList({
            contentDocumentIds : documentIds,
            fileType : fileType
        }).then(response => {
            //this.filesList(this.caseId);
            //setValues();
            if(fileType == 'PHARMACY CARD'){
                this.pharmacyCardDetails = false;
                this.existingPrimaryCardFiles = [];
                this.isPrimary = true;
                this.isMedical = false;
                this.isResidential = false;
                this.isInsurance = false;
                this.isIncome = false;
            }else if(fileType == 'MEDICAL CARD'){
                this.medicalCardDetails = false;
                this.existingMedicalCardFiles = [];
                this.isPrimary = false;
                this.isMedical = true;
                this.isResidential = false;
                this.isInsurance = false;
                this.isIncome = false;
            }else if(fileType == 'RESIDENTIAL DOCUMENT'){
                this.residentialCardDetails = false;
                this.existingResidentialFiles = [];
                this.isPrimary = false;
                this.isMedical = false;
                this.isResidential = true;
                this.isInsurance = false;
                this.isIncome = false;
            }else if(fileType == 'INSURANCE DOCUMENT'){
                this.insuranceCardDetails = false;
                this.existingInsuranceFiles = [];
                this.isPrimary = false;
                this.isMedical = false;
                this.isResidential = false;
                this.isInsurance = true;
                this.isIncome = false;
            }else if(fileType == 'INCOME DOCUMENT'){
                this.incomeProofDetails = false;
                this.existingProofOfIncomeFiles = [];
                this.isPrimary = false;
                this.isMedical = false;
                this.isResidential = false;
                this.isInsurance = false;
                this.isIncome = true;
            }
            for(var i=0;i<response.length;i++){
                if(response[i].Document_Type__c == 'PHARMACY CARD'){
                    if(this.isPrimary == true){
                        this.existingPrimaryCardFiles.push(response[i]);    
                    }
                    this.pharmacyCardDetails = true;
                    this.isPharmacyRequired = false;
                }else if(response[i].Document_Type__c == 'MEDICAL CARD'){
                    if(this.isMedical == true){
                        this.existingMedicalCardFiles.push(response[i]);
                    }
                    this.medicalCardDetails = true;
                    this.isRequired = false;
                }else if(response[i].Document_Type__c == 'RESIDENTIAL DOCUMENT'){
                    if(this.isResidential == true){
                        this.existingResidentialFiles.push(response[i]);
                    }
                    this.residentialCardDetails = true;
                }else if(response[i].Document_Type__c == 'INSURANCE DOCUMENT'){
                    if(this.isInsurance == true){
                        this.existingInsuranceFiles.push(response[i]);
                    }
                    this.insuranceCardDetails = true;
                }else if(response[i].Document_Type__c == 'INCOME DOCUMENT'){
                    if(this.isIncome == true){
                        this.existingProofOfIncomeFiles.push(response[i]);
                    }
                    this.incomeProofDetails = true;
                }
            } 
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });
    }

    setValues(){
        this.isPrimary = false;
        this.isMedical = false;
        this.isResidential = false;
        this.isInsurance = false;
        this.isIncome = false;
    }

    closePopup(){
        this.showPopup = false;
    }

    navigateToHomePage(){
        this.showPopup = false;
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: 'my-workspace'
            }
        });
    }
}