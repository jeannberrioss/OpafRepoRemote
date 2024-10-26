public class SendDocuSignEmailBatch implements
    Database.Batchable<sObject>, Database.AllowsCallouts {
    // instance member to retain state across transactions
    public Integer recordsProcessed = 0;
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'select Id,Status__c,Method__c,Patient__c from Consent__c where Method__c =\'Email\' and Status__c =\'Processing\' Order by Createddate desc limit 1' 
        );
    }
    public void execute(Database.BatchableContext bc, List<Consent__c> scope){
        // process each batch of records
        for (Consent__c consent : scope) {
            DS_OPAFController.sendPatientEnvelope(consent.Patient__c);
        }
        
    }
    public void finish(Database.BatchableContext bc){
        System.debug(recordsProcessed + ' records processed. Shazam!');
        AsyncApexJob job = [SELECT Id, Status, NumberOfErrors,
            JobItemsProcessed,
            TotalJobItems, CreatedBy.Email
            FROM AsyncApexJob
            WHERE Id = :bc.getJobId()];
        // call some utility to send email
        //EmailUtils.sendMessage(job, recordsProcessed);
    }
}