import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import inCommunity from '@salesforce/apex/PresciberWorkspaceLWCController.inCommunity';
import productValues from "@salesforce/apex/PresciberWorkspaceLWCController.getAllProductValues";
import contactDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getContactDetails';
import caseDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCaseData';
import prescriptionDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getPrescriptionData';
import fetchPickListValue from '@salesforce/apex/PresciberWorkspaceLWCController.fetchPickListValue';
import updateCaseAndPrescriptions from '@salesforce/apex/PresciberWorkspaceLWCController.updateCaseAndPrescriptions'; 
import consentDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getConsentDetails';
import filesList from '@salesforce/apex/PresciberWorkspaceLWCController.getUploadedFiles';
import deleteDocuments from "@salesforce/apex/PresciberWorkspaceLWCController.deleteFile";
import submitDocuments from "@salesforce/apex/PresciberWorkspaceLWCController.submitDocuments";
import currentFilesList from '@salesforce/apex/PresciberWorkspaceLWCController.getFiles';

export default class PrescriberApplicationStepThree extends NavigationMixin(LightningElement) {
    @api prescriberId;
    @api caseRecordId;
    @api accountRecordId;
    @api shipmentId;
    @api prescriptionId;
    @api patientId;
    @track isAbilify = false;
    @track isAbilifyAsimtufii = false;
    @track isSAMSCA = false;
    @track isJYNARQUE = false;
    @track isREXULTI = false;
    @track isNUEDEXTA = false;
    @track isEScribe = false;
    @track isDownload = false;
    @track isUpload = false;
    @track prescriptionData = {'sObjectType' : 'Prescription__c'};
    @track caseData = {'sObjectType' : 'Case'};
    @track contactData = {'sObjectType' : 'Contact'};
    refillOpts = [];
    adminOpts = [];
    options = [];
    dosageOpts = [];
    quantityOpts = [];
    filesData = [];
    fileData;
    @track abilifyExistingRxFiles = [];
    @track abilifyRxCardDetails = false;
    @track abilifyAsimtufiiExistingRxFiles = [];
    @track abilifyAsimtufiiRxCardDetails = false;
    @track nuedextaExistingRxFiles = [];
    @track nuedextaRxCardDetails = false;
    @track jynarqueExistingRxFiles = [];
    @track jynarqueRxCardDetails = false;
    @track samscaExistingRxFiles = [];
    @track samscaRxCardDetails = false;
    @track rexultiExistingRxFiles = [];
    @track rexultiRxCardDetails = false;
    @track uploadExistingRxFiles = [];
    @track uploadRxCardDetails = false;
    @track rxFileUploads = [];
    @track cssDisplay = 'slds-hide';
    @track displaySavePopup =  false;
    openSection = true;
    @track currentDate; 
    @track isConsentReceived = false;
    @track isAbilifyDocument = false;
    @track isAbilifyAsimtufiiDocument = false;
    @track isNuedextaDocument = false;
    @track isJynarqueDocument = false;
    @track isRexultiDocument = false;
    @track isSamscaDocument =  false;
    @track isRxDocument = false;
    @track showSubmitPopup = false;
    @track disableAbilifySubmitButton = true;
    @track disableAbilifyAsimtufiiSubmitButton = true;
    @track disableNuedextaSubmitButton = true;
    @track disableJynarqueSubmitButton = true;
    @track disableRexultiSubmitButton = true;
    @track disableSamscaSubmitButton = true;
    @track disableRxSubmitButton = true;
    @track isRxDocumentRequired = false;

    @wire(productValues) getProductValues ({ error, data }) {
        if (data) {
            this.options = data;
        } else if (error) {
        }
    }

