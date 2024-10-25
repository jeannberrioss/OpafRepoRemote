global class PrescriberSelfRegisterController {

    public PrescriberSelfRegisterController() {
    }

    @TestVisible 
    private static boolean isValidPassword(String password, String confirmPassword) {
        return password == confirmPassword;
    }

    @TestVisible 
    private static boolean siteAsContainerEnabled(String communityUrl) {
        Auth.AuthConfiguration authConfig = new Auth.AuthConfiguration(communityUrl,'');
        return authConfig.isCommunityUsingSiteAsContainer();
    }

    @TestVisible 
    private static void validatePassword(User u, String password, String confirmPassword) {
        if(!Test.isRunningTest()) {
            Site.validatePassword(u, password, confirmPassword);
        }
        return;
    }

    @AuraEnabled
    public static String selfRegister(String firstname, String lastname, String email, String npiNumber, String password, String confirmPassword, String accountId, String regConfirmUrl, String extraFields, String startUrl, Boolean includePassword) {
        Savepoint sp = null;
        try {
            if (lastname == null || String.isEmpty(lastname)) {
                return Label.Site.lastname_is_required;
            }

            if (email == null || String.isEmpty(email)) {
                return Label.Site.email_is_required;
            }

            // NPI Number validation
            if (npiNumber == null || String.isEmpty(npiNumber)) {
                return 'NPI Number is required';
            }

            // Callout to NPI Registry to verify NPI number
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('callout:NPI_Registry?version=2.1&enumeration_type=NPI-1&number=' + EncodingUtil.urlEncode(npiNumber, 'UTF-8'));
            request.setMethod('GET');
            HttpResponse response = http.send(request);

            // Check for HTTP status and parse JSON response
            if (response.getStatusCode() == 200) {
                Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                Integer resultCount = (Integer) responseBody.get('result_count');

                if (resultCount == 0) {
                    return 'Invalid NPI Number';
                }
            } else {
                return 'Failed to validate NPI Number. Please try again later.';
            }

            // Proceed with creating the user
            User u = new User();
            u.Username = email;
            u.put('Email', email);
            u.FirstName = firstname;
            u.LastName = lastname;

            String networkId = Network.getNetworkId();
            if (networkId != null && siteAsContainerEnabled(Network.getLoginUrl(networkId))) {
                u.put('UserPreferencesHideS1BrowserUI', true);
            }

            String nickname = ((firstname != null && firstname.length() > 0) ? firstname.substring(0, 1) : '') + lastname.substring(0, 1);
            nickname += String.valueOf(Crypto.getRandomInteger()).substring(1, 7);
            u.put('CommunityNickname', nickname);

            if (extraFields != null) {
                List<Object> extraFieldsList = (List<Object>) JSON.deserializeUntyped(extraFields);
                for (Object thisFieldObject : extraFieldsList) {
                    Map<String, Object> thisField = (Map<String, Object>) thisFieldObject;
                    Schema.SObjectField sof = Schema.SObjectType.User.fields.getMap().get((String) thisField.get('fieldPath'));
                    u.put(sof, thisField.get('value'));
                }
            }

            if (includePassword) {
                if (!isValidPassword(password, confirmPassword)) {
                    return Label.site.passwords_dont_match;
                }
                validatePassword(u, password, confirmPassword);
            } else {
                password = null;
            }

            sp = Database.setSavepoint();

            // Create the user as per the existing logic
            String userId = Site.createPortalUser(u, accountId, password);

            if (Test.isRunningTest()) {
                userId = 'fakeUserId';
            }

            if (userId != null) {
                if (password != null && password.length() > 1) {
                    ApexPages.PageReference lgn = Site.login(email, password, startUrl);
                    if (!Test.isRunningTest()) {
                        aura.redirect(lgn);
                    }
                } else {
                    ApexPages.PageReference confirmRef = new PageReference(regConfirmUrl);
                    if (!Test.isRunningTest()) {
                        aura.redirect(confirmRef);
                    }
                }
            }
            return null;
        } catch (Exception ex) {
            if (sp != null) {
                Database.rollback(sp);
            }
            return ex.getMessage();
        }
    }

    @AuraEnabled
    public static List<Map<String,Object>> getExtraFields(String extraFieldsFieldSet) { 
        List<Map<String,Object>> extraFields = new List<Map<String,Object>>();
        Schema.FieldSet fieldSet = Schema.SObjectType.User.fieldSets.getMap().get(extraFieldsFieldSet);
        if (!Test.isRunningTest()) {
            if (fieldSet != null) {
                for (Schema.FieldSetMember f : fieldSet.getFields()) {
                    Map<String, Object> fieldDetail = new Map<String, Object>();
                    fieldDetail.put('dbRequired', f.getDBRequired());
                    fieldDetail.put('fieldPath', f.getFieldPath());
                    fieldDetail.put('label', f.getLabel());
                    fieldDetail.put('required', f.getRequired());
                    fieldDetail.put('type', f.getType());
                    fieldDetail.put('value', '');   // client will populate
                    extraFields.add(fieldDetail);
                }
            }
        }
        return extraFields;
    }

    @AuraEnabled
    global static String setExperienceId(String expId) {
        try {
            if (expId != null) {
                Site.setExperienceId(expId);   
            }
            return null; 
        } catch (Exception ex) {
            return ex.getMessage();            
        }        
    }
}