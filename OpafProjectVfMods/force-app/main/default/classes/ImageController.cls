public class ImageController {
// Getting the Document Id and creating a Document Url.
    public String getStrLogoUrl(){
        list<Document> lstDocument = [SELECT Id FROM Document WHERE Name = 'Otsukalogo' LIMIT 1];
		String strOrgId = UserInfo.getOrganizationId();
		String strLogoUrl = System.URL.getSalesforceBaseUrl().toExternalForm() + 
            				'/servlet/servlet.ImageServer?id='+lstDocument[0].Id +
            				'&oid=' + strOrgId;
        return strLogoUrl;
    }
}