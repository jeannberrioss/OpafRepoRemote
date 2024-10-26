import { LightningElement, track} from 'lwc';

export default class OpafApplication extends LightningElement {
@track showFirstStep=true;
@track shoSecondStep=false;
@track shoVerificatonForm=false;
@track shoPrescriber=false;
@track showReadOnly = false;
@track showSubmit = false;
    get options() {
        return [
            { label: 'ABILIFY MAINTENA® (aripiprazole)', value: 'ABILIFY MAINTENA® (aripiprazole)' },
            { label: 'JYNARQUE® (tolvaptan)', value: 'JYNARQUE® (tolvaptan)' },
            { label: 'REXULTI® (brexpiprazole)', value: 'REXULTI® (brexpiprazole)' },
            { label: 'SAMSCA® (tolvaptan)', value: 'SAMSCA® (tolvaptan)' }
        ];
    }

    handleOnNext(){
       this.showFirstStep = false;
       this.shoSecondStep = true;
    }
    handleOnChildNext(){
        this.showFirstStep = false;
        this.shoSecondStep = false;
        this.shoVerificatonForm = true;
     }

     handleOnChildPrevious(){
        this.showFirstStep = true;
        this.shoSecondStep = false;
        this.shoVerificatonForm = false;
     }
     
     handleOnChild1Previous(){
        this.shoSecondStep = true;
        this.shoVerificatonForm = false;
     }

     handleOnChild1Next(){
        this.shoSecondStep = false;
        this.shoVerificatonForm = false;
        this.shoPrescriber = true;
     }

     handleOnChild2Previous(){
        this.shoVerificatonForm = true;
        this.shoPrescriber = false;
     }

     handleOnChild2Next(){
        this.showFirstStep = false;
        this.shoPrescriber = true;
        this.showReadOnly = true;
     }

     handleOnChild3Previous(){
      this.showReadOnly = false;
      this.shoPrescriber = false;
      this.showSubmit = true;
     }
}