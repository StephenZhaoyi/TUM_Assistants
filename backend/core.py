import os
import json
from google import genai
from dotenv import load_dotenv

# 加载 .env 文件中的环境变量
load_dotenv()

# 配置 Gemini API
# 确保您的 .env 文件中有 GOOGLE_API_KEY
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("请在 .env 文件中设置 GOOGLE_API_KEY")

# 创建客户端实例
client = genai.Client(api_key=GOOGLE_API_KEY)

def read_note():
    """读取笔记文件内容"""
    try:
        with open('./data/All/note.txt', 'r', encoding='utf-8') as file:
            content = file.read().strip()
            return content if content else None
    except Exception as e:
        print(f"读取笔记文件时发生错误：{str(e)}")
        return None

def process_course_registration(time_start=None, time_end=None, target_group=None, name=None):
    """
    读取课程注册信息并生成通知
    """
    # 读取文件内容
    file_path = './data/Student/course_registration.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"读取文件时发生错误：{str(e)}")
        return None

    # 读取笔记内容
    note_content = read_note()

    # 替换变量（如果提供）
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

    # 构造提示
    prompt = f"""
    请严格按照以下模板格式生成通知,不要添加其他任何额外的内容或解释：
    如果note_content内容为空，则**Hinweis:**和**Note:**应该不显示。
    否则请将note_content内容添加在**Hinweis:**或者**Note:**后。
    无论note_content是什么语言，你都应该转化成信件相应的德语和英语，并使用相应的信件语言。
    保持所有格式标记（如 **、换行等）不变。
    如果模板中有未替换的变量（如 {{time_start}}），请保持原样。
    如果模板中{{time_start}}或者{{time_end}}未被添加，请添加为今天的日期。如果用户写入until + 日期，或者 bis + 日期，或者日期写成其他格式，你也应该识别出来。
    如果模板中{{target_group}}未被添加，请添加为所有人。
    如果模板中{{name}}未被添加，请添加为Student Service Center。
    确保日期格式统一，为DD.MM.YYYY并在输出中突出显示。其中MM应为德语或英语月份（在德语版本为德语，在英语版本为英语），而不是数字。
    请帮忙将用户输入的所有信息在英语版本中翻译为英文，在德语版本中翻译为德语；


    模板内容：
    {template}
    """
    
    print("\n正在生成通知...")
    try:
        # 生成内容
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        generated_content = response.text
        
        # 确保内容保持格式
        generated_content = generated_content.replace('\n', '<br>')
        
        # 清空note.txt文件
        with open('data/All/note.txt', 'w', encoding='utf-8') as f:
            f.write('')
            
        return generated_content

    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        return None

def process_event_notice(event_name=None, event_intro=None, event_time=None, event_location=None, target_group=None, registration=None, language=None, name=None):
    """
    读取campus活动信息并生成通知
    """
    # 读取文件内容
    file_path = './data/Student/event_notice.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"读取文件时发生错误：{str(e)}")
        return None

    # 替换模板变量
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

    # 构造 prompt 交给 Gemini
    prompt = f"""
    请严格按照以下模板格式生成通知,不要添加其他任何额外的内容或解释：
    保持所有格式和标记（如 **、换行等）不变。
    如果模板中有未替换的变量（如 {{event_name}}），请保持原样。
    如果模板中{{event_time}}为空，请替换为"待定"，翻译为德英版本对应语言，不要简写。
    如果用户写入until + 日期，或者 bis + 日期，或者其他格式的日期，请识别并添加。
    如果模板中{{target_group}}未被添加，默认添加为所有人。
    如果模板中{{name}}未被添加，默认添加为Student Service Center。
    确保日期格式统一，为DD.MM.YYYY并在输出中突出显示。其中MM翻译为对应语言的月份表达,而不是数字。
    请帮忙将用户输入的所有信息在英语版本中翻译为英文，在德语版本中翻译为德语；


    模板内容：
    {template}
    """
    print("\n正在生成活动通知...")

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text.replace('\n', '<br>')

    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        return None

