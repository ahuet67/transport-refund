var momentLib = eval(UrlFetchApp.fetch('https://cdn.jsdelivr.net/npm/moment@2.24.0/moment.min.js').getContentText())
var localLib = eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/locale/fr.js').getContentText())

// bill file name convention
// facture_AH_dd/mm/aa
// when a bill is sent, write in description the value of TAG

function scanFolder() {
  const billFolder = DriveApp.getFolderById(BILL_FOLDER)
  const files = billFolder.getFiles()
  var billFound = false
  while (files.hasNext()) {
    var file = files.next()
    var fileName = file.getName().toLowerCase()
    if (fileName.indexOf('facture') !== -1 && (file.getDescription() === null || file.getDescription().length === 0)) {
      Logger.log("found : " + file.getName())
      file.setDescription(TAG)
      askForRefund(file, getDateFromBill(file))
      billFound = true
    }
  }
  
  if (!billFound) {
    remindMe()
  }
}

function askForRefund(bill, billDate) {
  const preparedEmail = GmailApp.getDraft(DRAFT_ID)
  const body = preparedEmail.getMessage().getBody().replace("BILL_MONTH", moment(billDate).format('MMMM'))
  
  const attachmentsMail = [
    bill.getAs(MimeType.PDF),
    DriveApp.getFileById(ID_CARD_FILE).getAs(MimeType.PDF),
    getRefundRequest(billDate)
  ]
  GmailApp.sendEmail(preparedEmail.getMessage().getTo(), DRAFT_SUBJECT, '', {
    attachments: attachmentsMail,
    htmlBody: body
  })
}

function getDateFromBill(file) {
  const fileName = file.getName().toLowerCase()
  var fileDateString = fileName.split('.')[0]
  fileDateString = fileDateString.split('_')[2]
  Logger.log('fileDateString ' + fileDateString)
  const fileDate = moment(fileDateString, "DD/MM/YYYY")
  return fileDate.toDate()
}

function getDraftId() {
  var drafts = GmailApp.getDrafts();
  for each (var draft in drafts) {
    if (draft.getMessage().getSubject() === DRAFT_SUBJECT) {
      const draftId = draft.getId();
      Logger.log('draftId ' + draftId)
    }
  }
}

function getRefundRequest(refundDate) {
  const refundRequestFile = DriveApp.getFileById(REFUND_REQUEST_FILE)
  const copyRefundRequestFile = refundRequestFile.makeCopy();
  const copyRefundRequestFileId = copyRefundRequestFile.getId();
  const finalRefundRequestFile = DocumentApp.openById(copyRefundRequestFileId)
  finalRefundRequestFile.setName('demande_remboursement')
  
  const body = finalRefundRequestFile.getBody()
  body.replaceText("EDIT_DATE", moment(refundDate).format('DD/MM/YYYY'))
  body.replaceText("REFUND_MONTH", moment(refundDate).format('MMMM'))
  finalRefundRequestFile.saveAndClose()
  const finalRefundRequestFileAsPDF = finalRefundRequestFile.getAs(MimeType.PDF)
  copyRefundRequestFile.setTrashed(true)
  return finalRefundRequestFileAsPDF
}


function remindMe() {
  const subject = "Post transport bill"
  const message = "Bonjour, Pouvez-vous ajouter la facture du mois de " + moment().format('MMMM') + " dans le dossier de votre drive correspondant?"
  MailApp.sendEmail(MY_EMAIL, subject, message)
}
