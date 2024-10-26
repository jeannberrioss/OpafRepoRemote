public class ContactListViewController {
	@AuraEnabled
    public static String getRecordType(String recordTypeName){
    	String recordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get(recordTypeName).getRecordTypeId();
        return recordTypeId;
    }
}