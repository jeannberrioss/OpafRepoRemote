public class eConsentEmailTempalteController {
public string ConsentId{get;set;}
    public list<Consent__c> Consentlist = new  list<Consent__c>();
    public eConsentEmailTempalteController(){
        
    }
    public list<Consent__c> getConsentreclist(){
        Consentlist = [select id,Status__c,
                      Patient__c,
                      Patient__r.Firstname,
                      Patient__r.Lastname,
                      Patient__r.Email,
                      Patient__r.Name,
                      Patient__r.Phone,
                      Patient__r.fax,
                      Provider__r.name,
                      Provider__r.firstname,
                      Provider__r.Lastname,
                   	  Provider__r.Email,
                      Provider__r.Salutation,
                      Provider__r.Phone
                      
                    from Consent__c  where Id=:ConsentId ];
        if (Consentlist.size()>0){
        return Consentlist;
        }
        return null;
    }

}