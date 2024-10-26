import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getApplications from '@salesforce/apex/PresciberWorkspaceLWCController.getApplications'; 
import inCommunity from '@salesforce/apex/PresciberWorkspaceLWCController.inCommunity';
import My_Resource from '@salesforce/resourceUrl/User_Guide';
import My_Paper_Consent from '@salesforce/resourceUrl/Paper_Consent';
import { refreshApex } from '@salesforce/apex';

export default class OpafPrescriberWorkspace extends NavigationMixin(LightningElement) {
    @track lastSevenApplications;
    wiredRecords;
    pdfDocument = My_Resource;
    paperConsent = My_Paper_Consent;

    connectedCallback(){
        this.refresh();
    }

    @wire(getApplications)
    applicationsList(result) {
        this.wiredRecords = result;
        if (result.data) {
            this.lastSevenApplications = result.data;
        }else if(result.error){
            this.lastSevenApplications = [];
        }
    }

    refresh(){
        refreshApex(this.wiredRecords);
    }

    getApplications(){
        getApplications().then(response => {
            this.lastSevenApplications = response;
        }).catch(error => {
            console.log(error);
        });
    }

    doView(event){ 
        event.preventDefault();
        var recordId = event.currentTarget.dataset.record;
        var applicationType = event.currentTarget.dataset.id;
        var communityPage;
        if(applicationType == 'New Enrollment'){
            communityPage = 'prescriberapplication';
        }else if(applicationType == 'Re-Enrollment'){
            communityPage = 're-enrollment-application';
        }
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: communityPage
            },
            state: {
                caseId : recordId
            }
        });
    }

    handleNavigate() {
        inCommunity().then(response => {
            if(response == true){
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: 'prescriberapplication'
                    }
                });
            }else{
                var compDefinition = {
                    componentDef: "c:prescriberApplicationForm",
                    attributes: {
                        
                    }
                };
                // Base64 encode the compDefinition JS object
                var encodedCompDef = btoa(JSON.stringify(compDefinition));
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/one/one.app#' + encodedCompDef
                    }
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }
    handleNavigateConsent() {
        inCommunity().then(response => {
            if(response == true){
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: 'patientconsent'
                    }
                });
            }else{
                var compDefinition = {
                    componentDef: "c:prescriberPatientConsent",
                    attributes: {
                        
                    }
                };
                // Base64 encode the compDefinition JS object
                var encodedCompDef = btoa(JSON.stringify(compDefinition));
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/one/one.app#' + encodedCompDef
                    }
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }
    handleNavigateCheckStatus() {
        console.log('incomplete');
        inCommunity().then(response => {
            if(response == true){
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: 'opaf-application'
                    }
                });
            }else{
                var compDefinition = {
                    componentDef: "c:prescriberPatientConsent",
                    attributes: {
                        
                    }
                };
                // Base64 encode the compDefinition JS object
                var encodedCompDef = btoa(JSON.stringify(compDefinition));
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/one/one.app#' + encodedCompDef
                    }
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }
    handleNavigateInComplete() {
        console.log('incomplete');
        inCommunity().then(response => {
            if(response == true){
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: 'incomplete-applications-list'
                    }
                });
            }else{
                var compDefinition = {
                    componentDef: "c:prescriberPatientConsent",
                    attributes: {
                        
                    }
                };
                // Base64 encode the compDefinition JS object
                var encodedCompDef = btoa(JSON.stringify(compDefinition));
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/one/one.app#' + encodedCompDef
                    }
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }
    handleNavigatePrescriberList() {
        inCommunity().then(response => {
            if(response == true){
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: 'prescribers'
                    }
                });
            }else{
                var compDefinition = {
                    componentDef: "c:prescriberPatientConsent",
                    attributes: {
                        
                    }
                };
                // Base64 encode the compDefinition JS object
                var encodedCompDef = btoa(JSON.stringify(compDefinition));
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/one/one.app#' + encodedCompDef
                    }
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }
    handleNavigatePatientList() {
        inCommunity().then(response => {
            if(response == true){
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: 'patients-page'
                    }
                });
            }else{
                var compDefinition = {
                    componentDef: "c:prescriberPatientConsent",
                    attributes: {
                        
                    }
                };
                // Base64 encode the compDefinition JS object
                var encodedCompDef = btoa(JSON.stringify(compDefinition));
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/one/one.app#' + encodedCompDef
                    }
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }
    handleNavigateFacilityList() {
        inCommunity().then(response => {
            if(response == true){
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: 'facilities'
                    }
                });
            }else{
                var compDefinition = {
                    componentDef: "c:prescriberPatientConsent",
                    attributes: {
                        
                    }
                };
                // Base64 encode the compDefinition JS object
                var encodedCompDef = btoa(JSON.stringify(compDefinition));
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/one/one.app#' + encodedCompDef
                    }
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }
    handleNavigateShipmentList() {
        inCommunity().then(response => {
            if(response == true){
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: 'shipments'
                    }
                });
            }else{
                var compDefinition = {
                    componentDef: "c:prescriberPatientConsent",
                    attributes: {
                        
                    }
                };
                // Base64 encode the compDefinition JS object
                var encodedCompDef = btoa(JSON.stringify(compDefinition));
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/one/one.app#' + encodedCompDef
                    }
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }
    handleNavigateConsentList() {
        inCommunity().then(response => {
            if(response == true){
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: 'consent-list'
                    }
                });
            }else{
                var compDefinition = {
                    componentDef: "c:prescriberPatientConsent",
                    attributes: {
                        
                    }
                };
                // Base64 encode the compDefinition JS object
                var encodedCompDef = btoa(JSON.stringify(compDefinition));
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/one/one.app#' + encodedCompDef
                    }
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }
    handleNavigateReEnrollment() {
        inCommunity().then(response => {
            if(response == true){
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: 're-enrollmentlist'
                    }
                });
            }else{
                var compDefinition = {
                    componentDef: "c:prescriberPatientConsent",
                    attributes: {
                        
                    }
                };
                // Base64 encode the compDefinition JS object
                var encodedCompDef = btoa(JSON.stringify(compDefinition));
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/one/one.app#' + encodedCompDef
                    }
                });
            }
        }).catch(error => {
            console.log(error);
        });
    }
}