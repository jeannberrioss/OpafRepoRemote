public without sharing class PatientConsentController {
    
    @auraEnabled(cacheable=true)
    public Static contact getCurrentUserContact(){
        try {
            user userDetails = [select id,name,ContactId from user where Id =: userInfo.getUserId()];
            contact contactDetail = [select Id,FirstName,LastName,Email,Birthdate,
                                     Legal_Rep__c,Legal_Rep_First_Name__c,
                                     Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,
                                     Legal_RepRelTypec__c,Legal_Rep_Condition_Check__c,Legal_Rep_Rel_Other__c,(select id,Type__c,DocusignCheck__c,Status__c from Consent1__r) from contact where Id =: userDetails.ContactId];
            return contactDetail;
        } catch (Exception ex) {
            throw new AurahandledException(ex.getMessage());
        }
    }
    
    @auraEnabled 
    public Static string updateConsent1(string ConsentId, string envelopeId){
        try {
            Consent__c con = new Consent__c();
            con.Id= consentId;
            con.Status__c = 'Received';
            con.DocusignCheck__c = true;
            con.EnvelopeId__c = envelopeId;
            String base64String = DS_OPAFController.getSignedDocument(envelopeId);
            ContentVersion cv = new ContentVersion();
            cv.Title = 'OnsiteConsentForm.pdf';
            cv.PathOnClient = 'OnsiteConsentForm.pdf';
            cv.VersionData = EncodingUtil.base64Decode(base64String);
            cv.Origin = 'H';
            cv.FirstPublishLocationId = consentId;
            cv.Document_Type__c = 'OnlineConsentForm';
        	insert cv;
            update con;
            return 'Success';
        } catch (Exception ex) {
            throw new AurahandledException(ex.getMessage());
        }
    }
    
    
    @auraEnabled 
    public Static string updateContact(Contact contactDetails, string consentType, List<Object> fileDatas){
        try {
            Contact newContact = new Contact(FirstName = contactDetails.FirstName,
                                             LastName = contactDetails.LastName,
                                             Email = contactDetails.Email,
                                             Birthdate = contactDetails.Birthdate,
                                             Legal_Rep_First_Name__c = contactDetails.Legal_Rep_First_Name__c,
                                             Legal_Rep_Last_Name__c = contactDetails.Legal_Rep_Last_Name__c,
                                             Legal_Rep_Phone__c = contactDetails.Legal_Rep_Phone__c,
                                             Legal_RepRelTypec__c = contactDetails.Legal_RepRelTypec__c,
                                             Legal_Rep_Rel_Other__c = contactDetails.Legal_Rep_Rel_Other__c,
                                             Id = contactDetails.Id);
            if(!string.isBlank(contactDetails.Legal_Rep_Condition_Check__c)){
                newContact.Legal_Rep__c = boolean.valueOf(contactDetails.Legal_Rep_Condition_Check__c);
                newContact.Legal_Rep_Condition_Check__c = string.valueof(contactDetails.Legal_Rep_Condition_Check__c);
            }
            Update newContact; 
            
            List<Consent__c> consentDetails = [select id,Type__c,Consent_Type__c,Patient__c from Consent__c where Patient__c =:newContact.Id];
            
            Consent__c newConsent = new Consent__c();
            newConsent.Patient__c = newContact.Id;
            newConsent.Type__c = consentType;
            
            if(!consentDetails.isEmpty()){
                newConsent.Id = consentDetails[0].Id; 
                newConsent.Consent_Type__c = 'Re-Enrollment';
            } else {
                newConsent.Consent_Type__c = 'New Consent';
            }
            
            upsert newConsent;
            
            if(consentType == 'Paper Consent' && !fileDatas.isEmpty()){
                List<ContentDocumentLink> cdl = DocumentUploadController.createContentVersion(fileDatas, newConsent.Id); 
                if (cdl == null) { return null; }
            }  
            
            return 'success';
        } catch (Exception ex) {
            throw new AurahandledException(ex.getMessage());
        }
    }
    
}