@isTest
private class DocumentUploadControllerTest {
    
    @testSetup static void setup() {
        
        Account ac = new Account(name ='Grazitti') ;
        insert ac;
        
        Contact con = new Contact(LastName ='testCon',AccountId = ac.Id);
        insert con;
        Consent__c consent = new Consent__c(Contact_Record__c=con.id,Consent_Type__c='New Consent');
        insert consent;
        
        //create common test cases
        List<case> testCases = new List<Case>();
        for(Integer i=0;i<2;i++) {
           testCases.add(new case(contactid=con.id,Enrollment_Start_Date__c = system.today().addDays(-10),Enrollment_End_Date__c = system.today().addDays(10)));
        }
        insert testCases;
        
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
        
        
        
    }
    @isTest static void testMethod1() {
       contact con = [SELECT Id FROM contact WHERE LastName='testCon' LIMIT 1];
       //Create Document
        ContentVersion cv = new ContentVersion();
        cv.Title = 'Test Document';
        cv.PathOnClient = 'TestDocument.pdf';
        cv.VersionData = Blob.valueOf('Test Content');
        cv.IsMajorVersion = true;
        Insert cv;
        set<id> conVersionIds = new set<Id>();
        conVersionIds.add(cv.id);
         
        //Get Content Documents
        Id conDocId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:cv.Id].ContentDocumentId;
         
        //Create ContentDocumentLink 
        ContentDocumentLink cdl = New ContentDocumentLink();
        cdl.LinkedEntityId = con.Id;
        cdl.ContentDocumentId = conDocId;
        cdl.shareType = 'V';
        Insert cdl;
        DocumentUploadController.FileInfo empW = new DocumentUploadController.FileInfo();
        empW.Title ='test';
        empW.DocumentType='text';
        empW.VersionData=Blob.valueOf('Test Content');
        
        contentVersion cv1 = new contentVersion();
        cv1.VersionData=empW.VersionData;
        cv1.Title = empW.Title;
        cv1.PathOnClient = empW.Title;
        cv1.Document_Type__c = empW.DocumentType;
        insert cv1;
        
        String jsonVal ='{"Title":"","VersionData":"","DocumentType":""}' ; 
        List<Object> jsonList = new List<Object>();
        jsonList.add(empW);
        
        //string str= DocumentUploadController.FileInfo(jsonVal);

        DocumentUploadController.getAllDocuments(con.id);
        DocumentUploadController.createContentLink(conVersionIds,con.id);
        DocumentUploadController.createContentVersion(jsonList,con.id);
    }
}