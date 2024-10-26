/*
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES 
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL 
THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
public with sharing class PbCloneDocuments {   
    @InvocableVariable(
        Label='Source Record Id' 
        Description='Record Id of an object with related Documents'
        Required=false)
    public String sourceRecordId;
    @InvocableVariable(
        Label='Destination Record Id' 
        Description='Record Id of an object that recieve copies of the Source record\'s Documents'
        Required=false)
    public String destinationRecordId;

    /**
    * all instantiation of class with no parameters or source/destination record Ids
    */
    public PbCloneDocuments(){}
    public PbCloneDocuments(String sourceRecordId, String destinationRecordId){
        this.sourceRecordId = sourceRecordId;
        this.destinationRecordId = destinationRecordId;
    }
    
    /**
    * clone related files from a source record to a destination record
    */
    @InvocableMethod(Label='Clone Documents' Description='Clone Documents related to the Source record onto the Destination record')
    public static void cloneDocuments(list<PbCloneDocuments> pfCloneDocumentsList) {
 
        // get set of To IDs by the From Id
        map<Id, set<Id>> fromToMap = formatFromToMap(pfCloneDocumentsList); 
        if (fromToMap.isEmpty()) {
            return;
        }

        map<Id, ContentDocumentLink> cdlMap = new map<Id, ContentDocumentLink>();
        map<Id, list<contentLinkCls>> docIdCdlListMap = new map<Id, list<contentLinkCls>>();

        // create Content Document Link records for each To ID
        set<Id> fromIdSet = fromToMap.keySet();
        for (ContentDocumentLink cdl : [SELECT ContentDocumentId,LinkedEntityId,ShareType,Visibility,ContentDocument.LatestPublishedVersion.Document_Type__c 
                                            FROM ContentDocumentLink 
                                            WHERE LinkedEntityId IN :fromIdSet and  ContentDocument.LatestPublishedVersion.Document_Type__c  NOT IN ('coversheet','Enrollment Form') AND  (NOT ContentDocument.LatestPublishedVersion.Document_Type__c  LIKE '%RxDocument' )]) {
            // by Link Id
            cdlMap.put(cdl.Id, cdl);

            // by Document Id
            list<contentLinkCls> cdlList = docIdCdlListMap.get(cdl.ContentDocumentId);
            if (null == cdlList) {
                cdlList = new list<contentLinkCls>();
                docIdCdlListMap.put(cdl.ContentDocumentId, cdlList);
            }
            set<Id> toSet = fromToMap.get(cdl.LinkedEntityId);
            if (null != toSet) {
                for (Id toId : toSet) {
                    ContentDocumentLink newCdl = cdl.clone();
                    newCdl.LinkedEntityId = toId;
                    cdlList.add(new contentLinkCls(newCdl));
                }
            }
        }

        if (docIdCdlListMap.isEmpty()) {
            return;
        }

        // create a new Content Version NOT linked to a Content Document for each Content Document Link for each Destination Id
        set<Id> cvIdSet = getNewContentVersionIdMap(docIdCdlListMap);

        // get new Content Document that was auto-created
        map<Id, Id> cvIdDocIdMap = new map<Id, Id>();
        for (ContentDocument cd : [SELECT Id, LatestPublishedVersionId 
                                   FROM ContentDocument
                                   WHERE LatestPublishedVersionId IN :cvIdSet]) {
            cvIdDocIdMap.put(cd.LatestPublishedVersionId, cd.Id);
        }

        // set ContentDocument Id on the ContentDocumentLink
        list<ContentDocumentLink> cdlInsertList = new list<ContentDocumentLink>();
        for (list<contentLinkCls> cLinkList : docIdCdlListMap.values()) {
            for (contentLinkCls cLink : cLinkList) {
                Id cdId = cvIdDocIdMap.get(cLink.cvId); 
                if (null != cdId) {
                    cLink.cdl.ContentDocumentId = cdId;
                    cdlInsertList.add(cLink.cdl);
                } else {
                    system.debug(LoggingLevel.ERROR, 'Not Found ' + cLink);
                }
            }            
        }

        if (!cdlInsertList.isEmpty()) {
            insert cdlInsertList;
        }
    }

    /**
    * create a new Content Version NOT linked to a Content Document for each Content Document Link
    */
    private static set<Id> getNewContentVersionIdMap(map<Id, list<contentLinkCls>> docIdCdlListMap) {
        set<Id> cvIdSet = new set<Id>();
        list<ContentVersion> cvInsertList = new list<ContentVersion>();

        for (ContentVersion cv : [SELECT ContentDocumentId, ContentLocation, Description, pathOnClient, TagCsv, Title, VersionData,Document_Type__c
                                    FROM ContentVersion
                                    WHERE ContentDocumentId IN :docIdCdlListMap.keySet()
                                            AND ContentLocation = 'S']) { // S=Document is located within Salesforce
            
            list<contentLinkCls> cdlList = docIdCdlListMap.get(cv.ContentDocumentId);
            if (null != cdlList) {
                for (contentLinkCls cdl : cdlList) {
                    ContentVersion newCv = new ContentVersion(
                                                              Description=cv.Description, 
                                                              TagCsv=cv.TagCsv, 
                                                              pathOnClient=cv.pathOnClient,
                                                              Title=cv.Title, 
                                                              VersionData=cv.VersionData,
                    										  Document_Type__c = cv.Document_Type__c);
                    cdl.cv = newCv;

                    cvInsertList.add(newCv);
                }
            }
        }
        if (!cvInsertList.isEmpty()) {
            insert cvInsertList;

            for (list<ContentLinkCls> clList : docIdCdlListMap.values()) {
                for (ContentLinkCls cl : clList) {
                    cl.clearCv();
                    cvIdSet.add(cl.cvId);
                }
            }
        }
        return cvIdSet;
    }

    /**
    * return a map of the from and to record ids
    */
    private static map<Id, set<Id>> formatFromToMap(list<PbCloneDocuments> pfCloneDocumentsList) {
        map<Id, set<Id>> fromToMap = new map<Id, set<Id>>();
        for (PbCloneDocuments cd : pfCloneDocumentsList) {
            // skip if blank 
            if (String.isBlank(cd.sourceRecordId) || String.isBlank(cd.destinationRecordId)) continue;
            
            // convert to Id types, and skip if either is invalid
            Id fromId;
            Id toId;
            try {
                fromId = cd.sourceRecordId;
                toId = cd.destinationRecordId;
            } catch (exception e) {
                system.debug(LoggingLevel.ERROR, 'Id exception: ' + e.getMessage());
                continue;
            }

            // put in cross-reference map
            set<Id> toSet = fromToMap.get(fromId);
            if (null == toSet) {
                toSet = new set<Id>();
                fromToMap.put(fromId, toSet);
            }
            toSet.add(toId);
        }
        return fromToMap;
    }

    /**
    * subclass to help associate the contentdocumentlink to the contentversion
    */
    private class contentLinkCls {
        ContentDocumentLink cdl {get; set;}
        ContentVersion cv {get; set;}
        Id cvId {get; set;}
        public contentLinkCls(ContentDocumentLink cdl) {
            this.cdl = cdl;
        }

        public void clearCv() {
            cvId = cv.Id;
            cv = null;
        }
    }
}