    connectedCallback(){
        //currentDate
        // this.cssDisplay = 'slds-show';
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

        this.fetchPickListValues({'sobjectType' : 'Prescription__c'}, 'Number_of_Refills__c');
        this.fetchPickListValues({'sobjectType' : 'Prescription__c'}, 'Administration_Method__c');
        //this.fetchPickListValues({'sobjectType' : 'Prescription__c'}, 'Dosage__c');
        this.fetchPickListValues({'sobjectType' : 'Prescription__c'}, 'Quantity__c');
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
        console.log('caseDetails', recordId);
        caseDetails({
            caseId : recordId
        }).then(response => {
            this.caseData = response;
            console.log('caseData', this.caseData);
            if(response.Product__c == 'ABILIFY MAINTENA'){
                this.prescriptionData['Quantity__c'] = '1';
                this.isAbilify = true;
                this.isAbilifyAsimtufii = false;
                this.isNUEDEXTA = false;
                this.isJYNARQUE = false;
                this.isSAMSCA = false;
                this.isREXULTI = false;
            }else if(response.Product__c == 'SAMSCA'){
                this.isSAMSCA = true;
                this.isAbilify = false;
                this.isAbilifyAsimtufii = false;
                this.isNUEDEXTA = false;
                this.isJYNARQUE = false;
                this.isREXULTI = false;
            }else if(response.Product__c == 'JYNARQUE'){
                this.isJYNARQUE = true;
                this.isSAMSCA = false;
                this.isAbilify = false;
                this.isAbilifyAsimtufii = false;
                this.isNUEDEXTA = false;
                this.isREXULTI = false;
            }else if(response.Product__c == 'REXULTI'){
                this.isJYNARQUE = false;
                this.isSAMSCA = false;
                this.isAbilify = false; 
                this.isAbilifyAsimtufii = false;
                this.isNUEDEXTA = false;
                this.isREXULTI = true;   
            }else if(response.Product__c == 'ABILIFY ASIMTUFII'){
                this.isJYNARQUE = false;
                this.isSAMSCA = false;
                this.isAbilify = false; 
                this.isAbilifyAsimtufii = true;
                this.isNUEDEXTA = false;
                this.isREXULTI = false;   
            }else if(response.Product__c == 'NUEDEXTA'){
                this.isJYNARQUE = false;
                this.isSAMSCA = false;
                this.isAbilify = false; 
                this.isAbilifyAsimtufii = false;
                this.isNUEDEXTA = true;
                this.isREXULTI = false;   
            }
            if(response.Rx_Send_Method__c == 'eScribe'){
                this.isEScribe = true;
                this.isDownload = false;
                this.isUpload = false;
                this.isRxDocumentRequired = false;
            }else if(response.Rx_Send_Method__c == 'Download and Upload OPAF provided Rx Template'){
                this.isEScribe = false;
                this.isDownload = true;
                this.isUpload = false;
                this.isRxDocumentRequired = true;
            }else if(response.Rx_Send_Method__c == 'Upload your Rx'){
                this.isEScribe = false;
                this.isDownload = false;
                this.isUpload = true;
                this.isRxDocumentRequired = true;
            }
            if(response.Rx_Fax_Timestamp__c != undefined){
                const event = new Date(response.Rx_Fax_Timestamp__c);
                this.currentDate = event.toLocaleString("en-US", {timeZone: "America/New_York"});
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
                if(response[i].Document_Type__c == 'ABILIFY RxDocument'){
                    this.abilifyExistingRxFiles.push(response[i]);
                    this.abilifyRxCardDetails = true;
                    this.disableAbilifySubmitButton = false;
                    this.isRxDocumentRequired = false;
                }else if(response[i].Document_Type__c == 'JYNARQUE RxDocument'){
                    this.jynarqueExistingRxFiles.push(response[i]);
                    this.jynarqueRxCardDetails = true;
                    this.disableJynarqueSubmitButton = false;
                    this.isRxDocumentRequired = false;
                }else if(response[i].Document_Type__c == 'SAMSCA RxDocument'){
                    this.samscaExistingRxFiles.push(response[i]);
                    this.samscaRxCardDetails = true;
                    this.disableSamscaSubmitButton = false;
                    this.isRxDocumentRequired = false;
                }else if(response[i].Document_Type__c == 'REXULTI RxDocument'){
                    this.rexultiExistingRxFiles.push(response[i]);
                    this.rexultiRxCardDetails = true;
                    this.disableRexultiSubmitButton = false;
                    this.isRxDocumentRequired = false;
                }else if(response[i].Document_Type__c == 'ABILIFY ASIMTUFII RxDocument'){
                    this.abilifyAsimtufiiExistingRxFiles.push(response[i]);
                    this.abilifyAsimtufiiRxCardDetails = true;
                    this.disableAbilifyAsimtufiiSubmitButton = false;
                    this.isRxDocumentRequired = false;
                }else if(response[i].Document_Type__c == 'NUEDEXTA RxDocument'){
                    this.nuedextaExistingRxFiles.push(response[i]);
                    this.nuedextaRxCardDetails = true;
                    this.disableNuedextaSubmitButton = false;
                    this.isRxDocumentRequired = false;
                }else if(response[i].Document_Type__c == 'RxDocument'){
                    this.uploadExistingRxFiles.push(response[i]);
                    this.uploadRxCardDetails = true;
                    this.disableRxSubmitButton = false;
                    this.isRxDocumentRequired = false;
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
            if(this.caseData.Product__c == 'ABILIFY_MAINTENA'){
                this.prescriptionData.Quantity__c = '1';   
            }
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });
    }

    fetchPickListValues(objInfo, fieldAPIName){
        console.log('fetchPickListValues', objInfo, fieldAPIName);
        fetchPickListValue({
            "objInfo" : objInfo,
            "picklistFieldApi" : fieldAPIName
        }).then(response => {
            console.log('fetchPickListValues.response', response);
            var opts = [];
            for(var i=0;i<response.length;i++){
                opts.push({
                        label : response[i].label,
                        value : response[i].value,
                });
            } 
            if(fieldAPIName == 'Number_of_Refills__c'){
                this.refillOpts = opts;
            }else if(fieldAPIName == 'Administration_Method__c'){
                this.adminOpts = opts;
            }else if(fieldAPIName == 'Dosage__c'){
                this.dosageOpts = opts;    
            }else if(fieldAPIName == 'Quantity__c'){
                this.quantityOpts = opts; 
            }
        }).catch(error => {

        });
    }

    toggleSection(){
        this.openSection = !this.openSection
    }

    get acceptedFormats() {
        return ['.pdf', '.png', '.jpeg', '.jpg'];
    }

    get sectionOne(){
        return this.openSection ? 'slds-section slds-is-open' : 'slds-section';
    }

    get radioOptions(){
        return [
            { label: 'eScribe', value: 'eScribe' },
            { label: 'Download and Upload OPAF provided Rx Template', value: 'Download and Upload OPAF provided Rx Template' },
            { label: 'Upload your Rx', value: 'Upload your Rx' },
        ];    
    }

    get refillOptions(){
        return this.refillOpts;
    }

    get adminOptions(){
        if (this.caseData.Product__c == 'ABILIFY_ASIMTUFII') {
            return this.adminOpts.filter(item => item.value.includes('Dual chamber syringe'));
        } else {
            return this.adminOpts;
        }
    }

    get productoptions() {
        return this.options;
    }

    get dosageOptions(){
        console.log('dosageOptions', this.caseData.Product__c);
        if(this.caseData.Product__c == 'ABILIFY_MAINTENA' || this.caseData.Product__c == 'ABILIFY MAINTENA'){
            return [
                {label: '300 mg', value: '300 mg'},
                {label: '400 mg', value: '400 mg'},
            ];    
        }else if(this.caseData.Product__c == 'SAMSCA'){
            return [
                {label: '15 mg', value: '15 mg'},
                {label: '30 mg', value: '30 mg'},
            ];  
        }else if(this.caseData.Product__c == 'JYNARQUE'){
            return [
                {label: '30 & 15 mg', value: '30 & 15 mg'},
                {label: '45 & 15 mg', value: '45 & 15 mg'},
                {label: '60 & 30 mg', value: '60 & 30 mg'},
                {label: '90 & 30 mg', value: '90 & 30 mg'},
                {label: '15 mg', value: '15 mg'},
            ]; 
        }else if(this.caseData.Product__c == 'REXULTI'){
            return [
                {label: '0.25 mg', value: '0.25 mg'},
                {label: '0.5 mg', value: '0.5 mg'},
                {label: '1 mg', value: '1 mg'},
                {label: '3 mg', value: '3 mg'},
                {label: '4 mg', value: '4 mg'},
            ]; 
        }else if(this.caseData.Product__c == 'ABILIFY_ASIMTUFII' || this.caseData.Product__c == 'ABILIFY ASIMTUFII'){
            return [
                {label: '720 mg dosed every 2 months', value: '720 mg'},
                {label: '960 mg dosed every 2 months', value: '960 mg'},
            ]; 
        }else if(this.caseData.Product__c == 'NUEDEXTA'){
            return [
                { label: '1 capsule PO QD x 7 days, then 1 capsule PO Q12H', value: 'PO QDx7/PO Q12H' }, // TODO: find values
                { label: '1 capsule PO Q12H', value: 'PO Q12H' },
            ]; 
        }
        
    }

    get quantityOptions(){
        console.log('quantityOptions', this.caseData.Product__c);
        /*if(this.caseData.Product__c == 'JYNARQUE'){
            return [
                {label: '1', value: '1'},
                {label: '2', value: '2'},
                {label: '3', value: '3'},
                {label: '4', value: '4'},
                {label: '5', value: '5'},
                {label: '6', value: '6'},
                {label: '7', value: '7'},
                {label: '30', value: '30'},
            ];
        }else */
        if(this.caseData.Product__c == 'SAMSCA' || this.caseData.Product__c == 'JYNARQUE'){
            var opts = [];
            for(var i=1;i<=30;i++){
                opts.push(
                    {label: i.toString(), value: i.toString()},
                );
            }
            return opts;
        }else if(this.caseData.Product__c == 'REXULTI'){
            return [
                {label: '30', value: '30'},
                {label: '60', value: '60'},
                {label: '90', value: '90'},
            ];    
        }else if(this.caseData.Product__c == 'NUEDEXTA'){
            return [
                {label: '30-day supply with 7-day initial titration (53 caps)', value: '53'},
                {label: '30-day supply', value: '60'},
                {label: '60-day supply', value: '120'},
                {label: '90-day supply', value: '180'},
            ];    
        }
        return this.quantityOpts;
    }

    downloadConsent(){
    //alert('coming here'+this.isAbilify);
    //OPAF_Neuroscience_Enrollment_Form
    //OPAFNephrologyApplicationForm
        var isValid = this.checkForValidFields();
        if(isValid){
            this.updateCaseAndPrescriptions('beforeDownload');
        }else{
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Please provide the required information in all of the fields highlighted in red.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }

    downloadConsentForm(){
        let documentName='';
        if(this.isAbilify){
            documentName='abilify';
        }
        if(this.isJYNARQUE){
            documentName='PrescriptionformforJYNARQUE';
        }
        if(this.isREXULTI){
            documentName='PrescriptionformforREXULTI';
        }
        if(this.isSAMSCA){
            documentName='PrescriptionformforSAMSCA';
        }
        if(this.isAbilifyAsimtufii){
            documentName='PrescriptionformforABILIFYASIMTUFII';
        }
        if(this.isNUEDEXTA){
            documentName='PrescriptionformforNUEDEXTA';
        }
        
        let urlString = window.location.href;
        let baseURL = urlString.substring(0, urlString.indexOf("/s"));
        //alert(baseURL+documentName);
        
        this[NavigationMixin.Navigate]({
           type : 'standard__webPage',
           attributes: {
            url : baseURL+'/apex/'+documentName+'?Id='+this.caseRecordId
           }
       });
    }

    rxDocumentsUpload(event){
        var fileType = event.currentTarget.dataset.name;
        this.rxFileUploads = [];
        const files = event.target.files;
        for(var i = 0; i < files.length; i++){
            this.readFiles(files[i], fileType); 
            this.rxFileUploads.push(files[i].name);  
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
            this.filesData.push(this.fileData);
            console.log(this.fileData);
        }
        reader.readAsDataURL(file);
        
    }

    caseDataTracking(event){
        this.caseData[event.currentTarget.dataset.name] = event.target.value;
        if(event.currentTarget.dataset.name == 'Rx_Send_Method__c'){
            if(event.target.value == 'eScribe'){
                this.isEScribe = true;
                this.isDownload = false;
                this.isUpload = false;
                this.caseData.eScribe_Rx__c = true;
                this.isRxDocumentRequired = false;
            }else if(event.target.value == 'Download and Upload OPAF provided Rx Template'){
                this.isEScribe = false;
                this.isDownload = true;
                this.isUpload = false;
                this.isRxDocumentRequired = true;
                this.prescriptionData.Dispense_as_Written__c = true;
            }else if(event.target.value == 'Upload your Rx'){
                this.isEScribe = false;
                this.isDownload = false;
                this.isUpload = true;
                this.isRxDocumentRequired = true;
            }
        }
    }

    prescriptionDataTracking(event){
        this.prescriptionData[event.currentTarget.dataset.name] = event.target.value;
    }

    contactDataTracking(event){
        this.contactData[event.currentTarget.dataset.name] = event.target.value;
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
        console.log('navigateToNextStep');
        const isInputsCorrect = this.checkForValidFields();
        if(isInputsCorrect){
            if(this.isRxDocumentRequired == false){
                if(this.isDownload || this.isUpload){
                    this.submitRxDocuments();
                }else{
                    this.updateCaseAndPrescriptions('nextStep');    
                }
            }else{
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: 'Please upload and submit RxDcoument',
                    variant: 'error',
                });
                this.dispatchEvent(evt);    
            }
            
            /*if(this.isRxDocumentRequired == false){
                this.updateCaseAndPrescriptions('nextStep');
            }else{
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: 'Please upload and submit RxDcoument',
                    variant: 'error',
                });
                this.dispatchEvent(evt);
            }*/
        }else{
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Please provide the required information in all of the fields highlighted in red.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }

    closeModel(){
        this.displaySavePopup = false;
    }

    submitDetails(){
        this.inCommunity();
    }

    checkForValidFields(){
        const isInputsCorrect = [...this.template.querySelectorAll('[data-id="inputId"]')]
        .reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            const valid = inputField.checkValidity()
            console.log('validate', inputField?.dataset?.name);
            console.log('input', inputField, valid)
            return validSoFar && valid;
        }, true);
        return isInputsCorrect;
    }

