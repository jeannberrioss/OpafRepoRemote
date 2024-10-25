@IsTest(SeeAllData = true)
public with sharing class PrescriberSelfRegisterControllerTest {
    
    /* 
     * Verifies that IsValidPassword method with various password combinations.
     */
    @IsTest
    static void testIsValidPassword() {
        System.assert(PrescriberSelfRegisterController.isValidPassword('password?@12334', 'password?@12334') == true);
        System.assert(PrescriberSelfRegisterController.isValidPassword('password?@12334', 'dummyPassword') == false);
        System.assert(PrescriberSelfRegisterController.isValidPassword('password?@12334', null) == false);
        System.assert(PrescriberSelfRegisterController.isValidPassword(null, 'fakePwd') == false);
    }

    /* 
     * Tests if the siteAsContainerEnabled method returns a non-null value.
     */
    @IsTest
    static void testSiteAsContainerEnabled() {
        System.assertNotEquals(null, PrescriberSelfRegisterController.siteAsContainerEnabled('https://portaleu1-developer-edition.eu11.force.com'));
    }

    /* 
     * Verifies the selfRegister method flow with various invalid inputs.
     */
    @IsTest
    static void testSelfRegistration() {
        Map<String, String> paramsMap = initializeParams();
        System.assertNotEquals(null, paramsMap);
        
        // Missing Last Name
        System.assertEquals(Label.Site.lastname_is_required, PrescriberSelfRegisterController.selfRegister(
            paramsMap.get('firstName'),
            '',
            paramsMap.get('email'),
            paramsMap.get('npiNumber'), // Added npiNumber
            paramsMap.get('password'),
            paramsMap.get('confirmPasswordCorrect'),
            null,
            paramsMap.get('regConfirmUrl'),
            null,
            paramsMap.get('startUrl'),
            true
        ));
        
        // Missing Email
        System.assertEquals(Label.Site.email_is_required, PrescriberSelfRegisterController.selfRegister(
            paramsMap.get('firstName'),
            paramsMap.get('lastName'),
            '',
            paramsMap.get('npiNumber'), // Added npiNumber
            paramsMap.get('password'),
            paramsMap.get('confirmPasswordCorrect'),
            null,
            paramsMap.get('regConfirmUrl'),
            null,
            paramsMap.get('startUrl'),
            true
        ));
        
        // Missing Email and firstName
        System.assertEquals(Label.Site.email_is_required, PrescriberSelfRegisterController.selfRegister(
            null,
            paramsMap.get('lastName'),
            '',
            paramsMap.get('npiNumber'), // Added npiNumber
            null,
            paramsMap.get('confirmPasswordCorrect'),
            null,
            paramsMap.get('regConfirmUrl'),
            null,
            paramsMap.get('startUrl'),
            true
        ));
        
        // Password Mismatch
        System.assertEquals(Label.site.passwords_dont_match, PrescriberSelfRegisterController.selfRegister(
            paramsMap.get('firstName'),
            paramsMap.get('lastName'),
            paramsMap.get('email'),
            paramsMap.get('npiNumber'), // Added npiNumber
            paramsMap.get('password'),
            paramsMap.get('confirmPasswordWrong'),
            null,
            paramsMap.get('regConfirmUrl'),
            null,
            paramsMap.get('startUrl'),
            true
        ));
        
        // Missing Email with Password Mismatch and includePassword=false
        System.assertNotEquals(null, PrescriberSelfRegisterController.selfRegister(
            paramsMap.get('firstName'),
            paramsMap.get('lastName'),
            '',
            paramsMap.get('npiNumber'), // Added npiNumber
            paramsMap.get('password'),
            paramsMap.get('confirmPasswordWrong'),
            null,
            paramsMap.get('regConfirmUrl'),
            null,
            paramsMap.get('startUrl'),
            false
        ));
    }

    /* 
     * Verifies the selfRegister method flow for valid inputs with NPI validation.
     */
    @IsTest
    static void testSelfRegisterWithProperCredentials() {
        // Set up mock callout for successful NPI validation
        Test.setMock(HttpCalloutMock.class, new NPIRegistrySuccessMock());
        
        Map<String, String> paramsMap = initializeParams();
        System.assertEquals(null, PrescriberSelfRegisterController.selfRegister(
            paramsMap.get('firstName'),
            paramsMap.get('lastName'),
            paramsMap.get('email'),
            paramsMap.get('npiNumber'), // Added npiNumber
            paramsMap.get('password'),
            paramsMap.get('confirmPasswordCorrect'),
            null,
            paramsMap.get('regConfirmUrl'),
            null,
            paramsMap.get('startUrl'),
            true
        ));
    }

    /* 
     * Verifies SelfRegister flow with an accountId that is created within the test.
     */
    @IsTest
    static void testSelfRegisterWithCreatedAccount() {
        // Set up mock callout for successful NPI validation
        Test.setMock(HttpCalloutMock.class, new NPIRegistrySuccessMock());
        
        Account acc = new Account(Name = 'test acc');
        insert acc;
        List<Account> accounts = [SELECT Id FROM Account LIMIT 1];
        System.assert(!accounts.isEmpty(), 'There must be at least one account in this environment!');
        String accountId = accounts[0].Id;
        
        Map<String, String> paramsMap = initializeParams();
        System.assertEquals(null, PrescriberSelfRegisterController.selfRegister(
            paramsMap.get('firstName'),
            paramsMap.get('lastName'),
            paramsMap.get('email'),
            paramsMap.get('npiNumber'), // Added npiNumber
            paramsMap.get('password'),
            paramsMap.get('confirmPasswordCorrect'),
            accountId,
            paramsMap.get('regConfirmUrl'),
            null,
            paramsMap.get('startUrl'),
            false
        ));
    }

    /* 
     * Verifies getExtraFields method with null input.
     */
    @IsTest
    static void testGetNullExtraFields() {
        System.assertEquals(new List<Map<String, Object>>(), PrescriberSelfRegisterController.getExtraFields(null));
    }

    /* 
     * Verifies getExtraFields method with non-empty input.
     */
    @IsTest
    static void testGetNonEmptyExtraFields() {
        System.assertEquals(new List<Map<String, Object>>(), PrescriberSelfRegisterController.getExtraFields('field1'));
    }

    /* 
     * Verifies validation of extraFields within the Self Registration flow.
     */
    @IsTest
    static void testGetExtraFieldsInSelfRegistration() {
        List<Map<String, Object>> fieldlist = new List<Map<String, Object>>();
        Map<String, String> paramsMap = initializeParams();
        Map<String, Object> fieldMap = new Map<String, Object>();
        fieldMap.put('description', 'new field');
        fieldMap.put('fieldPath', 'dummyPath');
        fieldlist.add(fieldMap);
        String extraFields = JSON.serialize(fieldlist);
        System.assertNotEquals(null, PrescriberSelfRegisterController.selfRegister(
            paramsMap.get('firstName'),
            paramsMap.get('lastName'),
            paramsMap.get('email'),
            paramsMap.get('npiNumber'), // Added npiNumber
            paramsMap.get('password'),
            paramsMap.get('confirmPasswordCorrect'),
            null,
            paramsMap.get('regConfirmUrl'),
            extraFields,
            paramsMap.get('startUrl'),
            true
        ));
    }

    /* 
     * Verifies controller instantiation.
     */
    @IsTest
    static void PrescriberSelfRegisterControllerInstantiation() {
        PrescriberSelfRegisterController controller = new PrescriberSelfRegisterController();
        System.assertNotEquals(controller, null);
    }
    
    /* 
     * Verifies the selfRegister method with a valid NPI number.
     */
    @IsTest
    static void testSelfRegisterWithValidNPI() {
        // Set up mock callout for successful NPI validation
        Test.setMock(HttpCalloutMock.class, new NPIRegistrySuccessMock());
        
        Map<String, String> paramsMap = initializeParams();
        String result = PrescriberSelfRegisterController.selfRegister(
            paramsMap.get('firstName'),
            paramsMap.get('lastName'),
            paramsMap.get('email'),
            paramsMap.get('npiNumber'), // Added npiNumber
            paramsMap.get('password'),
            paramsMap.get('confirmPasswordCorrect'),
            null,
            paramsMap.get('regConfirmUrl'),
            null,
            paramsMap.get('startUrl'),
            true
        );
        System.assertEquals(null, result, 'Registration should be successful with a valid NPI number.');
        
        // Optionally, verify that the user was created with the correct NPI number
        User createdUser = [SELECT Id, Email FROM User WHERE Email = 'testUser@salesforce.com' LIMIT 1];
        System.assertNotEquals(null, createdUser, 'User should be created.');
    }

    /* 
     * Verifies the selfRegister method with an invalid NPI number.
     */
    @IsTest
    static void testSelfRegisterWithInvalidNPI() {
        // Set up mock callout for invalid NPI number
        Test.setMock(HttpCalloutMock.class, new NPIRegistryInvalidMock());
        
        Map<String, String> paramsMap = initializeParams();
        // Update the npiNumber to an invalid one
        paramsMap.put('npiNumber', '0000000000');
        
        String result = PrescriberSelfRegisterController.selfRegister(
            paramsMap.get('firstName'),
            paramsMap.get('lastName'),
            paramsMap.get('email'),
            paramsMap.get('npiNumber'), // Added npiNumber
            paramsMap.get('password'),
            paramsMap.get('confirmPasswordCorrect'),
            null,
            paramsMap.get('regConfirmUrl'),
            null,
            paramsMap.get('startUrl'),
            true
        );
        System.assertEquals('Invalid NPI Number provided.', result, 'Registration should fail with an invalid NPI number.');
        
        // Optionally, verify that the user was not created
        Integer userCount = [SELECT COUNT() FROM User WHERE Email = 'testUser@salesforce.com'];
        System.assertEquals(0, userCount, 'User should not be created with an invalid NPI number.');
    }

    /* 
     * Verifies the selfRegister method when the NPI Registry callout fails.
     */
    @IsTest
    static void testSelfRegisterWithNPIRegistryFailure() {
        // Set up mock callout for callout failure
        Test.setMock(HttpCalloutMock.class, new NPIRegistryFailureMock());
        
        Map<String, String> paramsMap = initializeParams();
        String result = PrescriberSelfRegisterController.selfRegister(
            paramsMap.get('firstName'),
            paramsMap.get('lastName'),
            paramsMap.get('email'),
            paramsMap.get('npiNumber'), // Added npiNumber
            paramsMap.get('password'),
            paramsMap.get('confirmPasswordCorrect'),
            null,
            paramsMap.get('regConfirmUrl'),
            null,
            paramsMap.get('startUrl'),
            true
        );
        System.assertEquals('Failed to verify NPI Number. Please try again later.', result, 'Registration should fail when NPI Registry callout fails.');
        
        // Optionally, verify that the user was not created
        Integer userCount = [SELECT COUNT() FROM User WHERE Email = 'testUser@salesforce.com'];
        System.assertEquals(0, userCount, 'User should not be created when NPI Registry callout fails.');
    }

    /* 
     * Verifies the selfRegister method when the NPI number is missing.
     */
    @IsTest
    static void testSelfRegisterMissingNPI() {
        Map<String, String> paramsMap = initializeParams();
        // Remove the npiNumber
        paramsMap.put('npiNumber', null);
        
        String result = PrescriberSelfRegisterController.selfRegister(
            paramsMap.get('firstName'),
            paramsMap.get('lastName'),
            paramsMap.get('email'),
            paramsMap.get('npiNumber'), // Added npiNumber
            paramsMap.get('password'),
            paramsMap.get('confirmPasswordCorrect'),
            null,
            paramsMap.get('regConfirmUrl'),
            null,
            paramsMap.get('startUrl'),
            true
        );
        System.assertEquals('NPI Number is required.', result, 'Registration should fail when NPI number is missing.');
        
        // Optionally, verify that the user was not created
        Integer userCount = [SELECT COUNT() FROM User WHERE Email = 'testUser@salesforce.com'];
        System.assertEquals(0, userCount, 'User should not be created when NPI number is missing.');
    }

    /* 
     * Helper method to initialize the parameters required for SelfRegistration.
     */
    private static Map<String, String> initializeParams() {
        Map<String, String> paramsMap = new Map<String, String>();
        String firstName = 'test';
        String lastName = 'User';
        String email = 'testUser@salesforce.com';
        String password = 'testuser123';
        String confirmPasswordCorrect = 'testuser123';
        String confirmPasswordWrong = 'wrongpassword';
        String accountId = 'testuser123'; // This can be replaced with a valid Account Id if needed
        String regConfirmUrl = 'http://registration-confirm.com';
        String startUrl = 'http://my.company.salesforce.com';
        String npiNumber = 'testNPI123'; // Example valid NPI number
        
        paramsMap.put('firstName', firstName);
        paramsMap.put('lastName', lastName);
        paramsMap.put('email', email);
        paramsMap.put('password', password);
        paramsMap.put('confirmPasswordCorrect', confirmPasswordCorrect);
        paramsMap.put('confirmPasswordWrong', confirmPasswordWrong);
        paramsMap.put('accountId', accountId);
        paramsMap.put('regConfirmUrl', regConfirmUrl);
        paramsMap.put('startUrl', startUrl);
        paramsMap.put('npiNumber', npiNumber); // Added npiNumber
        return paramsMap;
    }

    /* 
     * Mock class for successful NPI Registry callout (HTTP 200 with result_count >= 1)
     */
    class NPIRegistrySuccessMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"result_count":1,"results":[{"created_epoch":"1587951514000","enumeration_type":"NPI-1","last_updated_epoch":"1610148935000","number":"1518587930","addresses":[{"country_code":"US","country_name":"United States","address_purpose":"MAILING","address_type":"DOM","address_1":"2400 NORTH BLVD W","address_2":"STE 1","city":"DAVENPORT","state":"FL","postal_code":"338378980"},{"country_code":"US","country_name":"United States","address_purpose":"LOCATION","address_type":"DOM","address_1":"3225 HILLSDALE LN","city":"KISSIMMEE","state":"FL","postal_code":"347417561","telephone_number":"863-421-5864"}],"practiceLocations":[],"basic":{"first_name":"ANITA","last_name":"SINGH","middle_name":"KAUR","sole_proprietor":"NO","gender":"F","enumeration_date":"2020-04-26","last_updated":"2021-01-08","certification_date":"2021-01-08","status":"A"},"taxonomies":[{"code":"363LF0000X","taxonomy_group":"","desc":"Nurse Practitioner, Family","state":"FL","license":"APRN11006965","primary":true}],"identifiers":[],"endpoints":[],"other_names":[]}]}');
            res.setStatusCode(200);
            return res;
        }
    }

    /* 
     * Mock class for NPI Registry callout with result_count = 0 (invalid NPI)
     */
    class NPIRegistryInvalidMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"result_count":0,"results":[]}');
            res.setStatusCode(200);
            return res;
        }
    }

    /* 
     * Mock class for NPI Registry callout failure (e.g., HTTP 500)
     */
    class NPIRegistryFailureMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('Internal Server Error');
            res.setStatusCode(500);
            return res;
        }
    }
}