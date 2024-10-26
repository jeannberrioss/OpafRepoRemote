public with sharing class PresciberWorkspaceLWCController {
    @AuraEnabled(cacheable=true)
    public static List<Case> getApplications(){
        List<Case> cases = [SELECT Id, 
                                    Patient__c,
                                    Patient__r.Name,
                                    CaseNumber,
                                    Product__c,
                                    Origin,
                            		Sub_Type__c
                                    FROM Case 
                                    WHERE Enrollment_Status__c = 'Saved to Complete Later' 
                                    ORDER BY LastModifiedDate DESC 
                                    LIMIT 7];
        return cases;
            
    }
    
    @AuraEnabled
    public static Boolean inCommunity(){
        return Network.getNetworkId() != null; 
    }
    
    @AuraEnabled
    public static User getCurrentUserDetails(){ 
        User usr = [SELECT Id, AccountId, ContactId FROM User WHERE Id =: UserInfo.getUserId()];
        return usr;
    }
    
    @AuraEnabled
    public static String getPrimaryContact(){ 
        User usr = [SELECT Id, AccountId, ContactId FROM User WHERE Id =: UserInfo.getUserId()];
        List<Contact> primaryPrescriber = [SELECT Id, Is_Primary__c FROM Contact WHERE (CreatedById =: UserInfo.getUserId() OR OwnerId=:UserInfo.getUserId() ) AND Is_Primary__c = true ORDER BY LastModifiedDate DESC LIMIT 1];
        String primaryPrescriberId = '';
        if(primaryPrescriber.size() > 0){
            primaryPrescriberId = primaryPrescriber[0].Id;	    
        }else{
            primaryPrescriberId = usr.ContactId;
        }
        return primaryPrescriberId;
    }
    
    @AuraEnabled
    public static String getPrimaryAccount(){ 
        List<Account> primaryFacility = [SELECT Id, Is_Primary__c FROM Account WHERE (CreatedById =: UserInfo.getUserId() OR OwnerId =: UserInfo.getUserId()) AND Is_Primary__c=true ORDER BY LastModifiedDate DESC LIMIT 1];
        String primaryFacilityId = '';
        system.debug('primaryFacility -------> '+primaryFacility);
        if(primaryFacility.size() > 0){
            primaryFacilityId = primaryFacility[0].Id;	    
        }else{
            primaryFacilityId = '';
        }
        return primaryFacilityId;
    }
    
    
    @AuraEnabled
    public static Contact getContactDetails(String contactId){
        Contact con = [SELECT Id, Name, FirstName, LastName, Email, Phone, MailingStreet, State__c, MailingCity,
                                MailingPostalCode, BirthDate, SSN__c, HealthCloudGA__Gender__c,
                                Mailing_Address_Line_2__c, Prescriber_Salutation__c, Tax_Id__c,
                                NPI__c, DEA__c, State_License__c, Phone_Extension__c, Fax, Street_Address__c,
                       			Address_Line_2__c, City__c, Zip_Code__c, HomePhone, State_of_License__c
                                FROM Contact WHERE Id =: contactId];
        return con;
    }
    
    @AuraEnabled
    public static Case getCaseData(String caseId){
        Case cs = [SELECT Id, CaseNumber, Product__c, Has_No_Insurance__c, Pharmacy_Plan_Name__c, Pharmacy_Plan_Phone__c, 
                            Pharmacy_Policyholder_Name__c, Pharmacy_Policyholder_DOB__c, Pharmacy_Rx_BIN__c,
                            Pharmacy_Rx_PCN__c, Medical_Plan_Name__c, Medical_Plan_Phone__c, Medical_Policyholder_Name__c,
                            Medical_Policyholder_DOB__c, Medical_Policyholder_Member_ID__c, MedicalGroupNumber__c,
                            ABILIFY_MAINTENA_First_Administration__c, Temportary_Patient_Assistance__c,JYNARQUE_Starter_Kit__c,
                            Does_the_patient_live_in_United_States__c, Estimated_Annual_Household_Income__c, Estimated_Household_Size__c,
                            Facility__c, Prescriber__c , ICD_10_Diagnosis_Code__c, Patient_First_Name__c, Patient_Last_Name__c,
                            Rx_Send_Method__c, eScribe_Rx__c, Saved_Location__c, Patient__c, Rx_Fax_Timestamp__c, Prescription1__c,
                   			Ship_Address_Line2__c, Ship_Care_To__c, Ship_City__c, Ship_Fax__c, Ship_Local_Care_Center_Phone__c,
                   			Ship_Phone__c, Ship_State__c, Ship_Street_Address__c, Ship_Type__c, Ship_Zip__c, Enrollment_Status__c,
                   			Patient_First_Name2__c, Patient_Last_Name2__c, Patient_with_Same_Provider__c, Same_ICD_10__c, Same_Shipping_Address__c,
                   			Patient_City__c, Patient_State__c, Patient_Street_Address__c, Patient_Zip_Postal_Code__c, Prescriber_First_Name2__c,
                   			Prescriber_Last_Name2__c, Consent_Status__c, EnvelopeId__c, Enrollment_End_Date__c, Sub_Type__c,
                            Biotin_2500mcg__c,
                            Calcium_600mg__c,
                            Omega_3_Fish_Oil_1400mg__c,
                            Folic_Acid_400mcg__c,
                            Iron_65mg__c,
                            Multi_Complete__c,
                            Super_B_Comp_with_Folic_Biotin_and_C__c,
                            Vitamin_A_2400_mcg_8000_IU__c,
                            Vitamin_B1_100mg__c,
                            Vitamin_B6_100mg__c,
                            Vitamin_B12_1000mcg__c,
                            Vitamin_C_1000mg_Chewable__c,
                            Vitamin_C_1000mg__c,
                            Vitamin_D3_2000iu__c,
                            Vitamin_E_400iu_DL_ALPHA__c FROM Case WHERE Id =: caseId];
        return cs;
    }
    
    @AuraEnabled 
    public static Shipment__c getCaseShipments(String caseId){
        /*List<Shipment__c> shipments = [SELECT Id FROM Shipment__c WHERE Case__c =: caseId ORDER BY LastModifiedDate DESC];   
        if(shipments.size() > 0){
            return shipments[0];  
        }else{
            return null;
        }*/
        return null;
    }
    
    /*@AuraEnabled 
    public static Prescription__c getCasePrescriptions(String caseId){
        List<Prescription__c> prescriptions = [SELECT Id FROM Prescription__c WHERE Case__c =: caseId ORDER BY LastModifiedDate DESC];   
        if(prescriptions.size() > 0){
            return prescriptions[0];  
        }else{
            return null;
        }
    }*/
    
    @AuraEnabled
    public static List<ContentVersion> getUploadedFiles(String caseId){
        SET<Id> contentDocumentIds = new SET<Id>();
        List<ContentDocumentLink> cdlList = [SELECT Id, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId =: caseId AND LinkedEntity.Type='Case'];
        for(ContentDocumentLink cdl : cdlList){
            contentDocumentIds.add(cdl.ContentDocumentId);   
        }
        List<ContentVersion> cvList = [SELECT Id, 
                                                Title, 
                                                Document_Type__c, 
                                                ContentDocumentId, 
                                                ContentDocument.Id,
                                                FirstPublishLocationId
                                                FROM ContentVersion 
                                                WHERE ContentDocumentId IN: contentDocumentIds];
        system.debug('cvList ------> '+cvList);
        return cvList;
    }
    
    @AuraEnabled
    public static List<ContentVersion> getFiles(List<String> contentDocumentIds , String fileType){
    	List<ContentDocumentLink> cdlList = [SELECT Id, ContentDocumentId FROM ContentDocumentLink WHERE ContentDocumentId IN: contentDocumentIds];
        system.debug('cdlList -------> '+cdlList);
        for(ContentDocumentLink cdl : cdlList){
            contentDocumentIds.add(cdl.ContentDocumentId);   
        }
        List<ContentVersion> cvList = [SELECT Id, 
                                                Title, 
                                                Document_Type__c, 
                                                ContentDocumentId, 
                                                ContentDocument.Id,
                                       			ContentDocument.Title,
                                                FirstPublishLocationId
                                                FROM ContentVersion 
                                                WHERE ContentDocumentId IN: contentDocumentIds];
        system.debug('cvList ------> '+cvList);
        SET<Id> caseIds = new SET<Id>();
        if(cvList.size() > 0){
            for(ContentVersion cv : cvList){
                caseIds.add(cv.FirstPublishLocationId);
                if(cv.Document_Type__c == '' || cv.Document_Type__c == null){
                	cv.Document_Type__c = fileType;
                }    
            } 
            update cvList;
        }
        List<ContentVersion> finalCVList = [SELECT Id, 
                                                Title, 
                                                Document_Type__c, 
                                                ContentDocumentId, 
                                                ContentDocument.Id,
                                                FirstPublishLocationId
                                                FROM ContentVersion 
                                                WHERE FirstPublishLocationId IN: caseIds];
        system.debug('finalCVList ------> '+finalCVList);
        system.debug('finalCVList size ------> '+finalCVList.size());
        return finalCVList;    
    }
    
    @AuraEnabled
    public static Account getAccountData(String accountId){
        Account acc = [SELECT Id, Name, Facility_Type__c, BillingCity, BillingState, BillingStreet,
                                BillingPostalCode, Billing_Address_Line_2__c, Phone, Fax, 
                                Facility_Contact_First_Name__c, Facility_Contact_Phone__c, 
                                Facility_Contact_Last_Name__c, Facility_Contact_Phone_Extension__c, 
                                Facility_Contact_Email__c, Facility_Contact_Fax__c, State__c, City__c,
                       			Street_Address__c, Address_Line_2__c, Zip_Code__c FROM Account WHERE Id =: accountId];  
        return acc;
    }
    
    @AuraEnabled
    public static Prescription__c getPrescriptionData(String prescriptionId){
        Prescription__c ps = [SELECT Id, Name, Next_Injection__c, Hospital_Admission_Date__c, REMS_Program__c,
                                        HospitalDischarge_Date__c, REMS_ID_Number__c, Qty_SAMSCA_During_Stay__c,
                                        Qty_SAMSCA_at_Discharge__c, Number_of_Refills__c, Administration_Method__c,
                                        Dosage__c, Directions__c, Titration_Directions__c, Dispense_as_Written__c,
                                        Quantity__c FROM Prescription__c WHERE Id =: prescriptionId]; 
        return ps;
    }
    
    @AuraEnabled
    public static Shipment__c getShipmentData(String shipmentId){
        /*Shipment__c shipment = [SELECT Id, Name, Shipping_Type__c, Local_Care_Center_Phone__c, Ship_Address_Line_1__c,
                                        Ship_Address_Line_2__c, Ship_City__c, Ship_State__c, Ship_Postal_Code__c
                                        FROM Shipment__c WHERE Id =: shipmentId]; 
        return shipment;*/
        return null;
    }
    
    @AuraEnabled
    public static void updateContact(Contact contactRecord){
    	update contactRecord;    
    }
    
    @AuraEnabled
    public static ResponseClass createCase(Contact contactRecord, String caseId, String actionType, String step, String applicationType){
        system.debug('contactRecord -------> '+contactRecord);
        ResponseClass RC = new ResponseClass();
        try{
            RecordType RT = [SELECT Id, Name FROM RecordType WHERE DeveloperName='IndustriesIndividual' AND sObjectType='Contact'];
            /*Case caseRecord = new Case();
            if(contactRecord.Id != null){
                List<Case> caseList = [SELECT Id FROM Case WHERE Patient__c =: contactRecord.Id OR Prescriber__c =: contactRecord.Id ORDER BY LastModifiedDate DESC];    
                if(caseList.size() > 0){
                    caseRecord = caseList[0];       
                } 
            }*/
            Contact newContact = new Contact();
            if(contactRecord.Id != null){
                newContact.Id = contactRecord.Id;     
            }
            newContact.FirstName = contactRecord.FirstName;
            newContact.LastName = contactRecord.LastName;
            newContact.Email = contactRecord.Email;
            newContact.Birthdate = contactRecord.Birthdate;
            newContact.SSN__c = contactRecord.SSN__c;
            newContact.HomePhone = contactRecord.HomePhone;
            newContact.HealthCloudGA__Gender__c = contactRecord.HealthCloudGA__Gender__c;
            newContact.RecordTypeId = RT.Id;
            newContact.Gender__c = contactRecord.HealthCloudGA__Gender__c;
            //newContact.MailingStreet = contactRecord.MailingStreet;
            //newContact.Mailing_Address_Line_2__c = contactRecord.Mailing_Address_Line_2__c;
            //newContact.MailingCity = contactRecord.MailingCity;
            //newContact.MailingState = contactRecord.State__c;
            //newContact.MailingPostalCode = contactRecord.MailingPostalCode;
            newContact.Street_Address__c = contactRecord.Street_Address__c;
            newContact.Address_Line_2__c = contactRecord.Address_Line_2__c;
            newContact.City__c = contactRecord.City__c;
            newContact.State__c = contactRecord.State__c;
            newContact.Zip_Code__c = contactRecord.Zip_Code__c; 
            upsert newContact;
            
            Case cs = new Case();
            if(caseId != null && caseId != ''){
                cs.Id = caseId;    
            }else{
                RC.isInitial = true;
            }
            cs.Patient__c = newContact.Id;
            cs.Sub_Type__c = applicationType;
            if(actionType == 'Save and Complete Later'){
                cs.Saved_Location__c = step;
                cs.Enrollment_Status__c = 'Saved to Complete Later';
            }else if(actionType == 'next'){
                cs.Saved_Location__c = step;
                cs.Enrollment_Status__c = 'Saved to Complete Later';
            }
            cs.Patient_First_Name__c = newContact.FirstName;
            cs.Patient_Last_Name__c = newContact.LastName;
            cs.User_Type__c = 'Prescriber';
            cs.Origin = 'Web';
            upsert cs;
            RC.status = 'Success';
            RC.recordId = cs.Id;
            RC.patientId = newContact.Id;
            
        }Catch(exception exp){
            RC.status = 'Error';
            RC.message = exp.getMessage();
        }
        return RC;
    }
    
    @AuraEnabled
    public static ResponseClass cloneCase(Contact contactRecord, Case caseRecord, String actionType, String step, String applicationType, String caseId){
    	ResponseClass RC = new ResponseClass();
        try{
        	update contactRecord;
        	system.debug('caseRecord --------> '+caseRecord);
            Integer differenceInDays;
            if(caseRecord.Enrollment_End_Date__c != null){
            	differenceInDays = (system.today()).daysBetween(caseRecord.Enrollment_End_Date__c);    
            }
            Case clonedCase = caseRecord.clone();
            if(actionType == 'Save and Complete Later'){
                clonedCase.Saved_Location__c = step;
                clonedCase.Enrollment_Status__c = 'Saved to Complete Later';
            }else if(actionType == 'next'){
                clonedCase.Saved_Location__c = step;
                clonedCase.Enrollment_Status__c = 'Saved to Complete Later';
            }
            clonedCase.User_Type__c = 'Prescriber';
            clonedCase.Origin = 'Web';
            clonedCase.Does_the_patient_live_in_United_States__c = '';
            clonedCase.Temportary_Patient_Assistance__c = '';
            clonedCase.JYNARQUE_Starter_Kit__c = '';
            clonedCase.ABILIFY_MAINTENA_First_Administration__c = '';
            clonedCase.Estimated_Annual_Household_Income__c = null;
            clonedCase.Estimated_Household_Size__c = null;
            clonedCase.Rx_Fax_Timestamp__c = null;
            clonedCase.EnvelopeId__c = '';
            clonedCase.Consent_Status__c = '';
            clonedCase.Enrollment_End_Date__c = null;
            clonedCase.Sub_Type__c = applicationType;
            if(caseRecord.Same_ICD_10__c == false){
            	clonedCase.ICD_10_Diagnosis_Code__c = '';    
            }
            if(caseRecord.Patient_with_Same_Provider__c == false){
            	clonedCase.Prescriber__c = null;
                clonedCase.Facility__c = null;
            }
            if(differenceInDays <= 45 && caseRecord.Enrollment_End_Date__c != null){
            	insert clonedCase;    
            }else{
                clonedCase.Id = caseId;
            	update clonedCase;    
            }
            if(clonedCase.Prescription1__c!=null){
            Prescription__c prescription = [SELECT Id, Dosage__c, Quantity__c, Number_of_Refills__c,
                                           			Directions__c, Titration_Directions__c, Administration_Method__c
                                           			FROM Prescription__c WHERE Id =: clonedCase.Prescription1__c];
            if(prescription != null){
            	prescription.Dosage__c = '';
                prescription.Quantity__c = '';
                prescription.Number_of_Refills__c = '';
                prescription.Directions__c = '';
                prescription.Titration_Directions__c = '';
                prescription.Administration_Method__c = '';
                update prescription;
            }
            }
            caseRecord.Is_Enrolled__c = true;
            update caseRecord;
            //PbCloneDocuments pb=new PbCloneDocuments(caseRecord.Id,clonedCase.Id);
            //PbCloneDocuments.cloneDocuments(new List<PbCloneDocuments>{pb});
            /*
            List<ContentDocumentLink> toBeClonedContentDocumentLinks = [SELECT ContentDocumentId,
                                                                        		Id,
                                                                        		IsDeleted,
                                                                        		LinkedEntityId,
                                                                        		ShareType,
                                                                        		Visibility FROM ContentDocumentLink where LinkedEntityId =: caseRecord.Id];
            for(ContentDocumentLink cdl : toBeClonedContentDocumentLinks){
                cdl.Id=null;
                cdl.LinkedEntityId = clonedCase.Id;
            }
    		insert toBeClonedContentDocumentLinks;
            */
            RC.status = 'Success';
            RC.recordId = clonedCase.Id;
            RC.patientId = contactRecord.Id; 
            
        }catch(Exception exp){
        	RC.status = 'Error';
            RC.message = exp.getMessage();
        }
        return RC;
        
    }
    
    @auraEnabled(cacheable = true)
    public static List<PickListValues> getAllProductValues() {
        List<PickListValues> productValues = new List<PickListValues>();
        Map<String, Product_Setting__mdt> productSetting = Product_Setting__mdt.getAll();
        List<Product_Setting__mdt> productSettings = [SELECT Id, MasterLabel, Actual_Name__c FROM Product_Setting__mdt ORDER BY MasterLabel ASC];
        for(Product_Setting__mdt ps: productSettings){
            PickListValues p = new PickListValues();
            p.label = ps.Actual_Name__c;
            p.value = ps.MasterLabel;
            productValues.add(p);
        }
        return productValues;
    }
    
    @AuraEnabled(cacheable = true)
    public static List <PickListValues> fetchPickListValue(sObject objInfo, string picklistFieldApi) {
        Schema.DescribeSObjectResult objDescribe = objInfo.getSObjectType().getDescribe();
        map <String, Schema.SObjectField> fieldMap = objDescribe.fields.getMap();
        list <Schema.PicklistEntry> values = fieldMap.get(picklistFieldApi).getDescribe().getPickListValues();
        list <PickListValues> pickValues = new list <PickListValues> ();
        for (Schema.PicklistEntry a: values) {
            PickListValues pickVal = new PickListValues();
            pickVal.label = a.getLabel();
            pickVal.value = a.getValue();
            pickValues.add(pickVal);
        }
        return pickValues;
 
    }
    
    @AuraEnabled
    public static ResponseClass updateCaseDetails(Case caseRecord, String actionType, String step, 
                                                String primaryCardFile, String medicalCardFile, 
                                                String residentialFile, String insuranceFile, String incomeFile){
        
        ResponseClass RC = new ResponseClass();
        system.debug('caseRecord --------> '+caseRecord);                                            
        try{
            User usr = [SELECT Id, AccountId, ContactId FROM User WHERE Id =: UserInfo.getUserId()];
            List<Contact> primaryPrescriber = [SELECT Id, Is_Primary__c FROM Contact WHERE (CreatedById =: UserInfo.getUserId() OR OwnerId=:UserInfo.getUserId()) AND Is_Primary__c = true ORDER BY LastModifiedDate DESC LIMIT 1];
            String primaryPrescriberId = '';
            if(primaryPrescriber.size() > 0){
            	primaryPrescriberId = primaryPrescriber[0].Id;	    
            }else{
                primaryPrescriberId = '';
            }
            List<Account> primaryAccount = [SELECT Id, Is_Primary__c FROM Account WHERE (CreatedById =: UserInfo.getUserId() Or OwnerId=:UserInfo.getUserId()) AND Is_Primary__c = true AND RecordType.Name='Facility' ORDER BY LastModifiedDate DESC LIMIT 1];
            String primaryAccountId = '';
            if(primaryAccount.size() > 0){
            	primaryAccountId = primaryAccount[0].Id;	    
            }else{
            	primaryAccountId = '';    
            }
            List<FilesClass> primaryDocument = new List<FilesClass>();
            List<FilesClass> medicalDocument = new List<FilesClass>();
            List<FilesClass> residentialDocument = new List<FilesClass>();
            List<FilesClass> insuranceDocument = new List<FilesClass>();
            List<FilesClass> incomeDocument = new List<FilesClass>();
            if(actionType == 'Save and Complete Later'){
                caseRecord.Saved_Location__c = step;
                caseRecord.Enrollment_Status__c = 'Saved to Complete Later';
            }else if(actionType == 'next'){
                caseRecord.Saved_Location__c = step;  
                caseRecord.Enrollment_Status__c = 'Saved to Complete Later';
            }
            caseRecord.User_Type__c = 'Prescriber';
            update caseRecord;                                         
            Case caseData = getCaseData(caseRecord.Id);
            Shipment__c shipment = new Shipment__c(); 
                                                    
            if(primaryCardFile != ''){
                primaryDocument = (List<FilesClass>)System.JSON.deserialize(primaryCardFile, List<FilesClass>.class);
                createContentVersion(primaryDocument, caseRecord.Id, 'PharmaCard');
            }
            if(medicalCardFile != ''){ 
                medicalDocument = (List<FilesClass>)System.JSON.deserialize(medicalCardFile, List<FilesClass>.class);
                createContentVersion(medicalDocument, caseRecord.Id, 'MedicalCard');
            }
            if(residentialFile != ''){
                residentialDocument = (List<FilesClass>)System.JSON.deserialize(residentialFile, List<FilesClass>.class);
                createContentVersion(residentialDocument, caseRecord.Id, 'ResidencyProof');
            } 
            if(insuranceFile != ''){
                insuranceDocument = (List<FilesClass>)System.JSON.deserialize(insuranceFile, List<FilesClass>.class);
                createContentVersion(insuranceDocument, caseRecord.Id, 'InsuranceDocument');
            }
            if(incomeFile != ''){
                incomeDocument = (List<FilesClass>)System.JSON.deserialize(incomeFile, List<FilesClass>.class);
                createContentVersion(incomeDocument, caseRecord.Id, 'IncomeProof');
            }
            RC.status = 'Success';
            RC.recordId = caseData.Id;
            //RC.accountId = caseData.Facility__c;
            if(caseData.Facility__c != null){
                RC.accountId = caseData.Facility__c;  
            }else{
                if(primaryAccountId != ''){
                	RC.accountId = primaryAccountId;	    
                }
            }
            if(caseData.Prescriber__c != null){
                RC.prescriberId = caseData.Prescriber__c;
            }else{
                if(primaryPrescriberId != ''){
                	RC.prescriberId = primaryPrescriberId;	    
                }else{
                	RC.prescriberId = usr.ContactId;    
                }
            }
            //RC.shipmentId = shipment.Id;
            RC.prescriptionId = caseData.Prescription1__c;
            RC.caseRecord = caseData;
        }catch(exception exp){
            RC.status = 'Error';
            RC.message = exp.getMessage(); 
        }   
        return RC;                                            
        
    }
    
    public static void createContentVersion(List<FilesClass> filesList, String caseId, String fileType){
        List<ContentVersion> cvList = new List<ContentVersion>();
        for(FilesClass fc : filesList){
            ContentVersion cv = new ContentVersion();
            cv.Title = fc.fileName;
            cv.PathOnClient = fc.fileName;
            cv.VersionData = EncodingUtil.base64Decode(fc.fileContent);
            cv.Origin = 'H';
            cv.FirstPublishLocationId = caseId;
            cv.Document_Type__c = fc.fileType; 
            cvList.add(cv);
        }
        if(cvList.size() > 0){
            insert cvList; 
            system.debug('cvList -------> '+cvList);
        } 
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<Object,List<String>> getDependentPicklistValues(String selectedObject, string selectedField){
        Map<Object,List<String>> dependentPicklistValues = new Map<Object,List<String>>();
        //Get dependent field result
        DescribeSObjectResult objResult = Schema.getGlobalDescribe().get(selectedObject).getDescribe();
        // Get the field dynamically
        DescribeFieldResult fieldResult = objResult.fields.getMap().get(selectedField).getDescribe();
        //Get dependent field controlling field 
        Schema.sObjectField controllerField = fieldResult.getController();
        //Check controlling field is not null
        if(controllerField == null){
            return null;
        } 
        //Get controlling field result
        Schema.DescribeFieldResult controllerFieldResult = controllerField.getDescribe();
        //Get controlling field picklist values if controlling field is not a checkbox
        List<Schema.PicklistEntry> controllerValues = (controllerFieldResult.getType() == Schema.DisplayType.Boolean ? null : controllerFieldResult.getPicklistValues());
         
        //It is used to decode the characters of the validFor fields. 
        String base64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
         
        for (Schema.PicklistEntry entry : fieldResult.getPicklistValues()){
            if (entry.isActive()){
            //The PicklistEntry is serialized and deserialized using the Apex JSON class and it will check to have a 'validFor' field
                List<String> base64chars = String.valueOf(((Map<String,Object>)JSON.deserializeUntyped(JSON.serialize(entry))).get('validFor')).split('');
                for (Integer i = 0; i < controllerValues.size(); i++){
                    Object controllerValue = (controllerValues == null ? (Object) (i == 1) : (Object) (controllerValues[i].isActive() ? controllerValues[i].getLabel() : null));
                    Integer bitIndex = i / 6;
                    Integer bitShift = 5 - Math.mod(i, 6 );
                    if(controllerValue == null || (base64map.indexOf(base64chars[bitIndex]) & (1 << bitShift)) == 0){
                        continue;
                    } 
                    if (!dependentPicklistValues.containsKey(controllerValue)){
                        dependentPicklistValues.put(controllerValue, new List<String>());
                    }
                    dependentPicklistValues.get(controllerValue).add(entry.getLabel());
                }
            }
        }
        return dependentPicklistValues;
    }

    
    @AuraEnabled
    public static ResponseClass createStepThreeData(Case caseRecord, Prescription__c prescriptionRecord, Contact prescriberRecord, Account accountRecord, Shipment__c shipmentRecord, String actionType, String step){
        ResponseClass RC = new ResponseClass();
        try{
            RecordType providerRecordType = [SELECT Id, Name FROM RecordType WHERE DeveloperName='Provider' AND sObjectType='Contact'];
            RecordType facilityRecordType = [SELECT Id, Name FROM RecordType WHERE DeveloperName='Facility' AND sObjectType='Account'];
            //prescriptionRecord.Case__c = caseRecord.Id;
            upsert prescriptionRecord;
            prescriberRecord.RecordTypeId = providerRecordType.Id;
            if(prescriberRecord.ID!=null)
            UpdatePrescriberController.upsertPrescriber(prescriberRecord);
            else upsert prescriberRecord;
            accountRecord.RecordTypeId = facilityRecordType.Id;
            //UpdatePrescriberController.upsertPrescriber(prescriberRecord);
            upsert accountRecord;
            system.debug('case Id ------> '+caseRecord.Id);
            /*if(shipmentRecord.Id == null){
                shipmentRecord.Case__c = caseRecord.Id;    
            }
            upsert shipmentRecord;*/
            caseRecord.Prescriber__c = prescriberRecord.Id;
            CaseRecord.Facility__c = accountRecord.Id;
            CaseRecord.Prescription1__c = prescriptionRecord.Id;
            if(actionType == 'Save and Complete Later'){
                caseRecord.Saved_Location__c = step;
                caseRecord.Enrollment_Status__c = 'Saved to Complete Later';
            }else if(actionType == 'next'){
                caseRecord.Saved_Location__c = step; 
                caseRecord.Enrollment_Status__c = 'Saved to Complete Later';
            }
            caseRecord.User_Type__c = 'Prescriber';
            update caseRecord;
            RC.status = 'Success';
            RC.accountId = accountRecord.Id;
            RC.prescriberId = prescriberRecord.Id;
            //RC.shipmentId = shipmentRecord.Id;
            RC.prescriptionId = prescriptionRecord.Id;
        }catch(Exception exp){
            RC.status = 'Error';
            RC.message = exp.getMessage();
        }
        return RC;
    }
    
    @AuraEnabled
    public static ResponseClass updateCaseAndPrescriptions(Case caseRecord, Contact patientRecord, Prescription__c prescriptionRecord, String attachments, String actionType, String step){
        ResponseClass RC = new ResponseClass();
        try{
            if(actionType == 'Save and Complete Later'){
                caseRecord.Saved_Location__c = step;
                caseRecord.Enrollment_Status__c = 'Saved to Complete Later';
            }else if(actionType == 'next'){
                caseRecord.Saved_Location__c = step;  
                caseRecord.Enrollment_Status__c = 'Saved to Complete Later';
            }
            caseRecord.User_Type__c = 'Prescriber';
            update caseRecord;
            update patientRecord;
            update prescriptionRecord; 
            List<FilesClass> files = new List<FilesClass>();
            if(attachments != ''){
                files = (List<FilesClass>)System.JSON.deserialize(attachments, List<FilesClass>.class);
                createContentVersion(files, caseRecord.Id, '');    
            }
            RC.status = 'Success';
        }catch(exception exp){
            RC.status = 'Error';
            RC.message = exp.getMessage();
        }
        return RC;
    }
    
    @AuraEnabled
    public static ResponseClass updateVitamins(Case caseRecord, String actionType, String step){
        ResponseClass RC = new ResponseClass();
        try{
            if(actionType == 'Save and Complete Later'){
                caseRecord.Saved_Location__c = step;
                caseRecord.Enrollment_Status__c = 'Saved to Complete Later';
            }else if(actionType == 'next'){
                caseRecord.Saved_Location__c = step;  
                caseRecord.Enrollment_Status__c = 'Saved to Complete Later';
            }
            update caseRecord;
            RC.status = 'Success';
        }catch(exception exp){
            RC.status = 'Error';
            RC.message = exp.getMessage();
        }
        return RC;
    }
    
    @auraEnabled
    public static string deleteFile(String documentId){
        List<ContentDocument> contentDocList= [SELECT Id,Title,FileType,ContentSize,Description FROM ContentDocument WHERE Id =: documentId];  
        system.debug('contentDocList --------> '+contentDocList);
        delete contentDocList;
        return 'Success';  
    }
    
    @AuraEnabled
    public static ResponseClass submitApplication(String caseId){
        ResponseClass RC = new ResponseClass();
        try{
        	Case cs = [SELECT Id, Status, Enrollment_Status__c FROM Case WHERE Id =: caseId];
            cs.Status = 'Pending';
            cs.Enrollment_Status__c = 'Pending';
            cs.User_Type__c = 'Prescriber';
            update cs;
            insertPDF(cs.Id);
            RC.status = 'Success';
        }catch(Exception exp){
        	RC.status = 'Error';
            RC.message = exp.getMessage();
        }
    	return RC;   
    }
    @future(callout=true)
    public static void insertPDF(Id caseId){
        try{
            Case caseRecord =[SELECT ID,Product__c,User_Type__c from Case where id =:caseId];
            string networkQuery ='select id,name from Network where Name like '+'\'%'+caseRecord.User_Type__c+'%\'';
            Network networkRec=database.query(networkQuery);
            // Coversheet
        	PageReference ref = Page.efaxcoversheet;   
            ref.getParameters().put('id',caseId);
            ContentVersion cont = new ContentVersion();
            cont.Title = 'Coversheet';
            cont.PathOnClient = 'CoverSheet.pdf';
            if(!Test.isRunningTest()){
            	cont.VersionData = ref.getContentAsPdf();    
            }else{
            	cont.VersionData = blob.valueOf('Test');    
            }            
            cont.Document_Type__c='Coversheet';
            cont.Sort_Order__c = 1;
            cont.NetworkId =networkRec.ID;
            insert cont; 
            ContentDocumentLink cdl = new ContentDocumentLink(); 
            cdl.ContentDocumentId = [select ContentDocumentId,Id from ContentVersion where  Id =:cont.Id].ContentDocumentId;
            cdl.LinkedEntityId = caseId;
            cdl.ShareType ='I';
            cdl.Visibility ='AllUsers';
            insert cdl;
            // application form
            
            PageReference refEnrollmentForm;
            if(caseRecord.Product__c == 'ABILIFY MAINTENA' || caseRecord.Product__c=='REXULTI')
            refEnrollmentForm = Page.OPAF_Neuroscience_Enrollment_FormTrim;
            else refEnrollmentForm = Page.OPAFNephrologyApplicationFormTrim;   
            refEnrollmentForm.getParameters().put('id',caseId);
            ContentVersion contApp = new ContentVersion();
            contApp.Title = 'Enrollment Form';
            contApp.PathOnClient = 'Enrollment Form.pdf';
            if(!Test.isRunningTest()){
            	contApp.VersionData = refEnrollmentForm.getContentAsPdf();    
            }else{
            	contApp.VersionData = blob.valueOf('Test');    
            }
            contApp.Document_Type__c='Enrollment Form';
            contApp.Sort_Order__c = 2;
            contApp.NetworkId = networkRec.ID;
            insert contApp; 
            ContentDocumentLink cdl1 = new ContentDocumentLink(); 
            cdl1.ContentDocumentId = [select ContentDocumentId,Id from ContentVersion where  Id =:contApp.Id].ContentDocumentId;
            cdl1.LinkedEntityId = caseId;
            cdl1.ShareType ='I';
            cdl1.Visibility ='AllUsers';
            insert cdl1;
            // Convert IMAGE To PDF
            List<contentdocumentlink> cdlList = [select Id,ContentDocument.LatestPublishedVersionId, ContentDocument.Title,ContentDocument.LatestPublishedVersion.Document_Type__c from contentdocumentlink where LinkedEntityId =:caseId and ContentDocument.LatestPublishedVersion.FileType!='PDF' order by ContentDocument.LatestPublishedVersion.Sort_Order__c asc nulls last];
            for(contentdocumentlink cdl2:cdlList){
            	ConvertImageToPDFController.createImage(cdl2,caseId,networkRec.ID);
            }
            sendAllDocument(caseId);    
        }catch(exception exp){
            
        }
         
    }
    @AuraEnabled
    public static void sendAllDocument(String caseId){
    	Case cs = [SELECT Id, Patient__c,User_Type__c,Product__c,Patient__r.FirstName,Patient__r.LastName FROM Case WHERE Id =: caseId];
        Id consentId;
        for(Consent__c consent:[select id,Patient__c,Contact_Record__c from Consent__c where Patient__c=:cs.Patient__c or Contact_Record__c =:cs.Patient__c order by createddate desc limit 1]){
            consentId = consent.Id;        
        }
        List<contentdocumentlink> cdlList = [select Id,ContentDocument.LatestPublishedVersionId, ContentDocument.Title,ContentDocument.LatestPublishedVersion.Document_Type__c from contentdocumentlink where LinkedEntityId =:caseId and ContentDocument.LatestPublishedVersion.FileType='PDF' order by ContentDocument.LatestPublishedVersion.Sort_Order__c asc nulls last];
        List<efaxapp__Sent_Fax__c> faxList = new List<efaxapp__Sent_Fax__c>();
        map<Integer, efaxapp__Sent_Fax__c> mapFax = new map<Integer, efaxapp__Sent_Fax__c>();
        Id PatientConsentId;
        if(consentId!=null){
            System.debug('>>>'+cs.Patient__c +''+consentId);
            List<contentdocumentlink> consentCdlList = [select Id,ContentDocument.LatestPublishedVersionId, ContentDocument.Title,ContentDocument.LatestPublishedVersion.Document_Type__c,ContentDocument.CreatedDate from contentdocumentlink where (LinkedEntityId =:consentId OR LinkedEntityId =:cs.Patient__c) and ContentDocument.Title like '%ConsentForm%' Order by ContentDocument.CreatedDate desc limit 1];
            if(consentCdlList.size()>0)
                PatientConsentId = consentCdlList[0].ContentDocument.LatestPublishedVersionId;
        }
        Boolean isNewFax = true;
        Integer Counter = 0;
        Id CoversheetId;
        Id EnrollmentId;
        
        for(contentdocumentlink cdl:cdlList){
            if(cdl.ContentDocument.LatestPublishedVersion.Document_Type__c =='Coversheet')
        	CoversheetId = cdl.ContentDocument.LatestPublishedVersionId;
            if(cdl.ContentDocument.LatestPublishedVersion.Document_Type__c =='Enrollment Form')
            EnrollmentId =cdl.ContentDocument.LatestPublishedVersionId;
        }
        Integer incrementTime = 0;
        for(contentdocumentlink cdl:cdlList){
            efaxapp__Sent_Fax__c fax;
            if(isNewFax){
                isNewFax = false;
                fax = new efaxapp__Sent_Fax__c();
                fax.efaxapp__Send_Date__c = Datetime.now().addMinutes(incrementTime);
                incrementTime =incrementTime +5;
                Counter = Counter + 1;
                fax.efaxapp__Attachment_ID__c = CoversheetId;                             
                fax.efaxapp__Attachment_ID2__c = EnrollmentId;
                
                
                if(Counter==1){
                 if(PatientConsentId!=null)
                    fax.efaxapp__Attachment_ID3__c = PatientConsentId;   
                }
                if(mapFax==null) mapFax.put(1,fax);
                else 
                mapFax.put(mapFax.size()+1,fax);
            }
            else{
                fax =  mapFax.get(Counter);
            }
			if(cdl.ContentDocument.LatestPublishedVersion.Document_Type__c =='Coversheet')
            	Continue;
            if(cdl.ContentDocument.LatestPublishedVersion.Document_Type__c =='Enrollment Form')
            	Continue;
            if(fax.efaxapp__Attachment_ID__c== null) 
                fax.efaxapp__Attachment_ID__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID2__c== null)
                fax.efaxapp__Attachment_ID2__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID3__c== null)
                fax.efaxapp__Attachment_ID3__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID4__c== null)
                fax.efaxapp__Attachment_ID4__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID5__c== null)
                fax.efaxapp__Attachment_ID5__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID6__c== null)
                fax.efaxapp__Attachment_ID6__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID7__c== null)
                fax.efaxapp__Attachment_ID7__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID8__c== null)
                fax.efaxapp__Attachment_ID8__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID9__c== null)
                fax.efaxapp__Attachment_ID9__c = cdl.ContentDocument.LatestPublishedVersionId;
            else if(fax.efaxapp__Attachment_ID10__c== null){
                fax.efaxapp__Attachment_ID10__c = cdl.ContentDocument.LatestPublishedVersionId;
                isNewFax = true;
            }
        }
        for(efaxapp__Sent_Fax__c faxRec: mapFax.values()){
            faxRec.efaxapp__Fax_Number__c = System.Label.EFax_Application_Send_To;//'8558762627' // recipient number – mandatory
            faxRec.efaxapp__Subject__c = cs.User_Type__c+'App-'+cs.Product__c+'-'+cs.Patient__r.FirstName+cs.Patient__r.LastName;  // any text, mandatory
            //faxRec.efaxapp__Send_Date__c = Datetime.now(); // mandatory,
            faxRec.efaxapp__Status__c = 'Sending'; // mandatory
            faxRec.efaxapp__Sent_With_Outbound_Message__c = True; // mandatory
            faxRec.efaxapp__Org_Fax_Number__c = System.label.EFax_From; // org fax number from which to send, mandatory
            System.debug('>>>'+faxRec);
            if(faxRec.efaxapp__Attachment_ID2__c!=null)
            faxList.add(faxRec);
        }
        if(faxList.size()>0)
        insert faxList;
    }
        
    @auraEnabled(cacheable=true)
        public Static contact getCurrentUserContact(){
        user userDetails = [select id,name,ContactId from user where Id =: userInfo.getUserId()];
        contact contactDetail = [select Id,FirstName,LastName,Email,Birthdate,
                                 MailingStreet,Mailing_Address_Line_2__c,HealthCloudGA__Gender__c,
                                 MailingCity,SSN__c,Zip_Code__c,MailingState,HomePhone
                                 from contact where Id =: userDetails.ContactId];
        return contactDetail;
    }
    
    @AuraEnabled
    public static Consent__c getConsentDetails(String patientId){
    	List<Consent__c> consentDetails = [SELECT Id, Status__c FROM Consent__c WHERE Patient__c =:patientId ORDER BY LastModifiedDate DESC LIMIT 1];
        if(consentDetails.size() > 0){
         	return consentDetails[0];   
        }else{
        	return null;    
        }
    }
    
    @AuraEnabled
    public static void submitDocuments(String caseId, DateTime submittedDate){
        system.debug('submittedDate ------> '+submittedDate);
    	Case cs = [SELECT Id, Rx_Fax_Timestamp__c,CaseNumber FROM Case WHERE Id =: caseId]; 
		Datetime nowInLondonTime = convertToTimeZone(submittedDate, 'America/New_York');
        cs.Rx_Fax_Timestamp__c = nowInLondonTime;
        update cs;
        //Sending efax
        List<efaxapp__Sent_Fax__c> sendfax = new List<efaxapp__Sent_Fax__c>();
        List<contentdocumentlink> cdlList = [select Id,ContentDocument.LatestPublishedVersionId, ContentDocument.Title,ContentDocument.LatestPublishedVersion.Document_Type__c from contentdocumentlink where LinkedEntityId =:caseId and ContentDocument.LatestPublishedVersion.Document_Type__c like '%RxDocument' order by SystemModstamp desc limit 1];
        for(contentdocumentlink cdl:cdlList){
                efaxapp__Sent_Fax__c fax = new efaxapp__Sent_Fax__c(efaxapp__Fax_Number__c = System.label.EFax_Rx_Send_To,//'8558762627' // recipient number – mandatory
                efaxapp__Subject__c = 'Prescription Form - '+cs.CaseNumber,  // any text, mandatory
                efaxapp__Send_Date__c = Datetime.now(), // mandatory,
                efaxapp__Attachment_ID__c = cdl.ContentDocument.LatestPublishedVersionId, // attachment id to send, mandatory
                efaxapp__Status__c = 'Sending', // mandatory
                efaxapp__Sent_With_Outbound_Message__c = True, // mandatory
                efaxapp__Org_Fax_Number__c = System.label.EFax_From // org fax number from which to send, mandatory
                //efaxapp__Barcode_Position_Top__c = '30', // barcode options, can be passed
                //efaxapp__Barcode_Position_Left__c = '30',
                //efaxapp__Barcode_Size_Width__c = '30';
                );
                sendfax.add(fax);

        }
        if(sendfax.size()>0){
            Database.insert(sendfax,false);
        }
    }
    
    public static DateTime convertToTimeZone(Datetime dt, String locale){
    	Integer msPerHour = 1000 * 60 * 60;
        return dt.addHours(
            TimeZone.getTimeZone(locale).getOffset(dt) / msPerHour
        );    
    }
    
    @auraEnabled 
    public Static string updateContact(string prescriberDetails, string consentType){                
        List<Consent__c> consentDetails = [select id,Type__c,Consent_Type__c,Contact_Record__c from Consent__c where Contact_Record__c =:prescriberDetails];
        
        Consent__c newConsent = new Consent__c();
        newConsent.Contact_Record__c = prescriberDetails;
        newConsent.Method__c = consentType;
        if(!consentDetails.isEmpty()){
            newConsent.Id = consentDetails[0].Id; 
            newConsent.Consent_Type__c = 'Re-Enrollment';
        } else {
            newConsent.Consent_Type__c = 'New Consent';
        }
        
        upsert newConsent;
        
        return 'success';
    }
    
    @AuraEnabled
    public static Case updateCase(String caseId, String envelopeId, String status){
    	Case cs = [SELECT Id, Consent_Status__c, EnvelopeId__c, Patient__c, Facility__c, Prescriber__c, Prescription1__c FROM Case WHERE Id =: caseId]; 
        cs.Consent_Status__c = status;
        cs.EnvelopeId__c = envelopeId;
        
        if(envelopeId != ''){
        	String base64String = DS_OPAFController.getSignedDocument(envelopeId);
            ContentVersion cv = new ContentVersion();
            cv.Title = 'PrescriberConsentForm.pdf';
            cv.PathOnClient = 'PrescriberConsentForm.pdf';
            cv.VersionData = EncodingUtil.base64Decode(base64String);
            cv.Origin = 'H';
            cv.FirstPublishLocationId = caseId;
            cv.Document_Type__c = 'PrescriberConsentForm';
            insert cv;
        }
        update cs;
        return cs;
    }
    
    public class PickListValues {
        @auraEnabled
        public String label;
        @auraEnabled
        public String value;
    }
    
    public class ResponseClass{
        @AuraEnabled public String status;
        @AuraEnabled public String message;
        @AuraEnabled public Case caseRecord;
        @AuraEnabled public Contact contactRecord;
        @AuraEnabled public String recordId; 
        @AuraEnabled public String patientId; 
        @AuraEnabled public String accountId; 
        @AuraEnabled public String prescriberId; 
        @AuraEnabled public String shipmentId; 
        @AuraEnabled public String prescriptionId; 
        @AuraEnabled public Boolean isInitial;
    }
    
    public class FilesClass{
        public String fileName;
        public String fileContent;
        public String fileType;
        public String fileExtension;
    }
}