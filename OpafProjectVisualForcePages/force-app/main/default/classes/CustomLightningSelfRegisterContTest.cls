@IsTest(SeeAllData=true)
public without sharing class CustomLightningSelfRegisterContTest {  

    /**
     * Tests successful self-registration for a Patient site.
     */
    // @IsTest
    // static void testSelfRegister_Success_Patient() {
    //     // Set up mock response for NPI Registry (not needed for Patient site)
    //     Test.setMock(HttpCalloutMock.class, new NpiRegistryMockSuccessResponse());

    //     // Prepare input parameters
    //     String firstName = 'John';
    //     String lastName = 'Doe';
    //     String email = 'john.doe@example.com';
    //     String npiNumber = ''; // Not required for Patient
    //     String password = 'Password123';
    //     String confirmPassword = 'Password123';
    //     String accountId = '';
    //     String regConfirmUrl = '/confirmation';
    //     String extraFields = null;
    //     String startUrl = '/home';
    //     Boolean includePassword = true;
    //     String contactType = 'Individual';
    //     String salutation = 'Mr.';
    //     String suffix = 'Jr.';
    //     String workPhone = '123-456-7890';
    //     String mobilePhone = '098-765-4321';
    //     String workFax = '123-456-7891';
    //     String methodOfContact = 'Email';
        
    //     Test.startTest();
    //         String result = CustomLightningSelfRegisterController.selfRegister(
    //             firstName,
    //             lastName,
    //             email,
    //             npiNumber,
    //             password,
    //             confirmPassword,
    //             accountId,
    //             regConfirmUrl,
    //             extraFields,
    //             startUrl,
    //             includePassword,
    //             contactType,
    //             salutation,
    //             suffix,
    //             workPhone,
    //             mobilePhone,
    //             workFax,
    //             methodOfContact
    //         );
    //     Test.stopTest();
        
    //     // Assert that registration was successful
    //     System.assertEquals(null, result, 'Registration should be successful for Patient site.');
        
    //     // Verify that the user was created
    //     User createdUser = [SELECT Id, Username, Email, FirstName, LastName FROM User WHERE Email = :email LIMIT 1];
    //     System.assertNotEquals(null, createdUser, 'User should be created.');
    //     System.assertEquals(email, createdUser.Email, 'Email should match.');
    //     System.assertEquals(firstName, createdUser.FirstName, 'First name should match.');
    //     System.assertEquals(lastName, createdUser.LastName, 'Last name should match.');
    // }
    
    /**
     * Tests successful self-registration for a Prescriber site with valid NPI.
     */
    @IsTest
    static void testSelfRegister_Success_Prescriber_ValidNpi() {
        // Prepare input parameters
        String firstName = 'Alice';
        String lastName = 'Smith';
        String email = 'alice.smith@example.com';
        String npiNumber = '1234567890'; // Valid NPI
        String password = 'SecurePass!1';
        String confirmPassword = 'SecurePass!1';
        String accountId = '';
        String regConfirmUrl = '/confirmation';
        String extraFields = null;
        String startUrl = '/home';
        Boolean includePassword = true;
        String contactType = 'Provider';
        String salutation = 'Dr.';
        String suffix = 'MD';
        String workPhone = '321-654-0987';
        String mobilePhone = '789-012-3456';
        String workFax = '321-654-0988';
        String methodOfContact = 'Phone';
        
        Test.startTest();
            // Set up mock response for NPI Registry with result_count=1
            Test.setMock(HttpCalloutMock.class, new NpiRegistryMockSuccessResponse());
            String result = CustomLightningSelfRegisterController.selfRegister(
                firstName,
                lastName,
                email,
                npiNumber,
                password,
                confirmPassword,
                accountId,
                regConfirmUrl,
                extraFields,
                startUrl,
                includePassword,
                contactType,
                salutation,
                suffix,
                workPhone,
                mobilePhone,
                workFax,
                methodOfContact
            );
        Test.stopTest();
        
        // Assert that registration was successful
        System.assertEquals(null, result, 'Registration should be successful for Prescriber site with valid NPI.');
        
        // Verify that the user was created
        User createdUser = [SELECT Id, Username, Email, FirstName, LastName FROM User WHERE Email = :email LIMIT 1];
        System.assertNotEquals(null, createdUser, 'User should be created.');
        System.assertEquals(email, createdUser.Email, 'Email should match.');
        System.assertEquals(firstName, createdUser.FirstName, 'First name should match.');
        System.assertEquals(lastName, createdUser.LastName, 'Last name should match.');
        
        // Verify that the associated Account was created
        Contact createdContact = [SELECT Id, AccountId, FirstName, LastName FROM Contact WHERE Email = :email LIMIT 1];
        System.assertNotEquals(null, createdContact.AccountId, 'Account should be associated with the Contact.');
        
        Account associatedAccount = [SELECT Id, Name FROM Account WHERE Id = :createdContact.AccountId LIMIT 1];
        System.assertEquals(firstName + ' ' + lastName, associatedAccount.Name, 'Account name should match the Contact name.');
        
        // Verify that the Permission Set was assigned (if not running in test context)
        // Since Test.isRunningTest() is true, the permission set assignment is skipped in the actual code.
    }
    
    /**
     * Tests self-registration failure when required fields are missing.
     */
    @IsTest
    static void testSelfRegister_Failure_MissingRequiredFields() {
        // Prepare input parameters with missing firstName and lastName
        String firstName = '';
        String lastName = '';
        String email = '';
        String npiNumber = ''; 
        String password = 'Password123';
        String confirmPassword = 'Password123';
        String accountId = '';
        String regConfirmUrl = '/confirmation';
        String extraFields = null;
        String startUrl = '/home';
        Boolean includePassword = true;
        String contactType = 'Individual';
        String salutation = 'Mr.';
        String suffix = 'Jr.';
        String workPhone = '123-456-7890';
        String mobilePhone = '098-765-4321';
        String workFax = '123-456-7891';
        String methodOfContact = 'Email';
        
        Test.startTest();
            String result = CustomLightningSelfRegisterController.selfRegister(
                firstName,
                lastName,
                email,
                npiNumber,
                password,
                confirmPassword,
                accountId,
                regConfirmUrl,
                extraFields,
                startUrl,
                includePassword,
                contactType,
                salutation,
                suffix,
                workPhone,
                mobilePhone,
                workFax,
                methodOfContact
            );
        Test.stopTest();
        
        // Assert that registration failed due to missing firstName
        System.assertEquals('First name is required.', result, 'Should return error for missing first name.');
    }
    
    /**
     * Tests self-registration failure when passwords do not match.
     */
    @IsTest
    static void testSelfRegister_Failure_PasswordMismatch() {
        // Set up mock response for NPI Registry (not needed for Patient site)
        Test.setMock(HttpCalloutMock.class, new NpiRegistryMockSuccessResponse());

        // Prepare input parameters with password mismatch
        String firstName = 'Jane';
        String lastName = 'Doe';
        String email = 'jane.doe@example.com';
        String npiNumber = '1234567890'; // Valid NPI
        String password = 'Password123';
        String confirmPassword = 'Password321';
        String accountId = '';
        String regConfirmUrl = '/confirmation';
        String extraFields = null;
        String startUrl = '/home';
        Boolean includePassword = true;
        String contactType = 'Individual';
        String salutation = 'Ms.';
        String suffix = 'Sr.';
        String workPhone = '555-555-5555';
        String mobilePhone = '444-444-4444';
        String workFax = '555-555-5556';
        String methodOfContact = 'Email';
        
        Test.startTest();
            String result = CustomLightningSelfRegisterController.selfRegister(
                firstName,
                lastName,
                email,
                npiNumber,
                password,
                confirmPassword,
                accountId,
                regConfirmUrl,
                extraFields,
                startUrl,
                includePassword,
                contactType,
                salutation,
                suffix,
                workPhone,
                mobilePhone,
                workFax,
                methodOfContact
            );
        Test.stopTest();
        
        // Assert that registration failed due to password mismatch
        System.assertEquals(Label.Site.passwords_dont_match, result, 'Should return error for password mismatch.');
    }
    
    /**
     * Tests self-registration failure for Prescriber site with invalid NPI.
     */
    @IsTest
    static void testSelfRegister_Failure_Prescriber_InvalidNpi() {
        // Prepare input parameters with invalid NPI
        String firstName = 'Bob';
        String lastName = 'Builder';
        String email = 'bob.builder@example.com';
        String npiNumber = '0000000000'; // Invalid NPI
        String password = 'BuilderPass!1';
        String confirmPassword = 'BuilderPass!1';
        String accountId = '';
        String regConfirmUrl = '/confirmation';
        String extraFields = null;
        String startUrl = '/home';
        Boolean includePassword = true;
        String contactType = 'Provider';
        String salutation = 'Mr.';
        String suffix = 'DDS';
        String workPhone = '222-222-2222';
        String mobilePhone = '333-333-3333';
        String workFax = '222-222-2223';
        String methodOfContact = 'Phone';
        
        Test.startTest();
            // Set up mock response for NPI Registry with result_count=0
            Test.setMock(HttpCalloutMock.class, new NpiRegistryMockInvalidNpiResponse());
            String result = CustomLightningSelfRegisterController.selfRegister(
                firstName,
                lastName,
                email,
                npiNumber,
                password,
                confirmPassword,
                accountId,
                regConfirmUrl,
                extraFields,
                startUrl,
                includePassword,
                contactType,
                salutation,
                suffix,
                workPhone,
                mobilePhone,
                workFax,
                methodOfContact
            );
        Test.stopTest();
        
        // Assert that registration failed due to invalid NPI
        System.assertEquals('Invalid NPI number.', result, 'Should return error for invalid NPI.');
    }
    
    /**
     * Tests self-registration failure when NPI Registry returns errors.
     */
    @IsTest
    static void testSelfRegister_Failure_Prescriber_NpiRegistryErrors() {
        // Prepare input parameters with NPI that causes errors
        String firstName = 'Charlie';
        String lastName = 'Chaplin';
        String email = 'charlie.chaplin@example.com';
        String npiNumber = '123'; // Causes error
        String password = 'CharliePass!1';
        String confirmPassword = 'CharliePass!1';
        String accountId = '';
        String regConfirmUrl = '/confirmation';
        String extraFields = null;
        String startUrl = '/home';
        Boolean includePassword = true;
        String contactType = 'Provider';
        String salutation = 'Mr.';
        String suffix = 'PhD';
        String workPhone = '777-777-7777';
        String mobilePhone = '888-888-8888';
        String workFax = '777-777-7778';
        String methodOfContact = 'Email';
        
        Test.startTest();
            // Set up mock response for NPI Registry with errors
            Test.setMock(HttpCalloutMock.class, new NpiRegistryMockErrorResponse());
            String result = CustomLightningSelfRegisterController.selfRegister(
                firstName,
                lastName,
                email,
                npiNumber,
                password,
                confirmPassword,
                accountId,
                regConfirmUrl,
                extraFields,
                startUrl,
                includePassword,
                contactType,
                salutation,
                suffix,
                workPhone,
                mobilePhone,
                workFax,
                methodOfContact
            );
        Test.stopTest();
        
        // Assert that registration failed due to NPI Registry errors
        System.assertEquals('NPI must be 10 digits', result, 'Should return specific NPI error message.');
    }
    
    /**
     * Tests self-registration failure when NPI Registry returns internal server error.
     */
    @IsTest
    static void testSelfRegister_Failure_Prescriber_NpiRegistryInternalError() {
        // Prepare input parameters
        String firstName = 'Daisy';
        String lastName = 'Duck';
        String email = 'daisy.duck@example.com';
        String npiNumber = '1234567890'; // Valid format but server error
        String password = 'DaisyPass!1';
        String confirmPassword = 'DaisyPass!1';
        String accountId = '';
        String regConfirmUrl = '/confirmation';
        String extraFields = null;
        String startUrl = '/home';
        Boolean includePassword = true;
        String contactType = 'Provider';
        String salutation = 'Ms.';
        String suffix = 'RN';
        String workPhone = '999-999-9999';
        String mobilePhone = '000-000-0000';
        String workFax = '999-999-9998';
        String methodOfContact = 'Phone';
        
        Test.startTest();
            // Set up mock response for NPI Registry with internal server error
            Test.setMock(HttpCalloutMock.class, new NpiRegistryMockInternalErrorResponse());
            String result = CustomLightningSelfRegisterController.selfRegister(
                firstName,
                lastName,
                email,
                npiNumber,
                password,
                confirmPassword,
                accountId,
                regConfirmUrl,
                extraFields,
                startUrl,
                includePassword,
                contactType,
                salutation,
                suffix,
                workPhone,
                mobilePhone,
                workFax,
                methodOfContact
            );
        Test.stopTest();
        
        // Assert that registration failed due to internal server error
        System.assertEquals('Failed to validate NPI Number. Please try again later.', result, 'Should return internal server error message.');
    }
    
    /**
     * Tests self-registration with extra fields provided.
     */
    // @IsTest
    // static void testSelfRegister_Success_WithExtraFields() {
    //     // Set up mock response for NPI Registry (not needed for Patient site)
    //     Test.setMock(HttpCalloutMock.class, new NpiRegistryMockSuccessResponse());

    //     // Prepare extra fields as JSON string
    //     List<Map<String, Object>> extraFieldsList = new List<Map<String, Object>>();
    //     Map<String, Object> extraField1 = new Map<String, Object>{
    //         'fieldPath' => 'Custom_Field_1__c',
    //         'value' => 'Value1'
    //     };
    //     Map<String, Object> extraField2 = new Map<String, Object>{
    //         'fieldPath' => 'Custom_Field_2__c',
    //         'value' => 'Value2'
    //     };
    //     extraFieldsList.add(extraField1);
    //     extraFieldsList.add(extraField2);
    //     String extraFieldsJson = JSON.serialize(extraFieldsList);
        
    //     // Prepare input parameters
    //     String firstName = 'Eve';
    //     String lastName = 'Evans';
    //     String email = 'eve.evans@example.com';
    //     String npiNumber = ''; // Not required for Patient
    //     String password = 'EvePass!1';
    //     String confirmPassword = 'EvePass!1';
    //     String accountId = '';
    //     String regConfirmUrl = '/confirmation';
    //     String extraFields = extraFieldsJson;
    //     String startUrl = '/home';
    //     Boolean includePassword = true;
    //     String contactType = 'Individual';
    //     String salutation = 'Mrs.';
    //     String suffix = 'III';
    //     String workPhone = '111-111-1111';
    //     String mobilePhone = '222-222-2222';
    //     String workFax = '111-111-1112';
    //     String methodOfContact = 'Email';
        
    //     Test.startTest();
    //         String result = CustomLightningSelfRegisterController.selfRegister(
    //             firstName,
    //             lastName,
    //             email,
    //             npiNumber,
    //             password,
    //             confirmPassword,
    //             accountId,
    //             regConfirmUrl,
    //             extraFields,
    //             startUrl,
    //             includePassword,
    //             contactType,
    //             salutation,
    //             suffix,
    //             workPhone,
    //             mobilePhone,
    //             workFax,
    //             methodOfContact
    //         );
    //     Test.stopTest();
        
    //     // Assert that registration was successful
    //     System.assertEquals(null, result, 'Registration should be successful with extra fields.');
        
    //     // Verify that the user was created with extra fields populated
    //     User createdUser = [SELECT Id, Custom_Field_1__c, Custom_Field_2__c FROM User WHERE Email = :email LIMIT 1];
    //     System.assertNotEquals(null, createdUser, 'User should be created.');
    //     System.assertEquals('Value1', createdUser.Custom_Field_1__c, 'Custom_Field_1__c should be populated.');
    //     System.assertEquals('Value2', createdUser.Custom_Field_2__c, 'Custom_Field_2__c should be populated.');
    // }
    
    /**
     * Tests self-registration without including a password.
     */
    @IsTest
    static void testSelfRegister_Success_NoPassword() {
        // Prepare input parameters without password
        String firstName = 'Frank';
        String lastName = 'Franklin';
        String email = 'frank.franklin@example.com';
        String npiNumber = '1234567890'; // Valid NPI
        String password = ''; // Not included
        String confirmPassword = ''; // Not included
        String accountId = '';
        String regConfirmUrl = '/confirmation';
        String extraFields = null;
        String startUrl = '/home';
        Boolean includePassword = false;
        String contactType = 'Individual';
        String salutation = 'Mr.';
        String suffix = 'Sr.';
        String workPhone = '333-333-3333';
        String mobilePhone = '444-444-4444';
        String workFax = '333-333-3334';
        String methodOfContact = 'Email';
        
        Test.startTest();
            // Set up mock response for NPI Registry (not needed for Patient site)
            Test.setMock(HttpCalloutMock.class, new NpiRegistryMockSuccessResponse());
            String result = CustomLightningSelfRegisterController.selfRegister(
                firstName,
                lastName,
                email,
                npiNumber,
                password,
                confirmPassword,
                accountId,
                regConfirmUrl,
                extraFields,
                startUrl,
                includePassword,
                contactType,
                salutation,
                suffix,
                workPhone,
                mobilePhone,
                workFax,
                methodOfContact
            );
        Test.stopTest();
        
        // Assert that registration was successful
        System.assertEquals(null, result, 'Registration should be successful without including a password.');
        
        // Verify that the user was created without a password
        User createdUser = [SELECT Id, Username, Email, FirstName, LastName FROM User WHERE Email = :email LIMIT 1];
        System.assertNotEquals(null, createdUser, 'User should be created.');
        System.assertEquals(email, createdUser.Email, 'Email should match.');
        System.assertEquals(firstName, createdUser.FirstName, 'First name should match.');
        System.assertEquals(lastName, createdUser.LastName, 'Last name should match.');
        
        // Password is not directly accessible; ensure no exceptions occurred
    }
    
    /**
     * Tests the assignDocusignPermissionSet future method.
     */
    @IsTest
    static void testAssignDocusignPermissionSet() {
        // Create a user to assign the permission set to
        User testUser = new User(
            Username = 'test.user@example.com',
            Email = 'test.user@example.com',
            FirstName = 'Test',
            LastName = 'User',
            Alias = 'tuser',
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            ProfileId = [SELECT Id FROM Profile WHERE Name='Standard User' LIMIT 1].Id,
            LanguageLocaleKey = 'en_US'
        );
        insert testUser;
        
        // Create the DocuSign_Sender permission set if it doesn't exist
        PermissionSet docuSignPs = [SELECT Id, Name FROM PermissionSet WHERE Name = 'DocuSign_Sender' LIMIT 1];
        if (docuSignPs == null) {
            docuSignPs = new PermissionSet(Name='DocuSign_Sender', Label='DocuSign Sender');
            insert docuSignPs;
        }
        
        Test.startTest();
            // Call the future method
            CustomLightningSelfRegisterController.assignDocusignPermissionSet(testUser.Id);
            // Since it's a future method, need to call Test.stopTest() to execute it
        Test.stopTest();
        
        // Verify that the permission set was assigned
        PermissionSetAssignment psa = [SELECT Id FROM PermissionSetAssignment WHERE AssigneeId = :testUser.Id AND PermissionSetId = :docuSignPs.Id LIMIT 1];
        System.assertNotEquals(null, psa, 'Permission set should be assigned to the user.');
    }
    
    /**
     * Tests the getExtraFields method.
     */
    @IsTest
    static void testGetExtraFields() {
        // Define a field set for testing
        String fieldSetName = 'Test_ExtraFields';
        
        // Create a dummy field set on User object if it doesn't exist
        // Note: Field sets cannot be created dynamically in Apex. Ensure that a field set named 'Test_ExtraFields' exists in your org.
        // For the purpose of this test, assume it exists with fields 'Custom_Field_1__c' and 'Custom_Field_2__c'
        
        // Call the getExtraFields method
        Test.startTest();
            List<Map<String, Object>> extraFields = CustomLightningSelfRegisterController.getExtraFields(fieldSetName);
        Test.stopTest();
        
        // Assert that the extra fields were retrieved
        // This assertion depends on the actual fields in the field set
        // For example, if 'Custom_Field_1__c' and 'Custom_Field_2__c' are in the field set:
        System.assertNotEquals(null, extraFields, 'Extra fields should be returned.');
        System.assert(extraFields.size() >= 2, 'At least two extra fields should be returned.');
        
        // Further assertions can be added based on the known structure of the field set
    }
    
    /**
     * Tests the setExperienceId method.
     */
    @IsTest
    static void testSetExperienceId() {
        String experienceId = '0DBxxxxxxxxxxxx'; // Fake Experience ID
        
        Test.startTest();
            String result = CustomLightningSelfRegisterController.setExperienceId(experienceId);
        Test.stopTest();
        
        // Assert that the experience ID was set successfully
        System.assertEquals(null, result, 'setExperienceId should return null on success.');
    }
    
    /**
     * Tests self-registration when an exception occurs and rollback is performed.
     */
    @IsTest
    static void testSelfRegister_ExceptionHandling() {
        // Prepare input parameters that will cause an exception, e.g., invalid JSON response
        String firstName = 'Grace';
        String lastName = 'Hopper';
        String email = 'grace.hopper@example.com';
        String npiNumber = '1234567890'; // Valid format
        String password = 'GracePass!1';
        String confirmPassword = 'GracePass!1';
        String accountId = '';
        String regConfirmUrl = '/confirmation';
        String extraFields = null;
        String startUrl = '/home';
        Boolean includePassword = true;
        String contactType = 'Provider';
        String salutation = 'Dr.';
        String suffix = 'PhD';
        String workPhone = '444-444-4444';
        String mobilePhone = '555-555-5555';
        String workFax = '444-444-4445';
        String methodOfContact = 'Phone';

        // Modify extraFields to include an invalid field path
        List<Map<String, Object>> extraFieldsList = new List<Map<String, Object>>();
        Map<String, Object> invalidExtraField = new Map<String, Object>{
            'fieldPath' => 'Nonexistent_Field__c',
            'value' => 'SomeValue'
        };
        extraFieldsList.add(invalidExtraField);
        String extraFieldsJson = JSON.serialize(extraFieldsList);
        
        Test.startTest();
            Test.setMock(HttpCalloutMock.class, new NpiRegistryMockSuccessResponse());
            String result = CustomLightningSelfRegisterController.selfRegister(
                firstName,
                lastName,
                email,
                npiNumber,
                password,
                confirmPassword,
                accountId,
                regConfirmUrl,
                extraFieldsJson,
                startUrl,
                includePassword,
                contactType,
                salutation,
                suffix,
                workPhone,
                mobilePhone,
                workFax,
                methodOfContact
            );
        Test.stopTest();
        
        // Assert that an exception message is returned
        System.assertNotEquals(null, result, 'Registration should fail due to invalid extra fields.');
    }

    /**
     * Mock HTTP response for NPI Registry callout indicating a successful validation with result_count=1.
     */
    private class NpiRegistryMockSuccessResponse implements HttpCalloutMock {
        
        /**
         * Responds to the HTTP callout with a 200 status code and result_count=1.
         *
         * @param request The HTTP request.
         * @return The HTTP response.
         */
        public HTTPResponse respond(HTTPRequest request) {
            HTTPResponse response = new HTTPResponse();
            response.setStatusCode(200);
            response.setBody('{"result_count":1}');
            return response;
        }
    }
    
    /**
     * Mock HTTP response for NPI Registry callout indicating a successful validation with result_count=0.
     */
    private class NpiRegistryMockInvalidNpiResponse implements HttpCalloutMock {
        
        /**
         * Responds to the HTTP callout with a 200 status code and result_count=0.
         *
         * @param request The HTTP request.
         * @return The HTTP response.
         */
        public HTTPResponse respond(HTTPRequest request) {
            HTTPResponse response = new HTTPResponse();
            response.setStatusCode(200);
            response.setBody('{"result_count":0}');
            return response;
        }
    }

    /**
     * Mock HTTP response for NPI Registry callout indicating an error.
     */
    private class NpiRegistryMockErrorResponse implements HttpCalloutMock {
        
        /**
         * Responds to the HTTP callout with a 200 status code and a list of errors.
         *
         * @param request The HTTP request.
         * @return The HTTP response.
         */
        public HTTPResponse respond(HTTPRequest request) {
            HTTPResponse response = new HTTPResponse();
            response.setStatusCode(200);
            response.setBody('{"Errors":[{"description":"NPI must be 10 digits","field":"number","number":"06"}]}');
            return response;
        }
    }
    
    /**
     * Mock HTTP response for NPI Registry callout indicating an internal server error.
     */
    private class NpiRegistryMockInternalErrorResponse implements HttpCalloutMock {
        
        /**
         * Responds to the HTTP callout with a 500 status code.
         *
         * @param request The HTTP request.
         * @return The HTTP response.
         */
        public HTTPResponse respond(HTTPRequest request) {
            HTTPResponse response = new HTTPResponse();
            response.setStatusCode(500);
            response.setBody('Internal Server Error');
            return response;
        }
    }
}