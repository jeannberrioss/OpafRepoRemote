public without sharing class myWorkSpaceLWCController {
    @AuraEnabled
    public static List<Case> getCaseList() {
        try {
            user userDetails = [select id,name,ContactId from user where Id =: userInfo.getUserId()];
            List<Case> cs = new List<Case>();
            cs = [SELECT Id,ContactId,CaseNumber,Saved_Location__c,
                  Prescriber__c,Status,Enrollment_End_Date__c,parent.Status,parent.Enrollment_Status__c,
                  parent.Enrollment_Start_Date__c,parent.Enrollment_End_Date__c,parent.Product__c,
                  Enrollment_Start_Date__c,Product__c,Parent.CaseNumber,ParentId,Enrollment_Status__c
                  FROM Case where ContactId =: userDetails.ContactId ORDER BY createdDate Desc limit 1];
            if(!cs.IsEmpty())
            {
                return cs;
            }
            else{
                return null;
            }
        } catch(Exception ex) {
            throw new AurahandledException(ex.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Shipment__c> getShipmentList(Id caseIdData) {
        try {
            List<Shipment__c> shipList = new List<Shipment__c>();
            shipList = [SELECT Id,Shipment_Status__c FROM Shipment__c where case__c =: caseIdData ORDER BY createdDate Desc limit 1];
            if(!shipList.IsEmpty())
                return shipList;
            else
                return null;
        } catch(Exception ex) {
            throw new AurahandledException(ex.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static string getMissingInfo(Id caseIdData) {
        try {
            string missingFieldsInfo='';
            system.debug('******'+caseIdData);
            
            List<Missing_Info__c> minfo = [SELECT Id,Date_Of_Hospital_Admission__c,Date_of_Hospital_Discharge__c,Demographics__c,Diagnosis__c,
                                           Dosage__c,Dosage_Strength__c,Dr_Signature_Date__c,Expenses__c,Frequency_Days_supply__c,HIPAA_Authorization__c,
                                           Household_Size__c,Income_Expenses__c,Income_Amount__c,Income_Documentation__c,Insurance__c,Insurance_Denial_Letter__c,
                                           Insurance_Termination_Letter__c,Medicaid_Denial_Letter__c,Medicare_Part_D_Card__c,No_Prescription_Form__c,No_Quantity_Indicated__c,
                                           NPI_Number__c,Number_of_Refills__c,Number_of_Vials__c,Patient_Signature__c,Patient_Signature_Date__c,Prescriber_DEA__c,
                                           Prescriber_Signature__c,Prescriber_SLN__c,Provider_Income_Attestation__c,Provider_Insurance_Attestation__c,Provider_Signature__c,
                                           Reenrollment_Request__c,REMS_Enrollment__c,Residency__c,Underinsured_Policy__c
                                           FROM Missing_Info__c where case__c =: caseIdData ORDER BY createdDate Desc limit 1];
            if(!minfo.isEmpty()) {
                if(minfo[0].Date_Of_Hospital_Admission__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Date Of Hospital Admission\n';
                }
                if(minfo[0].Date_of_Hospital_Discharge__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Date of Hospital Discharge\n';
                }
                if(minfo[0].Demographics__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Demographics\n';
                }
                if(minfo[0].Diagnosis__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Diagnosis\n';
                }
                if(minfo[0].Dosage__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Dosage\n';
                }
                if(minfo[0].Dosage_Strength__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Dosage Strength\n';
                }
                if(minfo[0].Dr_Signature_Date__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Dr Signature Date\n';
                }
                if(minfo[0].Expenses__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Expenses\n';
                }
                if(minfo[0].Frequency_Days_supply__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Frequency/Days supply\n';
                }
                if(minfo[0].HIPAA_Authorization__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'HIPAA Authorization\n';
                }
                if(minfo[0].Household_Size__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Household Size\n';
                }
                if(minfo[0].Income_Expenses__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Income/Expenses\n';
                }
                if(minfo[0].Income_Amount__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Income Amount\n';
                }
                if(minfo[0].Income_Documentation__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Income Documentation\n';
                }
                if(minfo[0].Insurance__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Insurance\n';
                }
                if(minfo[0].Insurance_Denial_Letter__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Insurance Denial Letter\n';
                }
                if(minfo[0].Insurance_Termination_Letter__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Insurance Termination Letter\n';
                }
                if(minfo[0].Medicaid_Denial_Letter__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Medicaid Denial Letter\n';
                }
                system.debug('******'+missingFieldsInfo);
                
                if(minfo[0].Medicare_Part_D_Card__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Medicare Part D Card\n';
                }
                if(minfo[0].No_Prescription_Form__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'No Prescription Form\n';
                }
                if(minfo[0].No_Quantity_Indicated__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'No Quantity Indicated\n';
                }
                if(minfo[0].NPI_Number__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'NPI Number\n';
                }
                if(minfo[0].Number_of_Refills__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Number of Refills\n';
                }
                if(minfo[0].Number_of_Vials__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Number of Vials\n';
                }
                if(minfo[0].Patient_Signature__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Patient Signature\n';
                }
                if(minfo[0].Patient_Signature_Date__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Patient Signature Date\n';
                }
                if(minfo[0].Prescriber_DEA__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Prescriber DEA\n';
                }
                if(minfo[0].Prescriber_Signature__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Prescriber Signature\n';
                }
                if(minfo[0].Prescriber_SLN__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Prescriber SLN\n';
                }
                if(minfo[0].Provider_Income_Attestation__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Provider Income Attestation\n';
                }
                if(minfo[0].Provider_Insurance_Attestation__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Provider Insurance Attestation\n';
                }
                if(minfo[0].Provider_Signature__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Provider Signature\n';
                }
                if(minfo[0].Reenrollment_Request__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Re-enrollment Request\n';
                }
                if(minfo[0].REMS_Enrollment__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'REMS Enrollment\n';
                }
                if(minfo[0].Residency__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Residency\n';
                }
                if(minfo[0].Underinsured_Policy__c =='Y'){
                    missingFieldsInfo = missingFieldsInfo +'-' + 'Underinsured Policy\n';
                }
            }
            return missingFieldsInfo;
        } catch(Exception ex) {
            throw new AurahandledException(ex.getMessage());
        }
        
    }
    
    @AuraEnabled(cacheable=true)
    public static String getCasebyEnrollmentStartDate(Id caseIdData) {
        try {
            Case cs = new Case();
            String enrollmentBoolean = '';
            cs = [SELECT Id,CaseNumber,Status,Enrollment_End_Date__c,Product__c,Enrollment_Status__c,Enrollment_Start_Date__c 
                  FROM Case where Id =: caseIdData];
            if(cs.id != null){
                Date startDate;
                if(cs.Enrollment_Start_Date__c != null){
                    startDate = cs.Enrollment_Start_Date__c;
                }
                
                Integer noOfDays = null;
                Date endDate ;
                if(cs.Enrollment_End_Date__c != null){
                    endDate = cs.Enrollment_End_Date__c;
                    noOfDays = System.today().daysBetween(endDate);
                }
                
                if(cs == null) {
                    enrollmentBoolean = 'newopaf';
                } else if(noOfDays != null && cs.Enrollment_Start_Date__c <= system.Today() && cs.Enrollment_End_Date__c >= system.today() && cs.Enrollment_Status__c == 'Enrolled' && noOfDays <= 45 && noOfDays >= 0){
                    enrollmentBoolean = 'reEnroll';
                    system.debug('*****hello****');
                }
                if(cs.Enrollment_Status__c == 'Saved to Complete Later'){
                    enrollmentBoolean = 'incompleteopf';
                }
            }
            
            return enrollmentBoolean;
        } catch(Exception ex) {
            throw new AurahandledException(ex.getMessage());
        }
    }
    @AuraEnabled
    public static string createCaseRecord(){
        try {
            case c = new case();
            c.Enrollment_Start_Date__c = system.today();
            c.Enrollment_End_Date__c = system.today().addDays(30);
            c.Origin = 'Phone';
            insert c;
            return c.id;
        } catch(Exception ex) {
            throw new AurahandledException(ex.getMessage());
        }
    }
    
    @auraEnabled(cacheable=true)
    public Static List<Consent__c> getCurrentUserContact(){
        try {
            user userDetails = [select id,name,ContactId from user where Id =: userInfo.getUserId()];
            List<Consent__c> contactDetail = [select id,Type__c,DocusignCheck__c from Consent__c where Patient__c =: userDetails.ContactId];
            if(contactDetail.isEmpty()) { return null; }
            return contactDetail;
        } catch(Exception ex) {
            throw new AurahandledException(ex.getMessage());
        }
    }
    
}