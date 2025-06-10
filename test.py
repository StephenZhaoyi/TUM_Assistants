from fastapi import FastAPI

app = FastAPI()   # 创建一个应用实例

@app.get("/")    # 定义一个 GET 请求，路径是 /
async def read_root():
    return {"message": "Hello, FastAPI!"}
