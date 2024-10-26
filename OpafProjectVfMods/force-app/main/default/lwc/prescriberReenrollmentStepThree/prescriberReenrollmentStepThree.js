import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import inCommunity from '@salesforce/apex/PresciberWorkspaceLWCController.inCommunity';
import productValues from "@salesforce/apex/PresciberWorkspaceLWCController.getAllProductValues";
import contactDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getContactDetails';
import caseDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCaseData';
import accountDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getAccountData';
import prescriptionDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getPrescriptionData';
import shipmentDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getShipmentData';
import fetchPickListValue from '@salesforce/apex/PresciberWorkspaceLWCController.fetchPickListValue';
import createStepThreeData from '@salesforce/apex/PresciberWorkspaceLWCController.createStepThreeData';
import getDependentPicklistValues from '@salesforce/apex/PresciberWorkspaceLWCController.getDependentPicklistValues';
import consentDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getConsentDetails';

export default class PrescriberApplicationStepThree extends NavigationMixin(LightningElement) {
    
    salOptions = [];
    @api prescriberId;
    @api caseRecordId;
    @api accountRecordId;
    @api shipmentId;
    @api prescriptionId;
    @api patientId;
    @track prescriptionData = {'sObjectType' : 'Prescription__c'};
    @track caseData = {'sObjectType' : 'Case'};
    @track contactData = {'sObjectType' : 'Contact'};
    @track accountData = {'sObjectType' : 'Account'};
    @track shipmentData = {'sObjectType' : 'Shipment__c'};
    @track mapkeyvaluestore=[];
    @track isAbilify = false;
    @track isSAMSCA = false;
    @track isJYNARQUE = false;
    @track isLoanCare = false;
    options = [];
    stateOpts = [];
    shipStateOpts = [];
    accountStateOpts = [];
    @track icdCodes = [];
    @track cssDisplay = 'slds-hide';
    @track displaySavePopup = false;
    openSectionOne = true;
    openSectionTwo = true;
    openSectionThree = true;
    openSectionFour = true;
    shipmentType = '';
    @track isConsentReceived = false;
    @track selectedPrescriberName = '';
    @track selectedAccountName = '';
    @track records = [];
    @track isValueSelected = false;
    @track blurTimeout;
    @track error;
    searchRecords = [];
    openDropDown = false;

