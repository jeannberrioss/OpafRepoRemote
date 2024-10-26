@isTest
public with sharing class PatientEmailTempalteControllerTest {
	@testSetup
    public static void commonSetup() { 
        Case caseRecord = new Case(Enrollment_Status__c = 'Saved to Complete Later',
                                  	Product__c = 'ABILIFY MAINTENA',
                                  	User_Type__c = 'Prescriber');
        insert caseRecord; 
    }
    
    testmethod static void testIfMethods(){ 
        Test.startTest();
        PatientEmailTempalteController PET = new PatientEmailTempalteController();
        PET.getcasereclist();
        Test.stopTest();
    }
}