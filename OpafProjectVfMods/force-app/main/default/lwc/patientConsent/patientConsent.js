import { LightningElement, api, wire, track } from 'lwc';
import My_Resource from '@salesforce/resourceUrl/User_Guide';
import My_Paper_Consent from '@salesforce/resourceUrl/Paper_Consent';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from "@salesforce/apex";

import contactDetails from "@salesforce/apex/PatientConsentController.getCurrentUserContact";
import updateContactWithConsent from "@salesforce/apex/PatientConsentController.updateContact";
import updateDocConsent1 from "@salesforce/apex/PatientConsentController.updateConsent1";

import allDocuments from "@salesforce/apex/OPAFApplicationFormController.getAllDocuments";
import deleteDocuments from "@salesforce/apex/OPAFApplicationFormController.deleteFile";

import docusignGenaration from "@salesforce/apex/DS_OPAFController.sendPatientConsent";
import errorMessage from '@salesforce/label/c.Patient_Age_Less_Than_18_Years';

var fileName = [];
export default class PatientConsent extends NavigationMixin(LightningElement) {
    consentType = '';
    legalRep = '';
    model1 = true;
    model2 = false;
    model3 = false;
    openLegalRepresentative = false;
    pdfDocument = My_Resource;
    paperConsent = My_Paper_Consent;
    pdfAndUploadSectionForPatientPaperConsent = false;
    disableOnline = true;
    getData;
    contactDetail; 
    consentId = '';
    loaded = false;
    consentStatus='';

