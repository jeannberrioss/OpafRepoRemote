public class OPAF_NeuroscienceEnrollmentController {
 public string CaseRecId {get;set;}
    public OPAF_NeuroscienceEnrollmentController(ApexPages.StandardController stdcontroller){
        CaseRecId = ApexPages.currentPage().getParameters().get('id') ;
        Case caserecord = [select id,Patient__c,Patient__r.Firstname,Patient__r.LastName,Product__c from Case where Id =:CaseRecId];
        String generatedFileName = 'Rx-'+caserecord.Product__c+'-'+caserecord.Patient__r.Firstname+caserecord.Patient__r.LastName+'.pdf';
        Apexpages.currentPage().getHeaders().put('content-disposition', 'attachment; filename=' +generatedFileName);
        
        //PageReference ref = new PageReference('https://partial-opaf.cs201.force.com/Prescriber/apex/eFaxCoversheet');
        /*PageReference ref = new PageReference('https://partial-opaf.cs201.force.com/apex/eFaxCoversheet');
              
        ContentVersion cont = new ContentVersion();
            cont.Title = 'Title for this contentVersion';
            cont.PathOnClient = 'file.pdf';
            cont.VersionData = ref.getContentAsPdf();
            //cont.Origin = 'H';
            cont.Document_Type__c='Coversheet';

            insert cont; */
    }
}