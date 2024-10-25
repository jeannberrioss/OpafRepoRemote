public class PatientEmailTempalteController {
    public string CaseId{get;set;}
    public string ShipmentId{get;set;}
    //public Shipment__c Shipment{get;set;}
    public list<case> caselist = new  list<case>();
    public PatientEmailTempalteController(){
        
    }
    public shipment__c getShipment(){
        return [Select id,Case__r.Patient__r.FirstName,Case__r.Patient__r.Lastname,Case__r.Prescriber__r.email,case__r.Prescriber__r.Salutation, case__r.Prescriber__r.LastName,Track_Shipment__c,Tracking_Number__c,case__r.Prescriber__r.Name from Shipment__c where id=:ShipmentId];
        
        //return null;
    }
    public list<case> getcasereclist(){
        caselist = [select id,Enrollment_Status__c,User_Type__c,
                      Patient__c,
                      Patient__r.Firstname,
                      Patient__r.Lastname,
                      Patient__r.Email,
                      Patient__r.Phone,
                      Patient__r.fax,
                      Prescriber__r.name,
                      Prescriber__r.firstname,
                      Prescriber__r.Lastname,
                   	  Prescriber__r.Email,
                      prescriber__r.Salutation,
                      Prescriber__r.Phone,
                      Facility__c,
                      Facility__r.Name
                    from case where Id=:CaseId ];
        if (caselist.size()>0){
        return caselist;
        }
        return null;
    }

}