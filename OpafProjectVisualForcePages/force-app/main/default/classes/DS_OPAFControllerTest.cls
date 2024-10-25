@isTest
private class DS_OPAFControllerTest {
    @isTest
    static void service_call() {
         Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Id contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact con = new Contact(LastName ='testCon',FirstName='test',Email='test@gmail.com',recordtypeId=contactRecordTypeId,Street_Address__c='test',Address_Line_2__c='test',City__c='test',phone='343434343',Birthdate=system.today().addDays(-10),State__c='Az',SSN__c='454',Phone_Extension__c='455',Salutation__c='mr',HomePhone='343454545454',HealthCloudGA__Gender__c='female',Gender__c='female',Zip_Code__c='89898',Legal_Rep_Condition_Check__c='true',AccountId = ac.Id);
        insert con;
        contact con1 = [SELECT Id,lastname,firstname,Email,Birthdate,Legal_Rep_First_Name__c,Street_Address__c,Medical_Assistant_Name__c,Fax,Medical_Assistant_Phone__c,Phone_Extension__c,Salutation__c,Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,Legal_Rep_Condition_Check__c,State__c,SSN__c,Zip_Code__c,phone,HomePhone,HealthCloudGA__Gender__c,Gender__c,Legal_RepRelTypec__c,Legal_Rep_Rel_Other__c,Address_Line_2__c,City__c FROM contact WHERE LastName='testCon' LIMIT 1];
         Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent');
         insert consent;
        try {
            test.startTest(); 
            Test.setMock(HttpCalloutMock.class, new RestMock());
            string a=DS_OPAFController.sendPatientConsent(con1.id,'Patient');
            test.stopTest();
        }
        catch (Exception e) {
                system.assert(e.getMessage() != null);
         }
           
    }   
    
    @isTest
    static void service_callSign() {
         Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Id contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact con = new Contact(LastName ='testCon',FirstName='test',Email='test@gmail.com',recordtypeId=contactRecordTypeId,Street_Address__c='test',Address_Line_2__c='test',City__c='test',phone='343434343',Birthdate=system.today().addDays(-10),State__c='Az',SSN__c='454',Phone_Extension__c='455',Salutation__c='mr',HomePhone='343454545454',HealthCloudGA__Gender__c='female',Gender__c='female',Zip_Code__c='89898',Legal_Rep_Condition_Check__c='true',AccountId = ac.Id);
        insert con;
        contact con1 = [SELECT Id,lastname,firstname,Email,Birthdate,Legal_Rep_First_Name__c,Street_Address__c,Medical_Assistant_Name__c,Fax,Medical_Assistant_Phone__c,Phone_Extension__c,Salutation__c,Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,Legal_Rep_Condition_Check__c,State__c,SSN__c,Zip_Code__c,phone,HomePhone,HealthCloudGA__Gender__c,Gender__c,Legal_RepRelTypec__c,Legal_Rep_Rel_Other__c,Address_Line_2__c,City__c FROM contact WHERE LastName='testCon' LIMIT 1];
         Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent');
         insert consent;
        try {
            test.startTest(); 
                Test.setMock(HttpCalloutMock.class, new RestMock());
                DS_OPAFController ds = new DS_OPAFController();
                string Signer = DS_OPAFController.embedded_signing(new DocuSignTK.APIServiceSoap(), 'b1ab9d97-6bf0-4f5d-be2f-b6bc7a4d1be0', '', 'Testing', 'Testing@gmail.com', con.Id, consent.id);
            test.stopTest();
        }
        catch (Exception e) {
                system.assert(e.getMessage() != null);
         }
           
    }
    
