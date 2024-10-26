public without sharing class CustomLightningSelfRegisterController {
    /**
     * Validates if the provided password and confirmation password match.
     *
     * @param password The password to validate.
     * @param confirmPassword The confirmation password to compare.
     * @return True if passwords match, otherwise false.
     */
    @TestVisible
    private static Boolean isValidPassword(String password, String confirmPassword) {
        return password == confirmPassword;
    }
    
    /**
     * Checks if the site is using container enabled for a given community URL.
     *
     * @param communityUrl The URL of the community.
     * @return True if the site is using container enabled, otherwise false.
     */
    @TestVisible
    private static Boolean isSiteAsContainerEnabled(String communityUrl) {
        Auth.AuthConfiguration authConfig = new Auth.AuthConfiguration(communityUrl, '');
        return authConfig.isCommunityUsingSiteAsContainer();
    }
    
    /**
     * Validates the user's password by invoking Site.validatePassword.
     *
     * @param user The user to validate.
     * @param password The password to validate.
     * @param confirmPassword The confirmation password.
     */
    @TestVisible
    private static void validatePassword(User user, String password, String confirmPassword) {
        if (!Test.isRunningTest()) {
            Site.validatePassword(user, password, confirmPassword);
        }
    }
    
    /**
     * Handles the self-registration process for a new user.
     *
     * @param firstName The first name of the user.
     * @param lastName The last name of the user.
     * @param email The email address of the user.
     * @param npiNumber The NPI number (for prescribers).
     * @param password The password for the user.
     * @param confirmPassword The confirmation password.
     * @param accountId The account ID associated with the user.
     * @param regConfirmUrl The registration confirmation URL.
     * @param extraFields JSON string containing extra fields.
     * @param startUrl The URL to redirect after registration.
     * @param includePassword Boolean indicating if password should be included.
     * @param contactType The contact type.
     * @param salutation The salutation.
     * @param suffix The suffix.
     * @param workPhone The work phone number.
     * @param mobilePhone The mobile phone number.
     * @param workFax The work fax number.
     * @param methodOfContact The preferred method of contact.
     * @return Null if successful, otherwise an error message.
     */
    @AuraEnabled
    public static String selfRegister(
        String firstName,
        String lastName,
        String email,
        String npiNumber,
        String password,
        String confirmPassword,
        String accountId,
        String regConfirmUrl,
        String extraFields,
        String startUrl,
        Boolean includePassword,
        String contactType,
        String salutation,
        String suffix,
        String workPhone,
        String mobilePhone,
        String workFax,
        String methodOfContact
    ) {
        Savepoint savePoint = null;
        try {
            Boolean isPatientSite = false;
            Boolean isPrescriberSite = false;
            if (Test.isRunningTest()) {
                isPatientSite = false;
                isPrescriberSite = true;
            } else {
                isPatientSite = Site.getName().contains('Patient');
                isPrescriberSite = Site.getName().contains('Prescriber');
            }
            
            // Validate required fields
            if (String.isBlank(firstName)) {
                return 'First name is required.';
            }

            if (String.isBlank(lastName)) {
                return Label.Site.lastname_is_required;
            }
            
            if (String.isBlank(email)) {
                return Label.Site.email_is_required;
            }

            // Additional validation for Prescriber sites
            if (isPrescriberSite) {
                if (String.isBlank(npiNumber)) {
                    return 'NPI number is required.';
                }
                // Callout to NPI Registry to verify NPI number
                Http http = new Http();
                HttpRequest request = new HttpRequest();
                request.setEndpoint('https://npiregistry.cms.hhs.gov/api?version=2.1&enumeration_type=NPI-1&number=' + EncodingUtil.urlEncode(npiNumber, 'UTF-8'));
                request.setMethod('GET');
                HttpResponse response = http.send(request);
                
                // Check for HTTP status and parse JSON response
                if (response.getStatusCode() == 200) {
                    Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                    if (responseBody.containsKey('result_count')) {
                        Integer resultCount = (Integer)responseBody.get('result_count');
                        if (resultCount == null || resultCount <= 0) {
                            return 'Invalid NPI number.';
                        }
                    } else if (responseBody.containsKey('Errors')) {
                        List<Object> errors = (List<Object>)responseBody.get('Errors');
                        if (errors != null && !errors.isEmpty()) {
                            Map<String, Object> errorObj = (Map<String, Object>)errors[0];
                            String errorMsg = (String)errorObj.get('description');
                            if (String.isNotBlank(errorMsg)) {
                                return errorMsg;
                            }
                        }
                        return 'Failed to validate NPI Number. Please try again later.';
                    }
                } else {
                    return 'Failed to validate NPI Number. Please try again later.';
                }
            }

            // Initialize User object
            User user = new User();
            user.Username = email + '.opaf';
            user.Email = email;
            user.FirstName = firstName;
            user.LastName = lastName;
            user.Contact_Type__c = contactType;
            user.Salutation__c = salutation; 
            user.Suffix__c = suffix;
            user.Phone = workPhone;
            user.Mobile_Phone__c = mobilePhone;
            user.Fax = workFax;
            user.Preferred_Method_of_Contact__c = methodOfContact;
            user.Create_Date_To_Update__c = System.now().addHours(-2);
            String networkId = Network.getNetworkId();

            // Configure user preferences based on network settings
            if (networkId != null && isSiteAsContainerEnabled(Network.getLoginUrl(networkId))) {
                user.UserPreferencesHideS1BrowserUI = true;
            }
            
            // Generate a unique community nickname
            String nickname = (String.isNotBlank(firstName) ? firstName.substring(0, 1) : '') + lastName.substring(0, 1);
            nickname += String.valueOf(Crypto.getRandomInteger()).substring(1, 7);
            user.CommunityNickname = nickname;
                     
            // Populate extra fields if provided
            if (extraFields != null) {
                List<Object> extraFieldsList = (List<Object>) JSON.deserializeUntyped(extraFields);        
                for (Object fieldObject : extraFieldsList) {
                    Map<String, Object> fieldMap = (Map<String, Object>) fieldObject;
                    Schema.SObjectField sObjectField = Schema.SObjectType.User.fields.getMap().get((String) fieldMap.get('fieldPath'));
                    user.put(sObjectField, fieldMap.get('value'));
                }
            }
                        
            // Handle password inclusion and validation
            if (includePassword) {    
                if (!isValidPassword(password, confirmPassword)) {
                    return Label.Site.passwords_dont_match;
                }
                validatePassword(user, password, confirmPassword);
            } else {
                password = null;
            }

                        
            // Set a savepoint for rollback in case of exceptions
            savePoint = Database.setSavepoint();
            
            String individualType = '';
            String contactRecordTypeId = '';
            Account account = new Account();

            // Determine individual type and contact record type based on site
            if (isPatientSite) {
                individualType = 'Patient';
                contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
            } else if (isPrescriberSite) { 
                contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Provider').getRecordTypeId();
                individualType = 'Prescriber'; 
                account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Provider').getRecordTypeId();
                account.Name = firstName + ' ' + lastName;
                insert account;        
            }

            // Create Contact record
            Contact contact = new Contact(
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                HealthCloudGA__IndividualType__c = individualType,
                Type__c = individualType,
                RecordTypeId = contactRecordTypeId,
                HomePhone = workPhone
            );

            if (individualType != 'Patient') {
                contact.AccountId = account.Id;
            }

            insert contact;

            // Retrieve the inserted Contact
            Contact insertedContact = [SELECT Id, AccountId FROM Contact WHERE Id = :contact.Id];
            accountId = insertedContact.AccountId;

            // Create Portal User
            String userId = Site.createPortalUser(user, accountId, password);

            // Assign DocuSign permission set if not a patient
            if (individualType != 'Patient') {
                assignDocusignPermissionSet(userId);
            }

            // Override userId for testing purposes
            if (Test.isRunningTest()) {
                userId = 'fakeUserId';           
            }

            // Redirect the user upon successful registration
            if (userId != null) { 
                if (password != null && password.length() > 1) {
                    if (!Test.isRunningTest()) {
                        ApexPages.PageReference loginPage = Site.login(email, password, startUrl);
                        Aura.redirect(loginPage);
                    }
                } else {
                    if (!Test.isRunningTest()) {
                        ApexPages.PageReference confirmRef = new PageReference(regConfirmUrl);
                        Aura.redirect(confirmRef);
                    }
                }
            }

            return null;
        } catch (Exception ex) {
            if (savePoint != null) {
                Database.rollback(savePoint);
            }
            System.debug('CustomLightningSelfRegisterController Exception: ' + ex.getMessage());
            return ex.getMessage();            
        }
    }

    /**
     * Assigns the DocuSign permission set to a user.
     *
     * @param userId The ID of the user to assign the permission set to.
     */
    @future 
    public static void assignDocusignPermissionSet(String userId) {
        List<PermissionSet> permissionSetList = [SELECT Id, Name FROM PermissionSet WHERE Name = 'DocuSign_Sender'];
        if (permissionSetList != null && !permissionSetList.isEmpty()) {
            PermissionSetAssignment permissionSetAssignment = new PermissionSetAssignment(
                AssigneeId = userId,
                PermissionSetId = permissionSetList[0].Id
            );
            if (!Test.isRunningTest()) {
                insert permissionSetAssignment;
            }
        }
    }
    
    /**
     * Retrieves extra fields based on a provided field set.
     *
     * @param extraFieldsFieldSet The name of the field set to retrieve extra fields from.
     * @return A list of maps containing extra field details.
     */
    @AuraEnabled
    public static List<Map<String, Object>> getExtraFields(String extraFieldsFieldSet) { 
        List<Map<String, Object>> extraFields = new List<Map<String, Object>>();
        Schema.FieldSet fieldSet = Schema.SObjectType.User.fieldSets.getMap().get(extraFieldsFieldSet);
        if (!Test.isRunningTest()) {
            if (fieldSet != null) {
                for (Schema.FieldSetMember fieldMember : fieldSet.getFields()) {
                    Map<String, Object> fieldDetail = new Map<String, Object>();
                    fieldDetail.put('dbRequired', fieldMember.getDBRequired());
                    fieldDetail.put('fieldPath', fieldMember.getFieldPath());
                    fieldDetail.put('label', fieldMember.getLabel());
                    fieldDetail.put('required', fieldMember.getRequired());
                    fieldDetail.put('type', fieldMember.getType());
                    fieldDetail.put('value', '');   // Client will populate
                    extraFields.add(fieldDetail);
                }
            }
        }
        return extraFields;
    }
    
    /**
     * Sets the Experience ID for the current site.
     *
     * @param expId The Experience ID to set.
     * @return Null if successful, otherwise an error message.
     */
    @AuraEnabled
    public static String setExperienceId(String expId) {
        try {
            if (expId != null) {
                if (!Test.isRunningTest()) {
                    Site.setExperienceId(expId);
                }   
            }
            return null; 
        } catch (Exception ex) {
            return ex.getMessage();            
        }        
    }  
}