def process_schedule_request(course_name=None, course_code=None, semester=None, time_options=None, reply_deadline=None, name=None, target_group=None):
    """
    读取排课协调模板并生成发送给教职工的邮件
    """
    file_path = './data/Staff/schedule_request.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"读取模板文件时发生错误：{str(e)}")
        return None

    # 替换变量
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

    # 构造提示
    prompt = f"""
    请严格按照以下模板格式生成通知,不要添加其他任何额外的内容或解释：
    模板中所有变量（如 {{semester}}, {{course_name}}, {{course_code}}, {{time_options}}, {{reply_deadline}}, {{name}}, {{target_group}}）必须全部替换为提供的参数值，并且翻译为德语和英语；
    如果用户写入until + 日期，或者 bis + 日期，或者其他格式的日期，请识别并添加在{reply_deadline};
    确保日期格式统一，为DD.MM.YYYY并在输出中突出显示。其中MM翻译为对应语言的月份表达,而不是数字;
    请帮忙将用户输入的所有信息在英语版本中翻译为英文，在德语版本中翻译为德语；
    输出必须严格保留原有格式，包括称呼、空行、加粗标记（**）及段落结构；
    输出应为纯文本格式，德英两部分之间以横线 `---` 分隔；

    模板内容：
    {template}
    """

    print("\n正在生成排课协调邮件...")
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text.replace('\n', '<br>')
    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        return None

def process_schedule_announcement(course_name=None, course_code=None, instructor_name=None, course_start_date=None, weekly_time=None, weekly_location=None, target_group=None, name=None):
    """
    读取课程安排通知模板并生成邮件内容
    """
    file_path = './data/Student/schedule_announcement.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"读取模板文件时发生错误：{str(e)}")
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
    请严格按照以下模板格式生成德英双语课程通知,不要添加其他任何额外的内容或解释：
    所有变量应根据传入参数替换；保持换行符、列表符号、空格与加粗标记；不得添加HTML标签。
    确保日期格式统一，为DD.MM.YYYY并在输出中突出显示。其中MM翻译为对应语言的月份表达,而不是数字;
    德语版本翻译为德语，英语版本翻译为英语；
    如果{name}为空，默认为"Student Service Center";
    请帮忙将用户输入的所有信息在英语版本中翻译为英文，在德语版本中翻译为德语；    

    模板内容：
    {template}
    """

    print("\n正在生成课程安排通知...")
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text.replace('\n', '<br>')
    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        return None

def process_schedule_change(course_name=None, reason=None, original_time=None, original_location=None, new_time=None, new_location=None, target_group=None, name=None, course_code=None):
    """
    课程变更通知
    """
    file_path = './data/All/schedule_change.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"读取模板文件时发生错误：{str(e)}")
        return None

    if course_name:
        template = template.replace("{course_name}", course_name)
    if course_code:
        template = template.replace("{course_code}", course_code)
    if reason:
        template = template.replace("{reason}", reason)
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
    请严格按照以下模板格式生成课程时间变更通知,不要添加其他任何额外的内容或解释：
    德语和英语双语格式：
    所有变量均需替换；
    格式保持原样，不得添加解释或HTML；
    日期统一使用DD.MM.YYYY格式，并翻译月份；
    如果{new_location}或者{new_time}为空，替换为"没有变化"，并翻译为不同版本的对应语言；
    如果{name}为空，默认为"Student Service Center";
    请帮忙将用户输入的所有信息在英语版本中翻译为英文，在德语版本中翻译为德语；

    模板内容：
    {template}
    """

    print("\n正在生成课程时间变更通知...")
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text.replace('\n', '<br>')
    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        return None

