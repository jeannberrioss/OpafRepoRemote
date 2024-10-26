@IsTest(SeeAllData = true)
public with sharing class LoginControllerTest {

 @IsTest
 static void LightningLoginFormControllerInstantiation() {
  LoginController controller = new LoginController();
  System.assertNotEquals(controller, null);
 }
 @IsTest
 static void testIsSelfRegistrationEnabled() {
  System.assertEquals(false, LoginController.getIsSelfRegistrationEnabled());
 }

 @IsTest
 static void testGetSelfRegistrationURL() {
  System.assertEquals(null, LoginController.getSelfRegistrationUrl());
 }

 @IsTest
 static void testAuthConfig() {
  Auth.AuthConfiguration authConfig = LoginController.getAuthConfig();
  System.assertNotEquals(null, authConfig);
 }
 @IsTest
 static void testgetCustomsettings() {
  LoginController.getCustomsettings();
 }
 @IsTest
 static void testgetForgotPasswordUrl() {
  String authConfig = LoginController.getForgotPasswordUrl();
 }
 @IsTest
 static void testCheckLogin() {
  String s=LoginController.checkPortal('test@test.com','CiberString@1123');
  //System.assertNotEquals(null, s);
 }
 @IsTest
 static void testForgotPassowrd() {
  String s=LoginController.forgotPassowrd('test@test.com');
  //System.assertNotEquals(null, s);
 }
    
}