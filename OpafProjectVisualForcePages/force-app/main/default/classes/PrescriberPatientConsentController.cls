public class PrescriberPatientConsentController {
    
    
    @AuraEnabled
    public static Contact getContactDetails(String contactId){
        Contact con = [SELECT Id, Name, Phone, MailingStreet, State__c, MailingCity,
                       Legal_Rep_First_Name__c,Legal_RepRelTypec__c,
                       Legal_Rep_Last_Name__c,Legal_Rep_Rel_Other__c,Legal_Rep_Phone__c,
                       Legal_Rep_Condition_Check__c,Legal_Rep__c,
                       Birthdate,Email,LastName,FirstName,(select id,Method__c,Status__c from Consent1__r)
                       FROM Contact WHERE Id =: contactId];
        return con;
    }
    
    @auraEnabled
    public static string deleteFile(String documentId){
        List<ContentDocument> contentDocList= [SELECT Id,Title,FileType,ContentSize,Description FROM ContentDocument WHERE Id =: documentId];  
        delete contentDocList;
        return 'Success';  
    }
    
    @auraEnabled(cacheable=true)
    public static Map<string, List<ContentVersion>> getAllDocuments(string recordId) {
        try {
            return DocumentUploadController.getAllDocuments(recordId);          
        } catch(Exception ex) {
            return null;
        }
    }
    
    @auraEnabled(cacheable=true)
    public Static contact getCurrentUserContact(){
        user userDetails = [select id,name,ContactId from user where Id =: userInfo.getUserId()];
        contact contactDetail = [select Id,FirstName,LastName,Email,Birthdate,
                                 Legal_Rep__c,Legal_Rep_First_Name__c,
                                 Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,
                                 Legal_RepRelTypec__c,Legal_Rep_Condition_Check__c,Legal_Rep_Rel_Other__c from contact where Id =: userDetails.ContactId];
        return contactDetail;
    }
    
    @auraEnabled 
    public Static string updateConsent1(string patientId, string envelopeId){
        Consent__c  consent = [select Id,Status__c,DocusignCheck__c,EnvelopeId__c from Consent__c where Patient__c =: patientId];
        consent.Status__c = 'Received';
        consent.DocusignCheck__c = true;
        consent.EnvelopeId__c = envelopeId;
        String base64String;
        if(!Test.isRunningTest()){
        	base64String = DS_OPAFController.getSignedDocument(envelopeId);
        }else{
        	base64String = 'Test Doc';    
        }    
        ContentVersion cv = new ContentVersion();
        cv.Title = 'OnsiteConsentForm.pdf';
        cv.PathOnClient = 'OnsiteConsentForm.pdf';
        cv.VersionData = EncodingUtil.base64Decode(base64String);
        cv.Origin = 'H';
        cv.FirstPublishLocationId = consent.Id;
        cv.Document_Type__c = 'OnsiteConsentForm';
        insert cv; 
        update consent;
        return 'Success';
    }
    
    @auraEnabled 
    public Static ResponseClass updateNewContact(Contact contactDetails, Id prescriberId,boolean methodCheck,boolean contactUpdate, string consentType, List<Object> fileDatas){
        ResponseClass RC = new ResponseClass();
        try {
        system.debug('consentTy:::::::::pe'+consentType);
        Contact newContact = new Contact(FirstName = contactDetails.FirstName,
                                         LastName = contactDetails.LastName,
                                         Email = contactDetails.Email,
                                         Birthdate = contactDetails.Birthdate,
                                         Legal_Rep_First_Name__c = contactDetails.Legal_Rep_First_Name__c,
                                         Legal_Rep_Last_Name__c = contactDetails.Legal_Rep_Last_Name__c,
                                         Legal_Rep_Phone__c = contactDetails.Legal_Rep_Phone__c,
                                         Legal_RepRelTypec__c = contactDetails.Legal_RepRelTypec__c,
                                         Legal_Rep_Rel_Other__c = contactDetails.Legal_Rep_Rel_Other__c,
                                         RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId()
                                         
                                        );
        if(!string.isBlank(contactDetails.Legal_Rep_Condition_Check__c)){
            newContact.Legal_Rep__c = boolean.valueOf(contactDetails.Legal_Rep_Condition_Check__c);
            newContact.Legal_Rep_Condition_Check__c = string.valueof(contactDetails.Legal_Rep_Condition_Check__c);
        }
        if(contactDetails.Id != null){
            newContact.Id = contactDetails.Id;
        }
        
        upsert newContact; 
        
        List<Consent__c> consentDetails = [select id,Type__c,Consent_Type__c,Patient__c, EnvelopeId__c, Status__c from Consent__c where Patient__c =: newContact.Id];
        
        Consent__c newConsent = new Consent__c();
        if(methodCheck == false){
            newConsent.Method__c = 'Onsite';
        } else {
        newConsent.Method__c = consentType;
        }
        newConsent.Patient__c = newContact.Id;
        newConsent.Provider__c = prescriberId;
        if(!consentDetails.isEmpty()){
            newConsent.Id = consentDetails[0].Id; 
            newConsent.Consent_Type__c = 'Re-Enrollment';
            newConsent.EnvelopeId__c = consentDetails[0].EnvelopeId__c; 
        } else{
            newConsent.Consent_Type__c = 'New Consent';
        }
        if(consentType == 'Email')
            newConsent.Status__c = 'Processing';
        if(consentType == 'Paper')
            newConsent.Status__c = 'Processing';
        
        
        upsert newConsent;
        
        if(consentType == 'Paper' && !fileDatas.isEmpty()){
            List<ContentDocumentLink> cdl = DocumentUploadController.createContentVersion(fileDatas, newConsent.Id); 
            if (cdl == null) { return null; }
        }  
        RC.contact = newContact;
        RC.consent = newConsent;    
        return RC;
        } catch(Exception e ){
            system.debug('cde'+e.getMessage()+e.getLineNumber());
            return null;
        }
        
    }
    
    public class ResponseClass{
        @AuraEnabled public Contact contact;
        @AuraEnabled public Consent__c consent;
    }
    @InvocableMethod(label='Update Email Consent' description='')
    public static void updateEmailConsent(List<string> EnvelopeIds){
        System.debug('Coming Here'+EnvelopeIds);
        List<Consent__c> consentList =[select Id,Status__c,EnvelopeId__c from Consent__c where EnvelopeId__c  in:EnvelopeIds];
        if(consentList!=null){
            consentList[0].Status__c = 'Received';
            update consentList[0];
            createForm(EnvelopeIds);
            /*
            if(consentList[0].EnvelopeId__c != ''){
                String base64String = DS_OPAFController.getSignedDocument(consentList[0].EnvelopeId__c );
                ContentVersion cv = new ContentVersion();
                cv.Title = 'EmailConsentForm';
                cv.PathOnClient = 'EmailConsentForm.pdf';
                cv.VersionData = EncodingUtil.base64Decode(base64String);
                cv.Origin = 'H';
                cv.FirstPublishLocationId = consentList[0].Id;
                cv.Document_Type__c = 'EmailConsentForm';
                insert cv;
            }*/
        
        }
    }
    @future(callout=true)
    public static void createForm(List<string> EnvelopeIds){
        List<Consent__c> consentList =[select Id,Status__c,EnvelopeId__c from Consent__c where EnvelopeId__c  in:EnvelopeIds];
        if(consentList!=null){           
            if(consentList[0].EnvelopeId__c != ''){
                String base64String;
                if(!Test.isRunningTest()){ 
                	base64String = DS_OPAFController.getSignedDocument(consentList[0].EnvelopeId__c );
                }else{
                	base64String = 'Test Doc';    
                }    
                ContentVersion cv = new ContentVersion();
                cv.Title = 'EmailConsentForm';
                cv.PathOnClient = 'EmailConsentForm.pdf';
                cv.VersionData = EncodingUtil.base64Decode(base64String);
                cv.Document_Type__c = 'EmailConsentForm';
                cv.NetworkId=[select id,name from Network where Name ='Prescriber'].Id;
                insert cv;
                ContentDocumentLink cdl = new ContentDocumentLink(); 
                cdl.ContentDocumentId = [select ContentDocumentId,Id from ContentVersion where  Id =:cv.Id].ContentDocumentId;
                cdl.LinkedEntityId = consentList[0].Id;
                cdl.ShareType ='I';
                cdl.Visibility ='AllUsers';
                insert cdl;
                sendEMailConsentFax(consentList[0].Id,cv.id,cv.NetworkId);
                
            }
        }
        
        }
    public static void sendEMailConsentFax(String ConsentID, String EmailConsentId, Id NetworkId){
        Consent__c consentRec = [Select Id,Patient__c,Provider__c from Consent__c where id=:ConsentID];
        List<Case> caseList = [SELECT Id, Rx_Fax_Timestamp__c,CaseNumber,Patient__c FROM Case WHERE Patient__c =: consentRec.Patient__c Order By Createddate desc limit 1];
        Id CoverSheetId;
        if(caseList.size()>0){
        	List<contentdocumentlink> cdlList = [select Id,ContentDocument.LatestPublishedVersionId, ContentDocument.Title,ContentDocument.LatestPublishedVersion.Document_Type__c from contentdocumentlink where (LinkedEntityId =:caseList[0].ID OR LinkedEntityId =:caseList[0].Patient__c ) and (ContentDocument.Title='Coversheet' OR ContentDocument.Title='EmailConsentForm') order by SystemModstamp desc];
            if(cdlList.size()>0){
                for(contentdocumentlink cdl:cdlList){
                    if(cdl.ContentDocument.Title=='Coversheet') CoverSheetId = cdl.ContentDocument.LatestPublishedVersionId;
                    //if(cdl.ContentDocument.Title=='EmailConsentForm')  EmailConsentId = cdl.ContentDocument.LatestPublishedVersionId;
                }
            }
            
        }
        
        //Generate Coversheet with or withoutCase
        if(CoverSheetId == null){
            PageReference ref = Page.EmptyCoversheet;   
            ref.getParameters().put('id',ConsentID);
            ContentVersion cont = new ContentVersion();
            cont.Title = 'EmptyCoversheet';
            cont.PathOnClient = 'CoverSheet.pdf';
            if(!Test.isRunningTest()){
            	cont.VersionData = ref.getContentAsPdf();    
            }else{
            	cont.VersionData = blob.valueOf('Test');    
            }            
            cont.Document_Type__c='Coversheet';
            cont.Sort_Order__c = 1;
            cont.NetworkId =NetworkId;
            insert cont; 
            CoverSheetId = cont.Id;
            
            
        }
        if(CoverSheetId!=null && EmailConsentId!=null){
            efaxapp__Sent_Fax__c faxRec = new efaxapp__Sent_Fax__c();
            faxRec.efaxapp__Attachment_ID__c =CoverSheetId;
            faxRec.efaxapp__Attachment_ID2__c  =EmailConsentId; 
            faxRec.efaxapp__Fax_Number__c = System.label.EFax_Rx_Send_To;
            faxRec.efaxapp__Subject__c = 'Coversheet EConsentForm';
            faxRec.efaxapp__Send_Date__c = Datetime.now(); // mandatory,
            faxRec.efaxapp__Status__c = 'Sending'; // mandatory
            faxRec.efaxapp__Sent_With_Outbound_Message__c = True; // mandatory
            faxRec.efaxapp__Org_Fax_Number__c = System.label.EFax_From;        
            insert faxRec;
        }
        /*
        Case cs = [SELECT Id, Rx_Fax_Timestamp__c,CaseNumber,Patient__c FROM Case WHERE Id =: caseId]; 
        List<contentdocumentlink> cdlList = [select Id,ContentDocument.LatestPublishedVersionId, ContentDocument.Title,ContentDocument.LatestPublishedVersion.Document_Type__c from contentdocumentlink where (LinkedEntityId =:caseId OR LinkedEntityId =:cs.Patient__c ) and (ContentDocument.Title='Coversheet' OR ContentDocument.Title='EmailConsentForm') order by SystemModstamp desc];
        Id CoverSheetId,EmailConsentId;
        if(cdlList.size()>1){
            for(contentdocumentlink cdl:cdlList){
                if(cdl.ContentDocument.Title=='Coversheet') CoverSheetId = cdl.ContentDocument.LatestPublishedVersionId;
            	if(cdl.ContentDocument.Title=='EmailConsentForm')  EmailConsentId = cdl.ContentDocument.LatestPublishedVersionId;
            }
        }
        if(CoverSheetId!=null && EmailConsentId!=null){
            efaxapp__Sent_Fax__c faxRec = new efaxapp__Sent_Fax__c();
            faxRec.efaxapp__Attachment_ID__c =CoverSheetId;
            faxRec.efaxapp__Attachment_ID__c  =EmailConsentId; 
            faxRec.efaxapp__Fax_Number__c = System.label.EFax_Rx_Send_To;
            faxRec.efaxapp__Subject__c = 'Coversheet EConsentForm';
            faxRec.efaxapp__Send_Date__c = Datetime.now(); // mandatory,
            faxRec.efaxapp__Status__c = 'Sending'; // mandatory
            faxRec.efaxapp__Sent_With_Outbound_Message__c = True; // mandatory
            faxRec.efaxapp__Org_Fax_Number__c = System.label.EFax_From;        
            insert faxRec;
        }*/
        
    }

}