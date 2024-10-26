@isTest
public class ImageControllerTest {
	@testSetup
    public static void commonSetup() { 
        Folder f = [SELECT Id FROM Folder WHERE Name = 'Shared Documents'];
        Document doc = new Document(Body = Blob.valueOf('Some Text'),
                                 	ContentType = 'application/pdf',
                                    DeveloperName = 'My_Document',
                                    IsPublic = true,
                                    Name = 'Otsukalogo',
                                    FolderId = f.Id
                                 	);
        insert doc;
    }
    
    testmethod static void testMethod1(){
    	Test.startTest();
        ImageController IC = new ImageController();
        IC.getStrLogoUrl();
        Test.stopTest();
    }
}