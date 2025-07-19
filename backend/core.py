import os
import json
from google import genai
from dotenv import load_dotenv
import re

# Load environment variables from .env file
load_dotenv()

# Configure Gemini API
# Make sure your .env file contains GOOGLE_API_KEY
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("Please set GOOGLE_API_KEY in your .env file")

# Create Gemini client instance
client = genai.Client(api_key=GOOGLE_API_KEY)

def read_note():
    """Read note file content"""
    try:
        with open('./data/All/note.txt', 'r', encoding='utf-8') as file:
            content = file.read().strip()
            return content if content else None
    except Exception as e:
        print(f"Error reading note file: {str(e)}")
        return None

def process_course_registration(time_start=None, time_end=None, target_group=None, name=None):
    """
    Read course registration info and generate notification
    """
    # Read template file
    file_path = './data/Student/course_registration.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"Error reading file: {str(e)}")
        return None

    # Read note content
    note_content = read_note()

    # Replace variables (if provided)
    if time_start:
        template = template.replace("{time_start}", time_start)
    if time_end:
        template = template.replace("{time_end}", time_end)
    if target_group:
        template = template.replace("{target_group}", target_group)
    if name:
        template = template.replace("{name}", name)
    if note_content:
        template = template.replace("{note}", note_content)

    # Construct prompt
    prompt = f"""
    Strictly generate the notification according to the following template format. Do not add any extra content or explanation:
    At the very beginning of the email, generate German and English titles, formatted as <strong>Betreff:</strong> ... and <strong>Subject:</strong> ... respectively. The title content should be automatically summarized based on the email content. If the template contains title formats like **Betreff:**, **Subject:**, etc., remove the asterisks and wrap with <strong>.
    If note_content is empty, **Hinweis:** and **Note:** should not be shown.
    Otherwise, add note_content after **Hinweis:** or **Note:**.
    Regardless of the language of note_content, you should convert it to the corresponding German and English for the letter, and use the appropriate letter language.
    Keep line breaks and other formatting unchanged, but do not use asterisks (*) as formatting marks.
    Start the email body content directly.
    If there are unreplaced variables in the template (such as {{time_start}}), keep them as is.
    If {{time_start}} or {{time_end}} is not added in the template, add today's date. If the user writes 'until + date', or 'bis + date', or the date is written in another format, you should also recognize it.
    If {{target_group}} is not added in the template, add 'everyone'.
    If {{name}} is not added in the template, add 'Student Service Center'.
    Ensure the date format is consistent as DD.MM.YYYY and highlight it in the output. MM should be the German or English month (German in the German version, English in the English version), not a number.
    Please help translate all user input information into English in the English version and into German in the German version;
    Output only the email content, do not add any explanation, description, or formatting description.

    Formatting requirements:
    - For important words or phrases that need emphasis, use HTML format: <strong>important content</strong>
    - Required bold content: registration start time, registration end time, target group
    - Do not overuse bold, only use it where emphasis is truly needed
    - Do not use Markdown **bold** marks

    Template content:
    {template}
    """
    
    print("\nGenerating notification...")
    try:
        # Generate content
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        generated_content = response.text
        
        # Ensure content retains formatting
        generated_content = generated_content.replace('\n', '<br>')
        
        # Clear note.txt file
        with open('data/All/note.txt', 'w', encoding='utf-8') as f:
            f.write('')
            
        return extract_and_prepend_titles(generated_content)

    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        return None

