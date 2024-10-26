global class SendDocusignEmailScheduler implements Schedulable{
    global void execute(SchedulableContext SC){ 
        //Code logic goes here..
        List<AsyncApexJob> aaj =[SELECT Id, Status, NumberOfErrors, JobItemsProcessed,TotalJobItems, CreatedBy.Email,ApexClass.Name FROM AsyncApexJob where ApexClass.Name='SendDocuSignEmailBatch' 
                                and (Status ='Holding' OR  Status ='Queued' OR  Status ='Preparing' OR  Status ='Processing')];
        //if(aaj==null) 
        database.executeBatch(new SendDocuSignEmailBatch());
    }
 
/*
 System.schedule('SendDocusignEmailScheduler 1',  '0 00 * * * ?', new SendDocusignEmailScheduler());
 System.schedule('SendDocusignEmailScheduler 2',  '0 05 * * * ?', new SendDocusignEmailScheduler());
 System.schedule('SendDocusignEmailScheduler 3',  '0 10 * * * ?', new SendDocusignEmailScheduler());
 System.schedule('SendDocusignEmailScheduler 4',  '0 15 * * * ?', new SendDocusignEmailScheduler());
 System.schedule('SendDocusignEmailScheduler 5',  '0 20 * * * ?', new SendDocusignEmailScheduler());
 System.schedule('SendDocusignEmailScheduler 6',  '0 25 * * * ?', new SendDocusignEmailScheduler());
 System.schedule('SendDocusignEmailScheduler 7',  '0 30 * * * ?', new SendDocusignEmailScheduler());
 System.schedule('SendDocusignEmailScheduler 8',  '0 35 * * * ?', new SendDocusignEmailScheduler());
 System.schedule('SendDocusignEmailScheduler 9',  '0 40 * * * ?', new SendDocusignEmailScheduler());
 System.schedule('SendDocusignEmailScheduler 10', '0 45 * * * ?', new SendDocusignEmailScheduler());
 System.schedule('SendDocusignEmailScheduler 11', '0 50 * * * ?', new SendDocusignEmailScheduler());
 System.schedule('SendDocusignEmailScheduler 12', '0 55 * * * ?', new SendDocusignEmailScheduler());
  */
}