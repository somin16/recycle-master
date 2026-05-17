async def predict_trash(image):
    #raise Exception("강제 500에러")
    import asyncio
    await asyncio.sleep(1)
    return {"label": "plastic", "confidence": 0.95}
    