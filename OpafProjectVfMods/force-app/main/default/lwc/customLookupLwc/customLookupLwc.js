import { LightningElement,api,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import fetchLookupData from '@salesforce/apex/CustomLookupLWCController.fetchLookupData';
export default class CustomLookupLwc extends NavigationMixin(LightningElement) {
    @api label = 'custom lookup label';
    @api placeholder = 'search...'; 
    @api iconName = 'standard:account';
    @api sObjectApiName = 'Account';
    @api defaultRecordId = '';
    @api recordTypeName = '';
    @api currentUser;

    lstResult = [];    
    hasRecords = true; 
    searchKey='';     
    isSearchLoading = false;   
    delayTimeout;
    selectedRecord = {};

    connectedCallback(){
        
   }

   @wire(fetchLookupData, { 
       searchKey: '$searchKey' , 
       sObjectApiName : '$sObjectApiName', 
       recordTypeName: '$recordTypeName',
       currentUser: '$currentUser' 
    })
     searchResult(value) {
        const { data, error } = value; // destructure the provisioned value
        this.isSearchLoading = false;
        if (data) {
             this.hasRecords = data.length == 0 ? false : true; 
             this.lstResult = JSON.parse(JSON.stringify(data)); 
         }
        else if (error) {
            console.log('(error---> ' + JSON.stringify(error));
         }
    };

    handleKeyChange(event) {
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        this.isSearchLoading = true;
        //const searchKey = event.target.value;
        this.searchKey = event.target.value;
    }

    toggleResult(event){
        const lookupInputContainer = this.template.querySelector('.lookupInputContainer');
        const clsList = lookupInputContainer.classList;
        const whichEvent = event.target.getAttribute('data-source');
        switch(whichEvent) {
            case 'searchInputField':
                clsList.add('slds-is-open');
               break;
            case 'lookupContainer':
                clsList.remove('slds-is-open');    
            break;                    
           }
    }

    handleRemove(event){
        event.preventDefault();
        this.searchKey = '';    
        this.selectedRecord = {};
        this.lookupUpdatehandler(undefined); // update value on parent component as well from helper function 
        
        // remove selected pill and display input field again 
        const searchBoxWrapper = this.template.querySelector('.searchBoxWrapper');
        searchBoxWrapper.classList.remove('slds-hide');
        searchBoxWrapper.classList.add('slds-show');

        const pillDiv = this.template.querySelector('.pillDiv');
        pillDiv.classList.remove('slds-show');
        pillDiv.classList.add('slds-hide');
    }

    handelSelectedRecord(event){   
        var objId = event.target.getAttribute('data-recid'); // get selected record Id 
        this.selectedRecord = this.lstResult.find(data => data.Id === objId); // find selected record from list 
        this.lookupUpdatehandler(this.selectedRecord); // update value on parent component as well from helper function 
        this.handelSelectRecordHelper(); // helper function to show/hide lookup result container on UI
   }

    handelSelectRecordHelper(){
        this.template.querySelector('.lookupInputContainer').classList.remove('slds-is-open');

        const searchBoxWrapper = this.template.querySelector('.searchBoxWrapper');
        searchBoxWrapper.classList.remove('slds-show');
        searchBoxWrapper.classList.add('slds-hide');

        const pillDiv = this.template.querySelector('.pillDiv');
        pillDiv.classList.remove('slds-hide');
        pillDiv.classList.add('slds-show');     
    }

    lookupUpdatehandler(value){    
        const oEvent = new CustomEvent('lookupupdate',
            {
                'detail': {selectedRecord: value}
            }
        );
        this.dispatchEvent(oEvent);
    }

    createNewRecord(){
        alert('New Record');
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                "objectApiName": 'Contact',
                "actionName": 'new'
            },
            state : {
                navigationLocation: 'LOOKUP',
                panelOnDestroyCallback: this.stayInSamePage()
            }
        });
    }

    stayInSamePage(){
        alert('record saved');
    }
}