def process_event_notice(event_name=None, event_intro=None, event_time=None, event_location=None, target_group=None, registration=None, language=None, name=None):
    """
    Read campus activity info and generate notification
    """
    # Read template file
    file_path = './data/Student/event_notice.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"Error reading file: {str(e)}")
        return None

    # Replace template variables
    if not registration:
        registration = "Registration is not required."
        
    if event_name:
        template = template.replace("{event_name}", event_name)
    if event_intro:
        template = template.replace("{event_intro}", event_intro)
    if event_time:
        template = template.replace("{event_time}", event_time)
    if language:
        template = template.replace("{language}", language)
    if event_location:
        template = template.replace("{event_location}", event_location)
    if target_group:
        template = template.replace("{target_group}", target_group)
    if registration:
        template = template.replace("{registration}", registration)
    if name:
        template = template.replace("{name}", name)
    else:
        template = template.replace("{name}", "Student Service Center")

    # Construct prompt
    prompt = f"""
    Strictly generate the notification according to the following template format. Do not add any extra content or explanation:
    At the very beginning of the email, generate German and English titles, formatted as <strong>Betreff:</strong> ... and <strong>Subject:</strong> ... respectively. The title content should be automatically summarized based on the email content. If the template contains title formats like **Betreff:**, **Subject:**, etc., remove the asterisks and wrap with <strong>.
    The salutation (recipient) and signature (sender) sections should not be bolded, do not use <strong> or ** or any bold marks.
    Keep line breaks and other formatting unchanged, but do not use asterisks (*) as formatting marks.
    Start the email body content directly.
    If there are unreplaced variables in the template (such as {{event_name}}), keep them as is.
    If {{event_time}} is empty in the template, replace it with 'To be determined', translate to the corresponding language in German and English versions, do not abbreviate.
    If the user writes 'until + date', or 'bis + date', or other date formats, recognize and add them.
    If {{target_group}} is not added in the template, default to 'everyone'.
    If {{name}} is not added in the template, default to 'Student Service Center'.
    Ensure the date format is consistent as DD.MM.YYYY and highlight it in the output. MM should be translated to the corresponding language's month expression, not a number.
    Please help translate all user input information into English in the English version and into German in the German version;
    Output only the email content, do not add any explanation, description, or formatting description.

    Formatting requirements:
    - For important words or phrases that need emphasis, use HTML format: <strong>important content</strong>
    - Required bold content: event name, event time, event location, target group
    - Do not overuse bold, only use it where emphasis is truly needed
    - Do not use Markdown **bold** marks

    Template content:
    {template}
    """
    print("\nGenerating event notice...")

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        content = response.text.replace('\n', '<br>')
        return extract_and_prepend_titles(content)

    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        return None

def process_schedule_request(course_name=None, course_code=None, semester=None, time_options=None, reply_deadline=None, name=None, target_group=None):
    """
    Read schedule coordination template and generate email to faculty
    """
    file_path = './data/Staff/schedule_request.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"Error reading template file: {str(e)}")
        return None

    # Replace variables
    if target_group:
        template = template.replace("{target_group}", target_group)
    if course_name:
        template = template.replace("{course_name}", course_name)
    if course_code:
        template = template.replace("{course_code}", course_code)
    if semester:
        template = template.replace("{semester}", semester)
    if time_options:
        template = template.replace("{time_options}", time_options)
    else:
        template = template.replace(
        "{time_options}",
        "Derzeit liegen keine konkreten Zeitoptionen vor.\n\nCurrently, there are no specific time options available."
    )

    if reply_deadline:
        template = template.replace("{reply_deadline}", reply_deadline)
    if name:
        template = template.replace("{name}", name)
    else:
        template = template.replace("{name}", "Student Service Center")

    # Construct prompt
    prompt = f"""
    Strictly generate the notification according to the following template format. Do not add any extra content or explanation:
    At the very beginning of the email, generate German and English titles, formatted as <strong>Betreff:</strong> ... and <strong>Subject:</strong> ... respectively. The title content should be automatically summarized based on the email content. If the template contains title formats like **Betreff:**, **Subject:**, etc., remove the asterisks and wrap with <strong>.
    All variables in the template (such as {{semester}}, {{course_name}}, {{course_code}}, {{time_options}}, {{reply_deadline}}, {{name}}, {{target_group}}) must all be replaced with the provided parameter values and translated into German and English;
    If the user writes 'until + date', or 'bis + date', or other date formats, recognize and add them to {reply_deadline};
    Ensure the date format is consistent as DD.MM.YYYY and highlight it in the output. MM should be translated to the corresponding language's month expression, not a number;
    Please help translate all user input information into English in the English version and into German in the German version;
    The output must strictly retain the original format, including salutation, blank lines, bold marks, and paragraph structure, but do not use asterisks (*) as formatting marks;
    Start the email body content directly.
    The output should be plain text, with German and English parts separated by a horizontal line `---`;
    Output only the email content, do not add any explanation, description, or formatting description.

    Formatting requirements:
    - For important words or phrases that need emphasis, use HTML format: <strong>important content</strong>
    - Required bold content: course name, semester, reply deadline, target group
    - Do not overuse bold, only use it where emphasis is truly needed
    - Do not use Markdown **bold** marks

    Template content:
    {template}
    """

    print("\nGenerating schedule coordination email...")
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        content = response.text.replace('\n', '<br>')
        return extract_and_prepend_titles(content)
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        return None

