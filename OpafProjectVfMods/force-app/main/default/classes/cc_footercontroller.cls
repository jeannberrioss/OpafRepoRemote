/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 08-09-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public without sharing class cc_footercontroller {
    public cc_footercontroller() {
   }

   @AuraEnabled(cacheable=true)
   public static Opaf_Care_Connect_Setting__mdt getCustomsettings(){
      
       Opaf_Care_Connect_Setting__mdt footer = [SELECT Contact_Us__c, Privacy_Policy__c, Term_of_Use__c, Footer_Content__c, Footer_Content_1__c, Footer_Content_2__c, Facebook__c,Linkedin__c, PI_Nuedexta__c,
                                                PI_Abilify_Maintena__c,PI_Abilify_Asimtufii__c, PI_Jynarque__c, PI_Rexulti__c, PI_Samsca__c,
                                                MG_Abilify_Maintena__c,MG_Abilify_Asimtufii__c, MG_Jynarque__c, MG_Rexulti__c, MG_Samsca__c,
                                                SAR_Otsuka__c, SAR_FDA_Number__c, SAR_FDA_Email__c,Prescriber_Veeva_Code__c,Patient_Veeva_Code__c,Month_Year__c,Prescriber_Month_Year__c
                                                FROM Opaf_Care_Connect_Setting__mdt
                           						WHERE MasterLabel = 'Footer Settings'];
       System.debug(footer);
       return footer;
   }
}