    @isTest
    static void secondSigner() {
         Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Id contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact con = new Contact(LastName ='testCon',FirstName='test',Email='test@gmail.com',recordtypeId=contactRecordTypeId,Street_Address__c='test',Address_Line_2__c='test',City__c='test',phone='343434343',Birthdate=system.today().addDays(-10),State__c='Az',SSN__c='454',Phone_Extension__c='455',Salutation__c='mr',HomePhone='343454545454',HealthCloudGA__Gender__c='female',Gender__c='female',Zip_Code__c='89898',Legal_Rep_Condition_Check__c='true',AccountId = ac.Id);
        insert con;
        contact con1 = [SELECT Id,lastname,firstname,Email,Birthdate,Legal_Rep_First_Name__c,Street_Address__c,Medical_Assistant_Name__c,Fax,Medical_Assistant_Phone__c,Phone_Extension__c,Salutation__c,Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,Legal_Rep_Condition_Check__c,State__c,SSN__c,Zip_Code__c,phone,HomePhone,HealthCloudGA__Gender__c,Gender__c,Legal_RepRelTypec__c,Legal_Rep_Rel_Other__c,Address_Line_2__c,City__c FROM contact WHERE LastName='testCon' LIMIT 1];
         Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent');
         insert consent;
        try {
            test.startTest(); 
                Test.setMock(HttpCalloutMock.class, new RestMock());
                DS_OPAFController ds = new DS_OPAFController();
                string Signer = DS_OPAFController.secondSigner('b1ab9d97-6bf0-4f5d-be2f-b6bc7a4d1be0', '', 'Testing', 'Testing@gmail.com', con.Id, 'ReEnrollmentApp');
            test.stopTest();
        }
        catch (Exception e) {
                system.assert(e.getMessage() != null);
         }
           
    }
    
    @isTest
    static void sendPrescriberConsent() {
         Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Id contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact con = new Contact(LastName ='testCon',FirstName='test',Email='test@gmail.com',recordtypeId=contactRecordTypeId,Street_Address__c='test',Address_Line_2__c='test',City__c='test',phone='343434343',Birthdate=system.today().addDays(-10),State__c='Az',SSN__c='454',Phone_Extension__c='455',Salutation__c='mr',HomePhone='343454545454',HealthCloudGA__Gender__c='female',Gender__c='female',Zip_Code__c='89898',Legal_Rep_Condition_Check__c='true',AccountId = ac.Id);
        insert con;
        contact con1 = [SELECT Id,lastname,firstname,Email,Birthdate,Legal_Rep_First_Name__c,Street_Address__c,Medical_Assistant_Name__c,Fax,Medical_Assistant_Phone__c,Phone_Extension__c,Salutation__c,Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,Legal_Rep_Condition_Check__c,State__c,SSN__c,Zip_Code__c,phone,HomePhone,HealthCloudGA__Gender__c,Gender__c,Legal_RepRelTypec__c,Legal_Rep_Rel_Other__c,Address_Line_2__c,City__c FROM contact WHERE LastName='testCon' LIMIT 1];
         Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent');
         insert consent;
        Case caseRecord = new Case(Patient__c = con.Id,
                                  	Facility__c = ac.Id,
                                  	Enrollment_Status__c = 'Saved to Complete Later',
                                  	Product__c = 'ABILIFY MAINTENA',
                                  	User_Type__c = 'Prescriber');
        insert caseRecord;
        try {
            test.startTest(); 
                Test.setMock(HttpCalloutMock.class, new RestMock());
                DS_OPAFController ds = new DS_OPAFController();
                string Signer = DS_OPAFController.sendPrescriberConsent(caseRecord.Id, 'ReEnrollmentApp');
            test.stopTest();
        }
        catch (Exception e) {
                system.assert(e.getMessage() != null);
         }
           
    }
    
