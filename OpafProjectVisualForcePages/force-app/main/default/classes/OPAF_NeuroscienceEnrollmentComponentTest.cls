@isTest
public with sharing class OPAF_NeuroscienceEnrollmentComponentTest {
	@testSetup
    public static void commonSetup() { 
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
                                  	User_Type__c = 'Prescriber');
        insert caseRecord;
        
        ContentVersion contentVersionRecord = new ContentVersion(Title = 'Test Doc',
                                                                	PathOnClient='/Test Doc.pdf',
                                                                	VersionData = blob.valueOf('Test'),
                                                                	origin = 'H',
                                                                	FirstPublishLocationId = caseRecord.Id,
                                                                	Document_Type__c = 'INSURANCE DOCUMENT');
        insert contentVersionRecord;
    } 
    
    testmethod static void testIfMethods(){
        Case cs = [SELECT Id FROM Case LIMIT 1];
        Test.startTest();
    	OPAF_NeuroscienceEnrollmentVfComponent NEF = new OPAF_NeuroscienceEnrollmentVfComponent();
        NEF.setCaseRecId(cs.Id);
        NEF.getCaseRecId();
        NEF.CaserecordDate();
        Test.stopTest();
    }
}