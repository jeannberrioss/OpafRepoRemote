public class eFaxCoverSheetConsentController {
    public Consent__c caseRec {get;set;}
    public User portalUserDetails {get;set;}

    public string SalesforceRequestorID {get;set;}
    public eFaxCoverSheetConsentController(ApexPages.StandardController stdController) {
        this.caseRec = (Consent__c)stdController.getRecord();

        if(this.caseRec != null){
            
            this.caseRec = [SELECT Id, 
                                    Name,
                            		Provider__c,
                            		Patient__c,
                            		Provider__r.External_Prescriber_Id__c,
                            		Patient__r.External_Patient_Id__c
                                    FROM 
                                    Consent__c 
                                    WHERE 
                                    Id =: this.caseRec.Id];
            
            System.debug('the this.caseRec' + this.caseRec);

            if(this.caseRec.Provider__c != null){

                SalesforceRequestorID = this.caseRec.Provider__c;

                System.debug('the contact info is' + this.caseRec.Provider__c);

                List<User> portalUserInfo = [SELECT  Id,
                                                        Legacy_User_Id__c	
                                                        FROM 
                                                        User 
                                                        WHERE 
                                                        ContactId =: this.caseRec.Provider__c];
                
                System.debug('the portalUserInfo info is' + portalUserInfo);

                if(!portalUserInfo.isEmpty()){
                    portalUserDetails = portalUserInfo[0];
                }
            }
        }

    }
    /*
    public String getESTTime() {
       String estTime;
       if(caseRec.Rx_Fax_Timestamp__c==null)
       estTime = null;
       else
       estTime = (String)caseRec.Rx_Fax_Timestamp__c.format('MM/dd/yyy h:mm:ss a', 'America/New_York') + ' ET';
       return estTime;
    }*/


}