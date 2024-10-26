@isTest
public class ConvertAttachmentToContent_TC {
    @testSetup
    static void commonSetup() { 
        Id RecordTypeIdAccount = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Facility').getRecordTypeId();
        Id PatientRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Id PrescriberRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Provider').getRecordTypeId();
        Account accountRecord = new Account(Name = 'Test Account',
                                 	RecordTypeId = RecordTypeIdAccount
                                 	);
        insert accountRecord;
        
        Contact patientRecord = new Contact(FirstName = 'Test',
                                            LastName = 'Patient',
                                            RecordTypeId = PatientRecordTypeId,
                                           	Email = 'test@test.com',
                                           	Birthdate = system.today().addYears(-20),
                                           	SSN__c = '123456789',
                                           	HomePhone = '12345678890',
                                           	HealthCloudGA__Gender__c = 'Male',
                                           	Gender__c = 'Male',
                                           	Street_Address__c = 'Test Street',
                                           	Address_Line_2__c = 'Test',
                                           	City__c = 'Tulsa',
                                           	State__c = 'OK',
                                           	Zip_Code__c = '12345');
        insert patientRecord;
        
        Contact prescriberRecord = new Contact(FirstName = 'Test',
                                 	LastName = 'Prescriber',
                                 	RecordTypeId = PrescriberRecordTypeId);
        insert prescriberRecord;
        
        Prescription__c prescriptionRecord = new Prescription__c(Name = 'Test Prescription',
                                                                	Quantity__c = '4',
                                                                	Number_of_Refills__c = '4',
                                                                	Dosage__c = '300 mg');
        insert prescriptionRecord;
        
        Case caseRecord = new Case(Patient__c = patientRecord.Id,
                                  	Facility__c = accountRecord.Id,
                                  	Prescriber__c = prescriberRecord.Id,
                                  	Prescription1__c = prescriptionRecord.Id,
                                  	Enrollment_Status__c = 'Saved to Complete Later',
                                  	Product__c = 'ABILIFY MAINTENA',
                                  	User_Type__c = 'Prescriber',
                                  	Same_ICD_10__c = false,
                                  	Patient_with_Same_Provider__c = false);
        insert caseRecord; 
        
        Consent__c consentRecord = new Consent__c(Consent_Type__c = 'New Consent', 
                                                 	Contact_Record__c = patientRecord.Id,
                                                 	Patient__c = patientRecord.Id);
        insert consentRecord;
        
        ContentVersion contentVersionRecord = new ContentVersion(Title = 'Test Doc',
                                                                	PathOnClient='/Test Doc.pdf',
                                                                	VersionData = blob.valueOf('Test'),
                                                                	origin = 'H',
                                                                	FirstPublishLocationId = caseRecord.Id,
                                                                	Document_Type__c = 'RxDocument');
        insert contentVersionRecord;
        
        efaxapp__Sent_Fax__c faxRecord = new efaxapp__Sent_Fax__c(efaxapp__Account__c = accountRecord.Id,
                                                                 	efaxapp__Attachment_ID__c = contentVersionRecord.Id,
                                                                 	efaxapp__Fax_Number__c = '18005519391',
                                                                 	efaxapp__Send_Date__c = system.today(),
                                                                 	efaxapp__Subject__c = 'Prescription Form EFax');
        insert faxRecord;
    } 
    @isTest static void testAttachment(){  
        Case caseRec = [select id from case limit 1];
        Test.startTest();
        Attachment a = new attachment();
        a.ParentID = caseRec.Id;
        a.Body = Blob.ValueOf('Test');
        a.ContentType = 'text/plain';
        a.Name = 'test';
        insert a;
        test.stopTest();
    }
    @isTest static void testShipment(){  
        Case caseRec = [select id from case limit 1];
        Test.startTest();
        Shipment__C a = new Shipment__C();
        a.Case__c = caseRec.Id;
        insert a;
        test.stopTest();
    }

}