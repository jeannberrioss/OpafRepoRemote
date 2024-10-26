import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import inCommunity from '@salesforce/apex/PresciberWorkspaceLWCController.inCommunity';
import caseDetails from '@salesforce/apex/PresciberWorkspaceLWCController.getCaseData';

export default class PrescriberApplicationStepSeven extends NavigationMixin(LightningElement) {
    @api caseRecordId;
    @track caseNumber;
    //isConsentReceived = false;
    connectedCallback(){
        caseDetails({
            caseId : this.caseRecordId
        }).then(response => {
            this.caseNumber = response.CaseNumber;
        }).catch(error => {

        });    
    }

    navigateToHomePage(){
        this.inCommunity(); 
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