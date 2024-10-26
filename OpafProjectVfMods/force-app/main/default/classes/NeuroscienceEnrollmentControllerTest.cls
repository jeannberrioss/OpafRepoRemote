@isTest
public class NeuroscienceEnrollmentControllerTest {
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
                                           	//SSN__c = '123456789',
                                           	HomePhone = '12345678890',
                                           	HealthCloudGA__Gender__c = 'Male',
                                           	Gender__c = 'Male',
                                           	Street_Address__c = 'Test Street',
                                           	Address_Line_2__c = 'Test',
                                           	City__c = 'Tulsa',
                                           	State__c = 'OK',
                                           	Zip_Code__c = '12345');
        insert patientRecord;
        
        Case caseRecord = new Case(Patient__c = patientRecord.Id,
                                  	Facility__c = accountRecord.Id,
                                  	Product__c = 'ABILIFY MAINTENA');
        insert caseRecord; 
    }
    
    @isTest static void testIfMethods(){ 
         Case cs = [SELECT Id, Patient__c,Patient__r.Firstname,Patient__r.LastName,Product__c FROM Case LIMIT 1];
        ApexPages.currentPage().getParameters().put('id', cs.Id);
        ApexPages.StandardController sc = new ApexPages.StandardController(cs);
        OPAF_NeuroscienceEnrollmentController NEC = new OPAF_NeuroscienceEnrollmentController(sc);
    }
    
    
}