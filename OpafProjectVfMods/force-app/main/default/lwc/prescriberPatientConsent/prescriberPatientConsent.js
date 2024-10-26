import { LightningElement,track,api,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import inCommunity from '@salesforce/apex/PresciberWorkspaceLWCController.inCommunity';
import updateDocConsent1 from "@salesforce/apex/PrescriberPatientConsentController.updateConsent1";
import contactDetails from '@salesforce/apex/PrescriberPatientConsentController.getContactDetails';
import prescriberDetails from "@salesforce/apex/PrescriberPatientConsentController.getCurrentUserContact";
import updateContactWithConsent from "@salesforce/apex/PrescriberPatientConsentController.updateNewContact";
import allDocuments from "@salesforce/apex/PrescriberPatientConsentController.getAllDocuments";
import deleteDocuments from "@salesforce/apex/PrescriberPatientConsentController.deleteFile";
import docusignGenaration from "@salesforce/apex/DS_OPAFController.sendPatientConsent";
import emaildocusignGenaration from "@salesforce/apex/DS_OPAFController.sendPatientEnvelope";
import { refreshApex } from "@salesforce/apex";
import { CurrentPageReference } from 'lightning/navigation';
import errorMessage from '@salesforce/label/c.Patient_Age_Less_Than_18_Years';

var fileName = [];
export default class PrescriberPatientConsent extends NavigationMixin(LightningElement) {
    eConsent = true;
    @track contactData = {'sObjectType': 'Contact'};
    @api patientRecord;
    //patient Id From prescriberApplicationStepOne 
    @api patientRecordId;
    @track cssDisplay = 'slds-hide';
    @track section = true;
    firstPage = true;
    secondPage = false;
    legalRep = '';
    openLegalRepresentative = false;
    consentType;
    consentId = '';
    disableOnline = true;
    eConsentConfirm = false;
    paperConfirm = false;
    onSiteDocusign = false;
    onSiteConfirm = false;
    secondPageButton='';
    pdfPaperConsent = false;
    loaded = false;
    selectedPatientName = '';
    isConsentNotSent = true;
    envelopeId='';
    successEvent='';
    @wire(CurrentPageReference)
    currentPageReference;

    connectedCallback(){
        
          this.patientRecordId = this.currentPageReference.state.patientId;
          this.successEvent = this.currentPageReference.state.event;
          this.envelopeId = this.currentPageReference.state.envelopeId;
         
          if(this.successEvent == 'signing_complete'){
            updateDocConsent1({patientId:this.patientRecordId, envelopeId:this.envelopeId})
            .then((result) => {  
                
                this.loaded=false;
            })
            .catch((error) => {
                this.loaded=false;
                console.log('docusignGenaration::'+JSON.stringify(error));
            });
            this.firstPage = false;
            this.onSiteDocusign = true;
          } else {
            if(this.patientRecordId != undefined){
                this.patientDetails(this.patientRecordId);
            }
        }  
    }

    contactDetail;
    getPrescriberData;
    refreshPrescriberDetails;
    @wire(prescriberDetails) 
    wiredContacts (result) {
        this.refreshPrescriberDetails = result;
        if (result.data) {
            this.prescriberContactDetail = result.data;
            this.getPrescriberData=Object.assign({'sobjectType': 'Contact'}, this.prescriberContactDetail);

        } else if (result.error) {
            console.log('cdcdd'+JSON.stringify(result.error));
            this.error = result.error;
        }
    }
    
    handleRadioChange(event){
        console.log('wfddwd'+event.target.value);
        switch(event.target.value){
            case 'Email':
                this.disableOnline = false;
               
                this.consentType = event.target.value;
                this.secondPageButton ='SEND eCONSENT EMAIL TO PATIENT';
            break;
            case 'Paper':
                this.disableOnline = false;
                this.consentType = event.target.value;
                this.secondPageButton ='NEXT'
            break;
            case 'Onsite':
                this.disableOnline = false;
                this.consentType = event.target.value;
                this.secondPageButton ='NEXT'
            break;
        }
    }

    documentDetails = [];
    patientsignedconsent = [];

    refreshAllDocuments;
    @wire(allDocuments,{recordId:'$consentId'}) 
    wiredDocuments (result) {
        this.refreshAllDocuments = result;
        if (result.data) {
            this.documentDetails = result.data;
            this.patientsignedconsent = Object.assign([], this.documentDetails['patient signed consent']);
        } else if (result.error) {
            this.error = result.error;
        }
    }

    get patientsignedconsentChecking(){
        return this.patientsignedconsent == '' ? false : true;
    }

    clearSelectedValue(){
        this.patientRecordId = undefined;
        this.selectedPatientName = '';
        this.contactData = {'sObjectType': 'Contact'};
    }

    deleteUploadedFile(event){
        let fileId = event.target.name;
        this.loaded = true;
        console.log('sdsssssssssssss'+fileId);
        deleteDocuments({documentId:fileId})
            .then((result) => {
            
                for(let i=0;i<=this.patientsignedconsent.length;i++){
                    if(this.patientsignedconsent[i].ContentDocument.Id == fileId){
                        this.patientsignedconsent.splice(i, 1);
                    }
                }
                
                this.loaded = false;
            })
            .catch((error) => {
                this.loaded = false;
                console.log('asdqsd'+JSON.stringify(error));
            });

    }


    newOrUpdatePatient(fileDataDetails, consentTypes, methodChecking, contactUpdateChecking){
        console.log('ccocooc'+consentTypes,this.contactData);

        return updateContactWithConsent({contactDetails:JSON.stringify(this.contactData),
            prescriberId : this.getPrescriberData?.Id || null,
            methodCheck : methodChecking,
            contactUpdate : contactUpdateChecking,
            consentType: consentTypes,
            fileDatas:fileDataDetails})
        .then((result) => {
            this.loaded = false;
            this.patientRecordId = result.contact.Id;
            this.contactData = result.contact;
            this.fileData = [];
            fileName = [];
            if(result.consent.EnvelopeId__c != undefined && 
                (result.consent.Status__c != undefined || result.consent.Status__c == 'Sent'
                    || result.consent.Status__c == 'signing_complete' || result.consent.Status__c == 'Received'
                    || result.consent.Status__c == 'Complete')){
                this.isConsentNotSent = false;  
            }else{
                this.isConsentNotSent = true;    
            }
            return 'success';
        })
        .catch((error) => {
            this.loaded = false;
            console.log('cdecd'+JSON.stringify(error)); 
        });
    }

    controlScreens(eConsentConfirmScreen, paperConfirmScreen, onSiteDocusignScreen, onSiteConfirmScreen) {
        this.eConsentConfirm = eConsentConfirmScreen; 
        this.paperConfirm = paperConfirmScreen;
        this.onSiteDocusign = onSiteDocusignScreen;
        this.onSiteConfirm  = onSiteConfirmScreen;
    }

    @track fileData =[];
    @track names ='';
    Docusign;
    async handleClicks(event){
        console.log('rcddcd'+event.currentTarget.dataset.name);
        switch(event.currentTarget.dataset.name){
            case 'NEXTFIRST':           
                this.secondPage = true;
                this.firstPage = false;
                if(this.consentType == 'Paper') {
                    this.pdfPaperConsent = true;
                }  
                this.scrollToTop();             
                
            break;

            case 'NEXTSECOND':
                const allValid = [...this.template.querySelectorAll(`.${event.currentTarget.dataset.name}`)]
                .reduce((validSoFar, inputCmp) => {
                    inputCmp.reportValidity();
                    return validSoFar && inputCmp.checkValidity();
                }, true);
                if (allValid) { 
                    if(this.getAge(this.contactData.Birthdate) >= 18){
                        this.fileData = fileName;               
                        this.secondPage = false;
                        this.firstPage = false;
                        this.loaded = true;
                        console.log('aaa'+this.consentType);
                        switch(this.consentType){ 
                            case 'Email':
                                const emailContact = await this.newOrUpdatePatient('', this.consentType,true,true);
                                this.controlScreens(true,false,false,false);
                                /*if(emailContact == 'success') {
                                    if(this.isConsentNotSent){
                                        emaildocusignGenaration({mySourceId:this.contactData.Id})
                                        .then((result) => {
                                            
                                        // refreshApex(this.refreshContactDetails);
                                            })
                                        .catch((error) => {
                                            
                                        });
                                    }
                                }*/
                            break;

                            case 'Paper':
                                await this.newOrUpdatePatient(this.fileData, this.consentType,true,true);
                                

                                this.controlScreens(false,true,false,false);
                                //this.consentType = '';
                            // this.consentId = '';
                            
                            break;

                            case 'Onsite':
                                const messag = await this.newOrUpdatePatient('', '',false,true);
                                
                                console.log('docusignGenaration::'+messag+'csc'+this.consentStatus);
                                console.log('docusignGenaration::'+JSON.stringify(this.contactData.Id));
                                if(messag == 'success') {
                                    console.log('docusignGenaration::1'+messag);
                                    if(this.consentStatus != 'Received'){
                                        this.showInfo('Please Wait while Docusign Opens');
                                        console.log('docusignGenaration::'+messag);
                                docusignGenaration({patientId:this.contactData.Id, returnComponent:'Prescriber'})
                                .then((result) => {  
                                    this.Docusign = result;
                                    console.log('docusignGenaration::'+JSON.stringify(this.Docusign));
                                    if(this.Docusign != '' && this.Docusign != null) {
                                        window.open(this.Docusign,'_Self');
                                    }
        
                                // refreshApex(this.refreshContactDetails);
                                    })
                                .catch((error) => {
                                    console.log('docusignGenaration::'+JSON.stringify(error));
                                });
                                this.controlScreens(false,false,false,false);
                            } else {
                                console.log('docusignGenaration::'+messag);
                                this.controlScreens(false,false,true,false);
                            }
                            }
                            
                            break;

                        }
                        this.scrollToTop();
                    }else{
                        const evt = new ShowToastEvent({
                            title: 'Error',
                            message: errorMessage,
                            variant: 'error',
                        });
                        this.dispatchEvent(evt);
                    }
                                 
                } else {
                    this.informationToast('Please provide the required information in all of the fields highlighted in red');
                }
                break;
            case 'NEXTTHIRD':
                await this.newOrUpdatePatient('', this.consentType,true,true);
                this.controlScreens(false,false,false,true);
                this.scrollToTop(); 

            break;
            case 'PREVIOUSThird':
                this.secondPage = true;
                this.controlScreens(false,false,false,false);
                this.scrollToTop(); 

            break;

        }
    }
    downloadConsent(){
        let urlString = window.location.href;
        let baseURL = urlString.substring(0, urlString.indexOf("/s"));
        var today = new Date();
        var date = (today.getMonth()+1) +'/'+today.getDate()+'/'+ today.getFullYear();
        let legalFullName='';
        if(this.contactData.Legal_Rep_First_Name__c) legalFullName = this.contactData.Legal_Rep_First_Name__c;
        if(this.contactData.Legal_Rep_Last_Name__c) legalFullName = legalFullName + ' '+this.contactData.Legal_Rep_Last_Name__c;
         this[NavigationMixin.Navigate]({
            type : 'standard__webPage',
            attributes: {
                url : baseURL+'/apex/PaperConsentForm?pName='+this.contactData.FirstName+' '+this.contactData.LastName+'&&pDOB='+this.contactData.Birthdate.replace(/(\d{4})\-(\d\d)\-(\d\d)/, "$2/$3/$1")+'&&lName='+legalFullName+'&&cDate='+date
            }
        });
     }
    get options() {
        return [
            { label: 'eConsent via DocuSign Email - Your patient will receive a link via email to provide eConsent and will have ten business days to complete', value: 'Email' },
            { label: 'On-site Patient eConsent - You are certifying that your patient is on-site with you and can provide their eConsent immediately', value: 'Onsite' },
            { label: 'Patient Paper Consent - You can download, print, sign, and upload the “Patient Assistance Foundation - Patient Consent” form to move forward with the OPAF Application process', value:'Paper'}
        ];
    }
    patientLookupRecord(event){
        this.cssDisplay = 'slds-show';
        /*if(event.detail.selectedRecord != undefined){
            this.consentId = '';
            this.patientDetails(event.detail.selectedRecord.Id); 
            this.cssDisplay = 'slds-hide';   
        }else{
            this.contactData = {'sObjectType': 'Contact'};
            this.cssDisplay = 'slds-hide';
        }*/
        if(event.detail.selectedRecord != undefined){
            this.patientRecordId = event.detail.selectedRecord.Id;
            this.selectedPatientName = event.detail.selectedRecord.Name;
            this.patientDetails(event.detail.selectedRecord.Id); 
            this.cssDisplay = 'slds-hide';   
        }else{
            this.patientRecordId = undefined;
            this.selectedPatientName = '';
            this.contactData = {'sObjectType': 'Contact'};
            this.cssDisplay = 'slds-hide';
        }
    }
    consentStatus='';
    patientDetails(contactId){
        this.cssDisplay = 'slds-show';
        contactDetails({
            contactId : contactId
        }).then(response => {
            this.contactData = response;
            this.selectedPatientName = response.Name;
            if(this.contactData.Legal_RepRelTypec__c == 'Other (please specify)'){

                this.openOtherRelationship=true;
            } 
            if(this.contactData.Legal_Rep__c == true){
                this.openLegalRepresentative=true;
            }
            console.log('sdfg'+JSON.stringify(this.contactData));
            console.log('sdfg'+JSON.stringify(this.contactData.Consent1__r[0].Status__c));
            this.consentStatus = this.contactData.Consent1__r[0].Status__c;
            this.consentId = this.contactData.Consent1__r[0].Id;
           refreshApex(this.refreshAllDocuments);
           // this.disableOnline =  this.consentType == undefined?true:false;
            this.cssDisplay = 'slds-hide';
        }).catch(error => {

        });
    }
    get sectionClass(){
        return this.section ? 'slds-section slds-is-open' : 'slds-section';
    }
    get legalRepresentativeoptions() {
        return [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
        ];
    }


    openOtherRelationship=false;
    contactFieldsChange(event){
        console.log('rcfrc'+event.currentTarget.dataset.name);
        if(event.currentTarget.dataset.name == 'Legal_RepRelTypec__c' && event.target.value == 'Other (please specify)'){

            this.openOtherRelationship=true;
        } else if(event.currentTarget.dataset.name == 'Legal_RepRelTypec__c' && event.target.value != 'Other (please specify)') {
            this.openOtherRelationship=false;
        }
        this.contactData[event.currentTarget.dataset.name] = event.target.value; 
    }
    handleLegalRadioChange(event){
        console.log('dsdq'+event.target.value);
        switch(event.target.value){
            case 'true':
                console.log('dsdq'+event.target.value);
                this.openLegalRepresentative = true;
                
            break;
            case 'false':
                console.log('dsdq'+event.target.value);
                this.openLegalRepresentative = false;

            break;
        }
        this.contactData[event.currentTarget.dataset.name] = event.target.value;
        console.log('rdcdc'+JSON.stringify(this.contactData));
    }
    get legalRepresentativePickListoptions() {
        return [
            { label: 'Spouse', value: 'Spouse' },
            { label: 'Adult Child', value: 'Adult Child' },
            { label: 'Parent', value: 'Parent' },
            { label: 'Adult Sibling', value: 'Adult Sibling' },
            { label: 'Other (Please specify)', value: 'Other (please specify)' }
        ];
    }
    navigateToHomePage(){
        inCommunity().then(response => {
            refreshApex(this.refreshAllDocuments);
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

    navigateToPROCEED(){
        //window.open('https://partial-opaf.cs201.force.com/Prescriber/s/prescriberapplication?patientId='+this.patientRecordId,'_self');
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: 'prescriberapplication'
            },
            state: {
                'patientId': this.patientRecordId
            }
        });
    }


    openfileUpload(event) {
        console.log('event.target.files'+JSON.stringify(event.target.files));
        let files = event.target.files;
        const typeName = event.currentTarget.dataset.name;
             
        for (let i = 0; i < files.length; i++) {   
          let file = files[i];
          let fileType = file.type;
          console.log('event.target.files'+file.type);
          if(fileType == 'image/png' || fileType == 'image/jpg' || fileType == 'application/pdf') {
    
          if(this.names == ''){
            this.names = file.name;
          }
          else{
            this.names = this.names +','+file.name ;
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
    } else  {
        this.informationToast(`Please select a PDF, JPG, or PNG fileType for this file ${file.name}.`)
    }
       } 
    }

    scrollToTop(){
        let scrollTopElement = this.template.querySelector('.pageTop');
        scrollTopElement.scrollIntoView();
    }

    informationToast(title) {
        const toastEvent = new ShowToastEvent({
          title,
          variant: "ERROR",
          duration:'500'
        });
        this.dispatchEvent(toastEvent);
    } 

    showInfo(title) {
        const evt = new ShowToastEvent({
            title,
            variant: 'info',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt); 
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