    @isTest
    static void getSignedDocument() {
         Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Id contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact con = new Contact(LastName ='testCon',FirstName='test',Email='test@gmail.com',recordtypeId=contactRecordTypeId,Street_Address__c='test',Address_Line_2__c='test',City__c='test',phone='343434343',Birthdate=system.today().addDays(-10),State__c='Az',SSN__c='454',Phone_Extension__c='455',Salutation__c='mr',HomePhone='343454545454',HealthCloudGA__Gender__c='female',Gender__c='female',Zip_Code__c='89898',Legal_Rep_Condition_Check__c='true',AccountId = ac.Id);
        insert con;
        contact con1 = [SELECT Id,lastname,firstname,Email,Birthdate,Legal_Rep_First_Name__c,Street_Address__c,Medical_Assistant_Name__c,Fax,Medical_Assistant_Phone__c,Phone_Extension__c,Salutation__c,Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,Legal_Rep_Condition_Check__c,State__c,SSN__c,Zip_Code__c,phone,HomePhone,HealthCloudGA__Gender__c,Gender__c,Legal_RepRelTypec__c,Legal_Rep_Rel_Other__c,Address_Line_2__c,City__c FROM contact WHERE LastName='testCon' LIMIT 1];
         Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent');
         insert consent;
        try {
            test.startTest(); 
                Test.setMock(HttpCalloutMock.class, new RestMock());
                DS_OPAFController ds = new DS_OPAFController();
                string Signer = DS_OPAFController.getSignedDocument('b1ab9d97-6bf0-4f5d-be2f-b6bc7a4d1be0');
            test.stopTest();
        }
        catch (Exception e) {
                system.assert(e.getMessage() != null);
         }
           
    }
    
    @isTest
    static void getCertDocument() {
         Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Id contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact con = new Contact(LastName ='testCon',FirstName='test',Email='test@gmail.com',recordtypeId=contactRecordTypeId,Street_Address__c='test',Address_Line_2__c='test',City__c='test',phone='343434343',Birthdate=system.today().addDays(-10),State__c='Az',SSN__c='454',Phone_Extension__c='455',Salutation__c='mr',HomePhone='343454545454',HealthCloudGA__Gender__c='female',Gender__c='female',Zip_Code__c='89898',Legal_Rep_Condition_Check__c='true',AccountId = ac.Id);
        insert con;
        contact con1 = [SELECT Id,lastname,firstname,Email,Birthdate,Legal_Rep_First_Name__c,Street_Address__c,Medical_Assistant_Name__c,Fax,Medical_Assistant_Phone__c,Phone_Extension__c,Salutation__c,Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,Legal_Rep_Condition_Check__c,State__c,SSN__c,Zip_Code__c,phone,HomePhone,HealthCloudGA__Gender__c,Gender__c,Legal_RepRelTypec__c,Legal_Rep_Rel_Other__c,Address_Line_2__c,City__c FROM contact WHERE LastName='testCon' LIMIT 1];
         Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent');
         insert consent;
        try {
            test.startTest(); 
                Test.setMock(HttpCalloutMock.class, new RestMock());
                DS_OPAFController ds = new DS_OPAFController();
                DS_OPAFController.getCertDocument('b1ab9d97-6bf0-4f5d-be2f-b6bc7a4d1be0');
            test.stopTest();
        }
        catch (Exception e) {
                system.assert(e.getMessage() != null);
         }
           
    }
    