    @api initiativeValue = '';
    @api finishValue = '';
    @api checking = '';
    @api envelopeId = '';
    
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
            this.informationToast(JSON.stringify(result.error.body.message));
            this.error = result.error;
        }
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

    deleteUploadedFile(event) {
        let fileId = event.target.name;
        this.loaded = true;
        deleteDocuments({recordId:fileId})
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
                this.informationToast(JSON.stringify(error.body.message.split(',')[1]));
        });
    }

    get patientsignedconsentChecking(){
        return this.patientsignedconsent == '' ? false : true;
    }

    refreshContactDetails;
    DocuStatus = '';
    @wire(contactDetails) 
    wiredContacts (result) {
        
        this.refreshContactDetails = result;
        if (result.data) {
            //this.loaded=true;
            this.contactDetail = result.data;
            this.getData=Object.assign({'sobjectType': 'Contact'}, this.contactDetail);
            this.consentStatus = this.getData.Consent1__r[0].DocusignCheck__c;
            this.consentType = this.getData.Consent1__r[0].Type__c;
            this.DocuStatus = this.getData.Consent1__r[0].Status__c;
            this.consentId = this.getData.Consent1__r[0].Id;
            
                this.disableOnline =  this.consentType == undefined?true:false;
                this.legalRep = this.getData.Legal_Rep__c.toString();

                if (this.getData.Legal_RepRelTypec__c == 'Other (please specify)') {
                    this.openOtherRelationship=true;
                } 

                if (this.legalRep == 'true') {
                    this.openLegalRepresentative=true;
                }

                if (this.consentType == 'Paper Consent') {
                    this.pdfAndUploadSectionForPatientPaperConsent = true;
                }
                console.log('addcaxcadc'+this.consentStatus); 
                if (this.checking =="signing_complete" && this.consentStatus == false) { 
                    console.log('addcaxcadc'+this.DocuStatus); 
                    if(this.DocuStatus != 'Received') {                 
                        updateDocConsent1({ConsentId:this.consentId, envelopeId:this.envelopeId})
                        .then((result) => {  
                            this.loaded=false;
                        })
                        .catch((error) => {
                            this.loaded=false;
                            this.informationToast(JSON.stringify(error.body.message.split(',')[1]));
                        });
                    }
                            this.model1=false;
                            this.model3=true
                            this.loaded=false;
                }
                this.loaded=false;
        } else if (result.error) {
            this.informationToast(JSON.stringify(result.error.body.message));
            this.error = result.error;
        }
    }

    @api casedata = [];
    get options() {
        return [
            { label: 'Online Patient eConsent - You  can sign the eConsent immediately to move forward with the OPAF Application process', value: 'eConsent' },
            { label: 'Patient Paper Consent - You can download, print, sign, and upload the “Patient Assistance Foundation – Patient Consent” form to move forward with the OPAF Application process', value: 'Paper Consent' },
        ];
    }

    get legalRepresentativeoptions() {
        return [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
        ];
    }

    openOtherRelationship=false;
    fieldTracking(event) {
        if (event.currentTarget.dataset.name == 'Legal_RepRelTypec__c' && event.target.value == 'Other (please specify)') {
            this.openOtherRelationship=true;
        } else if (event.currentTarget.dataset.name == 'Legal_RepRelTypec__c' && event.target.value != 'Other (please specify)') {
            this.openOtherRelationship=false;
        }
        this.getData[event.currentTarget.dataset.name] = event.target.value;
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

    handleRadioChange(event) {
        switch(event.target.value) {
            case 'eConsent':
                this.pdfAndUploadSectionForPatientPaperConsent = false;
                this.disableOnline = false;
                this.consentType = event.target.value;
            break;
            case 'Paper Consent':
                this.pdfAndUploadSectionForPatientPaperConsent = true;
                this.disableOnline = false;
                this.consentType = event.target.value;
            break;
        }
       
    }

    handleLegalRadioChange(event) {
        switch(event.target.value) {
            case 'true':
                this.openLegalRepresentative = true;
                
            break;
            case 'false':
                this.openLegalRepresentative = false;

            break;
        }
        this.getData[event.currentTarget.dataset.name] = event.target.value;
    }

    @track fileData =[];
    @track names ='';

    openfileUpload(event) {
        let files = event.target.files;
        const typeName = event.currentTarget.dataset.name;
             
        for (let i = 0; i < files.length; i++) {   
            let file = files[i];
            let fileType = file.type;
            
            if (fileType == 'image/png' || fileType == 'image/jpg' || fileType == 'application/pdf') {
        
            if (this.names == '') {
                this.names = file.name;
            } else {
                this.names = this.names +','+file.name ;
            }
            this.disableSave = this.names ? false : true;
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

    Docusign;
    downloadConsent(){
        let urlString = window.location.href;
        let baseURL = urlString.substring(0, urlString.indexOf("/s"));
        var today = new Date();
        var date = (today.getMonth()+1) +'/'+today.getDate()+'/'+ today.getFullYear();
        var dob;
        let legalFullName='';
        if(this.getData.Legal_Rep_First_Name__c) legalFullName = this.getData.Legal_Rep_First_Name__c;
        if(this.getData.Legal_Rep_Last_Name__c) legalFullName = legalFullName + ' '+this.getData.Legal_Rep_Last_Name__c;
        if(this.getData.Birthdate!=undefined)
            dob = this.getData.Birthdate.replace(/(\d{4})\-(\d\d)\-(\d\d)/, "$2/$3/$1");
        
         this[NavigationMixin.Navigate]({
            type : 'standard__webPage',
            attributes: {
                url : baseURL+'/apex/PaperConsentForm?pName='+this.getData.FirstName+' '+this.getData.LastName+'&&pDOB='+dob+'&&lName='+legalFullName+'&&cDate='+date
            }
        });
     }
     refresh(){
        return refreshApex(this.refreshContactDetails);
     }

     async handleClicks(event) {
        this.scrollToTop();

        switch(event.currentTarget.dataset.name){           
            case 'redirectiontoOPAFAllicationBoolean':
                    this.refresh();
                    const selectOPAFApplicationEvent = new CustomEvent('mycustomevent', {
                        detail: {
                            closeScreen1: false,
                            openScreen2: true
                        } 
                    });
                    this.dispatchEvent(selectOPAFApplicationEvent);                                  
            break; 

            case 'CANCEL':
                this.loaded = true;
                const selectEvent = new CustomEvent('mycustomevent', {
                    detail: {
                        closeScreen1: true,
                        openScreen2: false
                    } 
                });
                this.dispatchEvent(selectEvent);
            break;

            case 'NEXTONLINE':
                this.loaded = true;
                updateContactWithConsent({contactDetails:JSON.stringify(this.getData),
                    consentType: this.consentType,
                    fileDatas:''})
                .then((result) => {
                    this.model1 = false;
                    this.model2 = true; 
                    this.loaded = false;
                })
                .catch((error) => {
                    this.loaded = false;
                    this.informationToast(JSON.stringify(error.body.message.split(',')[1]));
                });
                              
            break; 

            case 'NEXTMODEL3':
                const allValid = [...this.template.querySelectorAll(`.${event.currentTarget.dataset.name}`)]
                .reduce((validSoFar, inputCmp) => {
                    inputCmp.reportValidity();
                    return validSoFar && inputCmp.checkValidity();
                }, true);
                if (allValid) {
                    if(this.getAge(this.getData.Birthdate) >= 18){
                        this.model2 = false;
                        this.loaded = true;
                        this.fileData = fileName;
                       
                        updateContactWithConsent({contactDetails:JSON.stringify(this.getData),
                                                consentType: this.consentType,
                                                fileDatas:this.fileData})
                        .then((result) => {
                            this.fileData = [];
                            fileName = [];

                        if ( this.consentType != 'Paper Consent') {
                            
                            if (this.DocuStatus != 'Received') {
                                this.showInfo('Please Wait while Docusign Opens');
                                docusignGenaration({patientId:this.getData.Id, returnComponent:'Patient'})
                                .then((result) => {  
                                    this.Docusign = result+'&ConsentId='+this.consentId;
                                    
                                    if(this.Docusign != '' && this.Docusign != null) {
                                        window.open(this.Docusign,'_Self');
                                    }
        
                                    refreshApex(this.refreshContactDetails);
                                    })
                                .catch((error) => {
                                    console.log('docusignGenaration::'+JSON.stringify(error));
                                });
                            } else {
                                this.loaded = false;
                                this.model3 = true;
                            }
                        } else {
                            refreshApex(this.refreshContactDetails);
                            const selectOPAFApplicationEvent = new CustomEvent('mycustomevent', {
                                detail: {
                                    closeScreen1: false,
                                    openScreen2: true
                                } 
                            });
                            this.dispatchEvent(selectOPAFApplicationEvent);                       
                        }

                        })
                        .catch((error) => {
                            this.loaded = false;
                            this.informationToast(JSON.stringify(error.body.message.split(',')[1]));
                        });
                        this.scrollToTop();
                   }else{
                        const evt = new ShowToastEvent({
                            title: 'Error',
                            message: errorMessage,
                            variant: 'error',
                        });
                        this.dispatchEvent(evt);
                    }
                   
                }
                else {
                    this.informationToast('Please provide the required information in all of the fields highlighted in red');
                }
            break;
            
        }
        refreshApex(this.refreshContactDetails);
        refreshApex(this.refreshAllDocuments);
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