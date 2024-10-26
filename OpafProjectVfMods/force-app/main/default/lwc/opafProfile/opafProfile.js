import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";

import USER_OBJECT from '@salesforce/schema/User';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';

import CONTACT_OBJECT from '@salesforce/schema/Contact';
import FIRST_NAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LAST_NAME_FIELD from '@salesforce/schema/Contact.LastName';
import SALUTATION_FIELD from '@salesforce/schema/Contact.Salutation__c';
import SUFFIX_FIELD from '@salesforce/schema/Contact.Suffix';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import HOME_PHONE_FIELD from '@salesforce/schema/Contact.HomePhone';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import MOBILE_PHONE_FIELD from '@salesforce/schema/Contact.MobilePhone';
import OTHER_PHONE_FIELD from '@salesforce/schema/Contact.OtherPhone';
import FAX_FIELD from '@salesforce/schema/Contact.Fax';
import PREF_CONTACT_METHOD_FIELD from '@salesforce/schema/Contact.Preferred_Method_of_Contact__c';
import STREET_ADDRESS_FIELD from '@salesforce/schema/Contact.Street_Address__c';
import ADDRESS_LINE_2_FIELD from '@salesforce/schema/Contact.Address_Line_2__c';
import CITY_FIELD from '@salesforce/schema/Contact.City__c';
import STATE_FIELD from '@salesforce/schema/Contact.State__c';
import ZIP_CODE_FIELD from '@salesforce/schema/Contact.Zip_Code__c';
import RECEIVE_ALL_COMMUNICATION_FIELD from '@salesforce/schema/Contact.Receive_All_Communication__c';
import RECEIVE_SHIPPING_NOTIFICATIONS_FIELD from '@salesforce/schema/Contact.Receive_Shipping_Notifications__c';
import APPLICATION_STATUS_ELIGIBILITY_DECISION_FIELD from '@salesforce/schema/Contact.Application_Status_Eligibility_Decision__c';
import DO_NOT_CALL_FIELD from '@salesforce/schema/Contact.DoNotCall';

export default class OpafProfile extends LightningElement {

  firstNameField = FIRST_NAME_FIELD;

  // Flexipage provides recordId and objectApiName
  @api recordId;
  @api contactId;
  @api objectApiName;

  contactObject = CONTACT_OBJECT;
  userObject = USER_OBJECT;

  @wire(getRecord, { recordId: '$recordId', fields: [CONTACT_ID_FIELD] })
  wiredRecord({ error, data }) {
    if (data) {
      this.contactId = getFieldValue(data, CONTACT_ID_FIELD);
      this.hasContactId = !!this.contactId;
      console.log('contactId', this.contactId, data);
    } else if (error) {
      console.error('Error loading contact', error);
    }
  }

  showEditForm = false;
  hasContactId = false;

  fields = [
    FIRST_NAME_FIELD,
    LAST_NAME_FIELD,
    SALUTATION_FIELD,
    SUFFIX_FIELD,
    EMAIL_FIELD,
    PHONE_FIELD,
    HOME_PHONE_FIELD,
    MOBILE_PHONE_FIELD,
    OTHER_PHONE_FIELD,
    FAX_FIELD,
    STREET_ADDRESS_FIELD,
    ADDRESS_LINE_2_FIELD,
    CITY_FIELD,
    STATE_FIELD,
    ZIP_CODE_FIELD,
    RECEIVE_ALL_COMMUNICATION_FIELD,
    RECEIVE_SHIPPING_NOTIFICATIONS_FIELD,
    APPLICATION_STATUS_ELIGIBILITY_DECISION_FIELD,
    DO_NOT_CALL_FIELD,
    PREF_CONTACT_METHOD_FIELD
  ];
  
  handleEdit() {
    this.showEditForm = true;
  }

  handleCancel() {
    this.showEditForm = false;
  }

  handleSuccess() {
    console.log('success');
    this.showEditForm = false;
  }
}