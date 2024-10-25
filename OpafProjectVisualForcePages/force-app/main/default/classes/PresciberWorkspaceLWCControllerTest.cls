@isTest
public with sharing class PresciberWorkspaceLWCControllerTest {
	@testSetup
    static void commonSetup() { 
        Id RecordTypeIdAccount = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Facility').getRecordTypeId();
        Id PatientRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Individual').getRecordTypeId();
        Id PrescriberRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Provider').getRecordTypeId();
        Account accountRecord = new Account(Name = 'Test Account',
                                 	RecordTypeId = RecordTypeIdAccount
                                 	);
        insert accountRecord;
        
        Contact patientRecord = new Contact(FirstName = 'Test',
                                            LastName = 'Patient',
                                            RecordTypeId = PatientRecordTypeId,
                                           	Email = 'test@test.com',
                                           	Birthdate = system.today().addYears(-20),
                                           	SSN__c = '123456789',
                                           	HomePhone = '12345678890',
                                           	HealthCloudGA__Gender__c = 'Male',
                                           	Gender__c = 'Male',
                                           	Street_Address__c = 'Test Street',
                                           	Address_Line_2__c = 'Test',
                                           	City__c = 'Tulsa',
                                           	State__c = 'OK',
                                           	Zip_Code__c = '12345');
        insert patientRecord;
        
        Contact prescriberRecord = new Contact(FirstName = 'Test',
                                 	LastName = 'Prescriber',
                                 	RecordTypeId = PrescriberRecordTypeId);
        insert prescriberRecord;
        
        Prescription__c prescriptionRecord = new Prescription__c(Name = 'Test Prescription',
                                                                	Quantity__c = '4',
                                                                	Number_of_Refills__c = '4',
                                                                	Dosage__c = '300 mg');
        insert prescriptionRecord;
        
        Case caseRecord = new Case(Patient__c = patientRecord.Id,
                                  	Facility__c = accountRecord.Id,
                                  	Prescriber__c = prescriberRecord.Id,
                                  	Prescription1__c = prescriptionRecord.Id,
                                  	Enrollment_Status__c = 'Saved to Complete Later',
                                  	Product__c = 'ABILIFY MAINTENA',
                                  	User_Type__c = 'Prescriber',
                                  	Same_ICD_10__c = false,
                                  	Patient_with_Same_Provider__c = false);
        insert caseRecord; 
        
        Consent__c consentRecord = new Consent__c(Consent_Type__c = 'New Consent', 
                                                 	Contact_Record__c = patientRecord.Id,
                                                 	Patient__c = patientRecord.Id,
                                                    Provider__C = prescriberRecord.Id);
        insert consentRecord;
        
        ContentVersion contentVersionRecord = new ContentVersion(Title = 'Test Doc',
                                                                	PathOnClient='/Test Doc.pdf',
                                                                	VersionData = blob.valueOf('Test'),
                                                                	origin = 'H',
                                                                	FirstPublishLocationId = caseRecord.Id,
                                                                	Document_Type__c = 'RxDocument');
        insert contentVersionRecord;
        
        efaxapp__Sent_Fax__c faxRecord = new efaxapp__Sent_Fax__c(efaxapp__Account__c = accountRecord.Id,
                                                                 	efaxapp__Attachment_ID__c = contentVersionRecord.Id,
                                                                 	efaxapp__Fax_Number__c = '18005519391',
                                                                 	efaxapp__Send_Date__c = system.today(),
                                                                 	efaxapp__Subject__c = 'Prescription Form EFax');
        insert faxRecord;
    } 
    
    @isTest static void testIfMethods(){  
        Account accounts = [SELECT Id, RecordTypeId FROM Account LIMIT 1];
        Contact patient = [SELECT Id, 
                                      			FirstName,
                                      			LastName,
                                      			Email,
                                      			Birthdate,
                                      			SSN__c,
                                      			HomePhone,
                                      			HealthCloudGA__Gender__c,
                                      			Street_Address__c,
                                      			Address_Line_2__c,
                                      			City__c,
                                      			State__c,
                                      			Zip_Code__c
                                      			FROM Contact LIMIT 1];
        Contact prescriber = [SELECT Id, RecordTypeId FROM Contact LIMIT 1];
        Prescription__c prescroption = [SELECT Id FROM Prescription__c LIMIT 1];
        Case cs = [SELECT Id,
                                		Prescriber__c,
                                		Facility__c,
                                		Prescription1__c,
                                		User_Type__c,
                   						Same_ICD_10__c,
                   						Patient_with_Same_Provider__c
                   						FROM Case LIMIT 1];
        Consent__c consent = [SELECT Id, Consent_Type__c FROM Consent__c LIMIT 1];
        ContentVersion cv = [SELECT Id, ContentDocumentId FROM ContentVersion LIMIT 1];
        List<String> contentDocumentIds = new List<String>();
        contentDocumentIds.add(cv.ContentDocumentId);
        
        String pharmacyCardFile = '[{"fileName": "Test Doc.pdf", "fileContent": "Test", "fileType": "PHARMACY CARD", "fileExtension": "pdf"}]';
        String medicardFile = '[{"fileName": "Test Doc.pdf", "fileContent": "Test", "fileType": "MEDICAL CARD", "fileExtension": "pdf"}]';
        String residentialFile = '[{"fileName": "Test Doc.pdf", "fileContent": "Test", "fileType": "RESIDENTIAL DOCUMENT", "fileExtension": "pdf"}]';
        String insuranceFile = '[{"fileName": "Test Doc.pdf", "fileContent": "Test", "fileType": "INSURANCE DOCUMENT", "fileExtension": "pdf"}]';
        String incomeFile = '[{"fileName": "Test Doc.pdf", "fileContent": "Test", "fileType": "INCOME DOCUMENT", "fileExtension": "pdf"}]';
        
        Test.startTest();
        UpdatePrescriberController.upsertPrescriber(prescriber);
        PresciberWorkspaceLWCController.getApplications();
        PresciberWorkspaceLWCController.inCommunity();
        PresciberWorkspaceLWCController.getCurrentUserDetails();
        PresciberWorkspaceLWCController.getPrimaryContact();
        PresciberWorkspaceLWCController.getPrimaryAccount();
        PresciberWorkspaceLWCController.getContactDetails(patient.Id);
        PresciberWorkspaceLWCController.getCaseData(cs.Id);
        PresciberWorkspaceLWCController.getUploadedFiles(cs.Id);
        PresciberWorkspaceLWCController.getFiles(contentDocumentIds, '');
        PresciberWorkspaceLWCController.getAccountData(accounts.Id);
        PresciberWorkspaceLWCController.getPrescriptionData(prescroption.Id);
        PresciberWorkspaceLWCController.updateContact(patient);
        PresciberWorkspaceLWCController.createCase(patient, cs.Id, 'Save and Complete Later', 'Prescriber Application Step One', '');
        PresciberWorkspaceLWCController.cloneCase(patient, cs, 'Save and Complete Later', 'Prescriber Application Step One','',cs.Id);
        PresciberWorkspaceLWCController.getAllProductValues();
        PresciberWorkspaceLWCController.fetchPickListValue(cs, 'Product__c');
        PresciberWorkspaceLWCController.updateCaseDetails(cs, 'Save and Complete Later', 'Prescriber Appication Step Two', pharmacyCardFile, medicardFile, residentialFile, insuranceFile, incomeFile);
        PresciberWorkspaceLWCController.getDependentPicklistValues('Case', 'ICD_10_Diagnosis_Code__c');
        PresciberWorkspaceLWCController.createStepThreeData(cs, prescroption, prescriber, accounts, null, 'Save and Complete Later', 'Prescriber Application Step Three');
        PresciberWorkspaceLWCController.updateCaseAndPrescriptions(cs, patient, prescroption, pharmacyCardFile, 'Save and Complete Later', 'Prescriber Application Step Four');
        PresciberWorkspaceLWCController.submitApplication(cs.Id);
        PresciberWorkspaceLWCController.insertPDF(cs.Id);
        PresciberWorkspaceLWCController.sendAllDocument(cs.Id);
        PresciberWorkspaceLWCController.deleteFile(cv.ContentDocumentId);
        PresciberWorkspaceLWCController.FilesClass files = new PresciberWorkspaceLWCController.FilesClass();
        files.fileName = 'Test Doc';
        files.fileContent = 'Test';
        files.fileType = 'PHARMACY CARD';
        files.fileExtension = '';
        List<PresciberWorkspaceLWCController.FilesClass> filesList = new List<PresciberWorkspaceLWCController.FilesClass>();
        filesList.add(files);
        PresciberWorkspaceLWCController.createContentVersion(filesList, cs.Id, 'PHARMACY CARD'); 
        PresciberWorkspaceLWCController.getConsentDetails(patient.Id);
        PresciberWorkspaceLWCController.submitDocuments(cs.Id, system.now());
        PresciberWorkspaceLWCController.updateContact(patient.Id, 'Onsite');
        Test.stopTest();  
    }
    
    testmethod static void testElseMethods(){  
        Shipment__c shipment = new Shipment__c();
        List<Account> accountsList = [SELECT Id, RecordTypeId FROM Account LIMIT 1];
        List<Contact> patientsList = [SELECT Id, 
                                      			FirstName,
                                      			LastName,
                                      			Email,
                                      			Birthdate,
                                      			//SSN__c,
                                      			HomePhone,
                                      			HealthCloudGA__Gender__c,
                                      			Street_Address__c,
                                      			Address_Line_2__c,
                                      			City__c,
                                      			State__c,
                                      			Zip_Code__c
                                      			FROM Contact LIMIT 1];
        List<Contact> prescribersList = [SELECT Id, RecordTypeId FROM Contact LIMIT 1];
        List<Prescription__c> prescroptionsList = [SELECT Id FROM Prescription__c LIMIT 1];
        List<Case> casesList = [SELECT Id,
                                		Prescriber__c,
                                		Facility__c,
                                		Prescription1__c,
                                		User_Type__c FROM Case LIMIT 1];
        List<Consent__c> consentsList = [SELECT Id, Consent_Type__c FROM Consent__c LIMIT 1];
        List<ContentVersion> contentVersions = [SELECT Id, ContentDocumentId FROM ContentVersion LIMIT 1];
        List<String> contentDocumentIds = new List<String>();
        contentDocumentIds.add(contentVersions[0].ContentDocumentId);
        Id profileId = [select Id from Profile where Name='Customer Community Plus Login User Prescriber'].Id;
        User user = new User(alias = 'test123', email='test123@noemail.com',
                                emailencodingkey='UTF-8', lastname='Testing', languagelocalekey='en_US',
                                localesidkey='en_US', profileid = profileId, country='United States',IsActive =true,
                                ContactId = prescribersList[0].Id,
                                timezonesidkey='America/Los_Angeles', username='tester@noemail.com');
                                
        insert user;
        Test.startTest();
        PresciberWorkspaceLWCController.getApplications();
        PresciberWorkspaceLWCController.inCommunity();
        PresciberWorkspaceLWCController.getCurrentUserDetails();
        PresciberWorkspaceLWCController.getPrimaryContact();
        PresciberWorkspaceLWCController.getPrimaryAccount();
        PresciberWorkspaceLWCController.getContactDetails(patientsList[0].Id);
        PresciberWorkspaceLWCController.getCaseData(casesList[0].Id);
        PresciberWorkspaceLWCController.getUploadedFiles(casesList[0].Id);
        PresciberWorkspaceLWCController.getFiles(contentDocumentIds, '');
        PresciberWorkspaceLWCController.getAccountData(accountsList[0].Id);
        PresciberWorkspaceLWCController.getPrescriptionData(prescroptionsList[0].Id);
        PresciberWorkspaceLWCController.updateContact(patientsList[0]);
        PresciberWorkspaceLWCController.createCase(patientsList[0], casesList[0].Id, 'next', 'Prescriber Application Step Two', '');
        PresciberWorkspaceLWCController.cloneCase(patientsList[0], casesList[0], 'next', 'Prescriber Application Step Two', '',casesList[0].Id);
        PresciberWorkspaceLWCController.getAllProductValues();
        PresciberWorkspaceLWCController.fetchPickListValue(casesList[0], 'Product__c');
        PresciberWorkspaceLWCController.updateCaseDetails(casesList[0], 'next', 'Prescriber Application Step Three', '', '', '', '', '');
        PresciberWorkspaceLWCController.getDependentPicklistValues('Case', 'ICD_10_Diagnosis_Code__c');
        PresciberWorkspaceLWCController.createStepThreeData(casesList[0], prescroptionsList[0], prescribersList[0], accountsList[0], null, 'next', 'Prescriber Application Step Four');
        PresciberWorkspaceLWCController.updateCaseAndPrescriptions(casesList[0], patientsList[0], prescroptionsList[0], '', 'next', 'Prescriber Application Step Five');
        PresciberWorkspaceLWCController.submitApplication(casesList[0].Id);
        PresciberWorkspaceLWCController.insertPDF(casesList[0].Id);
        PresciberWorkspaceLWCController.sendAllDocument(casesList[0].Id);
        PresciberWorkspaceLWCController.deleteFile(contentVersions[0].ContentDocumentId);
        PresciberWorkspaceLWCController.FilesClass files = new PresciberWorkspaceLWCController.FilesClass();
        files.fileName = 'Test Doc';
        files.fileContent = 'Test';
        files.fileType = 'PHARMACY CARD';
        files.fileExtension = '';
        List<PresciberWorkspaceLWCController.FilesClass> filesList = new List<PresciberWorkspaceLWCController.FilesClass>();
        filesList.add(files);
        PresciberWorkspaceLWCController.createContentVersion(filesList, casesList[0].Id, 'PHARMACY CARD'); 
        PresciberWorkspaceLWCController.getConsentDetails(patientsList[0].Id);
        PresciberWorkspaceLWCController.submitDocuments(casesList[0].Id, system.now());
        PresciberWorkspaceLWCController.updateContact(patientsList[0].Id, 'Onsite');
        Test.stopTest();
    }
}