def process_free_prompt(prompt: str, tone: str = "neutral"):
    """使用 Gemini 根据自由提示生成行政文案。

    参数:
        prompt: 用户输入的自由文本需求。
        tone: 期望的语气，可选值为 neutral | friendly | firm。

    返回:
        str: 生成的 HTML 字符串，换行已转换为 <br>。
    """
    if not prompt:
        return ""

    # 根据语气添加前缀提示，帮助模型调整风格
    tone_map = {
        "neutral": "以正式且客观的语气撰写以下行政文档：",
        "friendly": "以亲切友好的语气撰写以下行政文档：",
        "firm": "以礼貌但坚定的语气撰写以下行政文档：",
    }
    prefix = tone_map.get(tone, tone_map["neutral"])

    full_prompt = f"""\
    {prefix}
    {prompt}
    请不要添加过多细节，请不要让用户输入更多内容，保持较为简洁。
    请生成德语版本后加横线 '——'，再生成英语版本。保持**加粗**与换行格式。
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt
        )
        content = response.text.replace("\n", "<br>")
        return content
    except Exception as e:
        print(f"Gemini free prompt error: {e}")
        # 回退：直接返回带前缀的原始提示
        return f"AI生成内容： {prompt}"

def process_student_consultation(on_site_time=None, virtual_time=None, meeting_id=None, passcode=None, email_address=None, name=None):
    """
    读取 student consultation 模板并生成内容
    """
    file_path = './data/Student/consultation_info.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"读取文件时发生错误：{str(e)}")
        return None

    # 默认值
    if not name:
        name = "Student Service Center"

    # 替换变量
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

    # 构造 prompt
    prompt = f"""
    如果 {{}}中的变量为空，请保留原样不要删除
    请严格按照以下模板格式生成德英双语课程通知,不要添加其他任何额外的内容或解释：
    所有变量应根据传入参数替换；保持换行符、列表符号、空格与加粗标记；不得添加HTML标签。
    确保日期格式统一，为DD.MM.YYYY并在输出中突出显示。其中MM翻译为对应语言的月份表达,而不是数字;
    请帮忙将用户输入的所有信息在英语版本中翻译为英文，在德语版本中翻译为德语； 

    模板内容如下：
    {template}
    """

    print("\n正在生成学生咨询通知...")

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text.replace('\n', '<br>')

    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        return None

def process_student_reply(student_name=None, name=None):
    """
    读取 student_reply.txt 模板并替换 {student_name} 和 {name} 变量
    请严格按照以下模板格式生成学生邮件问题回复,不要添加其他任何额外的内容或解释；
    请帮忙将用户输入的所有信息在英语版本中翻译为英文，在德语版本中翻译为德语；
    """
    file_path = './data/Student/student_reply.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"读取 student_reply 模板失败: {str(e)}")
        return None

    # 替换模板变量
    if student_name:
        template = template.replace("{student_name}", student_name)
    if name:
        template = template.replace("{name}", name)

    return template.replace('\n', '<br>')

def process_holiday_notice(holiday_name=None, holiday_date=None, name=None):
    """
    节假日放假通知
    """
    file_path = './data/All/holiday_notice.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"读取 holiday_notice 模板失败: {str(e)}")
        return None

    if holiday_name:
        template = template.replace("{holiday_name}", holiday_name)
    if holiday_date:
        template = template.replace("{holiday_date}", holiday_date)
    if name:
        template = template.replace("{name}", name)
    else:
        template = template.replace("{name}", "Student Service Center")

    return template.replace('\n', '<br>')



if __name__ == "__main__":
    # 示例：可以传入参数来替换变量
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
        print("\n=== 课程注册通知 ===\n")
        print(result_course)

    if result_event:
        print("\n=== 活动通知 ===\n")
        print(result_event)

    if result_schedule:
        print("\n=== 排课协调通知 ===\n")
        print(result_schedule)

    if result_schedule_announcement:
        print("\n=== 课程安排通知 ===\n")
        print(result_schedule_announcement)

    if result_schedule_change:
        print("\n=== 课程时间变更通知 ===\n")
        print(result_schedule_change)

    if result_holiday:
        print("\n=== 节假日放假通知 ===\n")
        print(result_holiday)

    if result_consultation:
        print("\n=== 学生咨询通知 ===\n")
        print(result_consultation)



#学生邮件问题回复

