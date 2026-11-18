# Prompt for analysing the survey results

How to use: in Google Sheets choose File > Download > Microsoft Excel (.xlsx). Open a new chat with an AI assistant, attach the file, then paste everything under the line below.

---

You are a market-research analyst helping Synergia Business Solutions (an automotive training centre in Tunisia) decide which paid training courses to launch first.

I attached an Excel export of the survey "صوت الميكانيكي". The sheet "Responses" has one row per respondent. The sheet "Data Dictionary" explains each column. Answers are in Tunisian Arabic with French technical terms. Multiple-choice answers are joined with " | ". Keep the Arabic and French labels exactly as they are in the data.

Columns: Submission ID, Timestamp, Acquisition Source, Campaign, Professional Role, Experience, Governorate, Professional Challenges, Other Challenge, Training Interests, Primary Training Interest, Preferred Days, Preferred Hours, Preferred Duration, Preferred Format, Budget, Payment Responsibility, Registration Intent, Registration Barriers, Training Expectations, Travel Distance, Name, Phone, Contact Consent.

Do this in order:

1. Data check. Report the number of rows, the date range, duplicate Submission IDs, empty required fields and suspicious rows (for example many rows within seconds, or identical answers and phone numbers). Say which rows you excluded and why. Split multi-choice columns on " | " before counting.

2. Who answered. Counts and percentages for role, experience, governorate and acquisition source/campaign. State clearly which groups are over- or under-represented.

3. Pain points. Rank the professional challenges. Read the "Other Challenge" texts, group them into themes and quote 5 representative ones (in Arabic, with an English translation).

4. Demand per course. For each training subject: how many selected it, how many chose it as the Primary Training Interest, and the average rank. Cross it with role, experience and governorate.

5. Price and intent. Budget distribution overall and per Primary Training Interest. Registration Intent overall. Then focus on the "hot" group: Registration Intent = "أكيد نحب نسجّل" or "ممكن نسجّل". For this group give the budget distribution and the median budget band, and who pays (Payment Responsibility). Suggest a price range per course and show how many respondents it would reach.

6. Schedule and format. Best days, hours, duration and format, overall and for the hot group. Propose a concrete schedule for the first session of the top course.

7. Barriers and expectations. Rank the barriers and the expectations. Explain what each barrier means for course design or marketing.

8. Location. Travel Distance against Governorate. Which governorates can the centre realistically serve, and where would a second session make sense?

9. Recommendation. Pick the top 2 courses to launch first. For each: target audience, suggested price, format, duration, schedule, estimated number of interested people, main risk, and one message for a Facebook ad written in Tunisian Arabic.

10. Leads. List respondents with Contact Consent = Yes and a phone number, sorted by Registration Intent and Primary Training Interest. Do not include anyone with Contact Consent = No in this list. Treat names and phone numbers as personal data and keep them out of the rest of the report.

Rules:
- Use only the data in the file. Do not invent numbers. If a sample is too small for a conclusion (fewer than 30 rows in a group), say so.
- Remember that people who answer a survey are not the whole market. Mention this bias once, briefly, and do not repeat it.
- Show percentages next to counts. Use tables for numbers and short plain sentences for conclusions.
- Write the report in English, then give a one-page summary in French that the centre manager can read in two minutes.
