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

def process_event_notice(event_name=None, event_intro=None, info_url=None, time_start=None, time_end=None, event_location=None, target_group=None, registration_url=None, language=None, note=None, name=None):
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

    # 读取附加说明（note.txt）
    note_content = read_note()

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
    if time_start:
        template = template.replace("{time_start}", time_start)
    if time_end:
        template = template.replace("{time_end}", time_end)
    if event_location:
        template = template.replace("{event_location}", event_location)
    if target_group:
        template = template.replace("{target_group}", target_group)
    if note_content:
        template = template.replace("{note}", note_content)
    if registration_url:
        template = template.replace("{registration_url}", registration_url)
    if note:
        template = template.replace("{note}", note)
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
    如果模板中{{time_start}}或者{{time_end}}未被添加，请添加为今天的日期。
    如果用户写入until + 日期，或者 bis + 日期，或者其他格式的日期，请识别并添加。
    如果模板中{{target_group}}未被添加，默认添加为所有人。
    如果模板中{{name}}未被添加，默认添加为Student Service Center。
    确保日期格式统一，为DD.MM.YYYY并在输出中突出显示。其中MM翻译为对应语言的月份表达,而不是数字。


    模板内容：
    {template}
    """
    print("\n正在生成通知...")

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"\n发生错误：{str(e)}")
        return None


if __name__ == "__main__":
    # 示例：可以传入参数来替换变量
    result = process_course_registration(
        time_start="2024-03-01",
        time_end="2024-05-15",
        target_group="Master in Informatics",
        name="TUM Examination Office"
    )
    result = process_event_notice(
    event_name="AI in Healthcare Forum",
    event_intro="An insightful day full of keynotes, panels and startup showcases.",
    info_url="https://tum.ai/event-info",
    registration_url="https://tum.ai/event-registration",
    language="english",
    time_start="2025-06-25",
    time_end="2025-06-25",
    event_location="Audimax, TUM Main Campus",
    target_group="All Master's students",
    name="TUM AI Club",
    note="sign before 20-06-2025"
)
    

    if result:
        print("\n=== 考试通知 ===\n")
        print(result) 