public class PaperConsentFormController {
    public String pName {get; set;}
    public String pDOB {get; set;}
    public String cDate {get; set;}
    public String lName {get; set;}
    public PaperConsentFormController(){
        
    	pName = ApexPages.currentPage().getParameters().get('pName');
        pDOB = ApexPages.currentPage().getParameters().get('pDOB');
        cDate = ApexPages.currentPage().getParameters().get('cDate');
        lName = ApexPages.currentPage().getParameters().get('lName');
        String generatedFileName = 'PatientPaperConsent_'+pName+'.pdf';
        Apexpages.currentPage().getHeaders().put('content-disposition', 'attachment; filename=' +generatedFileName);
        }
}