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
        with open('./data/note.txt', 'r', encoding='utf-8') as file:
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
    file_path = './data/course_registration.txt'
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
    请严格按照以下模板格式生成通知：
    如果note_content内容为空，则**Hinweis:**和**Note:**应该不显示。
    否则请将note_content内容添加在**Hinweis:**或者**Note:**后。
    无论note_content是什么语言，你都应该转化成信件相应的德语和英语，并使用相应的信件语言。
    不要添加其他任何额外的内容或解释。
    保持所有格式标记（如 **、换行等）不变。
    如果模板中有未替换的变量（如 {{time_start}}），请保持原样。
    如果模板中{{time_start}}或者{{time_end}}未被添加，请添加为今天的日期。如果用户写入until + 日期，或者 bis + 日期，或者日期写成其他格式，你也应该识别出来。
    如果模板中{{target_group}}未被添加，请添加为所有人。
    如果模板中{{name}}未被添加，请添加为Student Service Center。
    确保日期格式统一，为DD.MM.YYYY并在输出中突出显示。其中MM应为德语或英语月份（在德语版本为德语，在英语版本为英语），而不是数字。


    模板内容：
    {template}
    """
    
    print("\n正在生成通知...")
    try:
        # 生成内容
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        
        generated_content = response.text
        
        # 确保内容保持格式
        generated_content = generated_content.replace('\n', '<br>')
        
        # 清空note.txt文件
        with open('data/note.txt', 'w', encoding='utf-8') as f:
            f.write('')
            
        return generated_content

    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        return None

def process_event_notice(event_name=None, event_intro=None, info_url=None, event_time=None, event_location=None, target_group=None, registration_url=None, language=None, name=None):
    """
    读取campus活动信息并生成通知
    """
    # 读取文件内容
    file_path = './data/event_notice.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"读取文件时发生错误：{str(e)}")
        return None

    

    # 替换模板变量
    if event_name:
        template = template.replace("{event_name}", event_name)
    if event_intro:
        template = template.replace("{event_intro}", event_intro)
    if info_url:
        info_url_line = info_url
    else:
        info_url_line = ""
    template = template.replace("{info_url_line}", info_url_line)
    if event_time:
        template = template.replace("{event_time}", event_time)
    if language:
        template = template.replace("{language}", language)
    if event_location:
        template = template.replace("{event_location}", event_location)
    if target_group:
        template = template.replace("{target_group}", target_group)
    if registration_url:
        template = template.replace("{registration_url}", registration_url)
    if name:
        template = template.replace("{name}", name)
    else:
        template = template.replace("{name}", "Student Service Center")
    
       
    # 构造 prompt 交给 Gemini
    prompt = f"""
    请严格按照以下模板格式生成通知：
    如果note_content内容为空，则不显示**Hinweis:**和**Note:**。
    否则请将note_content内容添加在**Hinweis:**或者**Note:**后。
    无论note_content和是什么语言，你都应该转化成信件相应的德语和英语，并使用相应的信件语言。
    不要添加任何额外的内容或解释。
    保持所有格式和标记（如 **、换行等）不变。
    如果模板中有未替换的变量（如 {{time_start}}），请保持原样。
    如果模板中{{event_time}}为空，请替换为“待定”，翻译为德英版本对应语言，不要简写。
    如果用户写入until + 日期，或者 bis + 日期，或者其他格式的日期，请识别并添加。
    如果模板中{{target_group}}未被添加，默认添加为所有人。
    如果模板中{{name}}未被添加，默认添加为Student Service Center。
    确保日期格式统一，为DD.MM.YYYY并在输出中突出显示。其中MM翻译为对应语言的月份表达,而不是数字。
    确认所有输入信息在英语版本中翻译为英文，在德语版本中翻译为德语


    模板内容：
    {template}
    """
    print("\n正在生成排课通知...")

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text.replace('\n', '<br>')
       

    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        return None

def process_schedule_request(course_name=None, course_code=None, semester=None, time_options=None, reply_deadline=None, name=None):
    """
    读取排课协调模板并生成发送给教授的邮件
    """
    file_path = './data/schedule_request.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"读取模板文件时发生错误：{str(e)}")
        return None

    # 替换变量
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
    模板中所有变量（如 {{semester}}, {{course_name}}, {{course_code}}, {{time_options}}, {{reply_deadline}}, {{name}}）必须全部替换为提供的参数值；
    如果用户写入until + 日期，或者 bis + 日期，或者其他格式的日期，请识别并添加在{reply_deadline};
    如果{{course_name}}为空，替换为当前版本语言的“未指定”;
    确保日期格式统一，为DD.MM.YYYY并在输出中突出显示。其中MM翻译为对应语言的月份表达,而不是数字;
    英语版本中所有输入的信息必须翻译为英语；
    德语版本中所有输入信息必须翻译为德语；
    输出必须严格保留原有格式，包括称呼、空行、加粗标记（**）及段落结构；
    不得添加任何额外解释;
    输出应为纯文本格式，德英两部分之间以横线 `---` 分隔；

    模板内容：
    {template}
    """

    print("\n正在生成排课协调邮件...")
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text.replace('\n', '<br>')
    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        return None