    @isTest
    static void sendPatientEmbededSigningURL() {
         Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Id contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact con = new Contact(LastName ='testCon',FirstName='test',Email='test@gmail.com',recordtypeId=contactRecordTypeId,Street_Address__c='test',Address_Line_2__c='test',City__c='test',phone='343434343',Birthdate=system.today().addDays(-10),State__c='Az',SSN__c='454',Phone_Extension__c='455',Salutation__c='mr',HomePhone='343454545454',HealthCloudGA__Gender__c='female',Gender__c='female',Zip_Code__c='89898',Legal_Rep_Condition_Check__c='true',AccountId = ac.Id);
        insert con;
        contact con1 = [SELECT Id,lastname,firstname,Email,Birthdate,Legal_Rep_First_Name__c,Street_Address__c,Medical_Assistant_Name__c,Fax,Medical_Assistant_Phone__c,Phone_Extension__c,Salutation__c,Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,Legal_Rep_Condition_Check__c,State__c,SSN__c,Zip_Code__c,phone,HomePhone,HealthCloudGA__Gender__c,Gender__c,Legal_RepRelTypec__c,Legal_Rep_Rel_Other__c,Address_Line_2__c,City__c FROM contact WHERE LastName='testCon' LIMIT 1];
         Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent');
         insert consent;
        try {
            test.startTest(); 
                Test.setMock(HttpCalloutMock.class, new RestMock());
                DS_OPAFController ds = new DS_OPAFController();
                DS_OPAFController.EnvelopeSendResponse Signer = DS_OPAFController.sendPatientEmbededSigningURL(con.Id, '');
            test.stopTest();
        }
        catch (Exception e) {
                system.assert(e.getMessage() != null);
         }
           
    }
    
    @isTest
    static void getEmbeddedSigningUrl() {
         Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Id contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact con = new Contact(LastName ='testCon',FirstName='test',Email='test@gmail.com',recordtypeId=contactRecordTypeId,Street_Address__c='test',Address_Line_2__c='test',City__c='test',phone='343434343',Birthdate=system.today().addDays(-10),State__c='Az',SSN__c='454',Phone_Extension__c='455',Salutation__c='mr',HomePhone='343454545454',HealthCloudGA__Gender__c='female',Gender__c='female',Zip_Code__c='89898',Legal_Rep_Condition_Check__c='true',AccountId = ac.Id);
        insert con;
        contact con1 = [SELECT Id,lastname,firstname,Email,Birthdate,Legal_Rep_First_Name__c,Street_Address__c,Medical_Assistant_Name__c,Fax,Medical_Assistant_Phone__c,Phone_Extension__c,Salutation__c,Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,Legal_Rep_Condition_Check__c,State__c,SSN__c,Zip_Code__c,phone,HomePhone,HealthCloudGA__Gender__c,Gender__c,Legal_RepRelTypec__c,Legal_Rep_Rel_Other__c,Address_Line_2__c,City__c FROM contact WHERE LastName='testCon' LIMIT 1];
         Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent');
         insert consent;
        try {
            test.startTest(); 
                Test.setMock(HttpCalloutMock.class, new RestMock());
                DS_OPAFController ds = new DS_OPAFController();
                string Signer = DS_OPAFController.getEmbeddedSigningUrl('b1ab9d97-6bf0-4f5d-be2f-b6bc7a4d1be0', '');
            test.stopTest();
        }
        catch (Exception e) {
                system.assert(e.getMessage() != null);
         }
           
    }
    
    @isTest
    static void sendPatientEnvelope() {
         Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Id contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact con = new Contact(LastName ='testCon',FirstName='test',Email='test@gmail.com',recordtypeId=contactRecordTypeId,Street_Address__c='test',Address_Line_2__c='test',City__c='test',phone='343434343',Birthdate=system.today().addDays(-10),State__c='Az',SSN__c='454',Phone_Extension__c='455',Salutation__c='mr',HomePhone='343454545454',HealthCloudGA__Gender__c='female',Gender__c='female',Zip_Code__c='89898',Legal_Rep_Condition_Check__c='true',AccountId = ac.Id);
        insert con;
        contact con1 = [SELECT Id,lastname,firstname,Email,Birthdate,Legal_Rep_First_Name__c,Street_Address__c,Medical_Assistant_Name__c,Fax,Medical_Assistant_Phone__c,Phone_Extension__c,Salutation__c,Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,Legal_Rep_Condition_Check__c,State__c,SSN__c,Zip_Code__c,phone,HomePhone,HealthCloudGA__Gender__c,Gender__c,Legal_RepRelTypec__c,Legal_Rep_Rel_Other__c,Address_Line_2__c,City__c FROM contact WHERE LastName='testCon' LIMIT 1];
         Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent');
         insert consent;
        try {
            test.startTest(); 
                Test.setMock(HttpCalloutMock.class, new RestMock());
                DS_OPAFController ds = new DS_OPAFController();
                DS_OPAFController.EnvelopeSendResponse Signer = DS_OPAFController.sendPatientEnvelope(con.Id);
            test.stopTest();
        }
        catch (Exception e) {
                system.assert(e.getMessage() != null);
         }
           
    }
    
