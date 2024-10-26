import { LightningElement,api,track,wire } from 'lwc';

// importing Custom Label
// import FooterTextLine1 from '@salesforce/label/c.FooterTextLine1';
// import FooterTextLine2 from '@salesforce/label/c.FooterTextLine2';
// import FooterLogo from '@salesforce/label/c.FooterLogo';
import getInitialData from '@salesforce/apex/cc_footercontroller.getCustomsettings';
import { getRecord } from 'lightning/uiRecordApi';
import Abilify from '@salesforce/resourceUrl/Abilify';
import Asimtufii from '@salesforce/resourceUrl/Abilify_Asimtufii';
import Nuedexta from '@salesforce/resourceUrl/Nuedexta';
import jynarque from '@salesforce/resourceUrl/jynarque';
import rexulti from '@salesforce/resourceUrl/rexulti';
import smansca from '@salesforce/resourceUrl/smansca';
import otsukalogo from '@salesforce/resourceUrl/otsukalogo';
import basePathName from '@salesforce/community/basePath';

// const FIELDS = [
//     'Opaf_Care_Connect_Setting__mdt.MasterLabel',
//     'Opaf_Care_Connect_Setting__mdt.Contact_Us__c',
//     'Opaf_Care_Connect_Setting__mdt.Footer_Content__c',
//     'Opaf_Care_Connect_Setting__mdt.Privacy_Policy__c',
//     'Opaf_Care_Connect_Setting__mdt.Term_of_Use__c'
// ]

export default class FooterComponent extends LightningElement {
    @track footerLayoutType;     
    communityCode;
    MonthYear;
    imageURLs = {
        Abilify_Logo : Abilify,
        Asimtufii_Logo: Asimtufii,
        Nuedexta_Logo: Nuedexta,
        Jynarque_Logo : jynarque,
        Rexulti_Logo : rexulti,
        Smansca_Logo : smansca,
        Otsuka_Logo : otsukalogo
    }
    
    custMtData;

    @api set boolFooterLayout(value) { 
        this.footerLayoutType = value === 'Sideways'; 
     } 
     //{ this.footerLayoutType = true; };
    
    get boolFooterLayout(){ 
        return this.footerLayoutType; 
     }
    
    @wire(getInitialData)
    setInitialData({ error, data }){
        console.log('init footer');
        console.log(basePathName);
        if(data){
            console.log('customsettings: ' + JSON.stringify(data));
            this.custMtData = data;
            if(basePathName.indexOf("Prescriber")!=-1){
                this.communityCode = this.custMtData.Prescriber_Veeva_Code__c;
                this.MonthYear = this.custMtData.Prescriber_Month_Year__c
            }
            else{
                this.communityCode = this.custMtData.Patient_Veeva_Code__c ;
                this.MonthYear = this.custMtData.Month_Year__c
            }
            // this.custMtData.MasterLabel = data.MasterLabel.value;
            // this.custMtData.ContactUs = data.Contact_Us__c.value;
            // this.custMtData.FooterContent = data.Footer_Content__c.value;
            // this.custMtData.PrivacyPolicy = data.Privacy_Policy__c.value;
            // this.custMtData.TermOfUse = data.Term_of_Use__c.value;
        }
        else if(error){
            console.log('error: ' + JSON.stringify(error));
        }
    }
}