def process_schedule_announcement(course_name=None, course_code=None, instructor_name=None, course_start_date=None, weekly_time=None, weekly_location=None, target_group=None, info_url=None, name=None):
    """
    读取课程安排通知模板并生成邮件内容
    """
    file_path = './data/schedule_announcement.txt'
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
    if info_url:
        template = template.replace("{info_url}", info_url)
    if name:
        template = template.replace("{name}", name)
    else:
        template = template.replace("{name}", "Student Service Center")

    prompt = f"""
    请严格按照以下模板格式生成德英双语课程通知：
    不得添加解释，不要修改模板结构。
    所有变量应根据传入参数替换；保持换行符、列表符号、空格与加粗标记；不得添加HTML标签。
    日期格式为DD.MM.YYYY，德语版本翻译为德语，英语版本翻译为英语；
    如果{name}为空，默认为“Student Service Center";
    德语版本的输入内容全部翻译为德语。
    英语版本的输入内容全部翻译为英语；
    

    模板内容：
    {template}
    """

    print("\n正在生成课程安排通知...")
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text.replace('\n', '<br>')
    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        return None

def process_schedule_change(course_name=None, reason=None, original_time=None, original_location=None, new_time=None, new_location=None, target_group=None, name=None):
    """
    课程变更通知
    """
    file_path = './data/schedule_change.txt'
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            template = file.read()
    except Exception as e:
        print(f"读取模板文件时发生错误：{str(e)}")
        return None

    if course_name:
        template = template.replace("{course_name}", course_name)
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
    请严格按照以下模板格式生成课程时间变更通知，德语和英语双语格式：
    所有变量均需替换；
    格式保持原样，不得添加解释或HTML；
    日期统一使用DD.MM.YYYY格式，并翻译月份；
    如果{new_location}或者{new_time}为空，替换为“没有变化”，并翻译为不同版本的对应语言；
    如果{name}为空，默认为“Student Service Center";
    德语版本的输入内容全部翻译为德语；
    英语版本的输入内容全部翻译为英语。

    模板内容：
    {template}
    """

    print("\n正在生成课程时间变更通知...")
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text.replace('\n', '<br>')
    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        return None


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
        info_url="https://tum.ai/event-info",
        registration_url="https://tum.ai/event-registration",
        language="english",
        event_time="",
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
        name="TUM Campus Heilbronn Coordination Team"
    )

    result_schedule_announcement = process_schedule_announcement(
        course_name="Data-Driven Business Models",
        course_code="DDBM-301",
        instructor_name="Prof. Dr. Anna Schulz",
        course_start_date="08.04.2025",
        weekly_time="Montags, 14:00–16:00 Uhr",
        weekly_location="H.3.024",
        target_group="Bachelor in Management and Technology",
        info_url="https://campus.tum.de/ddbm-301-info",
        name="Student Service Center Heilbronn"
    )

    result_schedule_change = process_schedule_change(
        course_name="Innovation Management",
        reason="aufgrund einer Überschneidung mit einer anderen Pflichtveranstaltung",
        original_time="27.06.2025, 10:00–12:00 Uhr",
        original_location="H.2.103",
        new_time="27.06.2025, 12:00–14:00 Uhr",
        new_location="H.2.205",
        target_group="MSc Management",
        name="Program Coordination MSc Management"
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