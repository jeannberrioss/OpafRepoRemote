import { LightningElement, track} from 'lwc';

export default class OpafPatientConsent extends LightningElement {
   @track showSection=true;
    get options() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
    }

    handleOnSelect(event){
        var checkYes = event.target.value;
        if(event.target.value == 'Yes'){
            this.showSection = true;
        }else{
            this.showSection = false;
        }
    }
}