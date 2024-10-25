@isTest
private class myWorkSpaceLWCControllerTest {
    
    @testSetup static void setup() {
        
        
        Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Id contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact con = new Contact(LastName ='testCon',FirstName='test',Email='test@gmail.com',recordtypeId=contactRecordTypeId,Street_Address__c='test',HealthCloudGA__IndividualType__c='Prescriber',Medical_Assistant_Phone__c='4343434343',fax='5454545',Medical_Assistant_Name__c='test',Address_Line_2__c='test',City__c='test',phone='343434343',Birthdate=system.today().addDays(-10),State__c='Az',SSN__c='454',Phone_Extension__c='455',Salutation__c='mr',HomePhone='343454545454',HealthCloudGA__Gender__c='female',Gender__c='female',Zip_Code__c='89898',Legal_Rep_Condition_Check__c='true',AccountId = ac.Id);
        insert con;
        
        Id p = [select id from profile where name='Customer Community Plus Login User Custom'].id;
        
        User use = new User(alias = 'test123', email='test123@noemail.com',
                            emailencodingkey='UTF-8', lastname='Testing', languagelocalekey='en_US',
                            localesidkey='en_US', profileid = p, country='United States',IsActive =true,
                            ContactId = con.Id,
                            timezonesidkey='America/Los_Angeles', username='tester@noemail.com');
        insert use;
        System.runAs(use) {
            
            Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent',EnvelopeId__c='Test Id');
            insert consent;
        }
            
            //create common test cases
            List<case> testCases = new List<Case>();
            for(Integer i=0;i<2;i++) {
                testCases.add(new case(contactid=con.id,Enrollment_Start_Date__c = system.today().addDays(-10),Enrollment_End_Date__c = system.today().addDays(10)));
            }
        System.runAs(use) {
            insert testCases;
        }
            
            List<Shipment__c> shipList = new List<Shipment__c>();
            for(Integer i=0;i<2;i++) {
                shipList.add(new Shipment__c(case__c=testCases[0].id));
            }
            insert shipList;
            
            List<Missing_Info__c> MissingInfoList = new List<Missing_Info__c>();
            for(Integer i=0;i<2;i++) {
                MissingInfoList.add(new Missing_Info__c(case__c=testCases[0].id,Date_Of_Hospital_Admission__c='Y',Date_of_Hospital_Discharge__c='Y',Demographics__c='Y',
                                                        Diagnosis__c='Y',Dosage__c='Y',Dosage_Strength__c='Y',Dr_Signature_Date__c='Y',Expenses__c='Y',Frequency_Days_supply__c='Y',
                                                        HIPAA_Authorization__c='Y',Household_Size__c='Y',Income_Expenses__c='Y',Income_Amount__c='Y',Income_Documentation__c='Y',
                                                        Insurance__c='Y',Insurance_Denial_Letter__c='Y',Insurance_Termination_Letter__c='Y',Medicaid_Denial_Letter__c='Y',Medicare_Part_D_Card__c='Y',
                                                        No_Prescription_Form__c='Y',No_Quantity_Indicated__c='Y',NPI_Number__c='Y',Number_of_Refills__c='Y',Number_of_Vials__c='Y',
                                                        Patient_Signature__c='Y',Patient_Signature_Date__c='Y',Prescriber_DEA__c='Y',Prescriber_Signature__c='Y',Prescriber_SLN__c='Y',
                                                        Provider_Income_Attestation__c='Y',Provider_Insurance_Attestation__c='Y',Provider_Signature__c='Y',Reenrollment_Request__c='Y',
                                                        REMS_Enrollment__c='Y',Residency__c='Y',Underinsured_Policy__c='Y'));
            }
            insert MissingInfoList;
            
            //Create Document
            ContentVersion cv = new ContentVersion();
            cv.Title = 'Test Document';
            cv.PathOnClient = 'TestDocument.pdf';
            cv.VersionData = Blob.valueOf('Test Content');
            cv.IsMajorVersion = true;
            Insert cv;
            
            //Get Content Version
            List<ContentVersion> cvList = [SELECT Id, Title, ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id];
            System.assertEquals(cvList.size(), 1);
            
            //Get Content Documents
            List<ContentDocument> cdList = [SELECT Id, Title, LatestPublishedVersionId FROM ContentDocument];
            System.assertEquals(cdList.size(), 1);
   
    }
    
