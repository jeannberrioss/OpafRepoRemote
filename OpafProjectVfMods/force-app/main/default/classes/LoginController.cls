global class LoginController {
 
@AuraEnabled
global static String checkPortal(String username, String password) {
 
try {
ApexPages.PageReference lgn =Site.login(username,password, '');
aura.redirect(lgn);
return null;
}
catch (Exception ex) {
return ex.getMessage();
}
}
 
@AuraEnabled
global static String forgotPassowrd(String username) {
String procesMsg = '';
 
if (Site.isValidUsername(username)) {
 
Site.forgotPassword(username);
procesMsg = 'Label.LoginResetSuccess';
}
else {
 
procesMsg = 'Label.LoginResetWarning';
}
 
return procesMsg;
 
}
    @AuraEnabled
    public static String getSelfRegistrationUrl() {
        Auth.AuthConfiguration authConfig = getAuthConfig();
        if (authConfig.getSelfRegistrationEnabled()) {
            return authConfig.getSelfRegistrationUrl();
        }
        return null;
    }
    @TestVisible
    private static Auth.AuthConfiguration getAuthConfig(){
        Id networkId = Network.getNetworkId();
        Auth.AuthConfiguration authConfig = new Auth.AuthConfiguration(networkId,'');
        return authConfig;
    }
    @AuraEnabled
    public static Boolean getIsSelfRegistrationEnabled() {
        Auth.AuthConfiguration authConfig = getAuthConfig();
        return authConfig.getSelfRegistrationEnabled();
    }
    @AuraEnabled
    public static String getForgotPasswordUrl() {
        Auth.AuthConfiguration authConfig = getAuthConfig();
        return authConfig.getForgotPasswordUrl();
    }
    @AuraEnabled(cacheable=true)
    public static Opaf_Care_Connect_Setting__mdt getCustomsettings(){
        
        Opaf_Care_Connect_Setting__mdt footer = [SELECT Contact_Us__c, Privacy_Policy__c, Term_of_Use__c, Footer_Content__c,
                                                    PI_Abilify_Maintena__c, PI_Jynarque__c, PI_Rexulti__c, PI_Samsca__c,
                                                    MG_Abilify_Maintena__c, MG_Jynarque__c, MG_Rexulti__c, MG_Samsca__c,
                                                    SAR_Otsuka__c, SAR_FDA_Number__c, SAR_FDA_Email__c,Prescriber_Veeva_Code__c,Patient_Veeva_Code__c,Month_Year__c,Prescriber_Login_Header__c,Prescriber_Login_Text__c,Patient_Login_Header__c,Patient_Login_Text__c
                                                    FROM Opaf_Care_Connect_Setting__mdt
                                                    WHERE MasterLabel = 'Footer Settings'];
        return footer;
    }
}