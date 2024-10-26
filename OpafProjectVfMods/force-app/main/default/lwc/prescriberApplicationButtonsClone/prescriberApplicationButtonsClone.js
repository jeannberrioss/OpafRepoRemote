import { LightningElement, api,wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import inCommunity from '@salesforce/apex/PresciberWorkspaceLWCController.inCommunity';
import STATUS_FIELD from '@salesforce/schema/Case.Enrollment_Status__c';
import END_FIELD from '@salesforce/schema/Case.Enrollment_End_Date__c';
import SUBTYPE_FIELD from '@salesforce/schema/Case.Sub_Type__c';
import ISENROLLED_FIELD from '@salesforce/schema/Case.Is_Enrolled__c';

//const FIELDS = ['Case.Enrollment_Status__c'];

export default class PrescriberApplicationButtonsClone extends NavigationMixin(LightningElement) {
    @api recordId;
    @wire(getRecord, { recordId: '$recordId', fields: [STATUS_FIELD, END_FIELD, SUBTYPE_FIELD, ISENROLLED_FIELD] })
    caseRecord;
    get isResumeApp(){
        if(getFieldValue(this.caseRecord.data, STATUS_FIELD)=='Saved to Complete Later')
        return true;
        else return false;
    }
    get isEnrollApp(){
        var enddate =  getFieldValue(this.caseRecord.data, END_FIELD);
        var isEnrolled =  getFieldValue(this.caseRecord.data, ISENROLLED_FIELD);
        if(enddate != undefined){
            var today = new Date().toISOString().slice(0, 10);
            var date1 = new Date(enddate);
            var date2 = new Date(today);
            var Difference_In_Time = date1.getTime() - date2.getTime();
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            if(Difference_In_Days <= 45 && !isEnrolled){
                return true;
            }else{
                return false;    
            } 
        }        
        else return false;
    }
    navigateToHomePage(){
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: 'my-workspace'
            }
        });
        /*inCommunity().then(response => {
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
        });*/
    }

    resumeAppication(event){
        event.preventDefault();
        var applicationType = getFieldValue(this.caseRecord.data, SUBTYPE_FIELD);
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
                'caseId' : this.recordId
            }
        });
        /*inCommunity().then(response => {
            if(response == true){
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: 'prescriberapplication'
                    },
                    state: {
                        'caseId' : this.recordId
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
        });*/
    }

    beginEnrollment(event){
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: 're-enrollment-application'
            },
            state: {
                'caseId' : this.recordId
            }
        });    
    }

}