public class ConvertAttachmentToContent {    
public static void updateType(List<Attachment> attachmentList){
    Map<String, String> mapContentType = new Map<String,String>{'tif' => 'image/tiff','doc' => 'application/msword','txt' => 'text/plain', 'pdf' => 'application/pdf', 'jpg' => 'image/jpeg', 'png' => 'image/png','docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'xlsx' =>'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
    for(Attachment a:attachmentList){
        if(mapContentType.containsKey(a.ContentType))
    	a.ContentType = mapContentType.get(a.ContentType); 
    }
}
public static void convertAttachment(ID attachmentID){
    Map<String, String> mapContentType = new Map<String,String>{'image/tiff' =>'tiff', 'application/msword' =>'doc','text/plain' => 'txt', 'application/pdf' => 'pdf', 'image/jpeg' => 'jpeg', 'image/png' => 'png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx'};
    Attachment attach = [SELECT Id, Name, Body, ContentType, ParentId,OwnerId From Attachment where id =:attachmentID];
     
    //Insert ContentVersion
    ContentVersion cVersion = new ContentVersion();
    cVersion.ContentLocation = 'S'; //S-Document is in Salesforce. E-Document is outside of Salesforce. L-Document is on a Social Netork.
    if(mapContentType.containsKey(attach.ContentType))
    cVersion.PathOnClient = attach.Name +'.'+mapContentType.get(attach.ContentType);//File name with extention
    else cVersion.PathOnClient = attach.Name ;//File name with extention
    cVersion.Origin = 'H';//C-Content Origin. H-Chatter Origin.
    cVersion.OwnerId = attach.OwnerId;//Owner of the file
    cVersion.Title = attach.Name;//Name of the file
    cVersion.VersionData = attach.Body;//File content
    //cVersion.FileType = attach.ContentType;
    Insert cVersion;
     
    //After saved the Content Verison, get the ContentDocumentId
    Id conDocument = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:cVersion.Id].ContentDocumentId;
     
    //Insert ContentDocumentLink
    ContentDocumentLink cDocLink = new ContentDocumentLink();
    cDocLink.ContentDocumentId = conDocument;//Add ContentDocumentId
    cDocLink.LinkedEntityId = attach.ParentId;//Add attachment parentId
    cDocLink.ShareType = 'I';//V - Viewer permission. C - Collaborator permission. I - Inferred permission.
    cDocLink.Visibility = 'AllUsers';//AllUsers, InternalUsers, SharedUsers
    Insert cDocLink;
}
}