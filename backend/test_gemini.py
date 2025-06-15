import os
from google import genai
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置 Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
client = genai.Client(api_key=GOOGLE_API_KEY)

def test_gemini():
    # 测试提示
    prompt = "请用中文解释什么是人工智能？"
    
    try:
        # 生成响应
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        print("Gemini 的回复：")
        print(response.text)
    except Exception as e:
        print(f"发生错误：{str(e)}")

if __name__ == "__main__":
    test_gemini() 