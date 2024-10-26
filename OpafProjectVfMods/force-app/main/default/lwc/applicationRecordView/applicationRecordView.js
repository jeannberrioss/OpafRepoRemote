import { LightningElement, track, api } from 'lwc';
export default class ApplicationRecordView extends LightningElement {
    @api recordId;
    @track openSection = true;
    @track openSection1 = true;

    connectedCallback(){
        //alert('recordId -------> '+this.recordId); 
    }

    toggleSection(){
        this.openSection = !this.openSection;
    }
    toggleSection1(){
        this.openSection1 = !this.openSection1;
    }

    get sectionOne(){
        return this.openSection ? 'slds-section slds-is-open' : 'slds-section';
    }
    get sectionOne1(){
        return this.openSection1 ? 'slds-section slds-is-open' : 'slds-section';
    }
}