    updateCaseAndPrescriptions(actionType){
        this.cssDisplay = 'slds-show';
        var action = '';
        var actionStep = '';
        if(actionType == 'saveAndCompleteLater'){
            action = 'Save and Complete Later';
            actionStep = 'Prescriber Application Step Four';
        }else if(actionType == 'nextStep'){
            action = 'next';
            actionStep = 'Prescriber Application Vitamins Step';
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
                            isStepThree : true,
                            isCurrentStep : '4',
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
                }else if(actionType == 'saveAndCompleteLater'){
                    this.displaySavePopup = true;
                }else if(actionType == 'nextStep'){
                    const evt= new CustomEvent('nextstep', {
                        detail: {
                            isStepVitamins : true,
                            isCurrentStep : '4',
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
                }else if(actionType == 'beforeDownload'){
                    this.downloadConsentForm();
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
                        case 'upload rxDocumentDetails':
                            this.uploadRxCardDetails = false;   
                            for(var i = this.uploadExistingRxFiles.length - 1; i >= 0; i--){
                                if(this.uploadExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.uploadExistingRxFiles.splice(i, 1);
                                }
                            }
                            /*for(let i=0;i<=this.uploadExistingRxFiles.length;i++){
                                if(this.uploadExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.uploadExistingRxFiles.splice(i, 1);
                                }
                            }*/
                            if(this.uploadExistingRxFiles.length > 0){
                                this.uploadRxCardDetails = true;
                                this.disableRxSubmitButton = false;
                            }else{
                                this.uploadRxCardDetails = false; 
                                this.disableRxSubmitButton = true;   
                            }
                            break;
                        case 'samsca rxDocumentDetails':
                            this.samscaRxCardDetails = false;    
                            for(var i = this.samscaExistingRxFiles.length - 1; i >= 0; i--){
                                if(this.samscaExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.samscaExistingRxFiles.splice(i, 1);
                                }
                            }    
                            /*for(let i=0;i<=this.samscaExistingRxFiles.length;i++){
                                if(this.samscaExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.samscaExistingRxFiles.splice(i, 1);
                                }
                            }*/
                            if(this.samscaExistingRxFiles.length > 0){
                                this.samscaRxCardDetails = true;
                                this.disableSamscaSubmitButton = false;
                            }else{
                                this.samscaRxCardDetails = false;  
                                this.disableSamscaSubmitButton = true;  
                            }
                            break;
                        case 'rexulti rxDocumentDetails':
                            this.rexultiRxCardDetails = false;    
                            for(var i = this.rexultiExistingRxFiles.length - 1; i >= 0; i--){
                                if(this.rexultiExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.rexultiExistingRxFiles.splice(i, 1);
                                }
                            }
                            /*for(let i=0;i<=this.rexultiExistingRxFiles.length;i++){
                                if(this.rexultiExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.rexultiExistingRxFiles.splice(i, 1);
                                }
                            }*/
                            if(this.rexultiExistingRxFiles.length > 0){
                                this.rexultiRxCardDetails = true;
                                this.disableRexultiSubmitButton = false;
                            }else{
                                this.rexultiRxCardDetails = false;
                                this.disableRexultiSubmitButton = true;    
                            }
                            break;
                        case 'jynarque rxDocumentDetails':
                            this.jynarqueRxCardDetails = false;    
                            for(var i = this.jynarqueExistingRxFiles.length - 1; i >= 0; i--){
                                if(this.jynarqueExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.jynarqueExistingRxFiles.splice(i, 1);
                                }
                            }
                            /*for(let i=0;i<=this.jynarqueExistingRxFiles.length;i++){
                                if(this.jynarqueExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.jynarqueExistingRxFiles.splice(i, 1);
                                }
                            }*/
                            if(this.jynarqueExistingRxFiles.length > 0){
                                this.jynarqueRxCardDetails = true;
                                this.disableJynarqueSubmitButton = false;
                            }else{
                                this.jynarqueRxCardDetails = false; 
                                this.disableJynarqueSubmitButton = true;   
                            }
                            break;
                        case 'abilify rxDocumentDetails':
                            this.abilifyRxCardDetails = false;    
                            for(var i = this.abilifyExistingRxFiles.length - 1; i >= 0; i--){
                                if(this.abilifyExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.abilifyExistingRxFiles.splice(i, 1);
                                }
                            }
                            /*for(let i=0;i<=this.abilifyExistingRxFiles.length;i++){
                                if(this.abilifyExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.abilifyExistingRxFiles.splice(i, 1);
                                }
                            }*/
                            if(this.abilifyExistingRxFiles.length > 0){
                                this.abilifyRxCardDetails = true;
                                this.disableAbilifySubmitButton = false;
                            }else{
                                this.abilifyRxCardDetails = false;
                                this.disableAbilifySubmitButton = true;    
                            }
                            break;
                        case 'abilify asimtufii rxDocumentDetails':
                            this.abilifyAsimtufiiRxCardDetails = false;    
                            for(var i = this.abilifyAsimtufiiExistingRxFiles.length - 1; i >= 0; i--){
                                if(this.abilifyAsimtufiiExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.abilifyAsimtufiiExistingRxFiles.splice(i, 1);
                                }
                            }
                            /*for(let i=0;i<=this.abilifyExistingRxFiles.length;i++){
                                if(this.abilifyExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.abilifyExistingRxFiles.splice(i, 1);
                                }
                            }*/
                            if(this.abilifyAsimtufiiExistingRxFiles.length > 0){
                                this.abilifyAsimtufiiRxCardDetails = true;
                                this.disableAbilifyAsimtufiiSubmitButton = false;
                            }else{
                                this.abilifyAsimtufiiRxCardDetails = false;
                                this.disableAbilifyAsimtufiiSubmitButton = true;    
                            }
                            break;
                        case 'nuedexta rxDocumentDetails':
                            this.nuedextaRxCardDetails = false;    
                            for(var i = this.nuedextaExistingRxFiles.length - 1; i >= 0; i--){
                                if(this.nuedextaExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.nuedextaExistingRxFiles.splice(i, 1);
                                }
                            }
                            /*for(let i=0;i<=this.abilifyExistingRxFiles.length;i++){
                                if(this.abilifyExistingRxFiles[i].ContentDocument.Id == fileId){
                                    this.abilifyExistingRxFiles.splice(i, 1);
                                }
                            }*/
                            if(this.nuedextaExistingRxFiles.length > 0){
                                this.nuedextaRxCardDetails = true;
                                this.disableNuedextaSubmitButton = false;
                            }else{
                                this.nuedextaRxCardDetails = false;
                                this.disableNuedextaSubmitButton = true;    
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

    submitRxDocuments(){
        caseDetails({
            caseId : this.caseRecordId
        }).then(response => {
            if(response.Rx_Fax_Timestamp__c != null){
                this.showSubmitPopup = true;
            }else{
                this.sendDocuments();
            }
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });  
    }

    closeRxModel(){
        this.showSubmitPopup = false;
    }

    sendRxDetails(){
        this.sendDocuments();
    }

    sendDocuments(){
        var now = new Date();
        var utc_timestamp = now.toISOString();
        this.currentDate =  now.toLocaleString("en-US", {timeZone: "America/New_York"});
        submitDocuments({
            caseId : this.caseRecordId,
            submittedDate : utc_timestamp
        }).then(response => {
            this.showSubmitPopup = false;
            this.isRxDocumentRequired = false;
            this.updateCaseAndPrescriptions('nextStep');
        }).catch(error => {

        });
    }

    handleUploadFinished(event){
        //this.disableSubmitButton = false;
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
            if(fileType == 'ABILIFY RxDocument'){
                this.abilifyRxCardDetails = false;
                this.abilifyExistingRxFiles = [];
                this.isAbilifyDocument = true;
                this.isJynarqueDocument = false;
                this.isRexultiDocument = false;
                this.isSamscaDocument =  false;
                this.isNuedextaDocument = false;
                this.isAbilifyAsimtufiiDocument = false;
                this.isRxDocument = false;
                this.isRxDocumentRequired = false;
            }else if(fileType == 'ABILIFY ASIMTUFII RxDocument'){
                this.jynarqueRxCardDetails = false;
                this.jynarqueExistingRxFiles = [];
                this.isAbilifyDocument = false;
                this.isJynarqueDocument = false;
                this.isRexultiDocument = false;
                this.isSamscaDocument =  false;
                this.isNuedextaDocument = false;
                this.isAbilifyAsimtufiiDocument = true;
                this.isRxDocument = false;
                this.isRxDocumentRequired = false;
            }else if(fileType == 'NUEDEXTA RxDocument'){
                this.jynarqueRxCardDetails = false;
                this.jynarqueExistingRxFiles = [];
                this.isAbilifyDocument = false;
                this.isJynarqueDocument = false;
                this.isRexultiDocument = false;
                this.isSamscaDocument =  false;
                this.isNuedextaDocument = true;
                this.isAbilifyAsimtufiiDocument = false;
                this.isRxDocument = false;
                this.isRxDocumentRequired = false;
            }else if(fileType == 'JYNARQUE RxDocument'){
                this.jynarqueRxCardDetails = false;
                this.jynarqueExistingRxFiles = [];
                this.isAbilifyDocument = false;
                this.isJynarqueDocument = true;
                this.isRexultiDocument = false;
                this.isSamscaDocument =  false;
                this.isNuedextaDocument = false;
                this.isAbilifyAsimtufiiDocument = false;
                this.isRxDocument = false;
                this.isRxDocumentRequired = false;
            }else if(fileType == 'REXULTI RxDocument'){
                this.rexultiRxCardDetails = false;
                this.rexultiExistingRxFiles = [];
                this.isAbilifyDocument = false;
                this.isJynarqueDocument = false;
                this.isRexultiDocument = true;
                this.isSamscaDocument =  false;
                this.isNuedextaDocument = false;
                this.isAbilifyAsimtufiiDocument = false;
                this.isRxDocument = false;
                this.isRxDocumentRequired = false;
            }else if(fileType == 'SAMSCA RxDocument'){
                this.samscaRxCardDetails = false;
                this.samscaExistingRxFiles = [];
                this.isAbilifyDocument = false;
                this.isJynarqueDocument = false;
                this.isRexultiDocument = false;
                this.isSamscaDocument =  true;
                this.isNuedextaDocument = false;
                this.isAbilifyAsimtufiiDocument = false;
                this.isRxDocument = false;
                this.isRxDocumentRequired = false;
            }else if(fileType == 'RxDocument'){
                this.uploadExistingRxFiles = [];
                this.uploadRxCardDetails = false;
                this.isAbilifyDocument = false;
                this.isJynarqueDocument = false;
                this.isRexultiDocument = false;
                this.isSamscaDocument =  false;
                this.isNuedextaDocument = false;
                this.isAbilifyAsimtufiiDocument = false;
                this.isRxDocument = true;
                this.isRxDocumentRequired = false;
            }
            for(var i=0;i<response.length;i++){
                if(response[i].Document_Type__c == 'ABILIFY RxDocument'){
                    if(this.isAbilifyDocument == true){
                        this.abilifyExistingRxFiles.push(response[i]);    
                    }
                    this.abilifyRxCardDetails = true;
                    this.disableAbilifySubmitButton = false;
                }else if(response[i].Document_Type__c == 'ABILIFY ASIMTUFII RxDocument'){
                    if(this.isAbilifyAsimtufiiDocument == true){
                        this.abilifyAsimtufiiExistingRxFiles.push(response[i]);
                    }
                    this.abilifyAsimtufiiRxCardDetails = true;
                    this.disableAbilifyAsimtufiiSubmitButton = false;
                }else if(response[i].Document_Type__c == 'NUEDEXTA RxDocument'){
                    if(this.isNUEDEXTA == true){
                        this.nuedextaExistingRxFiles.push(response[i]);
                    }
                    this.nuedextaRxCardDetails = true;
                    this.disableNuedextaSubmitButton = false;
                }else if(response[i].Document_Type__c == 'JYNARQUE RxDocument'){
                    if(this.isJynarqueDocument == true){
                        this.jynarqueExistingRxFiles.push(response[i]);
                    }
                    this.jynarqueRxCardDetails = true;
                    this.disableJynarqueSubmitButton = false;
                }else if(response[i].Document_Type__c == 'REXULTI RxDocument'){
                    if(this.isRexultiDocument == true){
                        this.rexultiExistingRxFiles.push(response[i]);
                    }
                    this.rexultiRxCardDetails = true;
                    this.disableRexultiSubmitButton = false;
                }else if(response[i].Document_Type__c == 'SAMSCA RxDocument'){
                    if(this.isSamscaDocument == true){
                        this.samscaExistingRxFiles.push(response[i]);
                    }
                    this.samscaRxCardDetails = true;
                    this.disableSamscaSubmitButton = false;
                }else if(response[i].Document_Type__c == 'RxDocument'){
                    if(this.isRxDocument == true){
                        this.uploadExistingRxFiles.push(response[i]);
                    }
                    this.uploadRxCardDetails = true;
                    this.disableRxSubmitButton = false;
                }
            } 
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });
    }
}