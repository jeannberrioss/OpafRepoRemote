trigger ConsentTrigger on Consent__c (after insert, after update) {
   if(trigger.isAfter)
       ConsentTriggerHandler.shareConsentToPrescriberOwner(Trigger.New);

}