def process_schedule_announcement(course_name=None, course_code=None, instructor_name=None, course_start_date=None, weekly_time=None, weekly_location=None, target_group=None, name=None):
    """
    Read course announcement template and generate email content
    """
    file_path = './data/Student/schedule_announcement.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"Error reading template file: {str(e)}")
        return None

    if course_name:
        template = template.replace("{course_name}", course_name)
    if course_code:
        template = template.replace("{course_code}", course_code)
    if instructor_name:
        template = template.replace("{instructor_name}", instructor_name)
    if course_start_date:
        template = template.replace("{course_start_date}", course_start_date)
    if weekly_time:
        template = template.replace("{weekly_time}", weekly_time)
    if weekly_location:
        template = template.replace("{weekly_location}", weekly_location)
    if target_group:
        template = template.replace("{target_group}", target_group)
    if name:
        template = template.replace("{name}", name)
    else:
        template = template.replace("{name}", "Student Service Center")

    prompt = f"""
    Strictly generate a bilingual (German-English) course announcement according to the following template format. Do not add any extra content or explanation:
    At the very beginning of the email, generate German and English titles, formatted as <strong>Betreff:</strong> ... and <strong>Subject:</strong> ... respectively. The title content should be automatically summarized based on the email content. If the template contains title formats like **Betreff:**, **Subject:**, etc., remove the asterisks and wrap with <strong>.
    All variables should be replaced according to the input parameters; keep line breaks, list symbols, spaces, and bold marks, but do not use asterisks (*) as formatting marks;
    Start the email body content directly.
    Ensure the date format is consistent as DD.MM.YYYY and highlight it in the output. MM should be translated to the corresponding language's month expression, not a number;
    The German version should be translated into German, the English version into English;
    If {name} is empty, default to "Student Service Center";
    Please help translate all user input information into English in the English version and into German in the German version;
    Output only the email content, do not add any explanation, description, or formatting description.

    Formatting requirements:
    - For important words or phrases that need emphasis, use HTML format: <strong>important content</strong>
    - Required bold content: course name, course start date, weekly time, location
    - Do not overuse bold, only use it where emphasis is truly needed
    - Do not use Markdown **bold** marks

    Template content:
    {template}
    """

    print("\nGenerating course announcement...")
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        content = response.text.replace('\n', '<br>')
        return extract_and_prepend_titles(content)
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        return None

