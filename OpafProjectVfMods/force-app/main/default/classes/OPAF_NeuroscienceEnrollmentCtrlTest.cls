@isTest
public with sharing class OPAF_NeuroscienceEnrollmentCtrlTest {
    @testSetup
    public static void commonSetup() { 
        Case caseRecord = new Case(Enrollment_Status__c = 'Saved to Complete Later',
                                  	Product__c = 'ABILIFY MAINTENA',
                                  	User_Type__c = 'Prescriber');
        insert caseRecord; 
    }
    testmethod static void testIfMethods(){
        Case cs = [SELECT Id FROM Case LIMIT 1];
        Test.startTest();
        ApexPages.currentPage().getParameters().put('id', cs.Id) ;
        ApexPages.StandardController sc = new ApexPages.StandardController(cs);
        OPAF_NeuroscienceEnrollmentController NEC = new OPAF_NeuroscienceEnrollmentController(sc);
        Test.stopTest();
    }
}