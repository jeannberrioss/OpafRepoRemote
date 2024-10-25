@isTest
public with sharing class eConsentEmailTempalteControllerTest {
	@testSetup
    public static void commonSetup() {
        Id PatientRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Contact patientRecord = new Contact(FirstName = 'Test',
                                            LastName = 'Patient',
                                            RecordTypeId = PatientRecordTypeId,
                                           	Email = 'test@test.com'
                                           	);
        insert patientRecord;
        
        Consent__c consentRecord = new Consent__c(Consent_Type__c = 'New Consent', 
                                                 	Contact_Record__c = patientRecord.Id,
                                                 	Patient__c = patientRecord.Id);
        insert consentRecord;
    }
    
    testmethod static void testIfMethods(){
        Test.startTest();
        eConsentEmailTempalteController CET = new eConsentEmailTempalteController();
        CET.getConsentreclist();
        Test.stopTest();
    }
}