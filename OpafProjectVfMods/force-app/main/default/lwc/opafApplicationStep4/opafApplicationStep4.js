import { LightningElement, track} from 'lwc';

export default class OpafApplicationStep4 extends LightningElement {
    @track showReadOnly = false;
    handleOnNext() {
        this.showReadOnly = true;
        const selectedEvent = new CustomEvent("childnextbutton", {});
      
          this.dispatchEvent(selectedEvent);
        }
  
    handleOnPrevious() {
        this.showReadOnly = false;
        const selectedEvent = new CustomEvent("childcancelbutton", {});
          
           this.dispatchEvent(selectedEvent);
        }
}