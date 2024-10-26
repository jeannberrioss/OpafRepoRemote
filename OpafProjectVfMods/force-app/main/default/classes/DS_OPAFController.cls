public class DS_OPAFController {
    
    private static DocuSign_API__c DSAPI = DocuSign_API__c.getOrgDefaults();
    
    Private static string integration_key = DSAPI.Integration_Key__c;
    Private static string account_id = DSAPI.Account_Id__c; 
    Private static string api_username = DSAPI.Api_Username__c; 
    Private static string api_password = DSAPI.Api_Password__c; 
    Private static string ds_server = DSAPI.DS_Server__c; 
    
    Private static string trace_value = 'SFDC_002_SOAP_embedded_signing'; // Used for tracing API calls
    Private static string trace_key = 'X-ray';
    
    
    public static void configure_sender(DocuSignTK.APIServiceSoap api_sender){
        api_sender.endpoint_x = ds_server;
        api_sender.inputHttpHeaders_x = new Map<String, String>();
        String api_username = DSAPI.Api_Username__c;
        String api_password = DSAPI.Api_Password__c;
        String auth =   '<DocuSignCredentials><Username>'+api_username+'</Username>' 
            + '<Password>'+api_password+'</Password>' 
            + '<IntegratorKey>' + integration_key + '</IntegratorKey></DocuSignCredentials>';
        
        api_sender.inputHttpHeaders_x.put('X-DocuSign-Authentication', auth);
        api_sender.inputHttpHeaders_x.put(trace_key, trace_value);
    }
    
    
    @auraEnabled
    public static string secondSigner(String envelopId, String signerOrder, String contactName, String email, String patientId, String returnComponent){
        DocuSignTK.APIServiceSoap api_sender = new DocuSignTK.APIServiceSoap();
        configure_sender(api_sender);
        String signer_view_url = '';
        
        if(String.isNotBlank(envelopId)){
            signer_view_url = embedded_signing(api_sender, envelopId, signerOrder, contactName, email, patientId, returnComponent);
        }
        
        return signer_view_url;
        
    }
    
    @auraEnabled 
    public static string sendPrescriberConsent(string caseId, string returnComponent){
        DocuSignTK.APIServiceSoap api_sender = new DocuSignTK.APIServiceSoap();
        configure_sender(api_sender);
        String signer_view_url = '';
        
        signer_view_url = send_patientenvelope_template(api_sender, caseId, returnComponent);
        
        return signer_view_url;
    }
    
    @auraEnabled 
    public static string sendPatientConsent(string patientId, string returnComponent){
        DocuSignTK.APIServiceSoap api_sender = new DocuSignTK.APIServiceSoap();
        configure_sender(api_sender);
        String signer_view_url = '';
        
        signer_view_url = send_patientenvelope_template(api_sender, patientId, returnComponent);
        
        return signer_view_url;
    }
    
    Public static String send_patientenvelope_template(DocuSignTK.APIServiceSoap api_sender, string patientId, string returnComponent){
        String recordId=patientId;
        if(returnComponent =='PrescriberApp' || returnComponent =='ReEnrollmentApp'){
            Case cs = [select id, Prescriber__c from Case where id=:recordId limit 1];
            recordId = cs.Prescriber__c;
        }
        //recordId = '00377000001PWCV';
        List<Contact> contactInfo = [SELECT Id, Name, 
                                     Email, 
                                     Birthdate, 
                                     Legal_Rep_First_Name__c, 
                                     Legal_Rep_Last_Name__c,
                                     Legal_Rep__c
                                     From 
                                     Contact 
                                     Where Id =: recordId];
        
        //= contactInfo[0].Consent__r[0].Id;
        
        String signerName = '';
        
        if(contactInfo[0].Legal_Rep__c){
            signerName = contactInfo[0].Legal_Rep_First_Name__c + ' ' + contactInfo[0].Legal_Rep_Last_Name__c;
        }
        else{
            signerName = contactInfo[0].Name;
        }
        
        //string legalRepName = contactInfo[0].Legal_Rep_First_Name__c + contactInfo[0].Legal_Rep_Last_Name__c;
        
        DocuSignTK.EnvelopeInformation envelopeInfo = new DocuSignTK.EnvelopeInformation();
        envelopeInfo.AccountId = account_id;
        envelopeInfo.EmailBlurb = 'Please sign the Consent';
        envelopeInfo.Subject = 'Please sign the Consent';
        
        
        // Create the template reference from a server-side template ID
        
        DocuSignTK.TemplateReference templateReference = new DocuSignTK.TemplateReference();
        
        String templateId;
        Map<String, Docusign_Template__mdt> mapEd = Docusign_Template__mdt.getAll();
        if(returnComponent == 'PrescriberApp'){
            templateId = '6d414212-cadb-41db-9498-934878c39371';
            templateId = mapEd.get('Prescriber_Consent_Embedded').Template_Id__c;
        }
        else if(returnComponent == 'ReEnrollmentApp'){
            templateId = '6d414212-cadb-41db-9498-934878c39371';
            templateId = mapEd.get('Prescriber_Consent_Embedded').Template_Id__c;
        }
        else If(contactInfo[0].Legal_Rep__c){
            templateId = '1fc119b4-2428-4039-b319-88aa1a57adb1';
            templateId = mapEd.get('Patient_Consent_Legal_Embedded').Template_Id__c;
        }
        else{
            templateId = '8e69f133-2304-42a0-82b8-2cc0a21600b9'; 
            templateId = mapEd.get('Patient_Consent_Embedded').Template_Id__c;
        }
        
        system.debug('the template id is' + templateId);
        
        templateReference.Template = templateId;
        templateReference.TemplateLocation = 'Server';
        
        
        templateReference.FieldData = new DocuSignTK.TemplateReferenceFieldData();
        templateReference.FieldData.DataValues = new DocuSignTK.ArrayOfTemplateReferenceFieldDataDataValue();
        
        DocuSignTK.ArrayOfTemplateReference tempRefrences = new DocuSignTK.ArrayOfTemplateReference();
        
        If(contactInfo[0].Legal_Rep__c){
            
            DocuSignTK.TemplateReferenceFieldDataDataValue LegalName = new DocuSignTK.TemplateReferenceFieldDataDataValue();
            LegalName.TabLabel = 'LeagalNameOCLegal';
            LegalName.Value = contactInfo[0].Legal_Rep_First_Name__c + ' ' + contactInfo[0].Legal_Rep_Last_Name__c;    
            
            
            DocuSignTK.TemplateReferenceFieldDataDataValue patientName = new DocuSignTK.TemplateReferenceFieldDataDataValue();
            patientName.TabLabel = 'PatientNameLegalOC';
            patientName.Value = contactInfo[0].Name;
            
            DocuSignTK.TemplateReferenceFieldDataDataValue patientDOB = new DocuSignTK.TemplateReferenceFieldDataDataValue();
            if(contactInfo[0].Birthdate!=null){
                patientDOB.TabLabel = 'PatientDOBLegalOC';
                patientDOB.Value = contactInfo[0].Birthdate.month() + '/' + contactInfo[0].Birthdate.day() + '/' + contactInfo[0].Birthdate.year();
            }
            
            templateReference.FieldData.DataValues.DataValue = new List<DocuSignTK.TemplateReferenceFieldDataDataValue>{patientName, patientDOB, LegalName	}; 
                tempRefrences.TemplateReference = new List<DocuSignTK.TemplateReference>{templateReference};
                    
                    
                    }
        
        else{
            
            DocuSignTK.TemplateReferenceFieldDataDataValue patientName = new DocuSignTK.TemplateReferenceFieldDataDataValue();
            patientName.TabLabel = 'PatientNameLegalOC';
            patientName.Value = contactInfo[0].Name;
            
            DocuSignTK.TemplateReferenceFieldDataDataValue patientDOB = new DocuSignTK.TemplateReferenceFieldDataDataValue();
            if(contactInfo[0].Birthdate!=null){
                patientDOB.TabLabel = 'PatientDOBLegalOC';
                patientDOB.Value = contactInfo[0].Birthdate.month() + '/' + contactInfo[0].Birthdate.day() + '/' + contactInfo[0].Birthdate.year();
            }
            templateReference.FieldData.DataValues.DataValue = new List<DocuSignTK.TemplateReferenceFieldDataDataValue>{patientName, patientDOB}; 
                tempRefrences.TemplateReference = new List<DocuSignTK.TemplateReference>{templateReference};
                    
                    }
        
        
        // Create the recipient information
        DocuSignTK.Recipient recipient = new DocuSignTK.Recipient();
        //contact legalContact =[Select Name, Id, Email from contact where id='0037d0000110x9nAAA' limit 1];            
        If(contactInfo[0].Legal_Rep__c){
            recipient.UserName = signerName;
            recipient.Type_x = 'Signer';
            recipient.RoleName = 'Signer 1';
            //recipient.Email = contactInfo[0].Email;
        }
        else{
            recipient.UserName = signerName;
            recipient.Type_x = 'Signer';
            recipient.RoleName = 'Signer 1';
            //recipient.Email = contactInfo[0].Email;
        }
        
        //recipient.RoleName = 'Signer 1';
        
        System.debug('the RoleName is' + recipient.RoleName);
        System.debug('the user name is' + recipient.UserName);
        
        recipient.Email = contactInfo[0].Email;
        recipient.ID = 1;
        recipient.RoutingOrder = 1;
        //recipient.status = '';
        
        // We want this signer to be "captive" so we can use embedded signing with him
        recipient.CaptiveInfo = new DocuSignTK.RecipientCaptiveInfo();
        recipient.CaptiveInfo.ClientUserID = '1'; // Must uniquely identify the 
        
        System.debug('the receipient info is ' + recipient.tostring());
        
        DocuSignTK.ArrayOfRecipient1 recipients = new DocuSignTK.ArrayOfRecipient1();
        recipients.Recipient = new List<DocuSignTK.Recipient> { recipient };
            
            DocuSignTK.EnvelopeStatus status = api_sender.CreateEnvelopeFromTemplates(tempRefrences, recipients, envelopeInfo, true);
        
        system.debug('the myEnvelope response is' + status);                                    
        
        
        System.debug('--status.EnvelopeID-- ' + status.EnvelopeID);
        System.debug('--status-- ' + status.RecipientStatuses);
        
        String signer_view_url = '';
        
        if(String.isNotBlank(status.EnvelopeID)){
            signer_view_url = embedded_signing(api_sender, status.EnvelopeID, recipient.CaptiveInfo.ClientUserID, signerName, contactInfo[0].Email, patientId, returnComponent);
        }
        
        System.debug('the signer_view_url is' + signer_view_url);
        
        return signer_view_url;
    }
    
    public static String getSignedDocument(String envelope_id){
        DocuSignTK.APIServiceSoap api_sender = new DocuSignTK.APIServiceSoap();
        configure_sender(api_sender);
        
        DocuSignTK.EnvelopePDF signedPDF = api_sender.RequestPDF(envelope_id);
        
        system.debug('the envelop id is' + signedPDF.EnvelopeID);
        
        system.debug('the envelop id is' + signedPDF.PDFBytes);
        return signedPDF.PDFBytes;
        
    }
    
    
    public static void getCertDocument(String envelope_id){
        DocuSignTK.APIServiceSoap api_sender = new DocuSignTK.APIServiceSoap();
        configure_sender(api_sender);
        
        DocuSignTK.EnvelopePDF signedPDF = api_sender.RequestPDFWithCert(envelope_id, false);
        
        system.debug('the envelop id is' + signedPDF.EnvelopeID);
        
        system.debug('the envelop id is' + signedPDF.PDFBytes);
        
    }
    
    @TestVisible
    Private static string embedded_signing(DocuSignTK.APIServiceSoap api_sender, String envelope_id, String signer_user_id, String signer_name, String signer_email, String patientId, string returnComponent) {
        // Obtains the embedded Signing Ceremony URL for an envelope's recipient (the signer).
        // To use embedded signing:
        // 1. The signer must have been added to the envelope as a "captive signer"
        // 2. You need the following values:
        //    1. EnvelopeID
        //    2. Signer's Email that was provided when the signer was added to the envelope.
        //    3. Signer's name (UserName field)
        //    4. The Signer's User ID (client id) within your app. Must uniquely identify the signer. 
        // 3. You also need to create an "Assertion" object where you provide information on how
        //    your app authenticated the signer. This information is stored by DocuSign so you can
        //    later use the data in case of a dispute.
        
        // Incoming variables used:
        // envelope_id, signer_user_id, signer_email, signer_name
        
        // Maintaining state: when DocuSign redirects back to your app after the signing ceremony
        // ended, how does your app know what is going on? You can include additional query parameters
        // in the signer_return_url that you supply. Eg the recipient ID, envelope ID, etc.
        // You can include your app's sessionID. You can use the cookie system to store either
        // specific information or your stack's session id for your app.
        
        System.debug('*******envolpe*****'+envelope_id);
        // Step 1. Create the assertion
        DocuSignTK.RequestRecipientTokenAuthenticationAssertion assertion = new DocuSignTK.RequestRecipientTokenAuthenticationAssertion();
        assertion.AssertionID = '1'; // A unique identifier of the authentication 
        // event executed by your application.
        assertion.AuthenticationInstant = Datetime.now(); // The date/time that the end-user was authenticated.
        assertion.AuthenticationMethod = 'Password';      // How did your app authenticate the signer?
        // Options: Password, Email, PaperDocuments, HTTPBasicAuth, SSLMutualAuth, X509Certificate, Kerberos, 
        // SingleSignOn_CASiteminder, SingleSignOn_InfoCard, SingleSignOn_MicrosoftActiveDirectory, SingleSignOn_Passport, 
        // SingleSignOn_SAML, SingleSignOn_Other, Smartcard, RSASecureID, Biometric, None, KnowledgeBasedAuth
        assertion.SecurityDomain = 'DSCalloutHelper'; // The "domain" (app, sso system, etc) 
        // to which the user authenticated
        
        // Step 2. Create the redirect URLs for the different outcomes of the Signing Ceremony
        DocuSignTK.RequestRecipientTokenClientURLs urls = new DocuSignTK.RequestRecipientTokenClientURLs();
        //String return_url_base = signer_return_url;
        
        String return_url_base;
        if (returnComponent == 'Patient') { 
            return_url_base = System.label.Patient_URL+'/s/my-workspace?checkDocu=true&envelopeId=' + envelope_id;
        } 
        else if (returnComponent == 'Prescriber') {
            return_url_base = System.label.Prescriber_URL+'/s/patientconsent?patientId=' + patientId + '&envelopeId=' + envelope_id;
        }
        else if (returnComponent == 'PrescriberApp') {
            return_url_base = System.label.Prescriber_URL+'/s/prescriberapplication?caseId=' + patientId +'&envelopeId=' + envelope_id;
        }else if (returnComponent == 'ReEnrollmentApp') {
            return_url_base = System.label.Prescriber_URL+'/s/re-enrollment-application?caseId=' + patientId +'&envelopeId=' + envelope_id;
        }
        
        // The supplied url may already include one or more query parameters. In that case, we're appending 
        // one more query parameters. Otherwiser, we're adding the first set of query parameters.
        // Look for a ? to see if the url already includes query parameters
        If (return_url_base.contains('?')) {
            return_url_base += '&event=';
        } Else {
            return_url_base += '?event=';
        }
        
        urls.OnSigningComplete  = return_url_base + 'signing_complete';
        urls.OnViewingComplete  = return_url_base + 'viewing_complete';
        urls.OnCancel           = return_url_base + 'cancel';
        urls.OnDecline          = return_url_base + 'decline';
        urls.OnSessionTimeout   = return_url_base + 'session_timeout';
        urls.OnTTLExpired       = return_url_base + 'ttl_expired';
        urls.OnException        = return_url_base + 'exception';
        urls.OnAccessCodeFailed = return_url_base + 'failed_access_code';
        urls.OnIdCheckFailed    = return_url_base + 'failed_id_check';
        urls.OnFaxPending       = return_url_base + 'fax_pending';
        
        // Step 3. Make the call
        try {
            String signer_view_url = api_sender.RequestRecipientToken(
                envelope_id, signer_user_id, signer_name, signer_email, assertion, urls);
            System.debug(' signer_view_url: = ' + signer_view_url);
            
            return signer_view_url;
        } catch ( CalloutException e) {
            System.debug('Exception - ' + e );
            //error_code = 'Problem: ' + e;
            //error_message = error_code;
            return null;
        }
        
        
    }
    
    public static EnvelopeSendResponse sendPatientEmbededSigningURL(Id mySourceId, string templateId) {
        
        templateId = 'b6b0ad2c-bd0c-4b52-b586-f3b44077fb23';
        
        EnvelopeSendResponse response;
        try {
            
            Contact myCustomer = [SELECT Id, Name, Email, Legal_Rep_First_Name__c, Legal_Rep_Last_Name__c FROM Contact WHERE Id =:mySourceId];
            
            //Id mySourceId = mySourceId; // The ID of the initiating Salesforce object
            // Create an empty envelope and add a Salesforce Document and embedded signer  recipient
            // The embedded signer will be the current user with sequence and routing order 1 and role "Signer 1" by default
            dfsle.Envelope dsEnvelope = dfsle.EnvelopeService.getEmptyEnvelope(
                new dfsle.Entity(mySourceId)) // The initiating Salesforce entity--current SF user (salesperson)
                .withDocuments(new List<dfsle.Document> {
                    dfsle.Document.fromTemplate(dfsle.UUID.parse(templateId), 'Please sign the Document')
                        })
                .withRecipients(new List<dfsle.Recipient> {
                    dfsle.Recipient.newEmbeddedSigner('Test', 'sraju@ciberspring.com', userinfo.getUserId()) 
                        }
                               );
            
            dfsle.CustomField myCustomField1 = new dfsle.CustomField(
                'text', //type
                '##SFContact', //##SF+Salesforce API name of the object                                                    
                mySourceId, //Id of the record                                          
                null,
                false,
                false);
            
            //myEnvelope = myEnvelope.withDocuments(new List<dfsle.Document> { myDocument });
            //dsEnvelope = dsEnvelope.withDocuments(new List<dfsle.Document> { myDocument });
            dsEnvelope = dsEnvelope.withCustomFields(new List<dfsle.CustomField> {myCustomField1});
            
            
            
            // Send the envelope.
            dsEnvelope = dfsle.EnvelopeService.sendEnvelope(
                dsEnvelope, // The envelope to send
                true // Send now?
            );
            // Return string value of DocuSign envelope ID
            String envId = String.valueOf(dsEnvelope.docuSignId);
            
            System.debug('the envid ' + envId);
            
            String url = 'https://wellpsyche.herokuapp.com/';
            
            //Url mySigningUrl = dfsle.SigningService.getEmbeddedSigningUrl(
            //dfsle.UUID.parse(envId), // envId value as a UUID
            //new URL(url) // url value as a URL
            //);
            
            // Return string value of url to controller
            //URL mySigningUrl =  mySigningUrl.toExternalForm();
            
            //System.debug('the Signing URL is' + mySigningUrl.toExternalForm());
            
        }
        catch(Exception ex) {
            system.debug('****************'+ex.getMessage());
            response = new EnvelopeSendResponse(ex.getMessage(), false,'');
        }
        return response;     
    }
    
    public static String getEmbeddedSigningUrl(String envId, String url) {
        Url mySigningUrl = dfsle.SigningService.getEmbeddedSigningUrl(
            dfsle.UUID.parse(envId), // envId value as a UUID
            new URL(url) // url value as a URL
        );
        // Return string value of Url to controller
        
        System.debug('the Signinig URL is' + mySigningUrl.toExternalForm());
        
        return mySigningUrl.toExternalForm();
    }
    
    @auraEnabled
    public static EnvelopeSendResponse sendPatientEnvelope(Id mySourceId) {
                EnvelopeSendResponse response;
        try {
            // Capture customer details
            Contact myCustomer = [SELECT Id, Name, Email, Legal_Rep_First_Name__c, Legal_Rep_Last_Name__c,Legal_Rep__c,Owner.Name FROM Contact WHERE Id =:mySourceId AND Email != ''];
            System.debug('*** Inside sendPatientEnvelope myCustomer : ' + myCustomer);
            if(myCustomer.Legal_Rep__c)
                sendLegalEnvelope(mySourceId);
            string templateId = '6c476da0-d2b0-496b-8b41-9a10bc0712a7';//'';b6b0ad2c-bd0c-4b52-b586-f3b44077fb23
            Docusign_Template__mdt patientCosentEmail= [select Id,MasterLabel,Email_Subject__c, Template_Id__c, Email_Body__c from Docusign_Template__mdt where DeveloperName ='Patient_Consent_Email'];
            templateId = patientCosentEmail.Template_Id__c;
            // Create an empty envelope
            dfsle.Envelope myEnvelope = dfsle.EnvelopeService.getEmptyEnvelope(new dfsle.Entity(mySourceId));
            // Setup recipient data
            dfsle.Recipient myRecipient = dfsle.Recipient.fromSource(myCustomer.Name, myCustomer.Email, null, 'Signer 1', new dfsle.Entity(mySourceId));
            System.debug('*** myRecipient : ' + myRecipient);
            //myRecipient.emailSettings.message = 'test';
                        
            // Add Recipient to the Envelope
            myEnvelope = myEnvelope.withRecipients(new List<dfsle.Recipient> { myRecipient });
            String emailBody =patientCosentEmail.Email_Body__c.replace('{{Date}}',String.valueof(System.Today().format())).replace('{{Prescriber Name}}',myCustomer.Owner.Name);
            myEnvelope = myEnvelope.withEmail(patientCosentEmail.Email_Subject__c, emailBody);
            dfsle.CustomField myCustomField1 = new dfsle.CustomField(
                'text', //type
                '##SFContact', //##SF+Salesforce API name of the object                                                    
                mySourceId, //Id of the record                                          
                null,
                false,
                false);
            
            
            // myTemplateId contains the DocuSign Id of the DocuSign Template
            dfsle.UUID myTemplateId = dfsle.UUID.parse(templateId);
            
            // Create a new document for the Envelope
            dfsle.Document myDocument = dfsle.Document.fromTemplate(
                myTemplateId, // templateId in dfsle.UUID format
                'Please Sign the Consent'); // The name of the template
            
            // Add document to the Envelope
            //myEnvelope = myEnvelope.withDocuments(new List<dfsle.Document> { myDocument });
            myEnvelope = myEnvelope.withDocuments(new List<dfsle.Document> { myDocument });
            myEnvelope = myEnvelope.withCustomFields(new List<dfsle.CustomField> {myCustomField1});
            // Send the envelope
            myEnvelope = dfsle.EnvelopeService.sendEnvelope(
                myEnvelope, // The envelope to send
                true); // Send now?
            system.debug('****************'+myEnvelope.docuSignId);
            if(String.valueOf(myEnvelope.docuSignId) != ''){
                updatePatientConsent(mySourceId, String.valueOf(myEnvelope.docuSignId), 'Sent');
            }
            
            response = new EnvelopeSendResponse('Envelope sent successfully', true,string.valueOf(myEnvelope.docuSignId));
        }
        catch(Exception ex) {
            system.debug('****************'+ex.getMessage());
            response = new EnvelopeSendResponse(ex.getMessage(), false,'');
        }
        return response;     
    }
    
    public static void updatePatientConsent(String patientId, String EnvelopeId, String status){
        List<Consent__c> consentsList = [SELECT Id, EnvelopeId__c, Status__c FROM Consent__c WHERE Status__c='Processing' AND Patient__c =: patientId ORDER BY CreatedDate DESC LIMIT 1];
        consentsList[0].EnvelopeId__c = EnvelopeId;
        consentsList[0].Status__c = status; 
        update consentsList;
    }
    
    public static EnvelopeSendResponse sendLegalEnvelope(Id mySourceId) {
        
        String templateId = 'fbf3f79b-8c3e-4aa0-838e-96ab133f89b1';
        Docusign_Template__mdt patientCosentEmail= [select Id,MasterLabel,Email_Subject__c, Template_Id__c, Email_Body__c from Docusign_Template__mdt where DeveloperName ='Patient_Consent_Legal_Email'];
        templateId = patientCosentEmail.Template_Id__c;
        
        EnvelopeSendResponse response;
        try {
            system.debug('*****************'+mySourceId);
            system.debug('*****************'+templateId);
            
            //Capture customer details
            Contact myCustomer = [SELECT Id, Name, Email, Legal_Rep_First_Name__c, Legal_Rep_Last_Name__c,Owner.Name FROM Contact WHERE Id =:mySourceId];
            
            //Create an empty envelope
            dfsle.Envelope myEnvelope = dfsle.EnvelopeService.getEmptyEnvelope(new dfsle.Entity(mySourceId));
            
            //Setup recipient data
            dfsle.Recipient myRecipient = dfsle.Recipient.fromSource(myCustomer.Legal_Rep_First_Name__c + ' ' + myCustomer.Legal_Rep_Last_Name__c, myCustomer.Email, null, 'Signer 1', new dfsle.Entity(mySourceId));
            
            //Add Recipient to the Envelope
            myEnvelope = myEnvelope.withRecipients(new List<dfsle.Recipient> { myRecipient });
            String emailBody =patientCosentEmail.Email_Body__c.replace('{{Date}}',String.valueof(System.Today().format())).replace('{{Prescriber Name}}',myCustomer.Owner.Name);
            myEnvelope = myEnvelope.withEmail(patientCosentEmail.Email_Subject__c, emailBody);
            
            dfsle.CustomField myCustomField1 = new dfsle.CustomField(
                'text', //type
                '##SFContact', //##SF+Salesforce API name of the object                                                    
                mySourceId, //Id of the record                                          
                null,
                false,
                false);
            
            
            //myTemplateId contains the DocuSign Id of the DocuSign Template
            dfsle.UUID myTemplateId = dfsle.UUID.parse(templateId);
            
            //Create a new document for the Envelope
            dfsle.Document myDocument = dfsle.Document.fromTemplate(
                myTemplateId, // templateId in dfsle.UUID format
                'Please Sign the Consent'); // The name of the template
            
            //Add document to the Envelope
            //myEnvelope = myEnvelope.withDocuments(new List<dfsle.Document> { myDocument });
            myEnvelope = myEnvelope.withDocuments(new List<dfsle.Document> { myDocument });
            myEnvelope = myEnvelope.withCustomFields(new List<dfsle.CustomField> {myCustomField1});
            
            //Send the envelope
            myEnvelope = dfsle.EnvelopeService.sendEnvelope(
                myEnvelope, // The envelope to send
                true); // Send now?
            
            system.debug('the myEnvelope response is' + myEnvelope);                                    
            
            system.debug('****************'+myEnvelope.docuSignId);   
            if(String.valueOf(myEnvelope.docuSignId) != ''){
                updatePatientConsent(mySourceId, String.valueOf(myEnvelope.docuSignId), 'Sent');
            }
            response = new EnvelopeSendResponse('Envelope sent successfully', true,string.valueOf(myEnvelope.docuSignId));
        }
        catch(Exception ex) {
            system.debug('****************'+ex.getMessage());
            response = new EnvelopeSendResponse(ex.getMessage(), false,'');
        }
        return response;     
    }
    
    public class EnvelopeSendResponse {
        public String message {get; private set;}
        public Boolean status {get; private set;}
        public String DocuSignEnvelopeId {get; private set;}
        
        public EnvelopeSendResponse(final String message, final Boolean status, final string DocuSignEnvelopeId){
            this.message = message;
            this.status = status;
            this.DocuSignEnvelopeId = DocuSignEnvelopeId;
        }
    }
    
}