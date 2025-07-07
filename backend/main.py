from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
from core import (
    process_course_registration,
    process_event_notice,
    process_schedule_request,
    process_schedule_announcement,
    process_schedule_change,
    process_student_reply,
    process_holiday_notice,
    process_free_prompt
)
import os
import json
from uuid import uuid4

app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://localhost:5501", "http://localhost:5502"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 定义支持的模板类型
class TemplateRequest(BaseModel):
    templateType: Literal[
        "course_registration", "event_notice", "schedule_request", "schedule_announcement", "schedule_change"
    ]
    # 所有可能用到的字段（部分可选）
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    eventTime: Optional[str] = None
    courseName: Optional[str] = None
    courseCode: Optional[str] = None
    semester: Optional[str] = None
    instructorName: Optional[str] = None
    courseStartDate: Optional[str] = None
    weeklyTime: Optional[str] = None
    weeklyLocation: Optional[str] = None
    oldTime: Optional[str] = None
    oldLocation: Optional[str] = None
    newTime: Optional[str] = None
    newLocation: Optional[str] = None
    reason: Optional[str] = None
    targetAudience: Optional[str] = None
    location: Optional[str] = None
    registration: Optional[str] = None
    language: Optional[str] = None
    additionalNote: Optional[str] = None
    replyDeadline: Optional[str] = None
    timeOptions: Optional[str] = None
    name: Optional[str] = None

# 草稿存储文件
DRAFTS_FILE = './drafts.json'
TEMPLATES_FILE = './templates.json'

