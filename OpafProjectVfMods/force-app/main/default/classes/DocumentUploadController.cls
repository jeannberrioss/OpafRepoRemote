public without sharing class DocumentUploadController {
    
    public static Map<string, List<ContentVersion>> getAllDocuments(string recordId) {
        try {
            Set<Id> cdIds = new Set<Id>();
            Map<string, List<ContentVersion>> documents = new Map<string, List<ContentVersion>>();
            for(ContentDocumentLink cdl : [SELECT Id, LinkedEntityId,ContentDocumentId FROM ContentDocumentLink where LinkedEntityId =:recordId]) {
                cdIds.add(cdl.ContentDocumentId);                                               
            }
            
            for(ContentVersion cv : [SELECT Id, Title, ContentDocument.Title, ContentDocument.FileType, Document_Type__c from contentVersion where ContentDocumentId IN: cdIds]) {
                if(!documents.containsKey(cv.Document_Type__c)) {
                    documents.put(cv.Document_Type__c, new List<ContentVersion>());
                }
                
                documents.get(cv.Document_Type__c).add(cv);
            }
            
            return documents;
        } catch(Exception ex) {
            return null;
        }
    }
    
    public static List<ContentDocumentLink> createContentVersion(List<Object> fileDatas, string recordId) {
        try {
            List<ContentVersion> lstVersionsToInsert = new List<ContentVersion>();
            for (Object file : fileDatas) {
                FileInfo fileData = (FileInfo)JSON.deserialize(JSON.serialize(file), FileInfo.class);
                ContentVersion cv = new ContentVersion();
                cv.VersionData = fileData.VersionData;
                cv.Title = fileData.Title;
                cv.PathOnClient = fileData.Title;
                cv.Document_Type__c = fileData.DocumentType;
                lstVersionsToInsert.add(cv);
            }
            
            Insert lstVersionsToInsert;
            Set<Id> contentVersionIds =new Set<Id>();
            List<ContentDocumentLink> cdl = new List<ContentDocumentLink>();
            if (!lstVersionsToInsert.isEmpty()) {
                for (ContentVersion cversion : lstVersionsToInsert) {
                    contentVersionIds.add(cversion.Id);
                }
                cdl =  createContentLink(contentVersionIds, recordId);
            }
            
            
            return cdl;
        } catch(Exception ex) {
            return null;
        }
    }
    
    public static List<ContentDocumentLink> createContentLink(Set<Id> contentVersionId, string recordId) {
        try {
            if (contentVersionId == null || recordId == '') { return null; }
            List<contentVersion> cv = [SELECT ContentDocumentId FROM ContentVersion WHERE Id In: contentVersionId];
            List<ContentDocumentLink> cdl = new List<ContentDocumentLink>();
            for(contentVersion cver:cv){
                ContentDocumentLink cdocumentLink = new ContentDocumentLink();
                cdocumentLink.ContentDocumentId = cver.ContentDocumentId;
                cdocumentLink.LinkedEntityId = recordId;
                cdocumentLink.ShareType = 'V';
                cdl.add(cdocumentLink);    
            }        
            
            Insert cdl;
            return cdl;
        } catch(Exception ex) {
            return null;
        }
    }    
    
    public class FileInfo {
        public String Title;
        public Blob VersionData;
        public string DocumentType;
    }
}