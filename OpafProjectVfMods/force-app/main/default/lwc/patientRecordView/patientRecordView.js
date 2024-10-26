import { LightningElement, track, api } from 'lwc';


export default class PatientRecordView extends LightningElement {
    @api recordId;
    @track openSection = true;

    connectedCallback(){
        //alert('recordId -------> '+this.recordId); 
    }

    toggleSection(){
        this.openSection = !this.openSection;
    }

    get sectionOne(){
        return this.openSection ? 'slds-section slds-is-open' : 'slds-section';
    }
}