import { LightningElement } from 'lwc';

export default class OpafVerificationCheck extends LightningElement {
    handleOnNext() {
        const selectedEvent = new CustomEvent("childnextbutton", {});
      
          this.dispatchEvent(selectedEvent);
        }
  
    handleOnPrevious() {
        const selectedEvent = new CustomEvent("childcancelbutton", {});
          
           this.dispatchEvent(selectedEvent);
        }
}