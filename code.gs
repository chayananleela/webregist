/** WebApp - ระบบรับสมัครนักเรียน Version3.2.1-2022 (PDF Service)
 * พัฒนาโดย นายจิรศักดิ์ จิรสาโรช E-mail: niddeaw.n@gmail.com Tel/Line : 0806393969
 * สร้างเมื่อ 23 พฤศจิกายน 2564
 * อัพเดท
 * - 16 กุมภาพันธ์ 2565 : อัพเดทระบบค้นหา
 * - 16 มกราคม 2565 : สร้างไฟล์ PDF
 * - 13 มกราคม 2565 : อัพเดทโค้ด เซ็ตชื่อไฟล์รูปภาพ เพิ่ม Loading Overlay
 * - 8 มกราคม 2565 : ลบข้อมูลซ้ำ แก้ไข error ต่างๆ และการบันทึกค่า input radio

 */
var sheetID = '1dluROommVukMEJkcxzSXNZL6LbLtBpxaT8P1sEYNmMQ';// ID ของชีต
var sheetName = "sheet1";// ชื่อชีต
var SCRIPT_PROP = PropertiesService.getScriptProperties();

function setup() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  SCRIPT_PROP.setProperty(sheetID, doc.getId())
}

/** เรียกหน้าเพจ HTML */
function doGet(e) {
  Logger.log(Utilities.jsonStringify(e));
  if (!e.parameter.page) {
    return HtmlService.createTemplateFromFile('index').evaluate()
      .setTitle('ระบบรับสมัครบุคลากรใหม่')
      .addMetaTag('viewport', 'width=device-width , initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
  }
  return HtmlService.createTemplateFromFile(e.parameter['page']).evaluate()
    .setTitle('ระบบรับสมัครบุคลากรใหม่')
    .addMetaTag('viewport', 'width=device-width , initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

/** เรียก URL */
function getUrl() {
  var url = ScriptApp.getService().getUrl();
  return url;
}

/** ดึงไฟล์ */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** บันทึกข้อมูลลงชีต */
function uploadFile(files, service, reg_type, prefix, name, lastname, birthday, idcard, race, nationality, religion, house_no, village_no, village, road, alley, district, amphoe, province, zipcode, student_phone, school, district1, amphoe1, province1, zipcode1, gpa, school_type, disability, father, father_occupation, father_phone, mother, mother_occupation, mother_phone, parent, parent_occupation, parent_phone, relationship) {
  try {
    var folder = DriveApp.getFolderById('1DrEqIRqWGRzs81YeZjV0NQNyfQcoLZFp'); // ID โฟลเดอร์เก็บไฟล์ภาพที่อัพโหลด
    let images = [];
    Object.keys(files).forEach((key) => {
      let file = files[key];
      let data = file.dataURL;
      let filename = file.name;
      contentType = data.substring(5, data.indexOf(";"));
      bytes = Utilities.base64Decode(data.substr(data.indexOf("base64,") + 7));
      (blob = Utilities.newBlob(bytes, contentType, filename)), (file = folder.createFile(blob)), Logger.log(contentType);
      let fileId = file.getId();
      file.setName(prefix + name + " " + lastname) // เซ็ตชื่อไฟล์ภาพตามที่กำหนดเอง
      images.push("https://drive.google.com/uc?id=" + fileId);
    });

    var lock = LockService.getPublicLock();
    lock.waitLock(30000);

    var doc = SpreadsheetApp.openById('1dluROommVukMEJkcxzSXNZL6LbLtBpxaT8P1sEYNmMQ'); // ID Sheet
    var sheet = doc.getSheetByName('sheet1'); // ชื่อ Sheet

    sheet.appendRow([new Date(), service, reg_type, prefix, name, lastname, birthday, idcard, race, nationality, religion, house_no, village_no, village, road, alley, district, amphoe, province, zipcode, "'" + student_phone, school, district1, amphoe1, province1, zipcode1, gpa, school_type, disability, father, father_occupation, "'" + father_phone, mother, mother_occupation, "'" + mother_phone, parent, parent_occupation, "'" + parent_phone, relationship, ...images]);

    deleteRow();
    runPDF();
    return "success";

  } catch (f) {
    return f.toString();
  } finally {
    lock.releaseLock();
  }
}

/** ฟังก์ชั่นลบข้อมูลซ้ำ */
function deleteRow() {
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
  var name = ss.getRange(ss.getLastRow(), 8).getValue() // คอลัมภ์ที่ต้องการตรวจสอบค่าซ้ำ
  var lastRow = ss.getLastRow()
  var i = 2
  var nameChk = ss.getRange(2, 8).getValue()
  while (name !== nameChk) {
    i++
    var nameChk = ss.getRange(i, 8).getValue()
  }
  if (i < lastRow) {
    ss.deleteRow(i)
  }
}

/** ฟังก์ชั่นสร้างไฟล์ PDF */
/** ไลบรารี่ PDF Service : 1iePjnglUzelAuJJb-QykRcUUWYBSKiNGUWVljnNe03G9zWzSUGIRWLXa */
function runPDF() {
  let tmpFileId = '1xjc4RToHsrq1hD7q9JemtUFwTLVAptxFh3sezf6nQew' // ไอดีของ slide
  let pdfFolder = DriveApp.getFolderById('1dcCKhT4Xv0U16RXw9OqWpXSdF4UIIW0s')// ID โฟลเดอร์เก็บไฟล์ PDF
  let templateFile = DriveApp.getFileById(tmpFileId)
  let data = PdfService.initData(sheetID, sheetName)

  var date = data[0]['วันเดือนปีเกิด'].split("/")
  var birthday = Number(date[0]) // วันเกิดรูปแบบตัวเลข
  var mounthText = ["", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
  var mounthThai = mounthText[Number(date[1])]
  var yearThai = Number(date[2])
  var dateThai = data[0]['วันเดือนปีเกิด'] = birthday + " " + mounthThai + " พ.ศ." + yearThai
  Logger.log(dateThai)
  
  let option = {
    pdfFolder: pdfFolder,
    templateFile: templateFile,
    data: data,
    image_column: ['รูปภาพ1'], // ชื่อคอลัมภ์รูปภาพ
    fileName: ['เขตพื้นที่บริการ', "_", 'ประเภท', "_", 'คำนำหน้า', 'ชื่อ', "_", 'นามสกุล'], // ชื่อไฟล์ PDF
    linktype: "view" // รูปแบบของลิงค์
  }
  PdfService.createPDFFromSlide(option)
}

/** ค้นหาข้อมูล 1 เงื่อนไข */
function getData(user) {
  var data = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].getDataRange().getDisplayValues();
  var result = data.filter((r) => r[7] == user.name); // Index ที่ต้องการค้นหา
  return result;
}