def process_schedule_change(course_name=None, reason=None, original_time=None, original_location=None, new_time=None, new_location=None, target_group=None, name=None, course_code=None):
    """
    Course change notification
    """
    file_path = './data/All/schedule_change.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"Error reading template file: {str(e)}")
        return None

    if course_name:
        template = template.replace("{course_name}", course_name)
    if course_code:
        template = template.replace("{course_code}", course_code)
    if reason:
        template = template.replace("{change_reason}", reason)
    if original_time:
        template = template.replace("{original_time}", original_time)
    if original_location:
        template = template.replace("{original_location}", original_location)
    if new_time:
        template = template.replace("{new_time}", new_time)
    if new_location:
        template = template.replace("{new_location}", new_location)
    if target_group:
        template = template.replace("{target_group}", target_group)
    if name:
        template = template.replace("{name}", name)
    else:
        template = template.replace("{name}", "Student Service Center")

    prompt = f"""
    Strictly generate a course schedule change notification according to the following template format. Do not add any extra content or explanation:
    At the very beginning of the email, generate German and English titles, formatted as <strong>Betreff:</strong> ... and <strong>Subject:</strong> ... respectively. The title content should be automatically summarized based on the email content. If the template contains title formats like **Betreff:**, **Subject:**, etc., remove the asterisks and wrap with <strong>.
    Bilingual format in German and English:
    All variables must be replaced;
    Keep the original format, but do not use asterisks (*) as formatting marks, and do not add explanations;
    Start the email body content directly.
    Dates should always use DD.MM.YYYY format, and translate the month;
    If {new_location} or {new_time} is empty, replace with "No change", and translate to the corresponding language in different versions;
    If {name} is empty, default to "Student Service Center";
    Please help translate all user input information into English in the English version and into German in the German version;
    Output only the email content, do not add any explanation, description, or formatting description.

    Formatting requirements:
    - For important words or phrases that need emphasis, use HTML format: <strong>important content</strong>
    - Required bold content: course name, change reason, new time, new location
    - Do not overuse bold, only use it where emphasis is truly needed
    - Do not use Markdown **bold** marks

    Template content:
    {template}
    """

    print("\nGenerating course schedule change notification...")
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        content = response.text.replace('\n', '<br>')
        return extract_and_prepend_titles(content)
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        return None

