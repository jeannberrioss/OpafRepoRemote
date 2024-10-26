import { LightningElement ,api, wire, track} from 'lwc';
import getCaseList from '@salesforce/apex/myWorkSpaceLWCController.getCaseList';
import getCasebyEnrollmentStartDate from '@salesforce/apex/myWorkSpaceLWCController.getCasebyEnrollmentStartDate';
import getShipmentList from '@salesforce/apex/myWorkSpaceLWCController.getShipmentList';
import getMissingInfo from '@salesforce/apex/myWorkSpaceLWCController.getMissingInfo';
import My_Resource from '@salesforce/resourceUrl/User_Guide';
import My_Paper_Consent from '@salesforce/resourceUrl/Paper_Consent';
import MissingInfoLabel from '@salesforce/label/c.MissingInfo';
import contactDetails from "@salesforce/apex/myWorkSpaceLWCController.getCurrentUserContact";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { CurrentPageReference } from 'lightning/navigation';
import { refreshApex } from "@salesforce/apex";

export default class MyWorkSpace extends LightningElement {
openModel = true;
openPatientConsent = false;
@track newCaseId = '';
cases;
caseData=[];
shipments;
missingInfo;
areDetailsVisible = false;
pdfDocument = My_Resource
paperConsent = My_Paper_Consent
buttonDisplayValuenewopaf = false;
buttonDisplayValueincompleteopf = false;
buttonDisplayValueReEnrollopf = false;
@track isNoCase;
label = {
    MissingInfoLabel
};
caseIdData;
OPAFAppBoolean = false;
initiativeValue = '';
stepValue = '';
prescriber = '';
ConsentStatus='';
ConsentId = '';
finishIncompleteValue = {};

@track wiredAccountList = [];

connectedCallback(){
    this.getNewCases();
}

currentPageReference = null; 
urlStateParameters = null;
checkDocu;
envelopeId='';
successEvent='';
@wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
       if (currentPageReference) {
          this.urlStateParameters = currentPageReference.state;
          this.checkDocu = this.urlStateParameters.checkDocu;
          this.successEvent = this.urlStateParameters.event;
          this.envelopeId = this.urlStateParameters.envelopeId;
          
       }
    }

refreshContactDetails;
    @wire(contactDetails) 
    wiredContacts (result) {
        this.refreshContactDetails = result;
        if (result.data) {
            if(result.data != null){
            this.ConsentStatus = result.data[0].DocusignCheck__c;
            this.ConsentId = result.data[0].Id;
            console.log('insioyde');
            if(this.successEvent == 'signing_complete' && this.consentId != '' && this.ConsentStatus == false){
                console.log('inside');
                this.openModel = false;
                this.openPatientConsent = true; 
                
              }
            }
        } else if (result.error) {
            this.informationToast(JSON.stringify(result.error.body.message));
            this.error = result.error;
        }
    }

