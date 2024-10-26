import { LightningElement } from 'lwc';

export default class OpafCard extends LightningElement {

    handleOnNext() {
        const selectedEvent = new CustomEvent("nextbutton", {});
      
          this.dispatchEvent(selectedEvent);
        }
  
    handleOnPrevious() {
        const selectedEvent = new CustomEvent("cancelbutton", {});
          
           this.dispatchEvent(selectedEvent);
        }
}