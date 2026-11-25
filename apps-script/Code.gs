/**
 * Synergia — Automotive Training Market Research
 * Google Apps Script backend (bound to the Google Sheet).
 *
 * Setup: see README.md. In short:
 *  1. Paste this file into Extensions > Apps Script.
 *  2. Add a Script Property called SHARED_SECRET (Project Settings).
 *  3. Run setupSheet() once.
 *  4. Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 */

var SPREADSHEET_TITLE = "Synergia — Automotive Training Market Research";
var SHEET_NAME = "Responses";
var DICT_NAME = "Data Dictionary";
var TZ = "Africa/Tunis";

// [column header, key sent by the website, description for the Data Dictionary]
var COLUMNS = [
  ["Submission ID", "submissionId", "Unique ID created by the survey page. Used to block duplicate rows."],
  ["Timestamp", "timestamp", "Date and time the answer was stored (Tunisia time, yyyy-MM-dd HH:mm:ss)."],
  ["Acquisition Source", "source", "Where the visitor came from. 'source' or 'source / medium' from the link. Default: direct."],
  ["Campaign", "campaign", "Campaign name from the link (utm_campaign). Default: not-set."],
  ["Professional Role", "role", "Q1. Single choice."],
  ["Experience", "experience", "Q2. Single choice."],
  ["Governorate", "governorate", "Q3. One of the 24 Tunisian governorates."],
  ["Professional Challenges", "challenges", "Q4. Multiple choice, max 3, separated by ' | '."],
  ["Other Challenge", "challengeOther", "Q4. Free text, only if 'أخرى' was selected."],
  ["Training Interests", "interests", "Q5. Multiple choice, separated by ' | '."],
  ["Primary Training Interest", "primary", "Q6. Single choice among the Q5 answers."],
  ["Preferred Days", "days", "Q7. Multiple choice, separated by ' | '."],
  ["Preferred Hours", "hours", "Q8. Multiple choice, separated by ' | '."],
  ["Preferred Duration", "duration", "Q9. Single choice."],
  ["Preferred Format", "format", "Q10. Single choice."],
  ["Budget (retired)", "budget", "Retired question: no longer asked. Old rows keep their answer, new rows leave this cell empty."],
  ["Payment Responsibility", "payer", "Q12. Single choice."],
  ["Registration Intent", "intent", "Q13. Single choice."],
  ["Registration Barriers", "barriers", "Q14. Multiple choice, separated by ' | '."],
  ["Training Expectations", "expectations", "Q15. Multiple choice, max 3, separated by ' | '."],
  ["Travel Distance", "distance", "Q16. Single choice."],
  ["Name", "name", "Q17. Optional."],
  ["Phone", "phone", "Q18. Optional. Stored as text, digits with optional leading +."],
  ["Contact Consent", "consent", "Q19. Yes = wants Synergia to contact them. No = survey only."]
];

/* ---------- One-time setup ---------- */

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.rename(SPREADSHEET_TITLE);

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    var first = ss.getSheets()[0];
    if (first.getLastRow() === 0 && ss.getSheets().length === 1) {
      sheet = first.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }
  var headers = COLUMNS.map(function (c) { return c[0]; });
  sheet.getRange(1, 1, 1, headers.length)
    .setNumberFormat("@")
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground("#0B1522")
    .setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, headers.length, 170);

  var dict = ss.getSheetByName(DICT_NAME) || ss.insertSheet(DICT_NAME);
  dict.clear();
  var rows = [["Column", "Description"]].concat(COLUMNS.map(function (c) { return [c[0], c[2]]; }));
  dict.getRange(1, 1, rows.length, 2).setValues(rows);
  dict.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#0B1522").setFontColor("#FFFFFF");
  dict.setColumnWidth(1, 220);
  dict.setColumnWidth(2, 640);
  dict.setFrozenRows(1);

  Logger.log("Sheet ready. Now add SHARED_SECRET in Project Settings > Script Properties, then deploy as a Web App.");
}

/* ---------- Web app ---------- */

function doGet() {
  return json_({ ok: true });
}

function doPost(e) {
  try {
    var secret = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");
    if (!secret) return json_({ ok: false, error: "not_configured" });

    var raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 30000) return json_({ ok: false, error: "bad_request" });

    var body = JSON.parse(raw);
    if (!safeEqual_(String(body.secret || ""), secret)) return json_({ ok: false, error: "unauthorized" });

    var problem = validate_(body.row);
    if (problem) return json_({ ok: false, error: "invalid: " + problem });

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(20000)) return json_({ ok: false, error: "busy" });
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      if (!sheet) return json_({ ok: false, error: "sheet_missing_run_setupSheet" });

      var row = body.row;
      var last = sheet.getLastRow();

      // Duplicate protection: same Submission ID = already stored, report success.
      if (last > 1) {
        var ids = sheet.getRange(2, 1, last - 1, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (String(ids[i][0]) === row.submissionId) return json_({ ok: true, duplicate: true });
        }
      }

      row.timestamp = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm:ss");
      var values = COLUMNS.map(function (c) { return text_(row[c[1]], c[1]); });
      // Text format keeps phone numbers intact and stops anything being read as a formula.
      sheet.getRange(last + 1, 1, 1, values.length).setNumberFormat("@").setValues([values]);
      SpreadsheetApp.flush();
      return json_({ ok: true });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ ok: false, error: "exception: " + err });
  }
}

/* ---------- Helpers ---------- */

var REQUIRED = ["submissionId", "role", "experience", "governorate", "challenges", "interests", "primary",
  "days", "hours", "duration", "format", "payer", "intent", "barriers", "expectations", "distance", "consent"];
var MAX_LEN = { challengeOther: 200, name: 80, phone: 30 };

function validate_(row) {
  if (!row || typeof row !== "object") return "no row";
  if (!/^[A-Za-z0-9-]{16,64}$/.test(String(row.submissionId || ""))) return "submissionId";
  for (var i = 0; i < REQUIRED.length; i++) {
    var k = REQUIRED[i];
    if (typeof row[k] !== "string" || row[k].trim() === "") return "missing " + k;
  }
  for (var j = 0; j < COLUMNS.length; j++) {
    var key = COLUMNS[j][1];
    if (key === "timestamp") continue;
    var v = row[key];
    if (v !== undefined && typeof v !== "string") return "type " + key;
    if (v && v.length > (MAX_LEN[key] || 700)) return "too long " + key;
  }
  if (row.consent !== "Yes" && row.consent !== "No") return "consent";
  if (row.phone && !/^\+?\d{8,15}$/.test(row.phone)) return "phone";
  return "";
}

function text_(value, key) {
  var s = String(value == null ? "" : value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  if (key === "name" || key === "challengeOther") s = s.replace(/^[=+\-@\t\r]+/, "");
  return s;
}

function safeEqual_(a, b) {
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