loaded = false;
ReEnrolle = true;
parentDetails={parentCasenumber:'',parentStatus:'',parentStartDate:'',parentEndDate:'',parentEnrollmentStatus:'',parentProduct:''};
getNewCases(){
    getCaseList()
    .then((result) => {
        if(result != undefined || result != '' || result != null){
            //console.log('dsqdsq'+result[0].Id);
            this.cases = result;
            
                    this.caseData = result;
                    if(this.caseData != null) {
                        let caseParent = this.cases[0].ParentId;
                        this.ReEnrolle = caseParent != null ? this.cases[0].Enrollment_Status__c != 'Enrolled'? true : false : false;
                        this.parentDetails.parentCasenumber = caseParent != null ? this.cases[0].Enrollment_Status__c != 'Enrolled' ? this.cases[0].Parent.CaseNumber : this.cases[0].CaseNumber : this.cases[0].CaseNumber;
                        this.parentDetails.parentStatus = caseParent != null ? this.cases[0].Enrollment_Status__c != 'Enrolled'? this.cases[0].Parent.Status : this.cases[0].Status : this.cases[0].Status;
                        this.parentDetails.parentStartDate = caseParent != null ? this.cases[0].Enrollment_Status__c != 'Enrolled'? this.cases[0].Parent.Enrollment_Start_Date__c : this.cases[0].Enrollment_Start_Date__c : this.cases[0].Enrollment_Start_Date__c;
                        this.parentDetails.parentEndDate = caseParent != null ? this.cases[0].Enrollment_Status__c != 'Enrolled'? this.cases[0].Parent.Enrollment_End_Date__c : this.cases[0].Enrollment_End_Date__c : this.cases[0].Enrollment_End_Date__c;
                        this.parentDetails.parentEnrollmentStatus = caseParent != null ? this.cases[0].Enrollment_Status__c != 'Enrolled'? this.cases[0].Parent.Enrollment_Status__c : this.cases[0].Enrollment_Status__c : this.cases[0].Enrollment_Status__c;
                        this.parentDetails.parentProduct = caseParent != null ? this.cases[0].Enrollment_Status__c != 'Enrolled'? this.cases[0].Parent.Product__c : this.cases[0].Product__c : this.cases[0].Product__c;
                        
                        this.caseIdData = result[0].Id;
                        this.stepValue = result[0].Saved_Location__c;
                    }
                    this.isNoCase = false;
                   // this.buttonDisplayValuenewopaf = false;
            }
            if(result == null){
                console.log('dsqdsq'+result);
                this.isNoCase = true;
                this.buttonDisplayValuenewopaf = true;
            }
            this.loaded = false;

    })
    .catch((error) => {
        this.loaded = false;
        this.informationToast(JSON.stringify(error.body.message.split(',')[1]));
        this.error = error ;
    });
}   

    @wire(getShipmentList, {caseIdData:'$caseIdData'}) getShipmentRecords ({ error, data }) {
        if (data) {
            if(data != '' || data != null || data != undefined){
                this.shipments = data;
            }
        } else if (error) {
            this.informationToast(JSON.stringify(error.body.message));
            this.error = error;
        }
    }
    
    @wire(getMissingInfo, {caseIdData:'$caseIdData'}) getMissingInfoFields ({ error, data }) {
        
        if (data) {
            this.missingInfo = data;
            this.areDetailsVisible = true; 
        } else if (error) {
            this.informationToast(JSON.stringify(error.body.message));
            this.error = error;
        }
    }

    refreshCaseEnrollmentStartDate;
    @wire(getCasebyEnrollmentStartDate, {caseIdData:'$caseIdData'})
     getCasebyEnrollmentStart (result) {
        this.refreshCaseEnrollmentStartDate = result;
        if (result.data) {
            console.log('sadsac'+result.data);
             if(result.data == 'newopaf') {
                this.buttonDisplayValuenewopaf = true;
                this.buttonDisplayValueincompleteopf = false;
                this.buttonDisplayValueReEnrollopf = false;
             }
             else if(result.data == 'reEnroll') {
                this.buttonDisplayValueincompleteopf = false;
                this.buttonDisplayValuenewopaf = false;
                this.buttonDisplayValueReEnrollopf = true;
             }
             else if(result.data == 'incompleteopf') {
                this.buttonDisplayValueincompleteopf = true;
                this.buttonDisplayValuenewopaf = false;
                this.buttonDisplayValueReEnrollopf = false;
             }
        } else if (result.error) {
            this.error = result.error;
            this.informationToast(JSON.stringify(result.error.body.message));
        }
    }

    informationToast(title) {
        const toastEvent = new ShowToastEvent({
          title,
          variant: "ERROR",
          duration:'500'
        });
        this.dispatchEvent(toastEvent);
      }

    handleOnHide(event) {
        if(event.currentTarget.dataset.name =='InitiateNewOPAFButton' || event.currentTarget.dataset.name =='ReEnroll') {
            this.initiativeValue = event.currentTarget.dataset.name;   
            this.openModel = false;
            this.openPatientConsent = true;         
        }
        else if(event.currentTarget.dataset.name =='finishIncompleteButton') {
            this.newCaseId = this.caseIdData;
            this.prescriber = this.cases[0].Prescriber__c;
            this.initiativeValue = event.currentTarget.dataset.name;
            this.openModel = false;
            this.OPAFAppBoolean = true;
        }
    }

    handleCustomEvent(event){
        if(event.detail.closeScreen1 == true) {
            this.openModel = true;
            this.openPatientConsent =  false;
        }
        else if(event.detail.openScreen2 == true) {
            this.openPatientConsent =  false;
            this.OPAFAppBoolean = true;
        }
        this.scrollToTop();
    }

  handleCustomEvent2(event){
    if(event.detail.closeScreen2 == true) {
        this.scrollToTop();
        this.loaded = true;
        this.openModel = true;
        this.OPAFAppBoolean =  false;
        setTimeout(() => {
            this.getNewCases();
           
        },2000)
        window.location.reload();
    }
  }

  scrollToTop(){
    let scrollTopElement = this.template.querySelector('.pageTop');
    scrollTopElement.scrollIntoView();
  }
  
}