from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core import process_course_registration
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

class CourseRegistrationRequest(BaseModel):
    startDate: str
    endDate: str
    targetAudience: str
    additionalNote: str

@app.post("/api/generate")
async def generate_document(request: CourseRegistrationRequest):
    try:
        # 将前端的日期格式转换为后端需要的格式
        time_start = request.startDate
        time_end = request.endDate
        target_group = request.targetAudience
        
        # 将附加说明写入note.txt
        with open('./data/note.txt', 'w', encoding='utf-8') as f:
            f.write(request.additionalNote)
        
        # 调用core.py中的处理函数
        generated_content = process_course_registration(
            time_start=time_start,
            time_end=time_end,
            target_group=target_group
        )
        
        if generated_content is None:
            raise HTTPException(status_code=500, detail="Failed to generate document")
        
        return {
            "status": "success",
            "message": "Document generated successfully",
            "content": generated_content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 