def process_free_prompt(prompt: str, tone: str = "neutral"):
    """Use Gemini to generate administrative documents based on free prompts.

    Parameters:
        prompt: User input free text requirement.
        tone: Expected tone, optional values are neutral | friendly | firm.

    Returns:
        str: Generated HTML string, line breaks converted to <br>.
    """
    if not prompt:
        return ""

    # Add prefix prompts based on tone to help model adjust style
    tone_map = {
        "neutral": "Write the following administrative document in a formal and objective tone:",
        "friendly": "Write the following administrative document in a friendly and approachable tone:",
        "firm": "Write the following administrative document in a polite but firm tone:",
    }
    prefix = tone_map.get(tone, tone_map["neutral"])

    full_prompt = f"""
    You are an AI assistant dedicated to supporting TUM staff. Your sole responsibility is to generate professional email drafts or administrative documents strictly related to TUM staff work.

    Examples of acceptable topics include:
    - Holiday notices  
    - Language course consultations  
    - Replies to students or professors  
    - Administrative coordination within the university  

    If a user request is not clearly related to TUM staff email communication or administrative tasks, politely refuse to respond.  
    Always return the refusal message in both English and German.

    Refusal text:  
    "I cannot fulfill your request as it is not related to TUM staff email or administrative tasks."  
    "Ich kann Ihre Anfrage nicht bearbeiten, da sie nicht im Zusammenhang mit E-Mails oder administrativen Aufgaben für TUM-Mitarbeiter steht."

    {prefix}
    {prompt}

    Please generate the email content directly. Do not add any explanation, description, or formatting description.
    After generating the German version, add a horizontal line '——', then generate the English version.

    Formatting requirements:
    - For important words or phrases that need emphasis, use HTML format: <strong>important content</strong>
    - If there are title formats in the email such as **Betreff:**, **Subject:**, etc., remove the asterisks and automatically bold, e.g. <strong>Betreff:</strong>, <strong>Subject:</strong>
    - Do not overuse bold, only use it where emphasis is truly needed
    - Do not use Markdown **bold** marks
    - Start the email body content directly, do not add any prefix or explanatory text
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt
        )
        content = response.text.replace("\n", "<br>")
        
        # Post-processing: Add formatting similar to structured input
        if "——" in content:
            parts = content.split("——")
            if len(parts) == 2:
                german_part = parts[0].strip()
                english_part = parts[1].strip()
                content = f"Scroll down for English version<br><br>---<br><br>[Deutsch]<br><br>{german_part}<br><br>---<br><br>[English]<br><br>{english_part}"
        
        return extract_and_prepend_titles(content)
    except Exception as e:
        print(f"Gemini free prompt error: {e}")
        # Fallback: Return original prompt with prefix
        return f"AI generated content: {prompt}"

def process_student_consultation(on_site_time=None, virtual_time=None, meeting_id=None, passcode=None, email_address=None, name=None):
    """
    Read student consultation template and generate content
    """
    file_path = './data/Student/consultation.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"Error reading file: {str(e)}")
        return None

    # Default values
    if not name:
        name = "Student Service Center"

    # Replace variables
    if on_site_time:
        template = template.replace("{on_site_time}", on_site_time)
    if virtual_time:
        template = template.replace("{virtual_time}", virtual_time)
    if meeting_id:
        template = template.replace("{meeting_id}", meeting_id)
    if passcode:
        template = template.replace("{passcode}", passcode)
    if email_address:
        template = template.replace("{email_address}", email_address)
    template = template.replace("{name}", name)

    # Construct prompt
    prompt = f"""
    Strictly generate a bilingual (German-English) course consultation notification according to the following template format. Do not add any extra content or explanation:
    At the very beginning of the email, generate German and English titles, formatted as <strong>Betreff:</strong> ... and <strong>Subject:</strong> ... respectively. The title content should be automatically summarized based on the email content. If the template contains title formats like **Betreff:**, **Subject:**, etc., remove the asterisks and wrap with <strong>.
    All variables should be replaced according to the input parameters; keep line breaks, list symbols, spaces, and bold marks, but do not use asterisks (*) as formatting marks;
    Start the email body content directly.
    Ensure the date format is consistent as DD.MM.YYYY and highlight it in the output. MM should be translated to the corresponding language's month expression, not a number;
    Please help translate all user input information into English in the English version and into German in the German version;
    Output only the email content, do not add any explanation, description, or formatting description.

    Formatting requirements:
    - For important words or phrases that need emphasis, use HTML format: <strong>important content</strong>
    - Required bold content: on-site consultation time, virtual consultation time, meeting ID, email address
    - Do not overuse bold, only use it where emphasis is truly needed
    - Do not use Markdown **bold** marks

    Template content:
    {template}
    """

    print("\nGenerating student consultation notification...")

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        content = response.text.replace('\n', '<br>')
        return extract_and_prepend_titles(content)

    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        return None

def process_student_reply(student_name=None, name=None):
    """
    Read student_reply.txt template and replace {student_name} and {name} variables
    Strictly generate student email question reply, do not add any extra content or explanation;
    Please help translate all user input information into English in the English version and into German in the German version;
    """
    file_path = './data/Student/student_reply.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"Failed to read student_reply template: {str(e)}")
        return None

    if student_name:
        template = template.replace("{student_name}", student_name)
    if name:
        template = template.replace("{name}", name)

    content = template.replace('\n', '<br>')
    de_title = "<strong>Betreff:</strong> Antwort auf Ihre Anfrage<br>"
    en_title = "<strong>Subject:</strong> Reply to Your Inquiry<br><br>"
    return de_title + en_title + content

def process_holiday_notice(holiday_name=None, holiday_date=None, name=None):
    file_path = './data/All/holiday_notice.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"Failed to read holiday_notice template: {str(e)}")
        return None

    if holiday_name:
        template = template.replace("{holiday_name}", f"<strong>{holiday_name}</strong>")
    if holiday_date:
        template = template.replace("{holiday_date}", f"<strong>{holiday_date}</strong>")
    if name:
        template = template.replace("{name}", name)
    else:
        template = template.replace("{name}", "Student Service Center")

    content = template.replace('\n', '<br>')
    de_title = "<strong>Betreff:</strong> Feiertagsankündigung<br>"
    en_title = "<strong>Subject:</strong> Holiday Notice<br><br>"
    return de_title + en_title + content

def extract_and_prepend_titles(content):
    # Extract German and English titles
    de_title_match = re.search(r'(<strong>Betreff:</strong>.*?)(<br>|\n)', content)
    en_title_match = re.search(r'(<strong>Subject:</strong>.*?)(<br>|\n)', content)
    de_title = de_title_match.group(1) + '<br>' if de_title_match else ''
    en_title = en_title_match.group(1) + '<br><br>' if en_title_match else ''
    # Remove all titles from the body
    content = re.sub(r'<strong>Betreff:</strong>.*?(<br>|\n)', '', content)
    content = re.sub(r'<strong>Subject:</strong>.*?(<br>|\n)', '', content)
    # Concatenate
    return de_title + en_title + content

if __name__ == "__main__":
    # Example: Pass parameters to replace variables
    result_course = process_course_registration(
        time_start="2024-03-01",
        time_end="2024-05-15",
        target_group="Master in Informatics",
        name="TUM Examination Office"
    )
    result_event = process_event_notice(
        event_name="AI in Healthcare Forum",
        event_intro="An insightful day full of keynotes, panels and startup showcases.",
        registration="Anmeldung ist nicht erforderlich.",
        language="english",
        event_time="t.b.d.",
        event_location="Audimax, TUM Main Campus",
        target_group="All Master's students",
        name="TUM AI Club",
    )
    result_schedule = process_schedule_request(
        course_name="Advanced Data Analytics",
        course_code="ADA-2025",
        semester="2024/25 Winter",
        time_options="- Montag, 10:00–12:00 Uhr\n- Dienstag, 14:00–16:00 Uhr",
        reply_deadline="until 15.07.2025",
        name="TUM Campus Heilbronn Coordination Team",
        target_group="Professoren der Fakultät für Informatik"
    )
    result_schedule_announcement = process_schedule_announcement(
        course_name="Data-Driven Business Models",
        course_code="DDBM-301",
        instructor_name="Prof. Dr. Anna Schulz",
        course_start_date="08.04.2025",
        weekly_time="Montags, 14:00–16:00 Uhr",
        weekly_location="H.3.024",
        target_group="Bachelor in Management and Technology",
        name="Student Service Center Heilbronn"
    )
    result_schedule_change = process_schedule_change(
        course_name="Innovation Management",
        course_code="INNO-501",
        reason="aufgrund einer Überschneidung mit einer anderen Pflichtveranstaltung",
        original_time="27.06.2025, 10:00–12:00 Uhr",
        original_location="H.2.103",
        new_time="27.06.2025, 12:00–14:00 Uhr",
        new_location="H.2.205",
        target_group="MSc Management",
        name="Program Coordination MSc Management"
    )
    result_holiday = process_holiday_notice(
        holiday_name="Tag der Deutschen Einheit",
        holiday_date="03.10.2025",
        name="TUM Helpdesk"
    )
    result_consultation = process_student_consultation(
        on_site_time="every Tuesday, 11:00–12:00",
        virtual_time="every Friday, 13:00–14:00",
        meeting_id="123 4567 8910",
        passcode="tum2025",
        email_address="studentcenter@tum.de",
        name="TUM Heilbronn Office"
    )

    if result_course:
        print("\n=== Course Registration Notification ===\n")
        print(result_course)

    if result_event:
        print("\n=== Event Notice ===\n")
        print(result_event)

    if result_schedule:
        print("\n=== Schedule Coordination Notification ===\n")
        print(result_schedule)

    if result_schedule_announcement:
        print("\n=== Course Announcement ===\n")
        print(result_schedule_announcement)

    if result_schedule_change:
        print("\n=== Course Schedule Change Notification ===\n")
        print(result_schedule_change)

    if result_holiday:
        print("\n=== Holiday Notice ===\n")
        print(result_holiday)

    if result_consultation:
        print("\n=== Student Consultation Notification ===\n")
        print(result_consultation)



#


