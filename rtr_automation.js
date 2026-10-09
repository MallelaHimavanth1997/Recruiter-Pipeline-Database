function extractRTREmails() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var pSheet = spreadsheet.getSheetByName("Profile Submissions");
  var cSheet = spreadsheet.getSheetByName("Recruiters Contact List");
  
  // Uses your standard 2-hour tracker label
  var processedLabel = GmailApp.getUserLabelByName("RTR-TRACKER");
  if (!processedLabel) {
    processedLabel = GmailApp.createLabel("RTR-TRACKER");
  }
  
  var threads = GmailApp.search('label:RTR -label:RTR-TRACKER');
  
  if (threads.length === 0) {
    Logger.log("No new emails found.");
    return;
  }
  
  // NEW: Ignore your email, specific names, AND the entire marketing team domain
  var ignoreEmails = ["Your Gmail Id"];
  var ignoreDomains = ["If Any of your team "]; 
  var ignoreNames = ["Any name ignore"];
  
  // Gather existing emails from Contact List to prevent duplicates
  var contactData = cSheet.getDataRange().getValues();
  var existingEmails = [];
  for (var r = 3; r < contactData.length; r++) { 
    if (contactData[r][3]) { 
      existingEmails.push(contactData[r][3].toString().toLowerCase().trim());
    }
  }
  
  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var msgs = thread.getMessages();
    
    // Check the entire mail to find the external recruiter
    var msg = null;
    for (var m = 0; m < msgs.length; m++) {
       var fromEmail = (msgs[m].getFrom().match(/<([^>]+)>/) || ["", msgs[m].getFrom()])[1].toLowerCase();
       
       var shouldIgnore = false;
       if (ignoreEmails.indexOf(fromEmail) > -1) shouldIgnore = true;
       for (var d = 0; d < ignoreDomains.length; d++) {
         if (fromEmail.indexOf(ignoreDomains[d]) > -1) shouldIgnore = true;
       }
       
       if (!shouldIgnore) {
           msg = msgs[m]; 
           break;
       }
    }
    
    if (!msg) {
       thread.addLabel(processedLabel);
       continue;
    }
    
    var body = msg.getPlainBody();
    var subject = msg.getSubject();
    var sender = msg.getFrom(); 
    
    // Extract data from the mail
    var dateStr = Utilities.formatDate(msg.getDate(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    var recruiterName = sender.replace(/<.*>/, "").replace(/"/g,"").trim(); 
    var mailId = (sender.match(/<([^>]+)>/) || ["", sender])[1]; 
    
    var isInternal = false;
    for (var n = 0; n < ignoreNames.length; n++) {
        if (recruiterName.toLowerCase().indexOf(ignoreNames[n]) > -1) {
            isInternal = true;
        }
    }
    if (isInternal) {
       thread.addLabel(processedLabel);
       continue;
    }
    
    var phoneMatch = body.match(/(\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(\s*(ext|x|Ext\.)[\s.-]?\d+)?/i);
    var phoneNumber = phoneMatch ? "'" + phoneMatch[0].trim() : "";
    
    var staffingFirm = "";
    if (mailId.indexOf('@') > -1) {
      var domain = mailId.split('@')[1].split('.')[0];
      if (["gmail", "yahoo", "hotmail", "outlook", "icloud"].indexOf(domain.toLowerCase()) === -1) {
         staffingFirm = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    }
    
    var clientName = "";
    var clientMatch = body.match(/(?:client|end client)\s*(?:is|:|-)?\s*["“”']?([A-Za-z0-9\s&]+?)(?=\.|and|,|for|\n|["“”'])/i);
    if (clientMatch) {
       clientName = clientMatch[1].trim();
    } else {
       var knownClients = ["TCS", "HCL", "Deloitte", "Infosys", "Wipro", "Cognizant", "Capgemini", "Accenture", "IBM", "Charter", "Fiserv"];
       for (var k=0; k<knownClients.length; k++) {
          if (subject.toLowerCase().indexOf(knownClients[k].toLowerCase()) > -1 || body.toLowerCase().indexOf(knownClients[k].toLowerCase()) > -1) {
              clientName = knownClients[k];
              break;
          }
       }
    }
    
    var rateMatch = body.match(/\$[\d\.]+(?:\/hr|\/hour| p\/h| per hour| c2c| on c2c)?/i);
    var rate = rateMatch ? rateMatch[0].trim() : "";
    
    var location = "";
    var locMatch = body.match(/\b(remote|hybrid|on-site|onsite)\b/i);
    if (locMatch) {
        location = locMatch[1].charAt(0).toUpperCase() + locMatch[1].slice(1).toLowerCase();
        if (location === "Onsite") location = "On-site";
    }
    
    var jobDetails = subject.replace(/RTR|Fwd:|Re:|Opportunity|Submission Detail|Rate Confirmation/gi, "").replace(/[:\|]/g, "-").trim();
    var linkedInMatch = body.match(/(?:https?:\/\/(?:www\.)?)?linkedin\.com\/(?:in|profile)\/[a-zA-Z0-9_-]+/i);
    var linkedInUrl = linkedInMatch ? linkedInMatch[0] : "";

    // Data for Sheet 1 (Check for duplicates)
    var checkEmail = mailId.toLowerCase().trim();
    if (checkEmail && existingEmails.indexOf(checkEmail) === -1) {
       cSheet.appendRow([
         recruiterName,      
         staffingFirm,       
         linkedInUrl,        
         mailId,             
         phoneNumber,        
         "Active",           
         "",                 
         ""                  
       ]);
       existingEmails.push(checkEmail); 
    }

    // Data for Sheet 2 
    pSheet.appendRow([
      dateStr,           
      recruiterName,     
      mailId,            
      phoneNumber,       
      staffingFirm,      
      clientName,        
      rate,              
      location,          
      jobDetails         
    ]);
    
    // Confirm the data stored 
    thread.addLabel(processedLabel);
  }
}