    connectedCallback(){
        if(this.patientRecord != undefined){
            this.consentDetails(this.patientRecord);
        }
        //alert('step 3 preb id'+this.prescriberId);
        //alert('step 3 acc id'+this.accountRecordId);
        // this.cssDisplay = 'slds-show';
        if(this.caseRecordId != undefined){
            this.caseDetails(this.caseRecordId);
        }
        if(this.prescriberId != undefined){
            this.prescriberDetails(this.prescriberId);    
        }

        if(this.accountRecordId != undefined){
            this.accountDetails(this.accountRecordId);     
        }

        if(this.prescriptionId != undefined){
            this.prescriptionDetails(this.prescriptionId);
        }

        if(this.shipmentId != undefined){
            this.shipmentDetails(this.shipmentId);
        }
        this.fetchPickListValues({'sobjectType' : 'Case'}, 'Ship_State__c');
        this.fetchPickListValues({'sobjectType' : 'Contact'}, 'State__c');
        this.fetchPickListValues({'sobjectType' : 'Account'}, 'State__c');
        //this.dependentPickListValues('Case', 'ICD_10_Diagnosis_Code__c');
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

    /*currentUserDetails(){
        currentUserDetails().then(response =>{
            this.prescriberId = response.ContactId;
            this.accountRecordId = response.AccountId;
            alert('Prescriber id -------> '+this.prescriberId);
            alert('Account id -------> '+this.accountRecordId);
        }).catch(error =>{

        });
    }*/

    @wire(productValues) getProductValues ({ error, data }) {
        if (data) {
            this.options = data;
        } else if (error) {
        }
    }

    caseDetails(recordId){
        caseDetails({
            caseId : recordId
        }).then(response => {
            this.caseData = response;
            if(response.Product__c == 'ABILIFY MAINTENA'){
                this.isAbilify = true;
                this.isJYNARQUE = false;
                this.isSAMSCA = false;
                var icd10Codes = [
                    {label: 'F20.0', value: 'F20.0'},
                    {label: 'F20.1', value: 'F20.1'},
                    {label: 'F20.2', value: 'F20.2'},
                    {label: 'F20.3', value: 'F20.3'},
                    {label: 'F20.5', value: 'F20.5'},
                    {label: 'F20.8', value: 'F20.8'},
                    {label: 'F20.9', value: 'F20.9'},
                    {label: 'F31.0', value: 'F31.0'},
                    {label: 'F31.1', value: 'F31.1'},
                    {label: 'F31.2', value: 'F31.2'},
                    {label: 'F31.3', value: 'F31.3'},
                    {label: 'F31.4', value: 'F31.4'},
                    {label: 'F31.5', value: 'F31.5'},
                    {label: 'F31.6', value: 'F31.6'},
                    {label: 'F31.7', value: 'F31.7'},
                    {label: 'F31.8', value: 'F31.8'},
                    {label: 'F31.9', value: 'F31.9'},
                ]; 
                this.icdCodes = icd10Codes; 
                this.searchRecords = icd10Codes;
            }else if(response.Product__c == 'SAMSCA'){
                this.isSAMSCA = true;
                this.isAbilify = false;
                this.isJYNARQUE = false;
                var icd10Codes = [
                    {label: 'E87.1', value: 'E87.1'},
                    {label: 'E22.2', value: 'E22.2'},
                ]; 
                this.icdCodes = icd10Codes;
                this.searchRecords = icd10Codes;
            }else if(response.Product__c == 'JYNARQUE'){
                this.isJYNARQUE = true;
                this.isSAMSCA = false;
                this.isAbilify = false;
                var icd10Codes = [
                    {label: 'N18', value: 'N18'},
                    {label: 'N18.1', value: 'N18.1'},
                    {label: 'N18.2', value: 'N18.2'},
                    {label: 'N18.3', value: 'N18.3'},
                    {label: 'N18.4', value: 'N18.4'},
                    {label: 'N18.9', value: 'N18.9'},
                    {label: 'Q61.2', value: 'Q61.2'},
                ];
                this.icdCodes = icd10Codes;
                this.searchRecords = icd10Codes;
            }else if(response.Product__c == 'REXULTI'){
                this.isJYNARQUE = false;
                this.isSAMSCA = false;
                this.isAbilify = false;
                var icd10Codes = [
                    {label: 'F32.0', value: 'F32.0'},
                    {label: 'F32.1', value: 'F32.1'},
                    {label: 'F32.2', value: 'F32.2'},
                    {label: 'F32.3', value: 'F32.3'},
                    {label: 'F32.4', value: 'F32.4'},
                    {label: 'F32.5', value: 'F32.5'},
                    {label: 'F32.8', value: 'F32.8'},
                    {label: 'F32.9', value: 'F32.9'},
                    {label: 'F33.0', value: 'F33.0'},
                    {label: 'F33.1', value: 'F33.1'},
                    {label: 'F33.2', value: 'F33.2'},
                    {label: 'F33.3', value: 'F33.3'},
                    {label: 'F33.4', value: 'F33.4'},
                    {label: 'F33.8', value: 'F33.8'},
                    {label: 'F33.9', value: 'F33.9'},
                ];
                this.icdCodes = icd10Codes;
                this.searchRecords = icd10Codes;
            }
            if(response.Ship_Type__c == 'Local Care Center'){
                this.isLoanCare = true;
                this.shipmentType = 'Local Care Center';
            }else if(response.Ship_Type__c == 'Patient'){
                this.isLoanCare = false;
                this.shipmentType = 'Patient';
            }else if(response.Ship_Type__c == 'Prescribing Provider'){
                this.isLoanCare = false;
                this.shipmentType = 'Prescribing Provider';
            }
            if(response.ICD_10_Diagnosis_Code__c == undefined){
                this.caseData.ICD_10_Diagnosis_Code__c = '';
            }
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });    
    }

    prescriberDetails(contactId){
        contactDetails({
            contactId : contactId
        }).then(response => {
            this.selectedPrescriberName = response.Name;
            this.contactData = response;
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });
    }

    accountDetails(accountId){
        accountDetails({
            accountId : accountId
        }).then(response => {
            this.selectedAccountName = response.Name;
            this.accountData = response;
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

    shipmentDetails(shipmentId){
        shipmentDetails({
            shipmentId : shipmentId
        }).then(response => {
            this.shipmentData = response;
            if(response.Shipping_Type__c == 'Local Care Center'){
                this.isLoanCare = true;
                this.shipmentType = 'Local Care Center';
            }else if(response.Shipping_Type__c == 'Patient'){
                this.isLoanCare = false;
                this.shipmentType = 'Patient';
            }else if(response.Shipping_Type__c == 'Prescribing Provider'){
                this.isLoanCare = false;
                this.shipmentType = 'Prescribing Provider';
            }
            this.cssDisplay = 'slds-hide';
        }).catch(error => {
            this.cssDisplay = 'slds-hide';
        });
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
            }else if(fieldAPIName == 'Ship_State__c'){
                this.shipStateOpts = opts;
            }
        }).catch(error => {

        });
    }

    dependentPickListValues(objectName, fieldName){
        getDependentPicklistValues({
            selectedObject : objectName,
            selectedField : fieldName
        }).then(response => {
            for(var key in response){
                if(key == this.caseData.Product__c){
                    this.mapkeyvaluestore = response[key]
                }
            }
        }).catch(error => {

        });
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

    get productoptions() {
        return this.options;
    }

    get icd10Codes(){
        //alert('Product -----> '+this.caseData.Product__c);
        
        /*for(var i=0;i<this.mapkeyvaluestore.length;i++){
            opts.push(
                {label: this.mapkeyvaluestore[i], value: this.mapkeyvaluestore[i]}
            );    
        }
        return opts;*/
            
    }

    get salutationOptions(){
        return [
            { label: 'DO', value: 'DO' },
            { label: 'MD', value: 'MD' },
            { label: 'PA', value: 'PA' },
            { label: 'NP', value: 'NP' },
            { label: 'Other', value: 'Other' },
        ];
    }

    get radioOptions(){
        if(this.caseData.Product__c == 'ABILIFY MAINTENA'){
            return [
                { label: 'Local Care Center', value: 'Local Care Center' },
                { label: 'Prescribing Provider', value: 'Prescribing Provider' },
            ];     
        }else if(this.caseData.Product__c == 'JYNARQUE'){
            return [
                { label: 'Patient', value: 'Patient' },
                { label: 'Prescribing Provider', value: 'Prescribing Provider' },
            ];
        }else if(this.caseData.Product__c == 'SAMSCA'){
            return [
                { label: 'Patient', value: 'Patient' },
                { label: 'Prescribing Provider', value: 'Prescribing Provider' },
            ];
        }else if(this.caseData.Product__c == 'REXULTI'){
            return [
                { label: 'Patient', value: 'Patient' },
                { label: 'Prescribing Provider', value: 'Prescribing Provider' },
            ];
        }  
    }

    get stateOptions(){
        return this.stateOpts;
    }

    get shipStateOpts(){
        return this.shipStateOpts;
    }

    get accountStateOptions(){
        return this.accountStateOpts;
    }

    /*fetchContactDetails(event){
        this.cssDisplay = 'slds-show';
        var selectedValue = event.target.value;
        if(selectedValue != '' && selectedValue != undefined){
            this.prescriberDetails(selectedValue); 
            this.cssDisplay = 'slds-hide';   
        }else{
            this.contactData = {'sObjectType': 'Contact'};
            this.cssDisplay = 'slds-hide';
        }
    }*/
    
    prescriberLookupRecord(event){
        this.cssDisplay = 'slds-show';
        if(event.detail.selectedRecord != undefined){
            this.prescriberId = event.detail.selectedRecord.Id;
            this.selectedPrescriberName = event.detail.selectedRecord.Name;
            this.prescriberDetails(event.detail.selectedRecord.Id); 
            this.cssDisplay = 'slds-hide';   
        }else{
            this.prescriberId = undefined;
            this.selectedPrescriberName = '';
            this.contactData = {'sObjectType': 'Contact'};
            this.cssDisplay = 'slds-hide';
        }
    }

    clearSelectedValue(){
        this.prescriberId = undefined;
        this.selectedPrescriberName = '';
        this.contactData = {'sObjectType': 'Contact'};
    }

    lookupRecord(event){
        this.cssDisplay = 'slds-show';
        if(event.detail.selectedRecord != undefined){
            this.selectedAccountName = event.detail.selectedRecord.Name;
            this.accountRecordId = event.detail.selectedRecord.Id;
            this.accountDetails(event.detail.selectedRecord.Id); 
            this.cssDisplay = 'slds-hide';   
        }else{
            this.selectedAccountName = '';
            this.accountRecordId = undefined;
            this.accountData = {'sObjectType': 'Account'};
            this.cssDisplay = 'slds-hide';
        } 
    }

    clearAccountSelectedValue(){
        this.selectedAccountName = '';
        this.accountRecordId = undefined;
        this.accountData = {'sObjectType': 'Account'}; 
    }

    caseDataTracking(event){
        this.caseData[event.currentTarget.dataset.name] = event.target.value;
        if(event.currentTarget.dataset.name == 'Product__c'){
            if(event.target.value == 'ABILIFY MAINTENA'){
                this.isAbilify = true;
                this.isJYNARQUE = false;
                this.isSAMSCA = false;
            }else if(event.target.value == 'SAMSCA'){
                this.isSAMSCA = true;
                this.isAbilify = false;
                this.isJYNARQUE = false;
            }else if(event.target.value == 'JYNARQUE'){
                this.isJYNARQUE = true;
                this.isSAMSCA = false;
                this.isAbilify = false;
            }
        }
        if(event.currentTarget.dataset.name == 'Ship_Type__c'){
            if(event.target.value == 'Local Care Center'){
                this.isLoanCare = true;
            }else{
                this.isLoanCare = false;
            }
        }
    }

    prescriptionTracking(event){
        if (event.currentTarget.dataset.name == 'REMS_Program__c' && event.target.checked) {
            this.prescriptionData[event.currentTarget.dataset.name] = true;
        }else{
            this.prescriptionData[event.currentTarget.dataset.name] = event.target.value;     
        }
    }

    contactDataTracking(event){
        this.contactData[event.currentTarget.dataset.name] = event.target.value;
    }

    accountDataTracking(event){
        this.accountData[event.currentTarget.dataset.name] = event.target.value;
    }

    shipmentTracking(event){
        this.shipmentData[event.currentTarget.dataset.name] = event.target.value;
        if(event.currentTarget.dataset.name == 'Shipping_Type__c'){
            if(event.target.value == 'Local Care Center'){
                this.isLoanCare = true;
            }else{
                this.isLoanCare = false;
            }
        }
    }

    checkNPINumber(event){
        if(event.target.value.length > 10 || event.target.value.length < 10){
            var showDiv = this.template.querySelector('[data-id="npiId"]');
            showDiv.style.display = 'block';
            showDiv.style.color = 'rgb(194, 57, 52)';  
            showDiv.style.marginBottom = '-20px';
        }else{
            var showDiv = this.template.querySelector('[data-id="npiId"]');
            showDiv.style.display = 'none';     
        }
    }

    checkDEANumber(event){
        var letters = /[a-zA-Z]{2}\d{7}/;
        if(event.target.value.match(letters)){
            var showDiv = this.template.querySelector('[data-id="deaId"]');
            showDiv.style.display = 'none';      
        }else{
            var showDiv = this.template.querySelector('[data-id="deaId"]');
            showDiv.style.display = 'block';
            showDiv.style.color = 'rgb(194, 57, 52)';  
            showDiv.style.marginBottom = '-20px';   
        }
    }

    navigateToPreviousStep(){
        const isInputsCorrect = this.checkForValidFields();
        if(isInputsCorrect){
            this.createShipments('previousStep');
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
            this.createShipments('saveAndCompleteLater');
        }else{
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Please provide the required information in all of the fields highlighted in red.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }

    navigateToStepFour(){
        const isInputsCorrect = this.checkForValidFields();
        if(this.caseData.ICD_10_Diagnosis_Code__c != ''){
            var showDiv = this.template.querySelector('[data-id="objectId"]');
            showDiv.style.display = 'none'; 
        } else{
            var showDiv = this.template.querySelector('[data-id="objectId"]');
            showDiv.style.display = 'block';
            showDiv.style.color = 'rgb(194, 57, 52)'; 
        }
        if(isInputsCorrect && this.caseData.ICD_10_Diagnosis_Code__c != ''){
            this.createShipments('nextStep');
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

    createShipments(actionType){
        this.cssDisplay = 'slds-show';
        var action = '';
        var actionStep = '';
        if(actionType == 'saveAndCompleteLater'){
            action = 'Save and Complete Later';
            actionStep = 'Prescriber Re-Enrollment Step Three';
        }else if(actionType == 'nextStep'){
            action = 'next';
            actionStep = 'Prescriber Re-Enrollment Step Four';
        }
        console.log('Prescription data ------> '+JSON.stringify(this.prescriptionData));
        createStepThreeData({
            caseRecord : JSON.stringify(this.caseData),
            prescriptionRecord : JSON.stringify(this.prescriptionData),
            prescriberRecord : JSON.stringify(this.contactData),
            accountRecord : JSON.stringify(this.accountData),
            shipmentRecord : JSON.stringify(this.shipmentData),
            actionType : action,
            step : actionStep
        }).then(response => {
            if(response.status == 'Success'){
                if(actionType == 'previousStep'){
                    const evt= new CustomEvent('previousstep', {
                        detail: {
                            isStepTwo : true,
                            isCurrentStep : '3',
                            caseRecordId : this.caseRecordId,
                            patientRecord : this.patientId,
                            accountId : response.accountId,
                            prescriberId : response.prescriberId,
                            shipmentId : response.shipmentId,
                            prescriptionId : response.prescriptionId,
                            isConsentReceived : this.isConsentReceived
                        }
                    });
                    this.dispatchEvent(evt);
                }else if(actionType == 'saveAndCompleteLater'){
                    this.displaySavePopup = true;
                }else if(actionType == 'nextStep'){
                    const evt= new CustomEvent('nextstep', {
                        detail: {
                            isStepFour : true,
                            isCurrentStep : '3',
                            caseRecordId : this.caseRecordId,
                            patientRecord : this.patientId,
                            accountId : response.accountId,
                            prescriberId : response.prescriberId,
                            shipmentId : response.shipmentId,
                            prescriptionId : response.prescriptionId,
                            isConsentReceived : this.isConsentReceived
                        }
                    });   
                    this.dispatchEvent(evt); 
                }
                this.cssDisplay = 'slds-hide';
            }else{
                this.cssDisplay = 'slds-hide';
                const evt = new ShowToastEvent({
                    title: response.status,
                    message: response.message,
                    variant: 'error',
                });
                this.dispatchEvent(evt);     
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

    get dropDown(){
        if(this.openDropDown){
            return 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open';
        }else{
            return 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        }
    }

    handleClick() {
        if(this.openDropDown){
            this.openDropDown = false;
        }else{
            this.openDropDown = true;
        }
        
    }

    onBlur() {
        this.blurTimeout = setTimeout(() =>  {
            this.openDropDown = false;
        }, 300);
    }

    onSelect(event) {
        let selectedId = event.currentTarget.dataset.id;
        let selectedName = event.currentTarget.dataset.name;
        this.caseData.ICD_10_Diagnosis_Code__c = selectedName;
        console.log('search  -----> '+this.caseData.ICD_10_Diagnosis_Code__c);
        if(this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    }

    optionClickHandler(event){
        var selectedValue = event.currentTarget.dataset.value;
        this.caseData.ICD_10_Diagnosis_Code__c = selectedValue;
        this.openDropDown = false;
    }
	
	handleKeyUp(event){
        this.caseData.ICD_10_Diagnosis_Code__c = event.target.value;
        console.log('this.searchTerm ------> '+this.caseData.ICD_10_Diagnosis_Code__c);
        var searchFilter = this.caseData.ICD_10_Diagnosis_Code__c.toUpperCase();
        var tempArray = [];
        
        for(var i=0;i<this.searchRecords.length;i++){
            console.log(this.searchRecords[i].label.toUpperCase().indexOf(searchFilter)); 

            if(this.searchRecords[i].label.toUpperCase().indexOf(searchFilter) != -1){
                console.log('true');
                tempArray.push(this.searchRecords[i]);   
            }
        }
        console.log('tempArray ----->'+JSON.stringify(tempArray));
        this.icdCodes = tempArray;
    }
}