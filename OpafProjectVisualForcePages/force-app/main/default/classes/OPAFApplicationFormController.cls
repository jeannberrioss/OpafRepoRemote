public without sharing class OPAFApplicationFormController {
    
    @auraEnabled(cacheable=true)
    public static Map<string, List<ContentVersion>> getAllDocuments(string recordId) {
        try {
            return DocumentUploadController.getAllDocuments(recordId);          
        } catch(Exception ex) {
            throw new AurahandledException(ex.getMessage());
        }
    }
    
    @auraEnabled
    public static string deleteFile(string recordId){  
        try {
            List<ContentDocument> cdl= [select Id,Title,FileType,ContentSize,Description from ContentDocument where id =: recordId];  
            delete cdl;
            return 'Success';  
        } catch(Exception ex) {
            throw new AurahandledException(ex.getMessage());
        }
    } 
    
    @auraEnabled(cacheable=true)
    public Static List<contact> getPrescriberContact(string prescriberId){
        try {
            List<contact> contactDetail = [select Id,FirstName,LastName,Email,Birthdate,Phone,Phone_Extension__c,
                                           Street_Address__c,Address_Line_2__c,Salutation__c,Medical_Assistant_Name__c,
                                           City__c,SSN__c,Zip_Code__c,State__c,Fax,Medical_Assistant_Phone__c
                                           from contact where Id =: prescriberId];
            return contactDetail;
        } catch(Exception ex) {
            throw new AurahandledException(ex.getMessage());
        }
    }
    
    @auraEnabled 
    public Static string createContact(string caseId, Contact contactDetails, string locationStage){
        try{
            Case caseDetail = [select Id,Prescriber__c from Case where id =: caseId];
            
            Contact newContact = new Contact(FirstName = contactDetails.FirstName,
                                             LastName = contactDetails.LastName,
                                             Street_Address__c = contactDetails.Street_Address__c,
                                             Address_Line_2__c = contactDetails.Address_Line_2__c,
                                             Email = contactDetails.Email,
                                             City__c = contactDetails.City__c,
                                             Birthdate = contactDetails.Birthdate,
                                             State__c = contactDetails.State__c,
                                             Phone = contactDetails.Phone,
                                             Zip_Code__c = contactDetails.Zip_Code__c,
                                             Phone_Extension__c  = contactDetails.Phone_Extension__c,
                                             Salutation__c = contactDetails.Salutation__c,
                                             Medical_Assistant_Name__c = contactDetails.Medical_Assistant_Name__c,
                                             Fax = contactDetails.Fax,
                                             Medical_Assistant_Phone__c = contactDetails.Medical_Assistant_Phone__c,
                                             HealthCloudGA__IndividualType__c = 'Prescriber',
                                             RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Provider').getRecordTypeId()
                                            );
            if(caseDetail.Prescriber__c != null){
                newContact.Id = caseDetail.Prescriber__c;
            }
            
            upsert newContact; 
            
            case c = new case();
            c.Prescriber__c = newContact.Id;
            c.Saved_Location__c = locationStage;
            c.Id = caseId; 
            update c;
            
            return 'Success';
        } catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    @auraEnabled 
    public Static string updateContact(Contact contactDetails){
        try {
            Contact newContact = new Contact(FirstName = contactDetails.FirstName,
                                             LastName = contactDetails.LastName,
                                             Street_Address__c = contactDetails.Street_Address__c,
                                             Address_Line_2__c = contactDetails.Address_Line_2__c,
                                             Email = contactDetails.Email,
                                             City__c = contactDetails.City__c,
                                             Birthdate = contactDetails.Birthdate,
                                             State__c = contactDetails.State__c,
                                             SSN__c = contactDetails.SSN__c,
                                             Zip_Code__c = contactDetails.Zip_Code__c,
                                             HomePhone = contactDetails.HomePhone,
                                             HealthCloudGA__Gender__c = contactDetails.HealthCloudGA__Gender__c,
                                             Gender__c = contactDetails.HealthCloudGA__Gender__c,
                                             Id = contactDetails.Id);
            
            Update newContact; 
            
            return 'Success';
        } catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    @auraEnabled 
    public Static string updateCase(Object caseDetails, List<Object> fileDatas, string locationStage, string patientId){
        try {
            Case fileData = (Case)JSON.deserialize(JSON.serialize(caseDetails), Case.class);
            
            Case newCase = new Case(Pharmacy_Plan_Name__c = fileData.Pharmacy_Plan_Name__c,
                                    Pharmacy_Plan_Phone__c = fileData.Pharmacy_Plan_Phone__c,
                                    Pharmacy_Policyholder_Name__c = fileData.Pharmacy_Policyholder_Name__c,
                                    Pharmacy_Policyholder_DOB__c = fileData.Pharmacy_Policyholder_DOB__c,
                                    Pharmacy_Rx_BIN__c = fileData.Pharmacy_Rx_BIN__c,
                                    Pharmacy_Rx_PCN__c = fileData.Pharmacy_Rx_PCN__c,
                                    Medical_Plan_Name__c = fileData.Medical_Plan_Name__c,
                                    Medical_Plan_Phone__c = fileData.Medical_Plan_Phone__c,
                                    Medical_Policyholder_Name__c = fileData.Medical_Policyholder_Name__c,
                                    Medical_Policyholder_DOB__c = fileData.Medical_Policyholder_DOB__c,
                                    Medical_Policyholder_Member_ID__c = fileData.Medical_Policyholder_Member_ID__c,
                                    MedicalGroupNumber__c = fileData.MedicalGroupNumber__c,
                                    Has_No_Insurance__c = fileData.Has_No_Insurance__c,
                                    Product__c = fileData.Product__c,
                                    Estimated_Annual_Household_Income__c = fileData.Estimated_Annual_Household_Income__c,
                                    Estimated_Household_Size__c = fileData.Estimated_Household_Size__c);
            
            newCase.Does_the_patient_live_in_United_States__c = string.valueof(fileData.Does_the_patient_live_in_United_States__c);
            system.debug('jhvjh'+fileData.Id);
            if (fileData.Id == null) {
                //newCase.Enrollment_Start_Date__c = system.today();
                //newCase.Enrollment_End_Date__c = system.today().addDays(30);
                newCase.Origin = 'Phone';
                newCase.Enrollment_Status__c = 'Saved to Complete Later';
                newCase.User_Type__c = 'Patient';
                newCase.Patient__c = patientId;
            } else {
                newCase.Id = fileData.Id;
            }
            
            if(locationStage == 'YES'){
                newCase.Enrollment_Status__c = 'Pending';
                newCase.Status = 'Pending';
            }
            else {
                if(locationStage != ''){
                    newCase.Saved_Location__c = locationStage;
                }
            }
            
            upsert newCase; 
            
            if (!fileDatas.isEmpty()) {
                List<ContentDocumentLink> cdl = DocumentUploadController.createContentVersion(fileDatas, newCase.Id);                
            }
            if(locationStage == 'YES'){
                insertPDF(newCase.Id);
            }
            return newCase.Id;
            
        } catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    @future(callout=true)
    public static void insertPDF(Id caseId){
        try{
            Case caseRecord =[SELECT ID,Product__c,User_Type__c from Case where id =:caseId];
            string networkQuery ='select id,name from Network where Name like '+'\'%'+caseRecord.User_Type__c+'%\'';
            Network networkRec=database.query(networkQuery);
            // Coversheet
            PageReference ref = Page.efaxcoversheet;   
            ref.getParameters().put('id',caseId);
            ContentVersion cont = new ContentVersion();
            cont.Title = 'Coversheet';
            cont.PathOnClient = 'CoverSheet.pdf';
            if(!Test.isRunningTest()){
                cont.VersionData = ref.getContentAsPdf();    
            }else{
                cont.VersionData = blob.valueOf('Test');    
            }            
            cont.Document_Type__c='Coversheet';
            cont.Sort_Order__c = 1;
            cont.NetworkId =networkRec.ID;
            insert cont; 
            ContentDocumentLink cdl = new ContentDocumentLink(); 
            cdl.ContentDocumentId = [select ContentDocumentId,Id from ContentVersion where  Id =:cont.Id].ContentDocumentId;
            cdl.LinkedEntityId = caseId;
            cdl.ShareType ='I';
            cdl.Visibility ='AllUsers';
            insert cdl;
            // application form
            
            PageReference refEnrollmentForm;
            if(caseRecord.Product__c == 'ABILIFY MAINTENA' || caseRecord.Product__c=='REXULTI')
                refEnrollmentForm = Page.OPAF_Neuroscience_Enrollment_FormTrim;
            else refEnrollmentForm = Page.OPAFNephrologyApplicationFormTrim;   
            refEnrollmentForm.getParameters().put('id',caseId);
            ContentVersion contApp = new ContentVersion();
            contApp.Title = 'Enrollment Form';
            contApp.PathOnClient = 'Enrollment Form.pdf';
            if(!Test.isRunningTest()){
                contApp.VersionData = refEnrollmentForm.getContentAsPdf();    
            }else{
                contApp.VersionData = blob.valueOf('Test');    
            }
            contApp.Document_Type__c='Enrollment Form';
            contApp.Sort_Order__c = 2;
            contApp.NetworkId = networkRec.ID;
            insert contApp; 
            ContentDocumentLink cdl1 = new ContentDocumentLink(); 
            cdl1.ContentDocumentId = [select ContentDocumentId,Id from ContentVersion where  Id =:contApp.Id].ContentDocumentId;
            cdl1.LinkedEntityId = caseId;
            cdl1.ShareType ='I';
            cdl1.Visibility ='AllUsers';
            insert cdl1;
            // Convert IMAGE To PDF
            List<contentdocumentlink> cdlList = [select Id,ContentDocument.LatestPublishedVersionId, ContentDocument.Title,ContentDocument.LatestPublishedVersion.Document_Type__c from contentdocumentlink where LinkedEntityId =:caseId and ContentDocument.LatestPublishedVersion.FileType!='PDF' order by ContentDocument.LatestPublishedVersion.Sort_Order__c asc nulls last];
            for(contentdocumentlink cdl2:cdlList){
            	ConvertImageToPDFController.createImage(cdl2,caseId, networkRec.ID);
            }
            
            sendAllDocument(caseId);    
        }catch(exception exp){
            
        }
        
    }
    @AuraEnabled
    public static void sendAllDocument(String caseId){
    	Case cs = [SELECT Id, Patient__c,User_Type__c,Product__c,Patient__r.FirstName,Patient__r.LastName FROM Case WHERE Id =: caseId];
        Id consentId;
        for(Consent__c consent:[select id,Patient__c,Contact_Record__c from Consent__c where Patient__c=:cs.Patient__c or Contact_Record__c =:cs.Patient__c order by createddate desc limit 1]){
            consentId = consent.Id;        
        }
        List<contentdocumentlink> cdlList = [select Id,ContentDocument.LatestPublishedVersionId, ContentDocument.Title,ContentDocument.LatestPublishedVersion.Document_Type__c from contentdocumentlink where LinkedEntityId =:caseId and ContentDocument.LatestPublishedVersion.FileType='PDF' order by ContentDocument.LatestPublishedVersion.Sort_Order__c asc nulls last];
        List<efaxapp__Sent_Fax__c> faxList = new List<efaxapp__Sent_Fax__c>();
        map<Integer, efaxapp__Sent_Fax__c> mapFax = new map<Integer, efaxapp__Sent_Fax__c>();
        Id PatientConsentId;
        if(consentId!=null){
            List<contentdocumentlink> consentCdlList = [select Id,ContentDocument.LatestPublishedVersionId, ContentDocument.Title,ContentDocument.LatestPublishedVersion.Document_Type__c from contentdocumentlink where LinkedEntityId =:consentId];
            if(consentCdlList.size()>0)
                PatientConsentId = consentCdlList[0].ContentDocument.LatestPublishedVersionId;
        }
        Boolean isNewFax = true;
        Integer Counter = 0;
        Id CoversheetId;
        Id EnrollmentId;
        
        for(contentdocumentlink cdl:cdlList){
            if(cdl.ContentDocument.LatestPublishedVersion.Document_Type__c =='Coversheet')
        	CoversheetId = cdl.ContentDocument.LatestPublishedVersionId;
            if(cdl.ContentDocument.LatestPublishedVersion.Document_Type__c =='Enrollment Form')
            EnrollmentId =cdl.ContentDocument.LatestPublishedVersionId;
        }
        Integer incrementTime = 0;
        for(contentdocumentlink cdl:cdlList){
            efaxapp__Sent_Fax__c fax;
            if(isNewFax){
                isNewFax = false;
                fax = new efaxapp__Sent_Fax__c();
                fax.efaxapp__Send_Date__c = Datetime.now().addMinutes(incrementTime);
                incrementTime =incrementTime +5;
                Counter = Counter + 1;
                fax.efaxapp__Attachment_ID__c = CoversheetId;                             
                fax.efaxapp__Attachment_ID2__c = EnrollmentId;
                
                
                if(Counter==1){
                 if(PatientConsentId!=null)
                    fax.efaxapp__Attachment_ID3__c = PatientConsentId;   
                }
                if(mapFax==null) mapFax.put(1,fax);
                else 
                mapFax.put(mapFax.size()+1,fax);
            }
            else{
                fax =  mapFax.get(Counter);
            }
			if(cdl.ContentDocument.LatestPublishedVersion.Document_Type__c =='Coversheet')
            	Continue;
            if(cdl.ContentDocument.LatestPublishedVersion.Document_Type__c =='Enrollment Form')
            	Continue;
            if(fax.efaxapp__Attachment_ID__c== null) 
                fax.efaxapp__Attachment_ID__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID2__c== null)
                fax.efaxapp__Attachment_ID2__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID3__c== null)
                fax.efaxapp__Attachment_ID3__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID4__c== null)
                fax.efaxapp__Attachment_ID4__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID5__c== null)
                fax.efaxapp__Attachment_ID5__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID6__c== null)
                fax.efaxapp__Attachment_ID6__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID7__c== null)
                fax.efaxapp__Attachment_ID7__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID8__c== null)
                fax.efaxapp__Attachment_ID8__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID9__c== null)
                fax.efaxapp__Attachment_ID9__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID10__c== null){
                fax.efaxapp__Attachment_ID10__c = cdl.ContentDocument.LatestPublishedVersionId;
                isNewFax = true;
            }
        }
        for(efaxapp__Sent_Fax__c faxRec: mapFax.values()){
            faxRec.efaxapp__Fax_Number__c = System.Label.EFax_Application_Send_To;//'8558762627' // recipient number – mandatory
            faxRec.efaxapp__Subject__c = cs.User_Type__c+'App-'+cs.Product__c+'-'+cs.Patient__r.FirstName+cs.Patient__r.LastName;  // any text, mandatory
            //faxRec.efaxapp__Send_Date__c = Datetime.now(); // mandatory,
            faxRec.efaxapp__Status__c = 'Sending'; // mandatory
            faxRec.efaxapp__Sent_With_Outbound_Message__c = True; // mandatory
            faxRec.efaxapp__Org_Fax_Number__c = System.label.EFax_From; // org fax number from which to send, mandatory
            System.debug('>>>'+faxRec);
            if(faxRec.efaxapp__Attachment_ID2__c!=null)
            faxList.add(faxRec);
        }
        if(faxList.size()>0)
        insert faxList;
    }
    @auraEnabled(cacheable = true)
    public static List<PickListValues> getAllProductValues() {
        List<PickListValues> productValues = new List<PickListValues>();
        list<Product_Setting__mdt> productSetting = [select id,MasterLabel,Actual_Name__c from Product_Setting__mdt Order by Actual_Name__c ASC];
        for (Product_Setting__mdt ps : productSetting) {
            PickListValues p = new PickListValues();
            p.label = ps.Actual_Name__c;
            p.value = ps.MasterLabel;
            productValues.add(p);
        }
        
        return productValues;
    }
    
    @auraEnabled(cacheable = true)
    public static List<PickListValues> getAllStateValues() {
        List<PickListValues> productValues = new List<PickListValues>();
        for (Schema.PicklistEntry ple :Contact.State__c.getDescribe().getPicklistValues()) {
            PickListValues p = new PickListValues();
            p.label = ple.getLabel();
            p.value = ple.getValue();
            productValues.add(p);
        }
        
        return productValues;
    }
    
    @auraEnabled(cacheable=true)
    public Static contact getCurrentUserContact(){
        try {
            user userDetails = [select id,name,ContactId from user where Id =: userInfo.getUserId()];
            contact contactDetail = [select Id,FirstName,LastName,Email,Birthdate,
                                     Street_Address__c,Address_Line_2__c,HealthCloudGA__Gender__c,
                                     City__c,SSN__c,Zip_Code__c,State__c,HomePhone
                                     from contact where Id =: userDetails.ContactId];
            return contactDetail;
        } catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    @auraEnabled 
    public Static string cloneCase(case caseDetails){
        try {
            system.debug('dcdrcdcdr'+caseDetails);
            Case cloneRecord = caseDetails.clone();
            cloneRecord.ParentId = caseDetails.Id;
            cloneRecord.Enrollment_Status__c = 'Saved to Complete Later';
            cloneRecord.User_Type__c='Patient';
            insert cloneRecord;
            //PbCloneDocuments pb=new PbCloneDocuments(caseDetails.Id,cloneRecord.Id);
            //PbCloneDocuments.cloneDocuments(new List<PbCloneDocuments>{pb});
            
            /*
            List<ContentDocumentLink> cloneDocuments = [SELECT ContentDocumentId,
                                                                        		Id,
                                                                        		IsDeleted,
                                                                        		LinkedEntityId,
                                                                        		ShareType,
                                                                        		Visibility FROM ContentDocumentLink where LinkedEntityId =: caseDetails.Id];
            for(ContentDocumentLink cdl : cloneDocuments){
                cdl.Id=null;
                cdl.LinkedEntityId = cloneRecord.Id;
            }
    		insert cloneDocuments;
            */
            return cloneRecord.Id;
        } catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    @auraEnabled(cacheable=true)
    public Static List<Case> getCaseDetails(string caseId, string buttonType){
        try {
            List<Case> contactDetail = new List<Case>();
            if(buttonType == 'ReEnroll' && string.isBlank(caseId)) {
                user userDetails = [select id,name,ContactId from user where Id =: userInfo.getUserId()];
                contactDetail = [select Id,Origin,Patient__c,Prescriber__c,Has_No_Insurance__c,Pharmacy_Plan_Name__c,
                                Pharmacy_Plan_Phone__c,Pharmacy_Policyholder_Name__c,Pharmacy_Policyholder_DOB__c,
                                Pharmacy_Rx_BIN__c,Pharmacy_Rx_PCN__c,Enrollment_Status__c,
                                Biotin_2500mcg__c,
                                Calcium_600mg__c,
                                Omega_3_Fish_Oil_1400mg__c,
                                Folic_Acid_400mcg__c,
                                Iron_65mg__c,
                                Multi_Complete__c,
                                Super_B_Comp_with_Folic_Biotin_and_C__c,
                                Vitamin_A_2400_mcg_8000_IU__c,
                                Vitamin_B1_100mg__c,
                                Vitamin_B6_100mg__c,
                                Vitamin_B12_1000mcg__c,
                                Vitamin_C_1000mg_Chewable__c,
                                Vitamin_C_1000mg__c,
                                Vitamin_D3_2000iu__c,
                                Vitamin_E_400iu_DL_ALPHA__c,
                                Medical_Plan_Name__c,Medical_Plan_Phone__c,Product__c,
                                Medical_Policyholder_Name__c,Medical_Policyholder_DOB__c,Medical_Policyholder_Member_ID__c,
                                MedicalGroupNumber__c from Case where ContactId =: userDetails.ContactId ORDER BY createdDate Desc limit 1];
            } else {
                contactDetail = [select Id,Origin,Patient__c,Prescriber__c,Has_No_Insurance__c,Pharmacy_Plan_Name__c,
                                 Pharmacy_Plan_Phone__c,Pharmacy_Policyholder_Name__c,Pharmacy_Policyholder_DOB__c,
                                 Pharmacy_Rx_BIN__c,Pharmacy_Rx_PCN__c,Estimated_Annual_Household_Income__c,
                                 Biotin_2500mcg__c,
                                 Calcium_600mg__c,
                                 Omega_3_Fish_Oil_1400mg__c,
                                 Folic_Acid_400mcg__c,
                                 Iron_65mg__c,
                                 Multi_Complete__c,
                                 Super_B_Comp_with_Folic_Biotin_and_C__c,
                                 Vitamin_A_2400_mcg_8000_IU__c,
                                 Vitamin_B1_100mg__c,
                                 Vitamin_B6_100mg__c,
                                 Vitamin_B12_1000mcg__c,
                                 Vitamin_C_1000mg_Chewable__c,
                                 Vitamin_C_1000mg__c,
                                 Vitamin_D3_2000iu__c,
                                 Vitamin_E_400iu_DL_ALPHA__c,
                                 Estimated_Household_Size__c,Medical_Plan_Name__c,Medical_Plan_Phone__c,Product__c,
                                 Medical_Policyholder_Name__c,Medical_Policyholder_DOB__c,Medical_Policyholder_Member_ID__c,
                                 MedicalGroupNumber__c,Does_the_patient_live_in_United_States__c from Case where id =: caseId];
            }
            
            return contactDetail;
        } catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    public class PickListValues {
        @auraEnabled
        public String label;
        @auraEnabled
        public String value;
    }
}