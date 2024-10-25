@isTest
public class CustomLookupLWCControllerTest {
    @testSetup
    public static void commonSetup() { 
        Id RecordTypeIdAccount = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Facility').getRecordTypeId();
        Account accountRecord = new Account(Name = 'Test Account',
                                 	RecordTypeId = RecordTypeIdAccount
                                 	);
        insert accountRecord;
    }
    
    @isTest static void testMethod1() {
        Test.startTest();
        CustomLookupLWCController.fetchLookupData('Test', 'Account', 'Facility', true);
        Test.stopTest();
    }
    
    @isTest static void testMethod2() {
        Test.startTest();
        CustomLookupLWCController.fetchLookupData('Test', 'Account', 'Facility', false);
        Test.stopTest();
    }
    
    @isTest static void testMethod3() {
        Test.startTest();
        CustomLookupLWCController.fetchLookupData('Test', 'Account', '', true);
        Test.stopTest();
    }
}