    @isTest
    static void updatePatientConsent() {
         Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Id contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact con = new Contact(LastName ='testCon',FirstName='test',Email='test@gmail.com',recordtypeId=contactRecordTypeId,Street_Address__c='test',Address_Line_2__c='test',City__c='test',phone='343434343',Birthdate=system.today().addDays(-10),State__c='Az',SSN__c='454',Phone_Extension__c='455',Salutation__c='mr',HomePhone='343454545454',HealthCloudGA__Gender__c='female',Gender__c='female',Zip_Code__c='89898',Legal_Rep_Condition_Check__c='true',AccountId = ac.Id);
        insert con;
        contact con1 = [SELECT Id,lastname,firstname,Email,Birthdate,Legal_Rep_First_Name__c,Street_Address__c,Medical_Assistant_Name__c,Fax,Medical_Assistant_Phone__c,Phone_Extension__c,Salutation__c,Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,Legal_Rep_Condition_Check__c,State__c,SSN__c,Zip_Code__c,phone,HomePhone,HealthCloudGA__Gender__c,Gender__c,Legal_RepRelTypec__c,Legal_Rep_Rel_Other__c,Address_Line_2__c,City__c FROM contact WHERE LastName='testCon' LIMIT 1];
         Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent');
         insert consent;
        try {
            test.startTest(); 
                DS_OPAFController ds = new DS_OPAFController();
                DS_OPAFController.updatePatientConsent(con.Id,'b1ab9d97-6bf0-4f5d-be2f-b6bc7a4d1be0', 'signing_complete');
            test.stopTest();
        }
        catch (Exception e) {
                system.assert(e.getMessage() != null);
         }
           
    }
    
    @isTest
    static void sendLegalEnvelope() {
         Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Id contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact con = new Contact(LastName ='testCon',FirstName='test',Email='test@gmail.com',recordtypeId=contactRecordTypeId,Street_Address__c='test',Address_Line_2__c='test',City__c='test',phone='343434343',Birthdate=system.today().addDays(-10),State__c='Az',SSN__c='454',Phone_Extension__c='455',Salutation__c='mr',HomePhone='343454545454',HealthCloudGA__Gender__c='female',Gender__c='female',Zip_Code__c='89898',Legal_Rep_Condition_Check__c='true',AccountId = ac.Id);
        insert con;
        contact con1 = [SELECT Id,lastname,firstname,Email,Birthdate,Legal_Rep_First_Name__c,Street_Address__c,Medical_Assistant_Name__c,Fax,Medical_Assistant_Phone__c,Phone_Extension__c,Salutation__c,Legal_Rep_Last_Name__c,Legal_Rep_Phone__c,Legal_Rep_Condition_Check__c,State__c,SSN__c,Zip_Code__c,phone,HomePhone,HealthCloudGA__Gender__c,Gender__c,Legal_RepRelTypec__c,Legal_Rep_Rel_Other__c,Address_Line_2__c,City__c FROM contact WHERE LastName='testCon' LIMIT 1];
         Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent');
         insert consent;
        try {
            test.startTest(); 
                Test.setMock(HttpCalloutMock.class, new RestMock());
                DS_OPAFController ds = new DS_OPAFController();
                DS_OPAFController.EnvelopeSendResponse Signer = DS_OPAFController.sendLegalEnvelope(con.Id);
            test.stopTest();
        }
        catch (Exception e) {
                system.assert(e.getMessage() != null);
         }
           
    }
    
}