def load_drafts():
    if not os.path.exists(DRAFTS_FILE) or os.path.getsize(DRAFTS_FILE) == 0:
        return []
    with open(DRAFTS_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_drafts(drafts):
    with open(DRAFTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(drafts, f, ensure_ascii=False, indent=2)

def load_templates():
    if not os.path.exists(TEMPLATES_FILE) or os.path.getsize(TEMPLATES_FILE) == 0:
        return []
    with open(TEMPLATES_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_templates(templates):
    with open(TEMPLATES_FILE, 'w', encoding='utf-8') as f:
        json.dump(templates, f, ensure_ascii=False, indent=2)

class FreePromptRequest(BaseModel):
    prompt: str
    tone: Optional[str] = None

class StudentReplyRequest(BaseModel):
    student_name: str
    name: Optional[str] = None

class HolidayNoticeRequest(BaseModel):
    holiday_name: str
    holiday_date: str
    name: Optional[str] = None

class GeminiEditRequest(BaseModel):
    content: str
    instruction: str

@app.post("/api/generate")
async def generate_document(request: TemplateRequest):
    try:
        note = request.additionalNote or ""
        if note:
            with open('./data/note.txt', 'w', encoding='utf-8') as f:
                f.write(note)

        t = request.templateType

        if t == "course_registration":
            return {"content": process_course_registration(
                time_start=request.startDate,
                time_end=request.endDate,
                target_group=request.targetAudience,
                name=request.name
            )}
        elif t == "event_notice":
            return {"content": process_event_notice(
                event_name=request.courseName,
                event_intro=request.additionalNote,
                event_time=request.eventTime,
                event_location=request.location,
                target_group=request.targetAudience,
                registration=request.registration,
                language=request.language,
                name=request.name
            )}
        elif t == "schedule_request":
            return {"content": process_schedule_request(
                course_name=request.courseName,
                course_code=request.courseCode,
                semester=request.semester,
                time_options=request.timeOptions,
                reply_deadline=request.replyDeadline,
                name=request.name,
                target_group=request.targetAudience
            )}
        elif t == "schedule_announcement":
            return {"content": process_schedule_announcement(
                course_name=request.courseName,
                course_code=request.courseCode,
                instructor_name=request.instructorName,
                course_start_date=request.courseStartDate,
                weekly_time=request.weeklyTime,
                weekly_location=request.weeklyLocation,
                target_group=request.targetAudience,
                name=request.name
            )}
        elif t == "schedule_change":
            return {"content": process_schedule_change(
                course_name=request.courseName,
                course_code=request.courseCode,
                reason=request.reason,
                original_time=request.oldTime,
                original_location=request.oldLocation,
                new_time=request.newTime,
                new_location=request.newLocation,
                target_group=request.targetAudience,
                name=request.name
            )}
        else:
            raise HTTPException(status_code=400, detail="Unknown template type")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/student_reply")
async def student_reply_api(req: StudentReplyRequest):
    content = process_student_reply(student_name=req.student_name, name=req.name)
    return {"content": content}

@app.post("/api/holiday_notice")
async def holiday_notice_api(req: HolidayNoticeRequest):
    content = process_holiday_notice(holiday_name=req.holiday_name, holiday_date=req.holiday_date, name=req.name)
    return {"content": content}

@app.post("/api/free_prompt")
async def free_prompt_api(req: FreePromptRequest):
    content = process_free_prompt(prompt=req.prompt, tone=req.tone)
    return {"content": content}

@app.get("/api/self_templates")
async def get_self_customizing_templates():
    base_path = "./data/Student"
    template_files = ["student_reply.txt", "language_course.txt", "study_abroad.txt"]
    templates = []

    for filename in template_files:
        path = os.path.join(base_path, filename)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                templates.append({
                    "name": filename.replace(".txt", "").replace("_", " ").title(),
                    "content": f.read()
                })

    return templates


@app.get("/api/drafts")
async def get_drafts():
    return load_drafts()

@app.post("/api/drafts")
async def create_draft(draft: dict = Body(...)):
    drafts = load_drafts()
    draft['id'] = str(uuid4())
    drafts.insert(0, draft)
    save_drafts(drafts)
    return draft

@app.get("/api/drafts/{draft_id}")
async def get_draft(draft_id: str):
    drafts = load_drafts()
    for d in drafts:
        if d['id'] == draft_id:
            return d
    raise HTTPException(status_code=404, detail="Draft not found")

@app.put("/api/drafts/{draft_id}")
async def update_draft(draft_id: str, draft: dict = Body(...)):
    drafts = load_drafts()
    for i, d in enumerate(drafts):
        if d['id'] == draft_id:
            drafts[i] = {**d, **draft, 'id': draft_id}
            save_drafts(drafts)
            return drafts[i]
    raise HTTPException(status_code=404, detail="Draft not found")

@app.delete("/api/drafts/{draft_id}")
async def delete_draft(draft_id: str):
    drafts = load_drafts()
    drafts = [d for d in drafts if d['id'] != draft_id]
    save_drafts(drafts)
    return {"status": "success"}

@app.post("/api/gemini_edit")
async def gemini_edit_api(req: GeminiEditRequest):
    """使用 Gemini 对草稿进行二次编辑"""
    from core import client
    prompt = f"""
你是一个行政文档写作助手。请根据用户的修改要求对以下草稿内容进行修改：

【用户要求】：{req.instruction}

【原始草稿】：
{req.content}

请严格保留原有文档的结构、格式（如加粗、换行、列表等），只做必要的内容调整。输出格式为 HTML，换行请用<br>，加粗请用<strong>，不要添加解释。
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        content = response.text.replace("\n", "<br>")
        return {"content": content}
    except Exception as e:
        return {"content": f"[Gemini API error] {str(e)}"}

@app.get("/api/templates")
async def get_templates():
    return load_templates()

@app.post("/api/templates")
async def create_template(template: dict = Body(...)):
    templates = load_templates()
    template['id'] = str(uuid4())
    templates.insert(0, template)
    save_templates(templates)
    return template

@app.put("/api/templates/{template_id}")
async def update_template(template_id: str, template: dict = Body(...)):
    templates = load_templates()
    for i, t in enumerate(templates):
        if t['id'] == template_id:
            templates[i] = {**t, **template, 'id': template_id}
            save_templates(templates)
            return templates[i]
    raise HTTPException(status_code=404, detail="Template not found")

@app.delete("/api/templates/{template_id}")
async def delete_template(template_id: str):
    templates = load_templates()
    templates = [t for t in templates if t['id'] != template_id]
    save_templates(templates)
    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
