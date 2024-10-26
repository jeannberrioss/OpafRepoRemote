public class eFaxCoverSheetController {
    public Case caseRec {get;set;}
    public User portalUserDetails {get;set;}

    public string SalesforceRequestorID {get;set;}
    public eFaxCoverSheetController(){
        
    }
    public eFaxCoverSheetController(ApexPages.StandardController stdController) {
        this.caseRec = (case)stdController.getRecord();

        if(this.caseRec != null){
            
            this.caseRec = [SELECT Id, 
                                    CaseNumber, 
                                    User_Type__c,
                                    Patient__c,
                                    Hub_Patient_ID__c,
                                    ContactId,
                                    Prescriber__c,
                                    Hub_Provider_ID__c,
                                    Facility__c,
                                    Hub_Facility_ID__c,
                                    Product__c,
                                    Rx_Fax_Timestamp__c
                                    FROM 
                                    Case 
                                    WHERE 
                                    Id =: this.caseRec.Id];
            
            System.debug('the this.caseRec' + this.caseRec);

            if(this.caseRec.ContactId != null){

                SalesforceRequestorID = this.caseRec.ContactId;

                System.debug('the contact info is' + this.caseRec.ContactId);

                List<User> portalUserInfo = [SELECT  Id,
                                                        Legacy_User_Id__c	
                                                        FROM 
                                                        User 
                                                        WHERE 
                                                        ContactId =: this.caseRec.ContactId];
                
                System.debug('the portalUserInfo info is' + portalUserInfo);

                if(!portalUserInfo.isEmpty()){
                    portalUserDetails = portalUserInfo[0];
                }
            }
        }

    }
    public String getESTTime() {
       String estTime;
       if(caseRec.Rx_Fax_Timestamp__c==null)
       estTime = null;
       else
       estTime = (String)caseRec.Rx_Fax_Timestamp__c.format('MM/dd/yyy h:mm:ss a', 'America/New_York') + ' ET';
       return estTime;
    }

}