import { LightningElement, track} from 'lwc';

export default class Test1 extends LightningElement {
@track showMain=true;
@track showPatient= false;
@track showType = false;
    get options() {
        return [
            { label: 'Online Patient eConsent - You  can sign the eConsent immediately to move forward with the OPAF Application process', value: 'option1' },
            { label: 'Patient Paper Consent - You can download, print, sign, and upload the “Patient Assistance Foundation – Patient Consent” form to move forward with the OPAF Application process', value: 'option2' },
        ];
    }

    handleOnHide(){
        this.showMain = false;
        this.showType = true;
    }

    handleOnCancel(){
        this.showMain = true;
        this.showType = false;
    }

    handleOnNext(){
       this.showPatient = true;
       this.showMain = false;
       this.showType = false;
    }
}