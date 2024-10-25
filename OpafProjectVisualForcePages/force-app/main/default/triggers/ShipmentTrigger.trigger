trigger ShipmentTrigger on Shipment__c (before insert, before update) {
    set<Id> caseids = new set<ID>();
    for(Shipment__c s:Trigger.New){
    if(s.Case__c!=null)
    caseids.add(s.Case__c);    
    
    }
    MAP<ID,Case> mapCase = new MAP<ID,Case>([Select ID,Patient__c,Patient__r.Email,Prescriber__c, Prescriber__r.Email,User_Type__c from case where Id in:caseids]);
	for(Shipment__c s:Trigger.New){
        if(s.Case__c!=null){
            case SelectedCase= mapCase.get(s.Case__c);
            if(SelectedCase.Patient__c!=null)
        	s.Patient_Email__c = SelectedCase.Patient__r.Email;
            if(SelectedCase.Prescriber__c!=null)
            s.Prescriber_Email__c=  SelectedCase.Prescriber__r.Email;
            s.User_Type__c = SelectedCase.User_Type__c;
        }    
    
    }
}