public class ConsentTriggerHandler {
    public static void shareConsentToPrescriberOwner(List<Consent__c> consentList){
        set<Id> prescriberIds = new set<Id>();
        for(Consent__c c:consentList){
            if(c.Provider__c!=null){
            	prescriberIds.add(c.Provider__c);    
            }
            
        }
        map<Id, Contact> prescriberMap = new map<Id,Contact>([Select Id,OwnerId, Owner.Profile.Name from Contact where Id in:prescriberIds]);
        List<Consent__Share> consentShare = new List<Consent__Share>();
        for(Consent__c Consent:consentList){
            if(prescriberMap!=null  && Consent.Provider__c!=null &&  Consent.OwnerId!=prescriberMap.get(Consent.Provider__c).OwnerId && prescriberMap.get(Consent.Provider__c).Owner.Profile.Name.Contains('Customer Community')){
        	Consent__Share consentRec = new Consent__Share();   
            consentRec.UserOrGroupId =prescriberMap.get(Consent.Provider__c).OwnerId;
            consentRec.AccessLevel = 'Edit';
            consentRec.ParentId = Consent.ID;
            consentShare.add(consentRec);
            }
            
        } 
        if(!consentShare.isEmpty()) insert consentShare;
    }

}