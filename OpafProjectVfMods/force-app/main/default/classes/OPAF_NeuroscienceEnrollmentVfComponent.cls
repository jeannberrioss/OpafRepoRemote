public class OPAF_NeuroscienceEnrollmentVfComponent {
    public string CaseId;
    public case caserecord {get;set;}
    public user currentuser{get;set;}
    public string phoneNumber{get;set;}
    public boolean isInsurancedocumentattached {get;set;}
    public OPAF_NeuroscienceEnrollmentVfComponent(){
        isInsurancedocumentattached = false;
        case caserecord = new case();
        currentuser=[Select Id,Name,Email,ContactId,Contact.RecordType.Name,Contact.FirstName,Contact.LastName,
                   Contact.HomePhone,Contact.Phone,Contact.Phone_Extension__c,Contact.Fax,Contact.Email from User where Id=:userinfo.getuserId()];
        if(currentuser.Contact.RecordType.Name =='Individual') phoneNumber = currentuser.Contact.HomePhone;
        else phoneNumber = currentuser.Contact.Phone;
        
    }
    public void setCaseRecId(string Id){
        
        this.CaseId = Id;
        system.debug('CaseRecId---->'+Id);
        CaserecordDate();
    }
    public string getCaseRecId( ){
        return CaseId;
    }
    public void CaserecordDate(){
        set<Id> contentdocids = new set<Id>();
        list<ContentVersion>  ContentVersionlist = new list<ContentVersion> ();
        ContentVersionlist = [select id, Document_Type__c, 
                              ContentDocumentId, 
                              ContentDocument.LatestPublishedVersionId
                              from ContentVersion
                              where Document_type__c ='INSURANCE DOCUMENT' ];
        if(ContentVersionlist.size()>0){
            for(ContentVersion conversion :ContentVersionlist){
                contentdocids.add(conversion.ContentDocumentId);
            }
        }
        list<ContentDocumentLink>   codoclink =[SELECT ContentDocumentId,ContentDocument.Title, ContentDocument.CreatedDate,LinkedEntityId
                                                FROM ContentDocumentLink where LinkedEntityId =:CaseId and ContentDocumentId IN:contentdocids ];
        system.debug('codoclink----'+codoclink.size());
        system.debug('contentdocids------------'+contentdocids);
        if(codoclink.size()>0){
            isInsurancedocumentattached = true;
        }
        
        
        
        caserecord = [select id,Patient__c,
                      Patient__r.Firstname,
                      Patient__r.Lastname,
                      Patient__r.SSN__c,
                      Patient__r.Phone,
                      patient__r.HomePhone,
                      Patient__r.fax,
                      Patient_Phone__c,
                      Patient__r.Email,
                      Patient__r.Birthdate,
                      Patient__r.Mailingstreet,
                      Patient__r.MailingCity,
                      Patient__r.MailingState,
                      Patient__r.MailingPostalCode,
                      Patient__r.Mailing_Address_Line_2__c,
                      Patient__r.Zip_Code__c,
                      Patient__r.City__c,
                      Patient__r.Gender__c,
                      Patient__r.Street_Address__c,
                      Patient__r.Address_Line_2__c,
                      Patient__r.state__c,
                      Patient__r.Legal_Rep_Rel_Other__c,
                      Patient__r.Legal_RepRelTypec__c,
                      Patient_First_Name__c,
                      Patient_First_Name2__c,
                      Patient_Last_Name__c,
                      Patient_Last_Name2__c,
                      
                      Patient_with_Same_Provider__c,
                      Has_No_Insurance__c,
                      Medical_Plan_Name__c,
                      Medical_Plan_Phone__c,
                      MedicalGroupNumber__c,
                      Medical_Policyholder_Name__c,
                      Medical_Policyholder_Member_ID__c,
                      Medical_Policyholder_DOB__c,
                      Pharmacy_Plan_Name__c,
                      Pharmacy_Plan_Phone__c,
                      Pharmacy_Rx_BIN__c,
                      Pharmacy_Rx_PCN__c,
                      Does_the_patient_live_in_United_States__c,
                      ABILIFY_MAINTENA_First_Administration__c,
                      Estimated_Annual_Household_Income__c,
                      Estimated_Household_Size__c,
                      Prescriber__c,
                      Prescriber__r.State_License__c,
                      Prescriber__r.DEA__c,
                      Prescriber__r.NPI__c,
                      Prescriber__r.Tax_Id__c,
                      Prescriber__r.firstname,
                      Prescriber__r.Lastname,
                      Prescriber__r.Zip_Code__c,
                      Prescriber__r.City__c,
                      Prescriber__r.Gender__c,
                      Prescriber__r.Street_Address__c,
                      Prescriber__r.Address_Line_2__c,
                      Prescriber__r.state__c,
                     
                      Ship_Type__c,
                      Facility_Name__c,
                      Facility__c,
                      Facility__r.Name,
                      Facility__r.phone,
                      Facility__r.fax,
                      Facility_Address2__c,
                      Facility__r.BillingStreet,
                      Facility__r.Billingcity,
                      Facility__r.BillingState,
                      Facility__r.BillingPostalcode,
                      Facility__r.Billing_Address_Line_2__c,
                      Facility__r.PersonMailingstreet,
                      Facility__r.PersonMailingcity,
                      Facility__r.PersonMailingState,
                      Facility__r.PersonMailingPostalcode,
                      Facility__r.Facility_Contact_First_Name__c,
                      Facility__r.Facility_Contact_Last_Name__c,
                      Facility__r.Facility_Contact_Phone__c,
                      Facility__r.Facility_Contact_Phone_Extension__c,
                      Facility__r.Facility_Contact_Fax__c,
                      Facility__r.Facility_Contact_Email__c,
                      Facility__r.Facility_Type__c,
                       Facility__r.Street_Address__c,
                       Facility__r.Address_Line_2__c,
                       Facility__r.City__c,
                       Facility__r.State__c,
                       Facility__r.Zip_Code__c ,
                                          
                      Prescription1__r.Next_Injection__c,
                      Prescription1__r.Dosage__c,
                      Prescription1__r.Quantity__c,
                      Prescription1__r.Number_of_Refills__c,
                      Prescription1__r.Administration_Method__c,
                      Prescription1__r.Directions__c,
                      Prescription1__r.Titration_Directions__c,
                      Prescription1__r.Dispense_as_Written__c,
                      Prescription1__r.REMS_Program__c,
                      Prescription1__r.REMS_ID_Number__c,
                      Prescription1__r.Hospital_Admission_Date__c,
                      Prescription1__r.HospitalDischarge_Date__c,
                      Prescription1__r.Qty_SAMSCA_at_Discharge__c,
                      Prescription1__r.Qty_SAMSCA_During_Stay__c,
                      Prescriber_First_Name__c,
                      Prescriber_Last_Name__c, 
                      Prescriber_First_Name2__c,
                      Prescriber_Last_Name2__c,
                      Temportary_Patient_Assistance__c,
                      JYNARQUE_Starter_Kit__c,
                      Patient_Legal_Rep_First_Name__c,
                      Patient_Legal_Rep_Last_Name__c,
                      Patient_Legal_Rep_Phone__c,
                      Patient_Legal_Rep_Relationship__c,
                      Product__c,
                      ICD_10_Diagnosis_Code__c,
                      Ship_Care_To__c,
                      Ship_Address_Line2__c,
                      Ship_Street_Address__c,
                      Ship_Local_Care_Center_Phone__c,
                      Ship_City__c,
                      Ship_State__c,
                      Ship_Zip__c,
                      Ship_Phone__c,
                      Ship_Fax__c,
                      
                      Contact.FirstName, 
                      Contact.LastName, 
                      contact.HomePhone,
                      Contact.Phone_Extension__c,
                      Contact.Fax, 
                      contact.Email
                      
                      from case where Id=:CaseId limit 1];
        system.debug('caserecord----gender'+caserecord);
    }
}