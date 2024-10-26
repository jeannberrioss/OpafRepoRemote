import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import inCommunity from '@salesforce/apex/PresciberWorkspaceLWCController.inCommunity';

export default class PrescriberApplicationButtonsClone extends NavigationMixin(LightningElement) {
    @api recordId; 
    navigateToHomePage(){
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

    resumeAppication(){
        alert(this.recordId);
        inCommunity().then(response => {
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
        });
    }

}