    @isTest 
    static void testMethod1() {
        user use=[select id,name from user limit 1];
        contact con = [SELECT Id,HealthCloudGA__IndividualType__c,lastname,firstname,Email,Birthdate,Legal_Rep_First_Name__c,Street_Address__c,Medical_Assistant_Name__c,Fax,Medical_Assistant_Phone__c,Phone_Extension__c,Salutation__c,Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,Legal_Rep_Condition_Check__c,State__c,SSN__c,Zip_Code__c,phone,HomePhone,HealthCloudGA__Gender__c,Gender__c,Legal_RepRelTypec__c,Legal_Rep_Rel_Other__c,Address_Line_2__c,City__c FROM contact WHERE LastName='testCon' LIMIT 1];
        
        Case cs= [SELECT Id FROM Case LIMIT 1];
        List<String> envelopeIds = new List<String>();
        envelopeIds.add('Test Id');
        Consent__c cn = [select id, EnvelopeId__c from Consent__c];
        ContactShare objContactShare = new ContactShare();
        objContactShare.ContactAccessLevel = 'Edit';
        objContactShare.ContactId = con.Id;
        objContactShare.RowCause = 'Manual';
        objContactShare.UserOrGroupId = use.id;
        //insert objContactShare;
        
        ContentDocument cd = [select id from ContentDocument limit 1];
        DocumentUploadController.FileInfo empW = new DocumentUploadController.FileInfo();
        //Create Document
        ContentVersion cv = new ContentVersion();
        cv.Title = 'Test Document';
        cv.PathOnClient = 'TestDocument.pdf';
        cv.VersionData = Blob.valueOf('Test Content');
        cv.IsMajorVersion = true;
        cv.Document_Type__c ='Coversheet';
        Insert cv;
        set<id> conVersionIds = new set<Id>();
        conVersionIds.add(cv.id);
        
        //Get Content Documents
        Id conDocId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:cv.Id].ContentDocumentId;
        
        System.debug('*****contentDocument***'+conDocId);
        //Create ContentDocumentLink 
        ContentDocumentLink cdl = New ContentDocumentLink();
        cdl.LinkedEntityId = cs.Id;
        cdl.ContentDocumentId = conDocId;
        cdl.shareType = 'V';
        Insert cdl;
        
        
        system.debug(cdl.LinkedEntityId+'******'+cdl.ContentDocumentId+'*****'+cdl);
        empW.Title ='test';
        empW.DocumentType='text';
        empW.VersionData=Blob.valueOf('Test Content');
        
        
        String jsonVal ='{"Title":"","VersionData":"","DocumentType":""}' ; 
        List<Object> jsonList = new List<Object>();
        jsonList.add(empW);
        
        List<Object> caseJsonList = new List<object>();
        caseJsonList.add(cs);
        system.runAs(use) {
            myWorkSpaceLWCController.getCaseList();
            myWorkSpaceLWCController.getShipmentList(cs.id);
            myWorkSpaceLWCController.getMissingInfo(cs.id);
            myWorkSpaceLWCController.getCasebyEnrollmentStartDate(cs.id);
            myWorkSpaceLWCController.createCaseRecord();
            
            //PatientConsentController.getCurrentUserContact();
            PatientConsentController.updateContact(con,'Paper Consent',jsonList);
            try{
            PatientConsentController.updateConsent1(cn.Id, 'b1ab9d97-6bf0-4f5d-be2f-b6bc7a4d1be0');
            PatientConsentController.getCurrentUserContact();
            }
            catch(exception e){}
            
            OPAFApplicationFormController.getAllDocuments(con.id);
            OPAFApplicationFormController.deleteFile(cd.Id);
            OPAFApplicationFormController.getPrescriberContact(con.id);
            OPAFApplicationFormController.updateContact(con);
            try{
             OPAFApplicationFormController.createContact(cs.id,con,'StepOne');
            }
            catch(Exception e){
            }
            OPAFApplicationFormController.updateCase(cs,jsonList,'StepOne',con.id);
            OPAFApplicationFormController.updateCase(cs,jsonList,'YES',con.id);
            case caseInsert = new Case();
            caseInsert.contactid=con.id;
            caseInsert.Enrollment_Start_Date__c = system.today().addDays(-10);
            caseInsert.Enrollment_End_Date__c = system.today().addDays(10);
            OPAFApplicationFormController.updateCase(caseInsert,jsonList,'YES',con.id);
            
            OPAFApplicationFormController.insertPDF(cs.id);
            OPAFApplicationFormController.sendAllDocument(cs.id);
            OPAFApplicationFormController.getAllProductValues();
            OPAFApplicationFormController.getAllStateValues();
            //OPAFApplicationFormController.getCurrentUserContact();
            OPAFApplicationFormController.getCaseDetails(cs.id,'ReEnroll');
            
            
            PrescriberPatientConsentController.getContactDetails(con.id);
            PrescriberPatientConsentController.deleteFile(cd.id);
            PrescriberPatientConsentController.getAllDocuments(con.id);
            //PrescriberPatientConsentController.getCurrentUserContact();
            PrescriberPatientConsentController.updateConsent1(con.id,'4747-587857-45485');
            PrescriberPatientConsentController.updateNewContact(con,con.id,true,true,'Onsite',jsonList);
            PrescriberPatientConsentController.updateNewContact(con,con.id,true,true,'Paper',jsonList);
            PrescriberPatientConsentController.updateNewContact(con,con.id,true,true,'Email',jsonList);
            PrescriberPatientConsentController.updateEmailConsent(envelopeIds);
            PrescriberPatientConsentController.createForm(envelopeIds);
            
        }
        
        
    }
    
}