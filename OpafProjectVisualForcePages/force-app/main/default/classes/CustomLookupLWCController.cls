public with sharing class CustomLookupLWCController {
	@AuraEnabled(cacheable=true)
    public static list<sObject> fetchLookupData(String searchKey , String sObjectApiName, String recordTypeName, Boolean currentUser) {    
        List < sObject > returnList = new List < sObject > ();
        string sWildCardText = '%' + searchKey + '%';
        string filter = '';
        string sQuery;
        string currentLoggedInUser = UserInfo.getUserId();
        if(recordTypeName != ''){
            if(currentUser == true){
            	sQuery = 'Select Id, Name From ' + sObjectApiName + ' Where Name Like : sWildCardText AND RecordType.Name =: recordTypeName AND (CreatedBYId =: currentLoggedInUser OR OwnerId =: currentLoggedInUser) order by createdDate DESC LIMIT 5';        
            }else{
            	sQuery = 'Select Id, Name From ' + sObjectApiName + ' Where Name Like : sWildCardText AND RecordType.Name =: recordTypeName order by createdDate DESC LIMIT 5';        
            }
        }else{
            sQuery = 'Select Id, Name From ' + sObjectApiName + ' Where Name Like : sWildCardText order by createdDate DESC LIMIT 5';
        } 
        system.debug('sQuery -------> '+sQuery);
        for (sObject obj: database.query(sQuery)) {
            returnList.add(obj);
        }
        return returnList;
    }
}