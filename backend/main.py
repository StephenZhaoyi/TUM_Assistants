from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
from core import (
    process_course_registration,
    process_event_notice,
    process_schedule_request,
    process_schedule_announcement,
    process_schedule_change,
)
import os

app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
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
    infoUrl: Optional[str] = None
    registrationUrl: Optional[str] = None
    language: Optional[str] = None
    additionalNote: Optional[str] = None
    replyDeadline: Optional[str] = None
    timeOptions: Optional[str] = None
    name: Optional[str] = None

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
                info_url=request.infoUrl,
                event_time=request.eventTime,
                event_location=request.location,
                target_group=request.targetAudience,
                registration_url=request.registrationUrl,
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
                name=request.name
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
                info_url=request.infoUrl,
                name=request.name
            )}
        elif t == "schedule_change":
            return {"content": process_schedule_change(
                course_name=request.courseName,
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
