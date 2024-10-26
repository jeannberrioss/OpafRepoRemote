public class ConvertImageToPDFController {
	public String fileURL {get; set;}
	private Id fileId;
	
    	public ConvertImageToPDFController() {
    		this.fileId = ApexPages.currentPage().getParameters().get('id');
    		this.fileURL = '/sfc/servlet.shepherd/version/download/' + fileId;
	}
    public static void createImage(contentdocumentlink cdl1,String CaseId,Id networkId){
    		PageReference ref = Page.ConvertImageToPDF;   
            ref.getParameters().put('id',cdl1.ContentDocument.LatestPublishedVersionId);
            ContentVersion cont = new ContentVersion();
            cont.Title = cdl1.ContentDocument.Title;
            cont.PathOnClient = cdl1.ContentDocument.Title+'.pdf';
            //cont.FileType ='PDF';
            if(!Test.isRunningTest()){
                cont.VersionData = ref.getContentAsPdf();    
            }else{
                cont.VersionData = blob.valueOf('Test');    
            }            
            //cont.Document_Type__c='Coversheet';
            cont.Sort_Order__c = 1;
        	cont.NetworkId =networkId;
            insert cont; 
            ContentDocumentLink cdl = new ContentDocumentLink(); 
            cdl.ContentDocumentId = [select ContentDocumentId,Id from ContentVersion where  Id =:cont.Id].ContentDocumentId;
            cdl.LinkedEntityId = CaseId;
            cdl.ShareType ='I';
            cdl.Visibility ='AllUsers';
            insert cdl;
               
    }
}