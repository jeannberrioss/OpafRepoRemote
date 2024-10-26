import { LightningElement, wire, api, track } from 'lwc';
import CASE_OBJECT from '@salesforce/schema/Case';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

/*

  'Biotin_2500mcg__c',
  'Calcium_500mg__c',
  'Calcium_600mg__c',
  'Coenzyme_Q10_100mg__c',
  'Folic_Acid_400mcg__c',
  'Iron_65mg__c',
  'Magnesium_250mg__c',
  'Multi_Complete__c',
  'Omega_3_Fish_Oil_1400mg__c',
  'Super_B_Comp_with_Folic_Biotin_and_C__c',
  'Vitamin_B12_1000mcg__c',
  'Vitamin_B1_100mg__c',
  'Vitamin_B6_100mg__c',
  'Vitamin_C_1000mg_Chewable__c',
  'Vitamin_C_1000mg__c',
  'Vitamin_C_500mg__c',
  'Vitamin_D3_2000iu__c',
  'Vitamin_E_400iu_DL_ALPHA__c',
  'Zinc_30mg_Gluconate__c'

  Omega_3_Fish_Oil_1400mg__c - 
  Vitamin A 2400 mcg (8000 IU)
  

  'Coenzyme_Q10_100mg__c',
  'Magnesium_250mg__c',
  'Vitamin_C_500mg__c',
  'Zinc_30mg_Gluconate__c'
  */

const vitaminFields = [
  'Biotin_2500mcg__c',
  'Calcium_600mg__c',
  'Omega_3_Fish_Oil_1400mg__c',
  'Folic_Acid_400mcg__c',
  'Iron_65mg__c',
  'Multi_Complete__c',
  'Super_B_Comp_with_Folic_Biotin_and_C__c',
  'Vitamin_A_2400_mcg_8000_IU__c',
  'Vitamin_B1_100mg__c',
  'Vitamin_B6_100mg__c',
  'Vitamin_B12_1000mcg__c',
  'Vitamin_C_1000mg_Chewable__c',
  'Vitamin_C_1000mg__c',
  'Vitamin_D3_2000iu__c',
  'Vitamin_E_400iu_DL_ALPHA__c',
];


export default class OpafApplicationVitaminForm extends LightningElement {
  
  _caseFields;
  _case;
  
  @api
  get case() {
    console.log('get case ', JSON.stringify(this._case));
    return this._case;
  }
  set case(value) {
    console.log('set case ', JSON.stringify(value));
    this._case = {...value};
    this.formatVitamins();
  }

  

  @track vitamins = [];

  @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
    caseInfo({ data, error }) {
      if (data) {
        this._caseFields = data.fields;
        this.formatVitamins(data);
        this.debugCase(data);
      }
    }

  handleChange(event) {
    event.stopPropagation();
    const detail = {...event.detail, value: event.target.value };
    console.log('handleChange', detail);
    this.dispatchEvent(new CustomEvent('change', { detail }));
  }

  formatVitamins() {
    if (this._caseFields) {
      console.log('format vitamins', this._caseFields, this._case);
      this.vitamins = Object.keys(this._caseFields)
        .filter(fieldName => vitaminFields.includes(fieldName))
        .map(fieldName => {
          console.log('field', fieldName, this._case[fieldName], this._caseFields[fieldName])
          return {
            id: fieldName,
            value: fieldName,
            label: this._caseFields[fieldName]?.label,
            checked: this._case ?  this._case[fieldName] : false
          }
        })
    }
  }

  debugCase(data) {
    console.log('data.field', Object.keys(data.fields))
    console.log('data.field', data)
    console.log('vitamins', this.vitamins)
    console.log('@api.case', this.case);
  }

}